// wonder_core.js 
//---------------- 


// ------------------------------- 
// Idp_options.js 
// ------------------------------- 

// Default IDP options, if nothing is given on application layer
// points to simple domain-based idp 
var idp_options = 
	{
		protocol : "http", 
		domain : "150.140.184.247", 
		port : '8088', 
		path: "/phase2/idp_php/index.php?jsonp=returnIdentity&filter_rtcIdentity="
	};

// IDP options for websockets, if nothing is given on application layer
// points to idp mongo
/*
var idp_options  = {
	protocol: "ws",
	domain: "150.140.184.246",
	port: "28017",
	path: "",
	wsQuery: wsQuery
}
*/
    
// Default IDP options, if nothing is given on application layer
// points to idp mongo 
/*var idp_options = 
	{
		protocol : "http", 
		domain : "150.140.184.246", 
		port : '28017', 
		path: "/webrtc/users/?jsonp=returnIdentity&filter_rtcIdentity="
	};
*/
// ------------------------------- 
// Enums.js 
// ------------------------------- 

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
 * Enumeration for the {@link Message} types
 * @readonly
 * @enum {string}
 */
var MessageType = {
        /** Message to invite a peer to a conversation. */
        INVITATION              : "invitation",
        /** Answer for conversation accepted. */
        ACCEPTED                : "accepted",
        /** Message contains connectivity candidate */
        CONNECTIVITY_CANDIDATE  : "connectivityCandidate",
        /** Answer for conversation not accepted. */
        NOT_ACCEPTED            : "notAccepted",
        /** Message to cancel an invitation */
        CANCEL                  : "cancel",
        /** Message to add a {@link Resource} to the conversation */
        ADD_RESOURCE            : "addResource",
        /** Message to remove a {@link Participant} from the conversation */
        REMOVE_PARTICIPANT      : "removeParticipant",
        /** Message to finish the communication with a peer */
        BYE                     : "bye",
        /** Message to add a new {@link Resource} */
        UPDATE                  : "update",
        /** Answer to add a new {@link Resource} */
        UPDATED                 : "updated",
    
        /** Message to offer a role (TO BE IMPLEMENTED) */
        OFFER_ROLE              : "offerRole",
        /** Message to setup redirection (TO BE IMPLEMENTED) */
        REDIRECT                : "redirect",
        /** Message to remove a {@link Resource} from the conversation (TO BE IMPLEMENTED) */
        RESOURCE_REMOVED        : "resourceRemoved",
        /** Message to share a {@link Resource} in the conversation (TO BE IMPLEMENTED) */
        SHARE_RESOURCE          : "shareResource"
};

/**
 * Enumeration for the {@link Participant} statuses
 * @readonly
 * @enum {string}
 */
var ParticipantStatus = {
        WAITING                 : "waiting",
        PENDING                 : "pending",
        PARTICIPATING           : "participating",
        NOT_PARTICIPATING       : "not_participating",
        PARTICIPATED            : "participated",
        MISSED                  : "missed",
        FAILED                  : "failed",
        CREATED                 : "created",
        ACCEPTED                : "accepted"
};

var ConversationStatus = {
        OPENED                  : "opened",
        INACTIVE                : "inactive",
        FAILED                  : "failed",
        ACTIVE                  : "active",
        CLOSED                  : "closed",
        CREATED                 : "created",
        RECORDING               : "recording",
        PLAYING                 : "playing",
        PAUSED                  : "paused",
        STOPPED                 : "stopped"

};

var ConversationTopicStatus = {
        PENDING                 : "pending",
        ACTIVE                  : "active",
        INACTIVE                : "inactive",
        CLOSED                  : "closed"
};

var IdentityStatus = {
        IDLE                    : "idle",
        UNAVAILABLE             : "unavailable",
        BUSY                    : "busy",
        AVAILABLE               : "available",
        ON_CONVERSATION         : "onConversation"
};

/**
 * Enumeration for the {@link Resource} types
 * @readonly
 * @enum {string}
 */
var ResourceType = {
        /** Webcam + microphone as source for mediastream */
        AUDIO_VIDEO             : "audioVideo",
        /** Microphone as source for audiostream */
        AUDIO_MIC               : "audioMic",
        /** Webcam as source for videostream */
        VIDEO_CAM               : "videoCam",
        /** Plain text chat */
        CHAT                    : "chat",
        /** File sending (TO BE IMPLEMENTED)*/
        FILE                    : "file",
        /** Screen content as source for videostream (TO BE IMPLEMENTED)*/
        SCREEN                  : "screen",
        /** Other types */
        OTHER                   : "other",
        /** Photo (TO BE IMPLEMENTED) */
        PHOTO                   : "photo",
        /** Video (TO BE IMPLEMENTED) */
        VIDEO                   : "video",
        /** Music (TO BE IMPLEMENTED) */
        MUSIC                   : "music"
};


var ResourceStatus = {
        NEW                     : "new",
        SHARED                  : "shared",
        NOT_SHARED              : "notShared",
        PLAYING                 : "playing",
        PAUSED                  : "paused",
        STOPPED                 : "stopped",
        ENDED                   : "ended",
        RECORDING               : "recording",
        LIVE                    : "live"
};
// ------------------------------- 
// adapter.js 
// ------------------------------- 

var RTCPeerConnection = null;
var getUserMedia = null;
var attachMediaStream = null;
var reattachMediaStream = null;
var webrtcDetectedBrowser = null;
var webrtcDetectedVersion = null;

function trace(text) {
  // This function is used for logging.
  if (text[text.length - 1] == '\n') {
    text = text.substring(0, text.length - 1);
  }
  console.log((performance.now() / 1000).toFixed(3) + ": " + text);
}

if (navigator.mozGetUserMedia) {
  console.log("This appears to be Firefox");

  webrtcDetectedBrowser = "firefox";

  webrtcDetectedVersion =
                  parseInt(navigator.userAgent.match(/Firefox\/([0-9]+)\./)[1]);

  // The RTCPeerConnection object.
  RTCPeerConnection = mozRTCPeerConnection;

  // The RTCSessionDescription object.
  RTCSessionDescription = mozRTCSessionDescription;

  // The RTCIceCandidate object.
  RTCIceCandidate = mozRTCIceCandidate;

  // Get UserMedia (only difference is the prefix).
  // Code from Adam Barth.
  getUserMedia = navigator.mozGetUserMedia.bind(navigator);

  // Creates iceServer from the url for FF.
  createIceServer = function(url, username, password) {
    var iceServer = null;
    var url_parts = url.split(':');
    if (url_parts[0].indexOf('stun') === 0) {
      // Create iceServer with stun url.
      iceServer = { 'url': url };
    } else if (url_parts[0].indexOf('turn') === 0 &&
               (url.indexOf('transport=udp') !== -1 ||
                url.indexOf('?transport') === -1)) {
      // Create iceServer with turn url.
      // Ignore the transport parameter from TURN url.
      var turn_url_parts = url.split("?");
      iceServer = { 'url': turn_url_parts[0],
                    'credential': password,
                    'username': username };
    }
    return iceServer;
  };

  // Attach a media stream to an element.
  attachMediaStream = function(element, stream) {
    console.log("Attaching media stream");
    element.mozSrcObject = stream;
    element.play();
  };

  reattachMediaStream = function(to, from) {
    console.log("Reattaching media stream");
    to.mozSrcObject = from.mozSrcObject;
    to.play();
  };

  // Fake get{Video,Audio}Tracks
  MediaStream.prototype.getVideoTracks = function() {
    return [];
  };

  MediaStream.prototype.getAudioTracks = function() {
    return [];
  };
} else if (navigator.webkitGetUserMedia) {
  console.log("This appears to be Chrome");

  webrtcDetectedBrowser = "chrome";
  webrtcDetectedVersion =
             parseInt(navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./)[2]);

  // Creates iceServer from the url for Chrome.
  createIceServer = function(url, username, password) {
    var iceServer = null;
    var url_parts = url.split(':');
    if (url_parts[0].indexOf('stun') === 0) {
      // Create iceServer with stun url.
      iceServer = { 'url': url };
    } else if (url_parts[0].indexOf('turn') === 0) {
      if (webrtcDetectedVersion < 28) {
        // For pre-M28 chrome versions use old TURN format.
        var url_turn_parts = url.split("turn:");
        iceServer = { 'url': 'turn:' + username + '@' + url_turn_parts[1],
                      'credential': password };
      } else {
        // For Chrome M28 & above use new TURN format.
        iceServer = { 'url': url,
                      'credential': password,
                      'username': username };
      }
    }
    return iceServer;
  };

  // The RTCPeerConnection object.
  RTCPeerConnection = webkitRTCPeerConnection;

  // Get UserMedia (only difference is the prefix).
  // Code from Adam Barth.
  getUserMedia = navigator.webkitGetUserMedia.bind(navigator);

  // Attach a media stream to an element.
  attachMediaStream = function(element, stream) {
    if (typeof element.srcObject !== 'undefined') {
      element.srcObject = stream;
    } else if (typeof element.mozSrcObject !== 'undefined') {
      element.mozSrcObject = stream;
    } else if (typeof element.src !== 'undefined') {
      element.src = URL.createObjectURL(stream);
    } else {
      console.log('Error attaching stream to element.');
    }
  };

  reattachMediaStream = function(to, from) {
    to.src = from.src;
  };

  // The representation of tracks in a stream is changed in M26.
  // Unify them for earlier Chrome versions in the coexisting period.
  if (!webkitMediaStream.prototype.getVideoTracks) {
    webkitMediaStream.prototype.getVideoTracks = function() {
      return this.videoTracks;
    };
    webkitMediaStream.prototype.getAudioTracks = function() {
      return this.audioTracks;
    };
  }

  // New syntax of getXXXStreams method in M26.
  if (!webkitRTCPeerConnection.prototype.getLocalStreams) {
    webkitRTCPeerConnection.prototype.getLocalStreams = function() {
      return this.localStreams;
    };
    webkitRTCPeerConnection.prototype.getRemoteStreams = function() {
      return this.remoteStreams;
    };
  }
} else {
  console.log("Browser does not appear to be WebRTC-capable");
}

// ------------------------------- 
// helpfunctions.js 
// ------------------------------- 

/**
* @ignore
*/

function uuid4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
}

function guid() {
    return uuid4() + uuid4() + '-' + uuid4() + '-' + uuid4() + '-' + uuid4()
            + '-' + uuid4() + uuid4() + uuid4();
}
// ------------------------------- 
// Identity.js 
// ------------------------------- 

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


// ------------------------------- 
// Idp.js 
// ------------------------------- 

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
 * The Idp is a singleton object, there will always be just one instance of it, 
 * no matter how often the constructor is called.
 * @class
 */
function Idp(rtcIdentity, options) {

	// ensure that there is always just a singleton instance of the Idp, 
	// no matter how often the constructor is called
    
    
    
	if (arguments.callee.singleton) {
		return arguments.callee.singleton;
	}
	arguments.callee.singleton = this;

	if ( ! options ) {
		if ( typeof idp_options != 'undefined')
			options = idp_options;
		else 
			options = {};
	}
	//needs to know the domain of my identity
	var that = this;
    this.instance;
	this.domain = options.domain || '150.140.184.246';
    this.protocol = options.protocol || 'http';
    this.wsQuery = options.wsQuery;
	this.port = options.port || '28017';
	this.path = options.path || '/webrtc/users/?jsonp=returnIdentity&filter_rtcIdentity=';
	if ( this.path.indexOf('/') != 0 )
		this.path = "/" + this.path;
	this.messagingstubs = [];
	this.identities = []; // to collect all created Identities [ messagingAddress , Identity]
	this.pendingIdentities = {};
	this.ownMessagingLibUrl;
	this.ownRtcIdentity = rtcIdentity;
    this.returnIdentity;
	// initialize with a new MessagingStub delegator/container
	this.myOwnMessagingStub = new MessagingStub();
	console.log("created idp with domain:port: " + this.domain + ":" + this.port);
    console.log("Idp rtcIdentity: ", rtcIdentity);
    console.log("options: ", rtcIdentity);
    
	// SD: 02.06.2014, fix: only do this, if the given rtcIdentity is instance of Identity to make apps work again
	// Who needs this piece of code here?
    if(rtcIdentity instanceof Identity){
        //var stub = new MessagingStub();
        this.ownMessagingLibUrl = rtcIdentity.messagingStubLibUrl;
        this.myOwnMessagingStub = rtcIdentity.messagingStub;
        /*this.messagingstubs.push({
            "name": rtcIdentity.messagingStubLibUrl,
            "messagingStub": stub //put the general messagingstub in a way that can be shared to the other clients and then use It
        }); */
        this.identities.push({
            "messagingAddress": rtcIdentity.messagingAddress,
            "identity": rtcIdentity
        });
        console.log("Idp.this: ", this);
        rtcIdentity.idp = this;
    }
}

/**
 * This is a getter for an already created instance of the IDP.
 * The params are optional. In case there was no instance already created before, 
 * the params can also be given here and will then be used for initial creation of the object.
 */
Idp.getInstance = function(rtcIdentity, options) {
    console.log("Idp.getInstance --> instance: ", this.instance);
    if(!this.instance){
        this.instance = new Idp(rtcIdentity, options);
    }
    
    return this.instance;
};


Idp.prototype.checkForIdentity = function(rtcIdentity) {
	// do we already have this rtcIdentity in the identities array ?
	for (var i = 0; i < this.identities.length; i++) {
		if (rtcIdentity == this.identities[i].identity.rtcIdentity) {
			return this.identities[i].identity;
		}
	}
	return null;
};

Idp.prototype.getResolvedStub = function(downloadUri) {
 	// do we already have a stub for the same downloadUri with impl != undefined
 	for (var i = 0; i < this.messagingstubs.length; i++) {
	 	if (downloadUri == this.messagingstubs[i].name) {
	 		if ( this.messagingstubs[i].messagingStub.impl)
	 			return this.messagingstubs[i].messagingStub;
	 	}
 	}
 	return null;
};

/**
 * This method takes either a single rtcIdentity or an array of rtcIdentities and 
 * creates Identity objects from them. The successfully created Identities are 
 * then returned in an Array in the success callback.
 * If one or more rtcIdentities can't be created then the returned array is shorter 
 * than the given array.
 */
Idp.prototype.createIdentities = function(rtcIdentities, onSuccessCallback, onErrorCallback) {
	console.log("Idp > createIdentities.");
	var results = [];
	var ids = [];
	var count = 0;
	var that = this;

	if (! (rtcIdentities instanceof Array)) {
		ids.push(rtcIdentities);
	}
	else {
		ids = rtcIdentities;
	}

	var internalSuccessCallback = function(identity) {
		count++;
		results.push(identity);
		if(count < ids.length)
			that.createIdentity(ids[count], internalSuccessCallback, internalErrorCallback);
		else //if(count == ids.length){
			onSuccessCallback(results);
			
	};

	var internalErrorCallback = function() {
		console.log("Idp > internalErrorCallback error");
		count++;
		if (count == ids.length)
			onSuccessCallback(results);
        else
            that.createIdentity(ids[count], internalSuccessCallback, internalErrorCallback);
	}

    
    this.createIdentity(ids[0], internalSuccessCallback, internalErrorCallback);
};


Idp.prototype.createIdentity = function(rtcIdentity, onSuccessCallback, onErrorCallback) {
    
    // @callback function in the url
	this.returnIdentity = function(data) {
        console.log("data ", data);
		//see if the identity exists
		if (data.rows.length > 0) {
            
            console.log("data.rows[0]: ", data.rows[0]);
            
			var localStubURL = data.rows[0].localMsgStubURL;
			var generalStubURL = data.rows[0].messagingStubURL;

			// first identity is expected to be the own identity !?
			if (that.identities.length <= 0) {
				// use local stub url, if available, general stub if no local available
				if (localStubURL) {
					console.log("found localMsgStubURL for IDP owning Identity: " + localStubURL);
					that.ownMessagingLibUrl = localStubURL;
				}
				else
					that.ownMessagingLibUrl = generalStubURL;
			}

			var existStub = false;
			var index = null;

			// invoke without rtcIdentity, otherwise exception will be thrown
			//identity = new Identity(null, data.rows[0].rtcIdentity);
			identity = pendingIdentity;

			// if new identity has the same local stub url as the idp itself, then use this one
			if (localStubURL === that.ownMessagingLibUrl) {
				console.log("use localMsgStubURL for new Identity: " + localStubURL);
				identity.messagingStubLibUrl = that.ownMessagingLibUrl;
			}
			else
				identity.messagingStubLibUrl = generalStubURL;

			//create the identity with the right fields
			identity.messagingAddress = data.rows[0].messagingAddress;
			identity.idp = that;

			identity.credentials = {
				"username": data.rows[0].rtcIdentity,
				"password": data.rows[0].password
			};

			//if it is equal then messagingStub of remote equals to mine
			if (typeof that.ownMessagingLibUrl !== 'undefined') {
				if (that.ownMessagingLibUrl == identity.messagingStubLibUrl) {
					identity.messagingStub = that.myOwnMessagingStub;
				} else {
					for (var i = 0; i < that.messagingstubs.length; i++) {
						//compare if already exist
						if (that.messagingstubs[i].name == identity.messagingStubLibUrl) {
							existStub = true;
							index = i;
							break;
						}
					}
					if (existStub) {
						//if exist the stub then identity stub equals to the exist one
						identity.messagingStub = that.messagingstubs[index].messagingStub;
					} else {
						// @pchainho TODO should only instantiate a general messagingStub, the MessagingStub lib is not downloaded at this point
						var stub = new MessagingStub();
						identity.messagingStub = stub;
						that.messagingstubs.push({
							"name": identity.messagingStubLibUrl,
							"messagingStub": stub //put the general messagingstub in a way that can be shared to the other clients and then use It
						});
					}
				}
			}
			that.identities.push({
				"messagingAddress": data.rows[0].messagingAddress,
				"identity": identity
			});
			if ( pendingIdentity && rtcIdentity == pendingIdentity.rtcIdentity ) {
				console.log("cleaning up pendingIdentity");
				delete that.pendingIdentities[rtcIdentity];
			}
			onSuccessCallback(identity);
		} else {
			onErrorCallback();
		}
	};

	// handle potentially wrong usage 
	// check for the possibility that the given rtcIdentity is not a String but already of type identity
	if (rtcIdentity instanceof Identity)
		// if yes return it and stop
		return rtcIdentity;

	// handle potentially wrong usage 
	if (rtcIdentity instanceof Array) {
		throw "Wrong usage. Don't call createIdentity() with an array as first param --> use createIdentities() instead"
		return;
	}

	// does the Idp already know this identity ?
	var that = this;
	var identity = this.checkForIdentity(rtcIdentity);

	// if identity already known, return it and stop
	if (identity) {
		onSuccessCallback(identity);
		return;
	}
	
	var pendingIdentity = this.pendingIdentities[rtcIdentity];
	
	console.log("pendingIdentity: " + pendingIdentity);
	if ( pendingIdentity && rtcIdentity == pendingIdentity.rtcIdentity ) {
		console.log("pendingId-entity matches rtcIdentity: " + rtcIdentity + " --> returning it");
		onSuccessCallback(pendingIdentity);
		return;
	}
	console.log("no matching pendingIdentity --> creating new one");
	pendingIdentity = new Identity(null, rtcIdentity);
	this.pendingIdentities[rtcIdentity] = pendingIdentity;

	if(/^-?[\d.]+(?:e-?\d+)?$/.test(rtcIdentity)){ 
		rtcIdentity = "pstn@imsserver.ece.upatras.gr";
	    }else{
		var split = rtcIdentity.split('@')
		if(split.length ==2){
		    if(/^-?[\d.]+(?:e-?\d+)?$/.test(split[0])){ 
		        rtcIdentity = "pstn@imsserver.ece.upatras.gr";
		    }
		}
	    }
    

    if(this.protocol == "ws"){
        this.wsQuery(rtcIdentity, this.returnIdentity);
        console.log("PROTOCOL RTCIDENTITY: ", rtcIdentity);
    }else{
        // do a lookup in the IDP-DB
//        loadJSfile('http://' + this.domain + ':' + this.port + '/webrtc/users/?filter_rtcIdentity=' + rtcIdentity +'&jsonp=returnIdentity');
		var urlString = this.protocol + '://' + this.domain + ':' + this.port + this.path + rtcIdentity;
		console.log( "loading Identity from: " +  urlString);
	    loadJSfile(urlString);
        returnIdentity = this.returnIdentity;
    }
	
    //loadJSfile(this.protocol + '://' + this.domain + ':' + this.port + '/' + this.path + rtcIdentity);

	
}

// @pchainho retrieve Identity from its Messaging Address. Needed to process received messages in the Stub

Idp.prototype.getIdentity = function(messageAddress) {
	for (var i = 0; i < this.identities.length; i++) {
		if (this.identities[i].messagingAddress === messageAddress)
			return this.identities[i].identity;
	}

}
//load the file with the information about an identity
loadJSfile = function(url) {
	var fileref = document.createElement('script');
	fileref.setAttribute("type", "text/javascript");
	fileref.setAttribute("src", url);
	if (typeof fileref != "undefined")
		document.getElementsByTagName("head")[0].appendChild(fileref);
};



/*
 This class implement the creation of remote identities and the creation of me
 
 In the creation of this.me: 
 this.createIdentity will be called and create an identity with the parameters that are retrieved on the "GET" operation.
 After that do a callback function with the identity information as a parameter.
 Then: this.me = identity; and do the resolve. I added a the listener parameter to this identity add the application listener to his identity.
 and then connects to the stub that is returned by the resolve.
 
 
 For remote identities. will verify if this.me is already defined if it is not callbackerror (not implemented yet),
 if this.me is defined then will create the identity with the fields retrieved from the idpserver and then add the stub
 to this.messagingstubs and the identity with the correspondent messagingServer in the this.identities array.
 
 The getIdentity is not working yet <- fix it soon */

// ------------------------------- 
// Message.js 
// ------------------------------- 

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
 * @class
 * Message - This class is a data-holder for all messages that are sent between the domains.  
 * @param {Identity} from - Sender of the message
 * @param {Identity[]} [to] - Recipients of the message
 * @param {MessageBody} body - Message body (a json struct)
 * @param  {MessageType} type - Type of the Message (@see MessageType)
 * @param  {string} [context] - ID of the conversation. (Optional. For conversation related messages it is mandatory.)
 */
function Message(from, to, body, type, context) {
    // generate unique id for this message
    this.id = guid();
    this.from = from;
    this.to = to;
    this.body = body;
    this.type = type;

    // Optional. For conversation related messages it is mandatory 
    this.contextId = context;

    this.reply_to_uri;
    this.previous;
}

/**
 * @ignore
 *
 * newReplyMessage - This is a special factory method for a "reply-message".
 * It takes a previous message and swaps their from and to fields.
 * 
 * @param {MessageBody} body - Message body (a json struct)
 * @param {Message} previousMessage - Message to generate the reply from.
 * @param {MessageType} type - Message type.
 * @param {Identity} me - reply_to_uri identity.
 */
Message.prototype.newReplyMessage = function(body, previousMessage, type, me) {
    if (!previousMessage || !body || !type)
        return;
    // create a new message with swapped from and to fields (taken from previous message)
    // DONE: take Myself as from, take all previous.to - ME plus original sender as to
    var to = new Array();

    // Take all previous to - ME
    previousMessage.to.every(function(element, index, array) {
        if (element != me)
            to.push(element);
    });

    // + original sender
    to.push(previousMessage.from);

    var rm = new Message(me, to, body, type);
    rm.previous = previousMessage;
    rm.reply_to_uri = me;
    return (rm);
};
// ------------------------------- 
// MessageFactory.js 
// ------------------------------- 

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
 * @class
 * This class creates WONDER-compliant messages. Please note that all functions in this class are static, so there is no need to create MessageFactory objects.
 */
function MessageFactory() {
}


/**
 * createInvitationMessage - Creates an Invitation message, the connectionDescription field will be empty and has to be filled before sending.
 *
 *
 * @param {Identity} from - The {@link Identity} that figures as sender of the message.
 * @param {Identity[]} to - The Array of {@link Identity} that figures as receiver of the message. 
 * @param {string} contextId - The contextId of the conversation related to the invitation.
 * @param {ResourceConstraints} constraints - The resource constraints for the resources initialized on conversation start.
 * @param {string} [conversationURL] - The URL of the conversation (optional).
 * @param {string} [subject] - The subject of the conversation. (optional).
 * @param {Identity} [hosting] - The host of the conversation (optional). [NOT IMPLEMENTED, by default the host will be the one starting the conversation]
 * @return The created Message
 *
 */
MessageFactory.createInvitationMessage = function(from, to, contextId, constraints, conversationURL, subject, hosting, agenda, peers) {
    var invitationBody = new Object();
    invitationBody.conversationURL = conversationURL;
    invitationBody.connectionDescription = "";
    invitationBody.subject = subject;
    invitationBody.hosting = hosting;
    invitationBody.agenda = agenda;
    invitationBody.peers = peers;
    invitationBody.constraints = constraints;

    var invitationMessage = new Message(from, to, invitationBody, MessageType.INVITATION, contextId);
    return invitationMessage;
}

/**
 * createAnswerMessage - Creates an Answer message, the connectionDescription field will be empty and has to be filled before sending.
 *
 * @param {Identity} from - The {@link Identity} that figures as sender of the message.
 * @param {Identity[]} to - The Array of {@link Identity} that figures as receiver of the message. 
 * @param {string} contextId - The contextId of the conversation related to the invitation.
 * @param {ResourceConstraints} constraints - The resource constraints for the resources initialized on conversation start.
 * @param {Identity} [hosting] - The host of the conversation (optional). [NOT IMPLEMENTED, by default the host will be the one starting the conversation]
 * @param {Identity[]} connected - Array of {@link Identity} that are already connected to the conversation. Used to establish the order in the connection flow for multiparty.
 * @return The created Message
 *
 */
MessageFactory.createAnswerMessage =  function(from, to, contextId, constraints, hosting, connected) {
    var answerBody = new Object();
    answerBody.connectionDescription = "";
    answerBody.hosting = hosting;
    answerBody.connected = connected;
    answerBody.constraints = constraints;
    
    var answerMessage = new Message(from,to,answerBody,MessageType.ACCEPTED,contextId);
    return answerMessage;
}

/**
 * createCandidateMessage - Creates a Message containing an ICE candidate
 *
 * @param {Identity} from - The {@link Identity} that figures as sender of the message.
 * @param {Identity[]} to - The Array of {@link Identity} that figures as receiver of the message. 
 * @param {string} contextId - The contextId of the conversation related to the invitation.
 * @param {string} label - The label of the candidate.
 * @param {string} id - The id of the candidate.
 * @param {string} candidate - The ICE candidate string.
 * @param {boolean} lastCandidate - Boolean indicating if the candidate is the last one. If true, include the full SDP in the candidate parameter for compatibility with domains that don't support trickling.
 * @return The created Message
 *
 */

MessageFactory.createCandidateMessage = function (from, to, contextId, label, id, candidate, lastCandidate) {
    if (lastCandidate == false) {
        var candidateBody = new Object();
        candidateBody.label = label;
        candidateBody.id = id;
        candidateBody.candidateDescription = candidate;
        candidateBody.lastCandidate = false;
    }
    else{
        var candidateBody = new Object();
        candidateBody.label = label;
        candidateBody.id = id;
        candidateBody.candidateDescription = "";
        candidateBody.connectionDescription = candidate;
        candidateBody.lastCandidate = true;
    }
    
    var candidateMessage = new Message(from,to,candidateBody,MessageType.CONNECTIVITY_CANDIDATE,contextId);
    return candidateMessage;
}



/**
 * createUpdateMessage - Creates an Update message, the newConnectionDescription field will be empty and has to be filled before sending.
 *
 *
 * @param {Identity} from - The {@link Identity} that figures as sender of the message.
 * @param {Identity[]} to - The Array of {@link Identity} that figures as receiver of the message. 
 * @param {string} contextId - The contextId of the conversation related to the invitation.
 * @param {ResourceConstraints} newConstraints - The resource constraints for the resources to update.
 * @return The created Message
 *
 */
MessageFactory.createUpdateMessage = function(from, to, contextId, newConstraints,hosting) {
    var updatebody = new Object();
    updatebody.newConnectionDescription = "";
    updatebody.newConstraints = newConstraints;
    updatebody.hosting = hosting;
    //updatebody.agenda = agenda;
    //updatebody.dataCodecs = dataCodecs;

    var updateMessage = new Message(from, to, updatebody, MessageType.UPDATE, contextId);
    return updateMessage;
}


/**
 * createUpdatedMessage - Creates an Updated message, the newConnectionDescription field will be empty and has to be filled before sending.
 *
 *
 * @param {Identity} from - The {@link Identity} that figures as sender of the message.
 * @param {Identity[]} to - The Array of {@link Identity} that figures as receiver of the message. 
 * @param {string} contextId - The contextId of the conversation related to the invitation.
 * @param {ResourceConstraints} newConstraints - The resource constraints for the resources to update.
 * @return The created Message
 *
 */
MessageFactory.createUpdatedMessage = function(from, to, contextId, newConstraints,updated,hosting) {
    var updatebody = new Object();
    updatebody.newConnectionDescription = "";
    updatebody.newConstraints = newConstraints;
    updatebody.updated = updated;
    updatebody.hosting = hosting;
    //updatebody.agenda = agenda;
    //updatebody.dataCodecs = dataCodecs;
    
    var updateMessage = new Message(from, to, updatebody, MessageType.UPDATED, contextId);
    return updateMessage;
}


MessageFactory.createNotAccepted =  function(message) {
    var notAcceptedMessage = new Message(message.to, message.from,"",MessageType.NOT_ACCEPTED, message.contextId);
    return notAcceptedMessage;
}


// ------------------------------- 
// MessagingStub.js 
// ------------------------------- 

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
	
	if (message.type == MessageType.INVITATION || !message.contextId || message.type == MessageType.REMOVE_PARTICIPANT)
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

// ------------------------------- 
// Codec.js 
// ------------------------------- 

/**
 * @fileOverview WebRTC Framework to facilitate the development of Applications that seamless interoperate between each other
 * @author <a href="mailto:paulo-g-chainho@ptinovacao.pt">Paulo Chainho</a>
 * @author <a href="mailto:Steffen.Druesedow@telekom.de">Steffen Druesedow</a>
 * @author <a href="mailto:Miguel.Seijo@telekom.de">Miguel Seijo</a>
 * @author <a href="mailto:vasco-m-amaral@ptinovacao.pt">Vasco Amaral</a>
 * @author <a href="mailto:Kay.Haensge@telekom.de">Kay Haensge</a>
 * @author <a href="mailto:luis-f-oliveira@ptinovacao.pt">Luis Oliveira</a>
 */

//Codec.send() processa a msg e encaminha para DataBroker.send() q encaminha para channel.sen() 


//channel.onmessage --> deveria estar incorporado no Codec.prototype.onData??? e depois passar para o Broker e encaminhar para o utilizador correcto com o Codec correcto?...
//O DataBroker implementa channel.onmessage() e encaminha as mensagens recebidas para o Codec.onData(), seguindo o procedimento q falamos na última reunião e especificado no UML. Ie olha para o codecId em DataMsg.codecId() e procura na sua lista de DataBroker.codecs[]


/**
 * @class
 * Codec Class
 *
 */

function Codec(type, CodecLibUrl, dataBroker){
    this.listeners = [];
    this.id = guid();
    this.type = type;
    this.description;
    this.CodecLibUrl = CodecLibUrl;
    this.mime_type;
    this.dataBroker = dataBroker;
    this.chunkLength = 1000;
    this.arrayToStoreChunks = [];
}


/**
 * send function
 * @param.. input
 */

Codec.prototype.send = function( input ){
    var aux = JSON.parse(input);
    //How to change the mimetype of input.body is equal to this.mimetype 
    if(!this.dataBroker)
        return;
    if(this.type=="chat"){
        this.dataBroker.send(input);
    }else{ // case file Sharing...
        var reader = new window.FileReader();

        // get file from system
        var fileElement = document.getElementById(aux.body);
        var file = fileElement.files[0];
        var thatCodec = this;
        var readFile = function(event,text){
            var data = {}; // data object to transmit over data channel

            if (event) text = event.target.result; // on first invocation

            if (text.length > 1000) {
                data.message = text.slice(0, 1000); // getting chunk using predefined chunk length
            } else {
                data.message = text;
                data.last = true;
            }
            aux.body = data;
            thatCodec.dataBroker.send(JSON.stringify(aux));

            var remainingDataURL = text.slice(data.message.length);
            if (remainingDataURL.length) setTimeout(function () {
                readFile(null, remainingDataURL); // continue transmitting
            }, 500)
        };
        reader.readAsDataURL(file);
        reader.onload =readFile;
    }

}

/**
 * getReport function
 * @param.. reportHandler
 */

Codec.prototype.getReport = function( reportHandler ){

    //??

}


/**
 * onData function
 * @param.. dataMsg
 */

Codec.prototype.onData = function( dataMsg ){

    //take data and treat it
    console.log(this.listeners);
    if(this.type=="chat"){
        this.listeners.every(function(element, index, array){
            element('ondatamessage',dataMsg);
        });
    }else{
        //var data = JSON.parse(dataMsg.body.message);
        this.arrayToStoreChunks.push(dataMsg.body.message);
        if (dataMsg.body.last) {
            this.saveToDisk(this.arrayToStoreChunks.join(''), 'fileName');
            this.arrayToStoreChunks = []; // resetting array
        }
    }
}


/**
 * addListener function
 * @param.. listener
 */

Codec.prototype.addListener = function( listener ){

    this.listeners.push(listener);

}


/**
 * removeListener function
 * @param.. listener
 */

Codec.prototype.removeListener = function( listener ){

    var index = 0;
    if(this.listeners.indexOf(listener, index) !== -1){
        index = this.listeners.indexOf(listener, index);
        this.listeners.splice(index, 1);
    }


}


/**
 * setDataBroker function
 * @param.. listener
 */

Codec.prototype.setDataBroker = function( dataBroker ){

    this.dataBroker = dataBroker;

}

/**
 * save file to local Disk
 *
 * @param fileUrl
 * @param fileName
 */
Codec.prototype.saveToDisk= function(fileUrl, fileName) {
    var save = document.createElement('a');
    save.href = fileUrl;
    save.target = '_blank';
    save.download = fileName || fileUrl;
    var evt = document.createEvent('MouseEvents');
    evt.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);

    save.dispatchEvent(evt);

    (window.URL || window.webkitURL).revokeObjectURL(save.href);
}
// ------------------------------- 
// DataCodec.js 
// ------------------------------- 

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
 * Class DataMessage
 * creates all the json associated to the codecs messages 
 * @class
 */

function DataMessage (codecId, to, body){


	this.codecId = codecId;
	this.to = to; //in case empty it sends the message to all clients
	this.body = body;
}
// ------------------------------- 
// DataMessage.js 
// ------------------------------- 

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
 * Class DataMessage
 * creates all the json associated to the codecs messages 
 * @class
 */

function DataMessage (codecId, to, from, body){


	this.codecId = codecId;
	this.to = to; //in case empty it sends the message to all clients
	this.body = body;
	this.from = from;
}
// ------------------------------- 
// DataBroker.js 
// ------------------------------- 

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
 * Class DataBroker
 * @class
 */
function DataBroker(){

	//constructor DataBroker
	this.codecs = [];
	this.channels = [];
}

/**
 * onDataChannelEvt
 */

DataBroker.prototype.onDataChannelEvt = function( msg ){

	var that = this;
	console.log(msg);
	/*console.log(this.codecs);
	console.log(this.channels);*/
	for(var i = 0; i < this.channels.length; i++){
		this.channels[i].channel.onmessage = function(msg){
			var msgObject = JSON.parse(msg.data);
			console.log("MESSAGE: ", msg);
			//that.codecs[0].onData(msgObject);
			for(var i = 0; i < that.codecs.length; i++){
				console.log("that.codecs[i].id: ", that.codecs[i].id);
				console.log("msgObject.codecId: ", msgObject.codecId);
				if( that.codecs[i].id == msgObject.codecId ){
					console.log("that.codecs[i], ", that.codecs[i]);
					that.codecs[i].onData(msgObject);
					break;
				}
					
			}
		}	
	}

	/*this.channels[0].channel.onmessage = function(msg){
		var msgObject = JSON.parse(msg.data);
		that.codecs[0].onData(msgObject)
		/*for(var i = 0; i < that.codecs.length; i++){
			if( that.codecs[i].id == msgObject.codecId )
				
		}
	}




	this.channels[0].channel.onmessage = function(msg){
		for(var i = 0; i < that.codecs.length; i++){
			if( that.codecs[i].id == msgObject.codecId )
				
		}*/

	
}

/**
 * addCodec
 */

DataBroker.prototype.addCodec = function(codec){
    console.log("ADDD CODEC DATA BROKER\n\n\n",this)
    codec.dataBroker=this;
	this.codecs.push(codec);

}

/**
 * removeCodec
 */

DataBroker.prototype.removeCodec = function(){


	//removecodec

}

/**
 * addDataChannel
 */

DataBroker.prototype.addDataChannel = function(dataChannel, identity){


	//see the UML
	var channel = {
		"identity": identity,
		"channel": dataChannel
	};
	this.channels.push(channel);

}

/**
 * removeDataChannel
 */

DataBroker.prototype.removeDataChannel = function(identity){
    this.channels.forEach(function(element, index, array){
        if(element.identity==identity) array.splice(index,1);
    });

	//removecodec

}

/**
 * send
 */

DataBroker.prototype.send = function( msg ){
	
	console.log("MENSAGEM: ", msg);
	var index = -1;
	var msgObject = JSON.parse(msg);
	
	if( msgObject.to == "" || typeof msgObject.to === 'undefined' ){
		for(var i = 0; i < this.channels.length; i++){
			console.log("channels--->",this.channels[i].channel);
			if(this.channels[i].channel.readyState == 'open')
				this.channels[i].channel.send(msg);
		}
			
	}
	else {
		for(var i = 0; i < this.channels.length; i++){
			if( this.channels[i].identity.rtcIdentity === msgObject.to )
				index = i;
		}
		if(index !== -1)
			this.channels[index].channel.send(msg);
	}

	console.log(this.channels);
	console.log(this.codecs);

}