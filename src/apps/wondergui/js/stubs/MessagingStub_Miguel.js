/*********************************************************************************
 * Messaging Stub Class
 * For websocket
 */
function MessagingStub_Miguel() {
	this.ownRtcIdentity;
	this.credentials;
	this.websocket;

    this.conversations=new Array();
}

/**
 * SendMessage
 * @param message... Message
 */
MessagingStub_Miguel.prototype.sendMessage = function (message) {
    console.log("C->S: ", message);
    var full_message = new Object();
    full_message.type = "message";
    full_message.body = message;


    // Multicast support for INVITE and UPDATE
    if ((message.type == MessageType.INVITATION || message.type == MessageType.UPDATE) && message.body.peers) {
        this.conversations.forEach(function (element, index, array) {
            if (element.contextId == message.contextId) array.splice(index, 1);
        });
        var conversation = new Object();
        conversation.contextId = message.contextId;
        conversation.peers = message.body.peers;
        this.conversations.push(conversation);
    }

    // Multicast support if to is empty
    if (!message.to) {
        var peers;
        var that=this;
        this.conversations.forEach(function (element, index, array) {
            if (element.contextId == message.contextId) peers = element.peers;
        });
        message.from = message.from.rtcIdentity;
        if(peers){
        	peers.forEach(function (element, index, array) {
            	full_message.to = element;
            	that.websocket.send(JSON.stringify(full_message));
        	});
        }

        return
    }

    // From and To Identities are changed into strings containing rtcIdentities
    // If To is an array, it sends it to the first position
    message.from = message.from.rtcIdentity;
    if (message.to instanceof Array) {
        message.to.every(function (element, index, array) {
            array[index] = element.rtcIdentity;
        });
        full_message.to = message.to[0];
    } else {
        message.to = new Array(message.to.rtcIdentity);
        full_message.to = message.to[0];
    }
    this.websocket.send(JSON.stringify(full_message));
};

/**
 * Connect
 */
MessagingStub_Miguel.prototype.connect = function(ownRtcIdentity, credentials, callbackFunction) {
	this.ownRtcIdentity = ownRtcIdentity;
	this.credentials = credentials;

	//DEFINE THE HOST ADDR
	var signaling_server = "192.168.8.4:1337";
	//signaling_server="172.16.62.66:1337";
	signaling_server = "150.140.184.247:1337";

	// If connect was already executed succesfully, it won't try to connect again, just execute the callback.
	if (this.websocket) {
		console.log("Websocket connection already opened, executing callback function: ");
		callbackFunction();
		return;
	}

	console.log('Opening channel: ws://' + signaling_server);
	this.websocket = new WebSocket('ws://' + signaling_server);

	var socket = this.websocket;
	this.websocket.onopen = function() {
		var message = new Object();
		message.type = "login";
		message.from = ownRtcIdentity;
		socket.send(JSON.stringify(message));
		console.log("Websocket connection opened and logging in as: " + ownRtcIdentity);
		callbackFunction();
	};

	this.websocket.onerror = function() {
		console.log("Websocket connection error");
	};
	this.websocket.onclose = function() {
		console.log("Websocket connection closed");
	};

	var that = this;
	// Maps the websocket listener to the MessagingStub listeners, and notifies filtering
	// by contextId
	this.websocket.onmessage = function(full_message) {
		// IF it doesnt have contextID, it is the application.
		var message = JSON.parse(full_message.data).body;

		Idp.getInstance().createIdentity(message.from, function(identity) {
			message.from = identity;

			// createIdentities can take array or single rtcIdentity and always returns an Array in the callback result
			Idp.getInstance().createIdentities(message.to, function(identityArr) {
				message.to = identityArr;

				that.baseStub.deliverMessage(message);
			});
		});
	};
}

/**
 * Disconnects from the server.
 */
MessagingStub_Miguel.prototype.disconnect = function() {
	this.websocket.close();
	this.websocket = null;
	console.log("Websocket connection disconnected");
};
