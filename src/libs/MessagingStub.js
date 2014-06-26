/**
 * @fileOverview WebRTC Framework to facilitate the development of Applications that seamless interoperate between each other
 * @author Paulo Chainho <paulo-g-chainho@ptinovacao.pt>
 * @author Steffen Druesedow <Steffen.Druesedow@telekom.de>
 * @author Miguel Seijo Simo <Miguel.Seijo@telekom.de>
 * @author Vasco Amaral <vasco-m-amaral@ptinovacao.pt>
 * @author Kay Haensge <Kay.Haensge@telekom.de>
 * @author Luis Oliveira <luis-f-oliveira@ptinovacao.pt>
 */

/**
 *
 * @class
 * The MessagingStub implements the the protocol Stack used to communicate with a certain Messaging server.
 * It defines a set of methods that must be implemented in order to support a new domain.
 * 
 */
function MessagingStub() {
	this.impl = null;
	this.message = "No implementation downloaded and assigned to this stub yet!";

	// do the listener handling already here
	this.listeners = new Array(new Array(), new Array(), new Array());
	this.buffer = new Array();
}


MessagingStub.prototype.setImpl = function(stubImplementation) {
	this.impl = stubImplementation;
	// put a ref to the base stub into the impl
	this.impl.baseStub = this;
};

/** @ignore
 *
 * addListener - Adds a listener. If the listener exists with the same contextID, doesn't add it again.
 * @param {StubEvtHandler} listener - Listener to execute its do(message) when a new message arrives. 
 * @param {URI} [rtcIdentity] - The RTCIdentity of the Identity to be notified. (optional)
 * @param {string} [contextId] - The ID of the context to be notified. If not specified it will receive invitation messages and messages without contextID. (optional)
 */
MessagingStub.prototype.addListener = function(listener, rtcIdentity, contextId) {
	// Checks that the listener is not on the list with the same context already
	var index = 0;
	while (this.listeners[0].indexOf(listener, index) != -1) {
		index = this.listeners[0].indexOf(listener, index);
		if (this.listeners[2][index] == contextId && this.listeners[1][index] == rtcIdentity)
			return;
	}

	// Adds the listener with the contextID to the listeners list.
	this.listeners[0].push(listener);
	this.listeners[1].push(rtcIdentity);
	this.listeners[2].push(contextId);

	for (var i = this.buffer.length - 1; i > -1; i--) {
		var message = this.buffer[i];
		var filtered_listeners = [];
		var idx = this.listeners[1].indexOf(message.from.rtcIdentity);
		while (idx != -1) {
			if (this.listeners[2][idx] == message.contextId)
				filtered_listeners.push(this.listeners[0][idx]);
			idx = this.listeners.indexOf(message.from.rtcIdentity, idx + 1);
		}
		filtered_listeners.forEach(function(element, index, array) {
			element(message);
		});
		if (filtered_listeners.length != 0)
			this.buffer.splice(i, 1);
	}
};


/** 
 * sendMessage - Sends the specified message.
 * @param {Message} message - Message to send. 
 */
MessagingStub.prototype.sendMessage = function(message) {
	if (this.impl) {
		this.impl.sendMessage(message);
	}
	else {
		console.log(this.message);
	}
};


/**
 * @ignore
 * 
 * removeListener - Removes a listener.
 * @param {StubEvtHandler} listener - Listener to execute its do(message) when a new message arrives. 
 * @param {URI} [rtcIdentity] - The RTCIdentity of the Identity. (required only if the listener to remove included it)
 * @param {string} [contextId] - The ID of the context. (required only if the listener to remove included it)
 */
MessagingStub.prototype.removeListener = function (listener, rtcIdentity, contextId) {
    var index = 0;
    if (!listener && !contextId) {
        while (this.listeners[1].indexOf(rtcIdentity, index) != -1) {
            index = this.listeners[1].indexOf(rtcIdentity, index);
            this.listeners[0].splice(index, 1);
            this.listeners[1].splice(index, 1);
            this.listeners[2].splice(index, 1);
        }
    } else {


        while (this.listeners[0].indexOf(listener, index) != -1) {
            index = this.listeners[0].indexOf(listener, index);
            if (this.listeners[2][index] == contextId && this.listeners[1][index] == rtcIdentity) {
                this.listeners[0].splice(index, 1);
                this.listeners[1].splice(index, 1);
                this.listeners[2].splice(index, 1);
                break; // Because in addListener already checks that there is only one.
            }
        }
    }
};

/**
 * Creates the connection, connects to the server and establish the callback to the listeners on new message. 
 * @param {URI} ownRtcIdentity - URI with the own RTCIdentity used to connect to the Messaging Server. 
 * @param {Object} credentials - Credentials to connect to the server.
 * @param {callback} callbackFunction - Callback to execute when the connection is done.
 */
MessagingStub.prototype.connect = function(ownRtcIdentity, credentials, callbackFunction) {
	if (this.impl) {
		this.impl.connect(ownRtcIdentity, credentials, callbackFunction);
	}
	else {
		console.log(this.message);
	}
};


/**
 * disconnect - Disconnects from the server.
 */
MessagingStub.prototype.disconnect = function() {
	if (this.impl) {
		this.impl.disconnect();
	}
	else {
		console.log(this.message);
	}
};


/**
 * @ignore
 * 
 * getListeners - Gets the list of listeners.
 * @returns [listener[], rtcIdentity[], contextID[]] Returns an 2-D array of listeners, rtcIdentities and contextIDs
 */
MessagingStub.prototype.getListeners = function() {
	return this.listeners;
};

/**
* @ignore
*/
MessagingStub.prototype.sendOtherMessages = function(message){

	var filtered_listeners = [];
	var idx = this.listeners[1].indexOf(message.from.rtcIdentity);
	while (idx != -1) {
		if (this.listeners[2][idx] == message.contextId)
			filtered_listeners.push(this.listeners[0][idx]);
		idx = this.listeners.indexOf(message.from.rtcIdentity, idx + 1);
	}
	filtered_listeners.every(function(element, index, array) {
		element(message);
	});
	if (filtered_listeners.length == 0) {
		this.buffer.push(message);
	}
}

/**
* @ignore
*/
MessagingStub.prototype.deliverMessage = function(message) {
	console.log("S->C: ", message);
	// Filter the listeners to redirect the message
	var that = this;
	
	if (message.type == MessageType.INVITATION || !message.contextId || message.type == MessageType.BYE)
	{
		if(this.listeners[0].length == 1){
			console.log("Registered an Handler: ", message);
			var filtered_listeners = [];
			var idx = this.listeners[2].indexOf(undefined);
			while (idx != -1) {
				filtered_listeners.push(this.listeners[0][idx]);
				idx = this.listeners.indexOf("", idx + 1);
			}
			filtered_listeners.every(function(element, index, array) {
				element(message);
			});

		}else{
			this.sendOtherMessages(message);
		}
		//regist an handler with contextId
	}
	else
	{
		this.sendOtherMessages(message);
	}
					
};
