
/*********************************************************************************
 * Messaging Stub Class 
 * For websocket
 */
function MessagingStub_OpenImsMS() {
	this.ownRtcIdentity;
	this.credentials;

	this.websocket;
	this.delayedMessages = {};
}

/**
 * Sends the specified message.
 * @param Message : message ... Message to send. 
 */
MessagingStub_OpenImsMS.prototype.sendMessage = function(message) {
	/*
	 * constructs an identifier for this msg from contextId + to
	 */
	getMessageKey = function(msg) {
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

	// From and To Identities are changed into strings containing rtcIdentities
	// To is always an array even if it wasnt.
	message.from = message.from.rtcIdentity;

	if (message.to instanceof Array)
		message.to.every(function(element, index, array) {
			array[index] = element.rtcIdentity;
		});
	else
		message.to = new Array(message.to.rtcIdentity);

	var msg = message;
	var msgKey = getMessageKey(message);
	console.log("msgKey = " + msgKey);

	switch (message.type) {
		case MessageType.INVITATION:
		case MessageType.ACCEPTED:
			this.delayedMessages[msgKey] = msg;
			console.log("set message on hold with key: " + msgKey);
			// don't send this msg now
			msg = null;
			break;

		case MessageType.CONNECTIVITY_CANDIDATE:
			// last candidate and we have a delayed message
			if (message.body.lastCandidate) {
				var delayedMessage = this.delayedMessages[msgKey]
				if (delayedMessage) {
					// replace RTCConnection with current localDescription in message.body.connectionDescription
					delayedMessage.body.connectionDescription = message.body.connectionDescription;
					msg = delayedMessage;
					delete this.delayedMessages[msgKey];
				}
			}
			else {
				// dont send candidates
				msg = null;
			}
			break;
		default:
			break;
	}
	if (msg) {
		var msgString = JSON.stringify(msg);
		this.websocket.send(msgString);
	}
};

/**
 * Creates the connection, connects to the server and establish the callback to the listeners on new message. 
 * @param Identity : manager ...
 * @param ???????? : credentials ... credentials to connect to the server.
 */
MessagingStub_OpenImsMS.prototype.connect = function(ownRtcIdentity, credentials, callbackFunction) {
	this.ownRtcIdentity = ownRtcIdentity;
	this.credentials = credentials;

	//DEFINE THE HOST ADDR
	var signaling_server = "192.168.7.216:8282";
	//var signaling_server = "192.168.7.4:8282";
//	var signaling_server = "150.140.184.247:8282";

	// If connect was already executed succesfully, it won't try to connect again, just execute the callback.
	if (this.websocket) {
		console.log("Websocket connection already opened, executing callback function: ");
		callbackFunction();
		return;
	}

	console.log('Opening channel: ws://' + signaling_server);
	this.websocket = new WebSocket('ws://' + signaling_server);

	this.websocket.onopen = function() {
		console.log("Websocket connection opened");
		callbackFunction();
	};
	this.websocket.onerror = function() {
		console.log("Websocket connection error");
	};
	this.websocket.onclose = function() {
		console.log("Websocket connection closed");
	};

	// Maps the websocket listener to the MessagingStub listeners, and notifies filtering
	// by contextId
	var that = this;
	this.websocket.onmessage = function(full_message) {
		// IF it doesnt have contextID, it is the application.
		var message = JSON.parse(full_message.data);
		Idp.getInstance().createIdentity(message.from, function(identity) {
			message.from = identity;

			// createIdentities can take array or single rtcIdentity and always returns an Array in the callback result
			Idp.getInstance().createIdentities(message.to, function(identityArr) {
				//message.to = new Array(identityArr);
				message.to = identityArr;

				that.baseStub.deliverMessage(message);
			});
		});

	};
}

/**
 * Disconnects from the server.
 */
MessagingStub_OpenImsMS.prototype.disconnect = function()
{
	this.websocket.close();
	this.websocket = null;
};
