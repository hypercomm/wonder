/**
 * @fileOverview WebRTC Framework to facilitate the development of Applications that seamless interoperate between each other
 * @author Paulo Chainho <paulo-g-chainho@ptinovacao.pt>
 * @author Steffen Druesedow <Steffen.Druesedow@telekom.de>
 * @author Miguel Seijo Simo <Miguel.Seijo@telekom.de>
 * @author Vasco Amaral <vasco-m-amaral@ptinovacao.pt>
 * @author Kay Haensge <Kay.Haensge@telekom.de>
 * @author Luis Oliveira <luis-f-oliveira@ptinovacao.pt>
 */
    
/*
 * TODO: State-machine for transitions of IdentityStatus should be described
 * TODO: Questions about MessagingStub-Listeners 
 * Why do the addListener and removeListener methods have a Message as second param?
 * What is the purpose? Which message type would it be?
 */

/**
 * @class
 * The Identity represents a user and contains all information needed to support 
 * Conversation services including the service endpoint to retrieve the protocol stack 
 * (Messaging Stub) that will be used to establish a signalling channel 
 * with the Identity domain messaging server.
 * </br><b>NOTE:</b> Identities are only created by using the corresponding create-methods of the Idp.
 * This constructor will throw an exception if it is used directly.
 */
function Identity(rtcIdentity, idpRtcIdentity) {
	console.log("idpRtcIdentity",idpRtcIdentity)
	if ( rtcIdentity )
		throw "Illegal attempt to create an Identity --> Please use Idp.getInstance().createIdentity(...) instead."
	
	// We use a string, RTCIdentityAssertion is not available.
	this.rtcIdentity = idpRtcIdentity;
	this.id = new Date().getTime();
	console.log( "####################");
	console.log( "created new Identiy for: " + this.rtcIdentity + " with id = " + this.id);
	console.trace();
	console.log( "####################");
	this.idp = "";
	this.presence = {
		status: IdentityStatus.IDLE
		//app: this.prototype.resolveMyApp()
	};
	
	// TODO: initialise presence status
    //this.presence.status = IdentityStatus.IDLE; // not initialized yet TODO: do state changes in a central place
	//this.presence.app = this.prototype.resolveMyApp(); // not initialized yet TODO: do state changes in a central place

	//this.status = IdentityStatus.IDLE; // TODO: to be replaced with Identity.presence
	this.context;


	this.sessionId = "";
	
	this.messagingStubLibUrl = "";
	this.messagingStub;
	this.notificationAddress;
	this.messagingAddress;
	this.credentials;
	this.tone;
	this.avatar;
};


/**
 * resolveMyApp
 * 
 * @returns AppType ... private function to resolve the type of Application used by the user 
 * 
 */
Identity.prototype.resolveMyApp = function() {
    // TODO: to check what kind of App is used:
	//     - Case is Web App running in a mobile browser it should return AppType.MOBILE_WEB_APP
	//     - Case is Mobile Web App running in a pc browser it should return AppType.WEB_APP
	
};

/**
 * This method downloads a messaging stub and keeps a reference to it in a local
 * attribute, if not already done before. That means the download will only be performed once.
 * After download it invokes the given callback with a reference to the downloaded MessagingStub.
 * 
 * @param callback {callback(MessagingStub)} callback that is invoked with messagingStub as param; if download failed then the stub param is empty
 */
Identity.prototype.resolve = function( callback ) {
	var that = this;
	console.log( "resolving identity: " + this.rtcIdentity);
	if ( ! this.messagingStub.impl ) {
		// not resolved yet --> let's ask Idp for a stub with the same downloadUri
		var knownStub = Idp.getInstance().getResolvedStub(this.messagingStubLibUrl);
		if ( knownStub) {
			this.messagingStub = knownStub;
			callback(this.messagingStub);
			return;
		}
		
		console.log( "downloading Messaging stub from: " + this.messagingStubLibUrl );

		// parse the downloadURL to get the name of the Stub
		var pathArr = this.messagingStubLibUrl.split("/");
		var stubName = pathArr[pathArr.length-1];
		stubName = stubName.substring(0, stubName.lastIndexOf("."));
		console.log("stub-name is: " + stubName );
		
		var check = function(stub, callback, count) {
			if ( typeof(window[stub]) == "function" ) {
				// instantiate stub
				var messagingStub = new window[stub]();
				//  should be an object now
				if ( typeof(messagingStub) == "object" ) {
					// assign the new messagingStub object to the "impl" field of the container stub
					that.messagingStub.setImpl(messagingStub);
					that.messagingStub.message = "stub downloaded from: " + that.messagingStubLibUrl;
					// return container-stub in callback
					callback(that.messagingStub);
				}
			}
			else {
				count++;
				if ( count < 20 )
					setTimeout( check, 500,  stub, callback, count );
				else {
					callback(); 
				}
			}
		};
		this.loadJSfile( this.messagingStubLibUrl );
		setTimeout( check, 100, stubName, callback, 0 );
	}
	else {
		console.log( this.rtcIdentity + ": no need to download stub from: " + this.messagingStubLibUrl);
		callback( this.messagingStub );
	}
};


/** 
 * 
 * This method subscribes to add a listener to receive status information (CONTEXT message type) from the user associated to this Identity. 
 * The Signalling on the fly concept is also used to ensure cross domain Presence management interoperability
 * by calling the Identiy.resolve() function
 * @param subscriber :
 *            Identity ... The identity of the subscriber
 * @param type :
 *            SubscriptionType ... The subscription type
 *
 */
Identity.prototype.subscribe = function(subscriber) {
	// TODO: get messagingStub by invoking Identity.resolve() function, add Identity as messagingStub listener (including the subscription contextId)  and send SUBSCRIBE message through the MessagingStub
	this.context = guid(); //check this
	that = this;
	var from = subscriber.rtcIdentity;
	var to = this.rtcIdentity;
	console.log("Identity to subscribe", to);
	console.log("Identity subscriber", subscriber);

	console.log("Identity subscribe");
	this.resolve(function(stub){
		
	    //message.contextId = guid();
		stub.addListener(that.onMessage(that), "presence." + to, that.context);
		stub.sendMessage(MessageFactory.createSubscribeMessage(from, to, ""));
	});
};

/** 
 * 
 * This method removes a listener previously added with "subscribe()"  function to receive status information 
 * (CONTEXT message type) from the user associated to this Identity
 * @param subscriber :
 *            Identity ... The identity of the subscriber
 * @param type :
 *            SubscriptionType ... The subscription type
 *
 */
Identity.prototype.unsubscribe = function(subscriber, type) {
	// TODO: get messagingStub by invoking Identity.resolve() function and send BYE message through the MessagingStub
	this.messagingStub.sendMessage(MessageFactory.createUnsubscribeMessage(message));
};


/**
 * To set Identity status and to publish it by sending a CONTEXT message to address "rtcIdentity.presence"
 * 
 * @param status :
 *            String ... The status to set
 * 
 */
 
Identity.prototype.setStatus = function(status, login) {
	//var message = new Object();
	//message.contextId = this.context;

	//from = identity.rtcIdentity;
	//to = this.rtcIdentity;
	var that = this;
	console.log("Identity SetStatus: ", status);

	this.presence.status = status;// TODO: change to that.presence.status = status;
	this.messagingStub.sendMessage(MessageFactory.createContextMessage(that.rtcIdentity, "", status, login, that.sessionId));	
    // TODO: check status transitions according to IdentityStatus state machine
	// TODO: Send a CONTEXT message to address "rtcIdentity.presence"
};

/**getPresence
 * To set Identity presence and to publish it by sending a CONTEXT message to address "rtcIdentity.presence"
 * 
 * @param presence :
 *            String ... The presence to set
 * 
 */
 
Identity.prototype.setPresence = function(presence) {

	var that = this;
	that.presence.status = presence;
	
    // TODO: check status transitions according to IdentityStatus state machine
	// TODO: Send a CONTEXT message to address "rtcIdentity.presence"
};

/**
 * To set Identity context and to publish it by sending a CONTEXT message to address "rtcIdentity.context"
 * 
 * @param context :
 *            String ... The context to set
 * 
 */
 
Identity.prototype.setContext = function(context) {

	this.context = context;
	this.messagingStub.sendMessage(MessageFactory.createContextMessage());
	// TODO: Send a CONTEXT message to address "rtcIdentity.context"
};


/**
 * getStatus
 * 
 * @returns IdentityStatus ... gets the presence status attribute for this Identity
 * 
 */
Identity.prototype.getStatus = function() {
// TODO: change to return this.presence.status;
	return this.presence.status;
};

/**
 * getPresence
 * 
 * @returns Presence ... gets the presence  attribute for this Identity
 * 
 */
Identity.prototype.getPresence = function() {
	return this.presence;
};


/**
 * sendMessage
 * 
 * @sendmessage ...sendMessage
 * 
 */


Identity.prototype.sendMessage = function(message) {
	this.messagingStub.sendMessage(message);
};

/**
 * getContext
 * 
 * @returns ContextData ... gets the context attribute for this Identity
 * 
 */
Identity.prototype.getContext = function() {
	return this.context;
};

/** 
 * getMessagingStubDownloadUrl
 * 
 * @returns URL ... gets the URL to download the MessagingStub for this Identity
 * 
 */
Identity.prototype.getMessagingStubDownloadUrl = function() {
	//will be needed to the Idp 
	return this.messagingStubDownloadUrl;
};


/**
 *
 * OnLastMessagingListerner is invoked by the MessagingStub as soon as the last listener has un-subscribed.
 * We use this callback to disconnect and unload the MessagingStub. 
 * 
 */
Identity.prototype.onLastMessagingListener = function() {
	if ( this.messagingStub )
		this.messagingStub.disconnect();
	// "undefine" messagingStub 
	delete this.messagingStub;
};

/**@ignore 
 * Simple function to load an external Javascript file at runtime.
 * TODO: This might be a security risk, because the file is executed immediately.
 * @param url ... url of the file to be loaded
 */
Identity.prototype.loadJSfile = function(url) {
	var fileref = document.createElement('script');
	fileref.setAttribute("type", "text/javascript");
	fileref.setAttribute("src", url);
	if (typeof fileref != "undefined")
		document.getElementsByTagName("head")[0].appendChild(fileref);
};

Identity.prototype.onMessage = function(message){
	console.log("MESSAGES-->",message)
	switch(message.type){
		case MessageType.CONTEXT:
			this.setStatus(message.identityPresence.status);
			break;
		case MessageType.ACCEPTED:
			break;
		case MessageType.NOT_ACCEPTED:
			break;
		case MessageType.CANCEL:
			break;
		default:
			break;
	}

}