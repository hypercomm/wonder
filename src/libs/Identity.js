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
	this.status = IdentityStatus.IDLE; // not initialized yet TODO: do state changes in a central place
	
	this.messagingStubLibUrl = "";
	this.messagingStub;
	this.notificationAddress;
	this.messagingAddress;
	this.credentials;
	this.tone;
	this.avatar;
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


/**@ignore 
 * 
 * @param subscriber :
 *            Identity ... The identity of the subscriber
 */
Identity.prototype.subscribe = function(subscriber) {
	// TODO: This is presence related stuff --> postponed
};

/**@ignore 
 * publish
 * 
 * @param status :
 *            String ... The status to publish
 * @param target :
 *            Identity [] ... The identity/identities to publish the status to
 * @param context :
 *            String ... The context
 * 
 */
Identity.prototype.publish = function(status, target, context) {
	// TODO: This is presence related stuff --> postponed
	// TODO Send a publish message
};

/**@ignore 
 * getStatus
 * 
 * @returns IdentityStatus ... gets the status attribute for a participant
 * 
 */
Identity.prototype.getStatus = function() {
	return this.status;
};

/**@ignore 
 * getMessagingStubDownloadUrl
 * 
 * @returns IdentityStatus ... gets the status attribute for a participant
 * 
 */
Identity.prototype.getMessagingStubDownloadUrl = function() {
	//will be needed to the Idp 
	return this.messagingStubDownloadUrl;
};


/**@ignore
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

