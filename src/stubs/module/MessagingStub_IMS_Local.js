/**
 * Defines the stub as a Module to be loaded via requireJS.
 * This avoids name-spacing issues.
 * @returns {MessagingStub_IMS_Local}
 */
define("stub", function (require, exports, module) {

	var CON = {
		WONDER: "wonder"
	};

	var IMSCM_COMMANDS = {
		START_CALL: "startwebrtccallrequest",
		ANSWER_CALL: "receivewebrtccallresponse",
		BYE: "stopsessionrequest",
		UPDATE: "callupdaterequest",
		REGISTER_RESPONSE: "registerresponse"
	};

	var IMSCM_STATUS = {
		NONE: 0,
		OK: 10,
		DENIED: 30
	};

	/*********************************************************************************
	 * Messaging Stub Class
	 * For IMS2Cloud
	 *
	 * This file is a translating stub between the Messages from the Wonder-Lib and
	 * the IMS2Cloud.
	 * For this purpose it implements the MessagingStub-Interface of the Wonder-Lib.
	 */
	function MessagingStub_IMS_Local() {
		this.ownRtcIdentity;
		this.credentials;
		this.connectCallbackFunction;
		this.errorConnectCallbackFunction;

		// keeps the mapping of context-IDs to sessionIDs
		this.sessionIDs = {};
		// for communication with non-wonder clients, the contextID's are missing 
		// in incoming invites or in 200oKs, for such cases we keep a mapping of sessionIDs to contextIDs
		this.contextIDs = {};
		this.inviteContextId;

		this.socket;
//		this.initialWSUri = "ws://192.168.7.216:2701/";
		this.initialWSUri = module.config().connectURL;

		this.delayedMessages = {};
	}


	/**
	 * SendMessage
	 * wraps the given Wonder-message into an IMS2Cloud message and sends it through the websocket
	 * @param message
	 */
	MessagingStub_IMS_Local.prototype.sendMessage = function (message) {

		var extractRtcIdentities = function (identities) {
			// ensure "to" is an array
			var to = [];
			to.push(identities);
			to.every(function (element, index, array) {
				array[index] = element.rtcIdentity;
			});
			return to;
		};

		var createAttributes = function (message, callStatus, sessionId) {
			var attributes = new Object();
			attributes.callStatus = callStatus;
			if (message.body.connectionDescription)
				attributes.sdp = message.body.connectionDescription.sdp;
			else
			if (message.body.newConnectionDescription)
				attributes.sdp = message.body.newConnectionDescription.sdp;
			if (sessionId)
				attributes.sessionId = sessionId;
			// wonder-specific parts
			attributes.contentType = CON.WONDER;
			message.to = extractRtcIdentities(message.to);
			attributes.body = message;
			attributes.body.from = message.from.rtcIdentity;

			return attributes;
		};

		/*
		 * constructs an identifier for this msg from contextId + to
		 */
		getMessageKey = function (msg) {
			var key = msg.contextId + "_";
			if (msg.to instanceof Identity)
				return key + msg.to.rtcIdentity;
			else if (msg.to instanceof Array && msg.to.length > 0) {
				if (msg.to[0] instanceof Identity)
					return key + msg.to[0].rtcIdentity;
				else
					return key + msg.to[0];
			}
			else
				return key + msg.to;
		};

		var msg;
		var msgKey = getMessageKey(message);
		// check for known WONDER-messages
		switch (message.type) {
			case MessageType.INVITATION:
				var attributes = createAttributes(message, "offer");
				attributes.sipUri = message.to[0];
				msg = this.ims2CloudMessage(IMSCM_COMMANDS.START_CALL, IMSCM_STATUS.NONE, attributes);
				this.delayedMessages[msgKey] = msg;
				console.log("set message on hold with key: " + msgKey);
				// don't send this msg now
				msg = null;
				break;

			case MessageType.ACCEPTED:
				var attributes = createAttributes(message, "answer", this.sessionIDs[message.contextId]);
				msg = this.ims2CloudMessage(IMSCM_COMMANDS.ANSWER_CALL, IMSCM_STATUS.OK, attributes);
				this.delayedMessages[msgKey] = msg;
				console.log("set message on hold with key: " + msgKey);
				// don't send this msg now
				msg = null;
				break;

			case MessageType.NOT_ACCEPTED:
				var attributes = createAttributes(message, "answer", this.sessionIDs[message.contextId]);
				msg = this.ims2CloudMessage(IMSCM_COMMANDS.ANSWER_CALL, IMSCM_STATUS.DENIED, attributes);
				break;

			case MessageType.BYE:
				var attributes = createAttributes(message, "", this.sessionIDs[message.contextId]);
				attributes.info = "hangup";
				delete attributes.callStatus;
				msg = this.ims2CloudMessage(IMSCM_COMMANDS.BYE, IMSCM_STATUS.NONE, attributes);
				break;

			case MessageType.CONNECTIVITY_CANDIDATE:
				// last candidate and we have a delayed message
				var delayedMessage = this.delayedMessages[msgKey];
				if (message.body.lastCandidate && delayedMessage) {
					console.log("found message on hold for key: " + msgKey);
					delayedMessage.attributes.sdp = message.body.connectionDescription.sdp;
					delayedMessage.attributes.body.body.connectionDescription = message.body.connectionDescription;
					this.inviteContextId = message.contextId;
					msg = delayedMessage;
					delete this.delayedMessages[msgKey];
				}
				else {
					// dont send candidates
					msg = null;
				}
				break;
			case MessageType.UPDATE:
			case MessageType.UPDATED:
				var attributes = createAttributes(message, "update", message.contextId);
				// this is required in IMS GW for setting the "to" of the Info message
				attributes.sipUri = message.to[0];
				msg = this.ims2CloudMessage(IMSCM_COMMANDS.UPDATE, IMSCM_STATUS.NONE, attributes);
				break;
			default:
				// this is a non-wonder msg - send it unchanged
				console.log("this is a non-wonder message --> forward it unchanged");
				msg = message;
				break;
		}

		if (msg && this.socket) {
			this.doSend(msg);
		}
	};


	MessagingStub_IMS_Local.prototype.connect = function (ownRtcIdentity, credentials, callbackFunction, errorCallbackFunction) {
		this.ownRtcIdentity = ownRtcIdentity;
		this.credentials = credentials;
		this.connectCallbackFunction = callbackFunction;
		this.errorConnectCallbackFunction = errorCallbackFunction;

		// If connect was already executed succesfully, it won't try to connect again, just execute the callback.
		if (this.socket) {
			console.log("Websocket connection already opened, executing callback function: ");
			callbackFunction();
			return;
		}

		console.log("Opening Init-API channel at: " + this.initialWSUri);
		var self = this;
		this.socket = new WebSocket(this.initialWSUri);
		this.socket.onopen = function () {
			var attributes = new Object();
			attributes.user = credentials.user;
			attributes.pubID = "";
			attributes.role = credentials.role;
			attributes.pass = credentials.pass;
			attributes.realm = credentials.realm;
			attributes.pcscf = credentials.pcscf;
			var register_request = self.ims2CloudMessage("registerrequest", 0, attributes);
			self.doSend(register_request);
		};

		this.socket.onerror = function () {
			console.log("Websocket connection error");
			if (errorCallbackFunction)
				errorCallbackFunction();
		};
		this.socket.onclose = function () {
			console.log("Websocket connection closed");
		};

		this.socket.addEventListener("message", function (event) {
			self.onSocketMessage(event, self);
		}, false);
	};

	/**
	 * Incoming message from IMSC.
	 * We have to check for the content-type.
	 * If it is "wonder" then we take the attribute.body as WonderMessage.
	 * If not, then we create a corresponding Message from all available
	 */
	MessagingStub_IMS_Local.prototype.onSocketMessage = function (event, self) {
		var that = this;
		var message = event.data;

		var msg = JSON.parse(message);
		var contentType = msg.attributes.contentType;
		var wonderMsg;
		if (contentType == CON.WONDER) {
			// the wonder msg is just a string in the body attribute --> need to parse it as JSON
			wonderMsg = JSON.parse(msg.attributes.body);
			console.log(JSON.stringify(wonderMsg));
			// convert rtcIdentities to Identities
			Idp.getInstance().createIdentity(wonderMsg.from, function (identity) {
				wonderMsg.from = identity;
				// createIdentities can take array or single rtcIdentity and always returns an Array in the callback result
				Idp.getInstance().createIdentities(wonderMsg.to, function (identityArr) {
					wonderMsg.to = identityArr;
					that.handleMessage(msg, wonderMsg, self);
				});
			});
		}
		else {
			this.handleMessage(msg, wonderMsg, self);
		}
	};

	MessagingStub_IMS_Local.prototype.handleMessage = function (msg, wonderMsg, self) {
		console.log("<<< received: " + msg.cmd + "  with content-type: " + msg.attributes.contentType);

		switch (msg.cmd) {
			case 'registerresponse':
				// This must be handled internally in this lib, and a final event must be emitted to app-layer
				if (msg.status == 10) {
					// fix for handling internal vs. public ip -> use configured ip/port from initial WS
					// only take id from returned URL
					var arr = msg.attributes.wsuri.split("/");
					var wsID = arr[arr.length - 1];
					var controlWSUri = this.initialWSUri + wsID;
					console.log("got wsuri = " + controlWSUri + " --> opening Control-Api channel");
					socket = new WebSocket(controlWSUri);
					self.socket = socket;
					this.socket.addEventListener("message", function (event) {
						self.onSocketMessage(event, self);
					}, false);
					socket.onopen = function () {
						self.connectCallbackFunction(msg);
						//self.baseStub.sendOtherMessages(msg);
					};
					socket.onclose = function () {
					};
				} else {
					self.socket.close();
					self.socket = null;
					self.errorConnectCallbackFunction(msg);
					//self.baseStub.sendOtherMessages(msg);
				}
				break;
			case 'hellorequest':
				console.log("not implemented");
				break;
			case 'startwebrtccallresponse':
				// take the sessionID from the response and add the mapping with the remembered contextID
				console.log("S->C: startwebrtccallresponse' with CallID : " + msg.attributes.sessionId);
				console.log("assigned wonder-contextId = " + self.inviteContextId);
				self.contextIDs[msg.attributes.sessionId] = self.inviteContextId;
				break;
			case 'stopsessionresponse':
				break;
				// the following messages can contain 
			case 'receivewebrtccallrequest': // this can be incoming offer or incoming answer
				/*
				 * This might be the offer/answer from a pure IMS client, that does not hold Wonder-specific attributes.
				 * In this case we extract a minimum wonder msg from the sip message.
				 * We will use the Sip-CallId as context-ID for this call.
				 */
				if (!wonderMsg) {
					// create a minumum wondermsg
					console.log("received non-wonder/pure SIP request: --> generating minimum wonder message with contextId: " + self.contextIDs[msg.attributes.sessionId]);
					wonderMsg = new Object();
					wonderMsg.id = guid();
					wonderMsg.contextId = self.contextIDs[msg.attributes.sessionId];
					wonderMsg.body = new Object();
					wonderMsg.body.connectionDescription = {
						sdp: msg.attributes.sdp,
						type: msg.attributes.callStatus
					}
					if (msg.attributes.callStatus == "offer") {
						wonderMsg.type = "invitation";
					}
					else if (msg.attributes.callStatus == "answer") {
						wonderMsg.type = "accepted";
						// send ACK (startwebtccallresponse) back and forward event to app
						var attributes = new Object();
						attributes.sessionId = msg.attributes.sessionId;
						attributes.info = "thanks";
						self.sendMessage(self.ims2CloudMessage("receivewebrtccallresponse", 10, attributes));
					}
					Idp.getInstance().createIdentity(msg.attributes.caller, function (identity) {
						wonderMsg.from = identity;
						Idp.getInstance().createIdentities(self.ownRtcIdentity, function (identityArr) {
							wonderMsg.to = identityArr;
							self.sessionIDs[wonderMsg.contextId] = msg.attributes.sessionId;
							self.baseStub.sendOtherMessages(wonderMsg);
						});
					});
				}
				else {
					self.sessionIDs[wonderMsg.contextId] = msg.attributes.sessionId;
					self.baseStub.sendOtherMessages(wonderMsg);
				}
				break;
			case 'terminatesessionrequest': // incoming bye
				// send terminatesessionresponse back and forward event to app
				var attributes = new Object();
				attributes.sessionId = msg.attributes.sessionId; // ims-callid
				attributes.info = "deleting session";
				self.sendMessage(self.ims2CloudMessage("terminatesessionresponse", 10, attributes));
				// TODO: change this on messaging Server side, bye needs the wonder-body
				if (!wonderMsg) {
					wonderMsg = new Object();
					wonderMsg.type = MessageType.BYE;
					wonderMsg.contextId = "todo";
				}
				self.baseStub.sendOtherMessages(wonderMsg);
				break;
			case 'callupdaterequest':
				// can be incoming "denied", "cancel", "ringing", "ConnectivityCandidate"
				// send callupdateresponse back and forward event to app
				var attributes = new Object();
				attributes.sessionId = msg.attributes.sessionId; // ims-callid
				var response = self.ims2CloudMessage("callupdateresponse", 10, attributes);
				self.sendMessage(response);
				if (wonderMsg) // should only be filled for connectivity candidates
					self.baseStub.sendOtherMessages(wonderMsg);
				break;
			default:
				console.log("?????? received unknown message: " + msg);
				console.log("forwarding original message to listeners");
				self.baseStub.sendOtherMessages(msg);
				break;
		}
	};


	MessagingStub_IMS_Local.prototype.disconnect = function () {
		if (this.socket)
			this.socket.close();
		this.socket = null;
		this.listeners = new Array(new Array(), new Array(), new Array());
		this.buffer = new Array();
	};

	MessagingStub_IMS_Local.prototype.doSend = function (message) {
		var msgString = JSON.stringify(message);
		console.log("send message " + msgString);
		this.socket.send(msgString);
	};

	MessagingStub_IMS_Local.prototype.ims2CloudMessage = function (message_command, status_code, attributes) {
		var msg = new Object();
		msg.cmd = message_command;
		msg.status = status_code;
		msg.attributes = attributes;
		return msg;
	};

	return new MessagingStub_IMS_Local();
});
