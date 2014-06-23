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

}// wonder_conversation.js 
//----------------------- 


// ------------------------------- 
// Resource.js 
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
 * The Resource class represents the digital assets that are shared among participants in the conversation.
 * 
 * @param {ResourceConstraint} resourceConstraint - Constraints of the Resource. Object with the following syntax {type: ResourceType, constraints: codec or MediaStreamConstraints}
 * @param {Codec} [codec] - For data types only, Codec used.
 *
 */

function Resource( resourceConstraint, codec ) {

  this.constraint = resourceConstraint;      
  this.connections = new Array();
  this.owner;
    
  if(codec) 
  {
      this.codec = codec;
      this.constraint.constraints=codec;
  }
}


/**
 * Resource class
 */
/*function Resource() {
	this.id;                        // We add a resource ID to identify it.
	this.type;                      // type of resource.
    this.stream;                    // StreamTrack (http://dev.w3.org/2011/webrtc/editor/getusermedia.html#mediastreamtrack) for this communication.
    this.data;                      // dataChannel for communication.
    this.evtHandler;                // eventHandler.
    this.status;                    // status this resource.
    this.owner;                     // owner this resource/stream.
    //this.codecs;                  <- still no discuss
    var thisresource = this;
    // Question: how to handle the creation of PeerConnections and add local MediaStreams? do we need them stored at each Resource having Tracks from this stream??
    // TODO: add stream attribute and rename "stream" to "streamTrack"
 	
    /**
     * private method setStream
     *
     * @param stream..
     */
 /*   setStream = function(stream){
        thisresource.stream = stream;
    }

    /**
     * private method setData
     *
     * @param data
     */
/*    setData = function(data){
      thisresource.data = data;
    };

    /**
     * private method setStatus
     *
     * @param status ... sets the status attribute for a resource
     */
/*    this.setStatus = function(status){
      // TODO: ensure the transition in the state machine is allowed otherwise callback error
      switch(thisresource.status){
          case ResourceStatus.RECORDING:
              if(status != ResourceStatus.NOT_SHARED || status != ResourceStatus.ENDED || status != ResourceStatus.PLAYING){
                  console.log("error setStatus" + status);
                  break;
              }
              thisresource.status = status;
              break;
          case ResourceStatus.NOT_SHARED:
              if(status != ResourceStatus.SHARED || status != ResourceStatus.PLAYING || status != ResourceStatus.ENDED){
                  console.log("error setStatus" + status);
                  break;
              }
              thisresource.status = status;
              break;
          case ResourceStatus.PAUSED:
              if(status != ResourceStatus.STOPPED){
                  console.log("error setStatus" + status);
                  break;
              }
              thisresource.status = status
              break
          case ResourceStatus.PLAYING:
              if(status != ResourceStatus.PAUSED || status != ResourceStatus.STOPPED || status != ResourceStatus.SHARED || status != ResourceStatus.NOT_SHARED){
                  console.log("error setStatus" + status);
                  break;
              }
              thisresource.status = status;
              break;
          case ResourceStatus.SHARED:
              if(status != ResourceStatus.NOT_SHARED || status != ResourceStatus.RECORDING || status != ResourceStatus.PLAYING || status != ResourceStatus.ENDED){
                  console.log("error setStatus" + status);
                  break;
              }
              thisresource.status = status;
              break;
          case ResourceStatus.STOPPED:
              console.log("transition is not allowed");
              break;
          case ResourceStatus.ENDED:
              if(status != ResourceStatus.PLAYING){
                  console.log("error setStatus" + status);
                  break;
              }
              thisresource.status = status;
              break;
          case ResourceStatus.LIVE:
              if(status != ResourceStatus.SHARED || status != ResourceStatus.NOT_SHARED){
                  console.log("error setStatus" + status);
                  break;
              }
              thisresource.status = status;
              break;
          case ResourceStatus.NEW:
              if(status != ResourceStatus.LIVE){
                  console.log("error setStatus" + status);
                  break;
              }
              thisresource.status = status;
              break;
          default:
            thisresource.status = status;
            break;
      }
       
    }
};

/**
 * createStream
 * 
 * @param owner  : Participant ... owner of the stream
 * @param stream : MediaStream ... the stream
 * @param type   : ResourceType... type of resource
 */
/*Resource.prototype.createStream = function(owner,stream,type) {
    if(! stream || ! owner) return ;
    else{
        this.owner=owner;
        this.stream=stream;
        this.type = type;
        this.id = guid();
        this.setStatus(ResourceStatus.NEW);
    }

    // TODO  Where/how to assign the type,data,connection,evtHandler and status?

};


/**
 * getStatus
 * 
 * @returns ResourceStatus ... returns the resource status
 */
/*Resource.prototype.getStatus = function(){
    return this.status;
};


/**
 * destroy
 * 
 */
/*Resource.prototype.stop = function(){
// @pchainho TODO: only applicable for local Resources. 

    this.stream = null;
    //this.setStatus(ResourceStatus.ENDED); // @pchainho I guess this should only be done when "ended" event is fired. To study how to address Data Channel resources
	
	// TODO: depending on the type of the Resource it may imply the invocation of browser APIs eg for MediaStreamTracks call its operation stop()
};

/**
 * share
 * 
 * @param shared : Boolean ... establishes if the resource is shared or not
 * 
 */
/*Resource.prototype.share = function(shared){
// @pchainho TODO: only applicable for local Resources. For MediaStreamTracks call its operation stop()

    if(shared) this.setStatus( ResourceStatus.SHARED );
    else this.setStatus( ResourceStatus.NOT_SHARED);
	// TODO: depending on the type of the Resource it may imply the invocation of browser APIs
};

/**
 * record
 * 
 */
/*Resource.prototype.record = function(){
    // TODO Complete the function
};

/**
 * play
 * 
 * @param timing : Number ... the time to start playing
 * 
 */
/*Resource.prototype.play = function(timing){
    // this.status = ResourceStatus.PLAYING;
    // TODO What to do with the timing ? How to get it playing ?
};

/**
 * pause
 * 
 */
/*Resource.prototype.pause = function(){
    // this.status = ResourceStatus.PAUSED;
};

/**
 * create
 * 
 * @param owner : Participant ... specifies the owner of the resource
 * @param type  : ResourceType ... specifies the resource type
 * 
 */
/*Resource.prototype.create = function(owner, type){
    if(! owner || ! type)return ;
    else{
        this.owner=owner;
        this.type=type;
        this.id=guid();                  // unique uid for resource
        this.setStatus(ResourceStatus.NEW);
    }
    // TODO  Where/how to assign the stream,data,connection,evtHandler and status?
};  

/**
 * createData
 * 
 * @param owner : Participant ... specifies the owner of the resource
 * @param type  : ResourceType ... specifies the resource type
 * @param data  : DataChannel ... specifies the data channel
 * 
 */
/*Resource.prototype.createData = function(owner, type, data){

    if(! owner || ! type || ! data ) return ;
    else {
        this.owner=owner;
        this.type=type;
        this.data=data;
    }
    // TODO  Where/how to assign the stream,connection,evtHandler and status?
};

/**
 * EventHandler
 *
 * @param that
 */
/*stream.started = function(self){

}

/**
 * EventHandler
 *
 * @param that
 *//*
function mute(self){

}

/**
 * EventHandler
 *
 * @param that
 *//*
function unmute(self){

}

/**
 * EventHandler
 *
 * @param that
 *//*
function overconstrained(self){

}

/**
 * EventHandler
 *
 * @param that
 */
 /*
function ended(that){

}*/
// ------------------------------- 
// Participant.js 
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
 * The Participant class handles all operations needed to manage the participation of an 
 * Identity (User) in a conversation including the WebRTC PeerConnection functionalities. 
 * The Local Participant is associated with the Identity that is using the Browser while the 
 * Remote Participant is associated to remote Identities (users) involved in the conversation.
 * 
 */
function Participant() {
    
    this.identity = "";                         // Identity of the participant
    this.RTCPeerConnection = "";                // RTCPeerConnection for that participant
    this.status = "";                           // Status
    this.me = "";                               // Participant representing the user of the browser. 
    this.rtcEvtHandler = "";                    // Event handler for WebRTC events
    this.msgHandler = "";                       // Event handler for signalling events
    this.contextId = "";                        // Context ID of the conversation the participant belongs to.
    this.resources = new Array();               // Resources of the participant
    this.hosting;                               // Hosting participant of the conversation this participant belongs to.
    this.connectedIdentities = new Array();     // For multiparty, array of Identities of the connected peers.
    this.dataBroker;                            // DataBroker for WebRTC DataChannel.
    this.streamGetMedia = null;
    this.hasDataChannel = false;
    this.updatesIdentities = new Array();       // For update, multy peers.
    /*********************************
     *        PRIVATE METHODS        *
     * TODO: try to have them accessible from other Wonder classes eg Conversation and MessagingSub but not visible from the App */
    /*********************************/

    /**
    * @ignore
    */
    var thisParticipant = this;
    setStatus = function(status) {

        //verify if all of the previous status allows to the participant to pass to the next status
        //if it is possible just setStatus, else return a message error.
        // (@ pchainho) check if the transition is allowed by the state machine.

        switch (thisParticipant.status) {
            case ParticipantStatus.CREATED:
                if (status != ParticipantStatus.WAITING && status != ParticipantStatus.PENDING) {
                    return false;
                }
                else {
                    thisParticipant.status = status;
                    console.log(thisParticipant);
                    return true;

                }
                break;
            case ParticipantStatus.ACCEPTED:
                if (status != ParticipantStatus.PARTICIPATING && status != ParticipantStatus.FAILED) {
                    return false;
                }
                else {
                    thisParticipant.status = status;
                    console.log(thisParticipant);
                    return true;
                }
                break;
            case ParticipantStatus.PARTICIPATING:
                if (status != ParticipantStatus.PARTICIPATED && status != ParticipantStatus.NOT_PARTICIPATING) {
                    return false;
                }
                else {
                    thisParticipant.status = status;
                    console.log(thisParticipant);
                    return true;
                }
                break;
            case ParticipantStatus.PENDING:
                if (status != ParticipantStatus.ACCEPTED && status != ParticipantStatus.MISSED) {
                    return false;
                }
                else {
                    thisParticipant.status = status;
                    console.log(thisParticipant);
                    return true;
                }
                break;
            case ParticipantStatus.FAILED:
                thisParticipant.status = status;
                return true;
                break;
            case ParticipantStatus.MISSED:
                console.log("transition is not allowed");
                return true;
                break;
            case ParticipantStatus.PARTICIPATED:
                    thisParticipant.status = status;
                    console.log(thisParticipant);
                    return true;
                break;
            case ParticipantStatus.WAITING:
                if (status != ParticipantStatus.PARTICIPATING && status != ParticipantStatus.FAILED) {
                    return false;
                }
                else {
                    thisParticipant.status = status;
                    console.log(thisParticipant);
                    return true;
                }
                break;
            case ParticipantStatus.NOT_PARTICIPATING:
                    thisParticipant.status = status;
                    console.log(thisParticipant);
                    return true;

                break;
            default:
                thisParticipant.status = status;
                console.log(thisParticipant);
                return true;
                break;
        }
    };
}
;

/**
 * Creates the local participant and initializes its resources.
 * 
 * @param {Identity} identity - {@link Identity} of the participant
 * @param {ResourceConstraints[]} resourceConstraints - Array of constraints for the initial resources of the local participant. (CURRENT IMPLEMENTATION WILL TAKE THE FIRST ONE)
 * @param {onRTCEvt} rtcEvtHandler - Callback function that handles WebRTC Events.
 * @param {onMessage} msgHandler - Callback function that handles signaling Events.
 * @param {callback} callback - Callback function for success creation of the local participant.
 * @param {errorCallback} errorCallback - Callback function for errors in the creation of the local participant.
 *
 */

Participant.prototype.createMyself = function(identity, resourceConstraints, rtcEvtHandler, msgHandler, callback, errorCallback) {
    
    this.identity = identity;
    this.me = this;
    this.rtcEvtHandler = rtcEvtHandler;
    this.msgHandler = msgHandler;

    setStatus(ParticipantStatus.CREATED);   // @pchainho TODO: to catch errors   

    
    var doGetUserMedia = false;
    var doDataChannel = false;
    var conversationResource = false;
    var constraints = new Object();
    constraints.audio = false;
    constraints.video = false;
    
    
    // Create RTCPeerConnection 
    try {
        // Create an RTCPeerConnection via the polyfill (adapter.js).
        var pc = new RTCPeerConnection({'iceServers': new Array()});
        this.RTCPeerConnnection = pc;
        console.log('Created RTCPeerConnnection.');
    }
    catch (e) {
        console.log('Failed to create PeerConnection, exception: ' + e.message);
        alert('Cannot create RTCPeerConnection object; \
          WebRTC is not supported by this browser.');
        return;
    }

    this.setRTCPeerConnection(pc);
    
    
    
    
    // TODO: Solve the problem where for many resourceConstraints, we would have a loop with callbacks inside.
    // Process the constraints, ordering them by media ones and data ones (maybe in 2 arrays). Merge if necessary
    //resourceConstraints=resourceConstraints[0]; // <dirtyFix>
    var thatIdentity = this.identity;
    var thatResources = this.resources;
    var thatDataBroker = this.dataBroker;
    var that = this;
    var numbResource = 0;
    var flag = false;
    var dataBroker;
    var one = false;
    var getMedia = function(numbResource,recursiveCallback){
        if(resourceConstraints.length > numbResource){

            if (doGetUserMedia === true && resourceConstraints[numbResource].direction!="in" && (resourceConstraints[numbResource].type == "audioVideo" || resourceConstraints[numbResource].type == "audioMic" || resourceConstraints[numbResource].type == "screen")) {
                var thisParticipant = that;
                flag = true;
                // TODO: Merge the media constraints so there is only 1 getUserMedia call (or maybe 2 if screensharing)
                // Loop/cascade callback so all the media is added and resources created.
                getUserMedia(constraints, function (stream) {
                    var evt=new Object();
                    evt.stream=stream;
                    streamGetMedia = stream;
                    thisParticipant.rtcEvtHandler('onaddlocalstream',evt);
                    console.log(numbResource);

                    pc.addStream(stream);
                    var resource = new Resource(resourceConstraints[numbResource -1]);
                    resource.id=stream.id;
                    //resource.constraint = resourceConstraints[numbResource];
                    console.log( resourceConstraints[numbResource]);
                    resource.constraint.constraints = {id: stream.id};
                    resource.owner = that.identity;
                    resource.connections.push(pc);
                    thisParticipant.resources.push(resource);

                    callback();
                }, errorCallback);
               // return;
            }
            if (doDataChannel === true && resourceConstraints[numbResource].direction!="in" &&  (resourceConstraints[numbResource].type != "audioVideo" || resourceConstraints[numbResource].type == "audioMic"  || resourceConstraints[numbResource].type == "screen") ) {
                // Loop so all the codecs are created and initialized.
                var numb = numbResource;
                var sucess = callback;
                var creatResources = function(recursive,numb,sucess){
                    if(resourceConstraints.length>numb){
                        var codec = new Codec(resourceConstraints[numb].type);
                        //codec.id=resourceConstraints[numb].id;
                        console.log(codec);
                        if(resourceConstraints[numb].id) codec.id = resourceConstraints[numb].id;
                        var resource = new Resource(resourceConstraints[numb], codec);
                        console.log(resource);
                        resource.connections.push(pc);
                        resource.owner = thatIdentity;
                        thatResources.push(resource);
                        console.log(thatResources)
                        var evt = new Object();
                        evt.codec = codec;
                        that.onRTCEvt('onResourceParticipantAddedEvt', evt);

                        numb++;
                        recursive(recursive,numb,sucess);
                    }else{
                       // sucess()
                    }
                }
                creatResources(creatResources,numb,sucess);

            }
            numbResource++;
            recursiveCallback(numbResource,recursiveCallback);
        }else{
            if(flag != true ){
               callback();
            }
        }
    }
    var iteration=0;
    var creatConstraints = function(iteration, callbackRecursive){
        if(resourceConstraints.length>iteration){
            switch (resourceConstraints[iteration].type) {

                case ResourceType.AUDIO_MIC:
                    constraints.audio = true;
                    doGetUserMedia = true;
                    break;
                case ResourceType.VIDEO_CAM:
                    constraints.video = true;
                    doGetUserMedia = true;
                    break;
                case ResourceType.AUDIO_VIDEO:
                    constraints.video = true;
                    constraints.audio = true;
                    doGetUserMedia = true;
                    break;
                case ResourceType.SCREEN:
                    constraints.video =  {
                        mandatory: {
                            chromeMediaSource: 'screen',
                            maxWidth: 1280,
                            maxHeight: 720
                        },
                        optional: []
                    };
                    constraints.audio = false;
                    doGetUserMedia = true;
                    break;
                case ResourceType.FILE:
                    doDataChannel = true;
                    break;
                case ResourceType.CHAT:
                    doDataChannel = true;
                    break;
            }
            iteration++;
            callbackRecursive(iteration,callbackRecursive);
        }else{
            getMedia(numbResource,getMedia);
        }

    }

    creatConstraints(iteration,creatConstraints);
};


/**
 * Creates a remote participant
 * 
 * @param {Identity} identity - {@link Identity} of the participant
 * @param {Participant} myParticipant - {@link Participant} representing the local user of the application. 
 * @param {string} contextId - Identifier of the conversation this participant belongs to. 
 * @param {ResourceConstraints[]} resourceConstraints - Array of constraints for the initial resources of the remote participant (CURRENT IMPLEMENTATION WILL TAKE THE FIRST ONE).
 * @param {onRTCEvt} rtcEvtHandler - Callback function that handles WebRTC Events.
 * @param {onMessage} msgHandler - Callback function that handles signaling Events.
 * @param {RTCIceServer} iceServers - Configuration parameters for ICE servers. {@link http://www.w3.org/TR/webrtc/#widl-RTCConfiguration-iceServers}
 *
 */

Participant.prototype.createRemotePeer = function(identity, myParticipant, contextId, resourceConstraints, rtcEvtHandler, msgHandler, iceServers) {
    // # if we follow the state diagram, it will be needed to set the status to created 
    setStatus(ParticipantStatus.CREATED);
    this.identity = identity;
    this.me = myParticipant;
    this.rtcEvtHandler = rtcEvtHandler;
    this.msgHandler = msgHandler;
    this.contextId = contextId;
    var channel;
    var thisParticipant = this;
    var oneDataChannel = false;
    constraints = resourceConstraints;
    var ite = 0;
    var that = this;
    //media and Data
    var getMedia = function(ite,functionCallback,pc,oneDataChannel){
        if(constraints.length > ite){
            var type;
            if(that.me.getResources(constraints[ite])[0] == undefined){
                type == null;
            }
            else{
                type = that.me.getResources(constraints[ite])[0].constraint.type;
            }
            // create data channel and setup chat
            if(data && constraints[ite].direction!="in" && (type == "chat" || type == "file" )){
                console.log("Creating remote peer with local constraints: ",  constraints);

                if(oneDataChannel == false){
                    oneDataChannel = true;
                    channel = pc.createDataChannel("dataChannel");

                    //thisParticipant.setDataBroker(constraints.constraints.dataBroker);
                    thisParticipant.dataBroker.addDataChannel(channel, thisParticipant.identity);
                    hasDataChannel = true;
                    channel.onopen = function () {
                        thisParticipant.dataBroker.onDataChannelEvt();
                        //thisParticipant.onRTCEvt("onResourceParticipantAddedEvt", resourceData);
                    }

                    // setup chat on incoming data channel
                    pc.ondatachannel = function (evt) {
                        channel = evt.channel;
                    };
                    var resourceData;
                }
                resourceData = that.me.getResources(constraints[ite])[0];
                console.log("\n\n\n\n\n",resourceData)
                resourceData.connections.push(pc);
            }

            if(media && constraints[ite].direction!="in" && (constraints[ite].type =="audioVideo" || constraints[ite].type =="audioMic" || constraints[ite].type =="screen")){
                var resourceMedia = that.me.getResources(constraints[ite])[0];
                var stream = that.me.RTCPeerConnection.getStreamById(resourceMedia.constraint.constraints.id);
                pc.addStream(stream);
                resourceMedia.connections.push(pc);
            }

            if (constraints[ite].direction != "out") {
                if (media === true) {
                    var resource = new Resource(resourceConstraints);
                    resource.owner = that.identity;
                    resource.connections.push(pc);
                    thisParticipant.resources.push(resource);
                }
                if (data === true) {
                    var resource = new Resource(resourceConstraints);
                    //var codec = new Codec(resourceConstraints.type);
                    //resource.codec = codec;
                    resource.owner = that.identity;
                    resource.connections.push(pc);
                    thisParticipant.resources.push(resource);
                }
            }
            ite++;
            that.setRTCPeerConnection(pc);
            functionCallback(ite,functionCallback,pc,oneDataChannel);
        }else{
            // Create RTCPeerConnection

        }
    }


    // end Media and Data
    var media = false;
    var data = false;
    var iteration = 0;
    var creatResource = function(iteration,callbackFunction){
        if(constraints.length > iteration){
            switch (constraints[iteration].type) {
                case ResourceType.AUDIO_MIC:
                    media = true;
                    break;
                case ResourceType.VIDEO_CAM:
                    media = true;
                    break;
                case ResourceType.AUDIO_VIDEO:
                    media = true;
                    break;
                case ResourceType.SCREEN:
                    media = true;
                    break;
                case ResourceType.FILE:
                    data = true;
                    break;
                case ResourceType.CHAT:
                    data = true;
                    break;
            }
            iteration++;
            callbackFunction(iteration,callbackFunction);
        }else{
            try {
                // Create an RTCPeerConnection via the polyfill (adapter.js).
                var mediaConstraints = {optional: [{RtpDataChannels: true}]};
                if(!iceServers) iceServers = {'iceServers': new Array()};
                console.log('Creating RTCPeerConnnection with:\n' + '  config: \'' + JSON.stringify(iceServers) + '\';\n' + '  constraints: \'' + JSON.stringify(mediaConstraints) + '\'.');

                var pc = new RTCPeerConnection(iceServers, mediaConstraints);
                //thisParticipant.RTCPeerConnection = pc;


            }
            catch (e) {
                console.log('Failed to create PeerConnection, exception: ' + e.message);
                alert('Cannot create RTCPeerConnection object; \
          WebRTC is not supported by this browser.');
                return;
            }
            getMedia(ite,getMedia,pc,oneDataChannel);
        }
    }
    creatResource(iteration,creatResource);
}







/**@ignore
 * setRTCPeerConnection
 * 
 * @param RTCPeerConnection : PeerConnection ... sets the connection attribute for a participant
 */
Participant.prototype.setRTCPeerConnection = function(RTCPeerConnection) {
    var thisParticipant = this;
    this.RTCPeerConnection = RTCPeerConnection;

    /**
     * onsignalingstatechange
     *
     * It is called any time the readyState changes
     */
    this.RTCPeerConnection.onsignalingstatechange = function(evt) {
        thisParticipant.onRTCEvt("onsignalingstatechange", evt);
    };

    /**
     * oniceconnectionstatechange
     *
     *  It is called any time the iceConnectionState changes.
     */
    this.RTCPeerConnection.oniceconnectionstatechange = function(evt) {
        thisParticipant.onRTCEvt("oniceconnectionstatechange", evt);
    };

    /**
     * onaddstream
     *
     *   It is called any time a MediaStream is added by the remote peer
     */

    this.RTCPeerConnection.onaddstream = function(evt) {
        evt.participant = thisParticipant;
        thisParticipant.onRTCEvt("onaddstream", evt);
    };

    /**
     * onicecandidate 
     *
     */

    this.RTCPeerConnection.onicecandidate = function(evt) {
        thisParticipant.onRTCEvt("onicecandidate", evt);
    };

    /**
     * onnegotiationneeded
     *
     */

    this.RTCPeerConnection.onnegotiationneeded = function(evt) {
        thisParticipant.onRTCEvt("onnegotiationneeded", evt);
    };

    /**
     * ondatachannel
     *
     */

    this.RTCPeerConnection.ondatachannel = function(evt) {
        thisParticipant.onRTCEvt("ondatachannel", evt);
    };

    /**
     * onremovestream
     *
     *  It is called any time a MediaStream is removed by the remote peer. 
     */

    this.RTCPeerConnection.onremovestream = function(evt) {
        thisParticipant.onRTCEvt("onremovestream", evt);
    };


};


/**
 * getConnection
 * 
 * @returns PeerConnection ... gets the connection attribute for a participant
 * 
 */
Participant.prototype.getRTCPeerConnection = function() {
    return this.RTCPeerConnection;
};



/**
 * This callback type is called `onRTCEvt` and handles the WebRTC events from the RTCPeerConnection.
 *
 * @callback onRTCEvt
 * @param {event} event - Event from {@link http://www.w3.org/TR/webrtc/#event-summary} + 'onResourceParticipantAddedEvt' + 'onaddlocalstream'.
 * @param {evt} evt - Returned stream, candidate, etc. see {@link http://www.w3.org/TR/webrtc/#event-summary}
 */
Participant.prototype.onRTCEvt = function(event, evt) {
    // TODO To implement and pass the events up
    switch (event) {

        case 'onnegotiationneeded':
            this.rtcEvtHandler(event, evt);
            break;
        case 'onicecandidate':
            if (evt.candidate) {
                var message = new MessageFactory.createCandidateMessage("","","",evt.candidate.sdpMLineIndex,evt.candidate.sdpMid,evt.candidate.candidate,false);
            } else {
                var message = new MessageFactory.createCandidateMessage("","","","","",this.RTCPeerConnection.localDescription,true);
                console.log("End of Ice Candidates");
            }
            this.sendMessage(message.body,MessageType.CONNECTIVITY_CANDIDATE,"",function(){},function(){});
            this.rtcEvtHandler(event, evt);
            break;
        case 'onsignalingstatechange':
            this.rtcEvtHandler(event, evt);
            break;
        case 'onaddstream':
            console.log("stream added");
            this.rtcEvtHandler(event, evt);
            break;
        case 'onremovestream':
            this.rtcEvtHandler(event, evt);
            break;
        case 'oniceconnectionstatechange':
            this.rtcEvtHandler(event, evt);
            break;
        case 'ondatachannel':
            this.rtcEvtHandler(event, evt);
            break;
        default:
            this.rtcEvtHandler(event, evt);
            break;

    }
}

/**
 * This callback type is called `onRTCEvt` and handles the WebRTC events from the RTCPeerConnection.
 *
 * @callback onMessage
 * @param {Message} message - {@link Message} received
 */
Participant.prototype.onMessage = function(message) {
    switch (message.type) {

        case MessageType.ACCEPTED:
            var mediaConstraints = message.body.constraints;
            var that = this;
            var exist = false;
            if(typeof message.body.connectionDescription !== 'undefined' && message.body.connectionDescription !== ""){

                console.log("Participant " + this.identity.rtcIdentity + " received accepted.");
            var description = new RTCSessionDescription(message.body.connectionDescription);
            this.RTCPeerConnection.setRemoteDescription(description,
                    onSetSessionDescriptionSuccess, onSetSessionDescriptionError);
                console.log("Remote Description set: ", this);  
                this.getResources(mediaConstraints)[0].constraint=mediaConstraints;

                console.log("this.me.indentity: " + this.me.identity.rtcIdentity);
                console.log("this.hosting.rtcIdentity " + this.hosting);
                if(this.me.identity.rtcIdentity == this.hosting.rtcIdentity){
                    //see if the hosting is equal to this.me
                    //send a accepted message with no SDP

                    this.me.connectedIdentities.push(message.from.rtcIdentity);
                    var answerBody = new Object();
                    answerBody.connected = this.me.connectedIdentities;
                    answerBody.from = message.from;
                    answerBody.to = "";
                    this.me.sendMessage(answerBody, MessageType.ACCEPTED, mediaConstraints);
                }
                setStatus(ParticipantStatus.PARTICIPATING);
            }else{
                if(message.body.connected.length != 0){
                    for(var i = 0; i < message.body.connected.length; i++){
                        //ignore the message if my rtcIdentity is in the this.connectedIdentities
                        if(message.body.connected[i] == that.me.identity.rtcIdentity){
                            exist = true;
                            break;
                        }
                    }
                    if(!exist){
                        //if not send a message to the all of candidates
                        that.sendMessage("", MessageType.INVITATION, mediaConstraints);
                    }
                }
            }          
            
            
            this.msgHandler(message);
            break;
        case MessageType.CONNECTIVITY_CANDIDATE:
            if (message.body.lastCandidate) {
                console.log("Participant " + this.identity.rtcIdentity + " reached End of Candidates.");
            }
            else
            {
                var candidate = new RTCIceCandidate({
                    sdpMLineIndex: message.body.label,
                    sdpMid: message.body.id,
                    candidate: message.body.candidateDescription
                });
                console.log("Participant " + this.identity.rtcIdentity + " added a candidate:", candidate);
                this.RTCPeerConnection.addIceCandidate(candidate);
            }
            break;
        case MessageType.NOT_ACCEPTED:
            //setStatus(ParticipantStatus.FAILED);
            this.status = ParticipantStatus.FAILED;
            this.leave(false);
            console.log("Participant received NOT_ACCEPTED");
            this.msgHandler(message);
            break;
        case MessageType.CANCEL:
            this.msgHandler(message);
            break;
        case MessageType.ADD_RESOURCE:
            this.msgHandler(message);
            break;
        case MessageType.UPDATE:
            this.msgHandler(message);
            
            break;
        case MessageType.UPDATED:
            var mediaConstraints = message.body.newConstraints;
            var that = this;
            var exist = false;
            if(typeof message.body.newConnectionDescription !== 'undefined' && message.body.newConnectionDescription !== ""){

                console.log("Participant " + this.identity.rtcIdentity + " received updated.");
                var description = new RTCSessionDescription(message.body.newConnectionDescription);
                this.RTCPeerConnection.setRemoteDescription(description,
                    onSetSessionDescriptionSuccess, onSetSessionDescriptionError);
                console.log("Remote Description set: ", description);
                this.getResources(mediaConstraints)[0].constraint=mediaConstraints;
                if(this.me.identity.rtcIdentity == this.hosting.rtcIdentity){
                    //see if the hosting is equal to this.me
                    //send a accepted message with no SDP
                    var updatesIdentit = new Array(); 
                    updatesIdentit.push(message.from.rtcIdentity);
                    that.me.updatedIdentities = updatesIdentit;
                    var answerBody = new Object();
                    answerBody.connected = that.me.updatedIdentities;
                    answerBody.from = message.from;
                    answerBody.to = "";
                    this.me.sendMessage(answerBody, MessageType.UPDATED, mediaConstraints);
                }
            }else{
                if(message.body.updated.length != 0){
                    for(var i = 0; i < message.body.updated.length; i++){
                        //ignore the message if my rtcIdentity is in the this.connectedIdentities
                        if(message.body.updated[i] == that.me.identity.rtcIdentity){
                            exist = true;
                            break;
                        }
                    }
                    if(!exist){
                        //if not send a message to the all of candidates
                        that.sendMessage("", MessageType.UPDATE, mediaConstraints);
                    }
                }
            } 
             
            this.msgHandler(message);
            break;
        case MessageType.REDIRECT:
            this.msgHandler(message);
            break;
        case MessageType.BYE:
            setStatus(ParticipantStatus.PARTICIPATED);
            this.leave(true);
            console.log("Participant received BYE");
            this.msgHandler(message);
            break;
        case MessageType.OFFER_ROLE:
            this.msgHandler(message);
            break;
        case MessageType.INVITATION:
            // IF GETS HERE IT IS NORMAL FOR THE MULTIPARTY
            var mediaConstraints = message.body.constraints;
            var description = new RTCSessionDescription(message.body.connectionDescription);
            this.RTCPeerConnection.setRemoteDescription(description, onSetSessionDescriptionSuccess, onSetSessionDescriptionError);
            
            this.sendMessage(answerBody, MessageType.ACCEPTED, mediaConstraints);
            //this.msgHandler(message);
            break;
        case MessageType.RESOURCE_REMOVED:
            this.msgHandler(message);
            break;
        case MessageType.SHARE_RESOURCE:
            this.msgHandler(message);
            break;
        default:
            // forward to application level
            this.msgHandler(message);
            break;
    }
}


/** @ignore */
Participant.prototype.connectStub = function(callback) {
    var thisParticipant = this;
    thisParticipant.identity.resolve(function(stub) {// @pchainho: why is this needed?
        stub.addListener(thisParticipant.onMessage.bind(thisParticipant), thisParticipant.identity.rtcIdentity, thisParticipant.contextId);
        stub.connect(thisParticipant.me.identity.rtcIdentity,thisParticipant.me.identity.credentials,callback);// @pchainho: we are using here the credentials of other users??
    });
}


/**
 *
 * The method will create the message and send it to the participant. 
 * 
 * @param {MessageBody} messageBody - The body of the message (depends on the MessageType)
 * @param {MessageType} messageType - The type of the message.
 * @param {ResourceConstraints} [constraints] - For the messages that imply information about the Resources, contraints about them. 
 * @param {callback} callback - Callback for successful sending.
 * @param {errorCallback} errorCallback - Error Callback
 *
 */
Participant.prototype.sendMessage = function(messageBody, messageType, constraints, callback, errorCallback) {
    // Sends the message
    console.log("constraints",messageBody);
    // @(pchainho) TODO: check if sender is not empty and if Participant is in the state "CREATED". otherwise fire error event
    if( messageBody == undefined){
        sdpConstraints = {'mandatory': {'OfferToReceiveAudio': true, 'OfferToReceiveVideo': true }};
    }else{
        if(/^-?[\d.]+(?:e-?\d+)?$/.test(messageBody.peers)){ 
            sdpConstraints = {'mandatory': {'OfferToReceiveAudio': true, 'OfferToReceiveVideo': false }};
        }
        else{       
            sdpConstraints = {'mandatory': {'OfferToReceiveAudio': true, 'OfferToReceiveVideo': true }};
        }
    }
    
    var message = new Message();
    var thisParticipant = this;
    console.log(this.resources)
    console.log(constraints)
    var i;
   /* for(i = 0;i<constraints.length;i++){
        if(constraints[i].type==ResourceType.CHAT || constraints[i].type==ResourceType.FILE)
        {
            var codec = new Codec(constraints[i].type, constraints[i].CodecLibUrl);
            codec.id = constraints[i].id;
            codec.description = constraints[i].description;
            codec.mime_type = constraints[i].mime_type;
            constraints[i] = codec;
        }
    }*/

    
    switch(messageType){
        case MessageType.INVITATION:
            console.log("MessageType.INVITATION: ", messageBody);
            console.log("constrains",constraints)
            // define new type of constraints because when isn't possible to send the DataBroker in message...
            var constraintsAux =new Array();
            var i;
            var iteration;

            for(iteration=0;iteration<constraints.length;iteration++){

                    console.log("entrei",constraints[iteration].type)
                    var aux = new Object()
                    if(constraints[iteration].constraints){
                        aux.id = constraints[iteration].constraints.id;
                    }else{
                        aux.id = constraints[iteration].id;
                    }
                    aux.type = constraints[iteration].type;
                    aux.direction =  constraints[iteration].direction;
                    constraintsAux.push(aux);
            }

                console.log("invite")
                if (!messageBody) message = MessageFactory.createInvitationMessage(this.me.identity, this.identity, this.contextId, constraintsAux);
                else message = MessageFactory.createInvitationMessage(this.me.identity, this.identity, this.contextId, constraintsAux, messageBody.conversationURL, messageBody.subject, messageBody.hosting, messageBody.agenda, messageBody.peers);
                setStatus(ParticipantStatus.PENDING); // TODO: OR WAITING?? Check for errors.

                this.RTCPeerConnection.createOffer(function (sessionDescription) {
                    thisParticipant.RTCPeerConnection.setLocalDescription(sessionDescription, function () {
                        console.log("Local description set: ", sessionDescription);
                        message.body.connectionDescription = thisParticipant.RTCPeerConnection.localDescription;

                        console.log("Sending message with constraints: ", constraints);

                        if (!thisParticipant.identity.messagingStub){
                            errorCallback("Messaging Stub not well initialized");
                            errorCallback;
                        }
                        else thisParticipant.identity.messagingStub.sendMessage(message);

                        if (callback)
                            callback();

                    }, function(error){errorCallback(error)});
                }, function(error){errorCallback(error)}, sdpConstraints);

            break;
        case MessageType.ACCEPTED:
                var constraintsAux =new Array();
                var i;
                for(i =0;i<constraints.length;i++){
                    var aux = new Object();
                    aux.id = constraints[i].id;
                    aux.type = constraints[i].type;
                    aux.direction =  constraints[i].direction;
                    constraintsAux.push(aux);
                }
                console.log(messageBody);
                console.log("this.me.identity.rtcIdentity: ", this.me.identity.rtcIdentity);
                console.log("this.hosting.rtcIdentity: ", this.hosting.rtcIdentity);
                //if(this.me.identity.rtcIdentity === thisParticipant.identity.rtcIdentity){
                if(this.me.identity.rtcIdentity === this.hosting.rtcIdentity){
                    //send a accepted message with no SDP inside
                    var message = new Object();
                    message = MessageFactory.createAnswerMessage(messageBody.from, "", thisParticipant.contextId, constraintsAux, "", messageBody.connected,messageBody.hosting);
                    message.body.from = messageBody.from.rtcIdentity;
                    thisParticipant.identity.messagingStub.sendMessage(message);

                }
                else{
            if(!messageBody) message = MessageFactory.createAnswerMessage(this.me.identity,this.identity,this.contextId, constraintsAux);
            else message = MessageFactory.createAnswerMessage(this.me.identity,this.identity,this.contextId, constraintsAux, messageBody.hosting);

            setStatus(ParticipantStatus.ACCEPTED);

            this.RTCPeerConnection.createAnswer(function (sessionDescription) {
                thisParticipant.RTCPeerConnection.setLocalDescription(sessionDescription, function () {
                    console.log("Local description set: ", sessionDescription);
                    message.body.connectionDescription = thisParticipant.RTCPeerConnection.localDescription;
                    
                    if (!thisParticipant.identity.messagingStub){
                        errorCallback("Messaging Stub not well initialized");
                        return;
                    }
                    else thisParticipant.identity.messagingStub.sendMessage(message);

                    if (callback)
                        callback();
                    
                }, function(error){errorCallback(error)});
                    }, function(error){
                        console.log("error: ", error);
                    }, sdpConstraints);
                }

            break;
        case MessageType.CONNECTIVITY_CANDIDATE:
            //console.log("Missing data for connectivity candidate", messageBody);
            if(messageBody.lastCandidate){
                if(errorCallback)
                    errorCallback("Missing data for connectivity candidate");
                // SD: bugfix, we also need context.id etc. in this message
                message = MessageFactory.createCandidateMessage( this.me.identity,this.identity,this.contextId,"",messageBody.id,messageBody.connectionDescription,true);
                thisParticipant.identity.messagingStub.sendMessage(message);
                return;
            }
            else message = MessageFactory.createCandidateMessage(this.me.identity,this.identity,this.contextId,messageBody.label,messageBody.id,messageBody.candidateDescription,messageBody.lastCandidate);
            
             if (!thisParticipant.identity.messagingStub){
                        errorCallback("Messaging Stub not well initialized");
                        return;
                    }
                    else thisParticipant.identity.messagingStub.sendMessage(message);
            break;
        case MessageType.BYE:
            message = new Message(this.me.identity,this.identity,"",MessageType.BYE,this.contextId); 
             if (!thisParticipant.identity.messagingStub){
                        errorCallback("Messaging Stub not well initialized");
                        return;
                    }
                    else 
                    {
                     thisParticipant.identity.messagingStub.sendMessage(message);
                     setStatus(ParticipantStatus.NOT_PARTICIPATING); // TODO: CHECK IF ITS THE CORRECT STATE
                    }
            console.log("Call terminated");
            break;
        case MessageType.UPDATE:
            console.log("UPDATE");

            console.log("MESSAGE: ", message);
            if (!messageBody)
            {
                message = MessageFactory.createUpdateMessage(this.me.identity,this.identity,this.contextId, constraints);
            }else{
                message = MessageFactory.createUpdateMessage(this.me.identity,this.identity,this.contextId, messageBody.newConstraints);
            }   
            console.log(message);

            this.RTCPeerConnection.createOffer(function (sessionDescription) {
                thisParticipant.RTCPeerConnection.setLocalDescription(sessionDescription, function () {
                    console.log("Local description set: ", sessionDescription);
                    message.body.newConnectionDescription = thisParticipant.RTCPeerConnection.localDescription;
                    if (!thisParticipant.identity.messagingStub){
                        errorCallback("Messaging Stub not well initialized");
                        return;
                    }
                    else thisParticipant.identity.messagingStub.sendMessage(message);

                }, function(error){errorCallback(error)});
            }, function(error){errorCallback(error)}, sdpConstraints);

        break;

        case MessageType.UPDATED:
            if(this.me.identity.rtcIdentity === this.hosting.rtcIdentity){
                    //send a accepted message with no SDP inside
                    var message = new Object();
                    message = MessageFactory.createUpdatedMessage(messageBody.from,"",this.contextId,constraints, this.updatedIdentities,this.hosting.rtcIdentity);
                    message.body.from = messageBody.from.rtcIdentity;
                    thisParticipant.identity.messagingStub.sendMessage(message);

            }else{
                if (!messageBody)
                {
                    
                    message = MessageFactory.createUpdatedMessage(this.me.identity, this.identity, this.contextId, messageBody.newConstraints);
                }else{ 
                    message = MessageFactory.createUpdatedMessage(this.me.identity,this.identity,this.contextId, messageBody.newConstraints,messageBody.hosting);
                }
                    console.log(message);

                //    console.log("VIDEO REMOTO: ", this.RTCPeerConnection.getRemoteStreams()[0].getVideoTracks());
                  //  console.log("AUDIO REMOTO: ", this.RTCPeerConnection.getRemoteStreams()[0].getAudioTracks());


                    this.RTCPeerConnection.createAnswer(function (sessionDescription) {
                        thisParticipant.RTCPeerConnection.setLocalDescription(sessionDescription, function () {
                            console.log("Local description set: ", sessionDescription);
                            message.body.newConnectionDescription = thisParticipant.RTCPeerConnection.localDescription;

                            if (!thisParticipant.identity.messagingStub){
                                errorCallback("Messaging Stub not well initialized");
                                return;
                            }
                            else thisParticipant.identity.messagingStub.sendMessage(message);

                            if (callback)
                                callback();

                        }, function(error){errorCallback(error)});
                    }, function(error){errorCallback(error)}, sdpConstraints);
                }
                    break;
        }
    console.log('Sending: ', message);
}

/**
 * 
 * The Participant leaves the Conversation removing all resources shared in the conversation. 
 * Participant status is changed accordingly.
 *
 * @param {boolean} sendMessage - If true a BYE message will be sent to the participant before removing it. If false the participant will be removed locally from the conversation without sending any message.
 * 
 */

Participant.prototype.leave = function(sendMessage) {
    setStatus(ParticipantStatus.PARTICIPATED);
    this.identity.messagingStub.removeListener("",this.identity.rtcIdentity,"");

    if(this.identity.rtcIdentity == this.me.identity.rtcIdentity){
        this.RTCPeerConnection.getLocalStreams().forEach(function(element, index, array){
            array[index].stop();
        });
        if(sendMessage==true){
            this.sendMessage("",MessageType.BYE,"","",function(){},function(){});  
            //this.identity.onLastMessagingListener();
        } 
    }
    else{
        if(sendMessage==true) this.sendMessage("",MessageType.BYE,"","",function(){},function(){});
        this.dataBroker.removeDataChannel(this.identity);
        if(this.RTCPeerConnection.signalingState && this.RTCPeerConnection.signalingState != "closed")
            this.RTCPeerConnection.close();
            
    }
}


/**
 * getStatus
 * 
 * @returns ParticipantStatus ... gets the status attribute for a participant
 * 
 */
Participant.prototype.getStatus = function() {
    return this.status;
}

/**@ignore
 * setConversation
 */

Participant.prototype.setConversation = function(conversation) {

    if (!conversation)
        return;
    else
        this.conversation = conversation;
}


/**
 * Adds a Resource to this participant including all the signaling and logical actions required.
 * 
 * @param {ResourceConstraints} resourceConstraints - Array of constraints for the initial resources of the remote participant (CURRENT IMPLEMENTATION WILL TAKE THE FIRST ONE).
 * @param {Message} [message] - In case an UPDATE message is received, it should be passed to this function as a parameter to process it and send the UPDATED.
 * @param {callback} callback - Callback function fired when the resource was added succesfully.
 * @param {errorCallback} errorCallback -  Callback function fired when an error happens.
 *
 */
Participant.prototype.addResource = function (resourceConstraints, message, callback, errorCallback) {
    
    var i;
    var getMedia = false;
    var idMedia;
    var dataChannel = false;
    var idChannel;

    var thisParticipant = this;
    for(i=0;i<this.resources.length;i++){
        if(this.resources[i].constraint.type =="audioVideo" || this.resources[i].constraint.type =="screen"){
            getMedia = true;
            idMedia = i;
        }
        if(this.resources[i].constraint.type =="chat" || this.resources[i].constraint.type =="file"){
            
            dataChannel = true;
        }
    }

    if (this == this.me) {
        // Create the resource and the media if the direction is not "in"

        var doGetUserMedia = false;
        var doDataChannel = false;
        var conversationResource = false;
        var constraints = new Object();
        constraints.audio = false;
        constraints.video = false;

        // make the conditions to update the stream if we had already Webcam or microphone
        var micAlready = (this.getResources("",ResourceType.AUDIO_MIC).length!=0);
        var camAlready = (this.getResources("",ResourceType.VIDEO_CAM).length!=0);
        var micCamAlready = (this.getResources("",ResourceType.AUDIO_VIDEO).length!=0);
        // TODO: CHECK FOR DATACHANNEL TYPES AND CONTROL THE CREATION OF A NEW DATACHANNEL, CREATING IT ONLY IF NECCESARY
        // TODO: Solve the problem where for many resourceConstraints, we would have a loop with callbacks inside.
        resourceConstraints = resourceConstraints[0]; // <dirtyFix>
        

        switch (resourceConstraints.type) {

        case ResourceType.AUDIO_MIC:
            if(!micAlready & !micCamAlready){
                constraints.audio = true;
                doGetUserMedia = true;
            }
            break;
        case ResourceType.VIDEO_CAM:
            if(!camAlready & !micCamAlready){
                constraints.video = true;
                doGetUserMedia = true;
            }
            break;
        case ResourceType.AUDIO_VIDEO:
            if(!camAlready) constraints.video = true;
            if(!micAlready) constraints.audio = true;
            if(!micCamAlready) doGetUserMedia = true;
            break;
        case ResourceType.SCREEN:
            constraints.audio = false;
            constraints.video = {
                mandatory: {
                        chromeMediaSource: 'screen',
                        maxWidth: 1280,
                        maxHeight: 720
                },
                optional: []
                };
            doGetUserMedia = true;
            break;
        case ResourceType.FILE:
            doDataChannel = true;
            break;
        case ResourceType.CHAT:
            doDataChannel = true;
            break;
        }


        console.log(constraints);

        if (doGetUserMedia === true && resourceConstraints.direction != "in") {
           
           
            if(!getMedia || resourceConstraints.type == "screen"){
                getUserMedia(constraints, function (stream) {
                    var evt = new Object();
                    evt.stream = stream;
                    streamGetMedia = stream;
                    
                    thisParticipant.rtcEvtHandler('onaddlocalstream', evt);

                    if(!micAlready & !camAlready){
                        thisParticipant.RTCPeerConnection.addStream(stream);
                        var resource = new Resource(resourceConstraints);
                        resource.id = stream.id;
                        resource.constraint.constraints= {id: stream.id};
                        resource.connections.push(thisParticipant.RTCPeerConnection);
                        thisParticipant.resources.push(resource);
                    }
                    else{
                        if(micAlready){
                            var resource = thisParticipant.me.getResources("",ResourceType.AUDIO_MIC)[0];
                            var stream2 = thisParticipant.RTCPeerConnection.getStreamById(resource.id);
                            stream2.addTrack(stream.getVideoTracks()[0]);
                        }
                        if(camAlready){
                            var resource = thisParticipant.me.getResources("",ResourceType.VIDEO_CAM)[0];
                            var stream2 = thisParticipant.RTCPeerConnection.getStreamById(resource.id);
                            stream2.addTrack(stream.getAudioTracks()[0]); 
                        }
                        resource.type=ResourceType.AUDIO_VIDEO;   
                        resource.constraint.type=ResourceType.AUDIO_VIDEO;
                    }

                    callback();
                }, errorCallback);
            }
            else{
                var evt = new Object();
                evt.stream = streamGetMedia;
                thisParticipant.rtcEvtHandler('onaddlocalstream', evt);
                    if(!micAlready & !camAlready){
                        thisParticipant.RTCPeerConnection.addStream(streamGetMedia);
                        var resource = this.resources[idMedia];
                        resource.constraint.constraints= {id: streamGetMedia.id};
                        resource.connections.push(thisParticipant.RTCPeerConnection);
                        thisParticipant.resources.push(resource);
                    }
                    else{
                        if(micAlready){
                            var resource = thisParticipant.me.getResources("",ResourceType.AUDIO_MIC)[0];
                            var stream2 = thisParticipant.RTCPeerConnection.getStreamById(resource.id);
                            stream2.addTrack(stream.getVideoTracks()[0]);
                        }
                        if(camAlready){
                            var resource = thisParticipant.me.getResources("",ResourceType.VIDEO_CAM)[0];
                            var stream2 = thisParticipant.RTCPeerConnection.getStreamById(resource.id);
                            stream2.addTrack(stream.getAudioTracks()[0]); 
                        }
                        resource.type=ResourceType.AUDIO_VIDEO;   
                        resource.constraint.type=ResourceType.AUDIO_VIDEO;
                    }

                    callback();
            }
            return;
        }
        if (doDataChannel === true && resourceConstraints.direction != "in") {
            console.log(thisParticipant);
            var codec = new Codec(resourceConstraints.type);

            var resource = new Resource(resourceConstraints, codec);
            if(resourceConstraints.id) codec.id = resourceConstraints.id;
            resource.connections.push(thisParticipant.RTCPeerConnection);
            resource.owner = this.identity;
            this.resources.push(resource);
            var evt = new Object();
            evt.codec = codec;
            this.onRTCEvt('onResourceParticipantAddedEvt', evt);
        }
        callback();
    } else {
        if (resourceConstraints.direction != "out") {
            if (doGetUserMedia === true) {
                var resource = new Resource(resourceConstraints);
                resource.id = resource.constraint.constraints.id;
                resource.owner = this.identity;
                resource.connections.push(pc);
                thisParticipant.resources.push(resource);
            }
            if (doDataChannel === true) {
                var resource = new Resource(resourceConstraints);
                //var codec = new Codec(resourceConstraints.type);
                //resource.codec = codec;
                resource.owner = this.identity;
                resource.connections.push(pc);
                thisParticipant.resources.push(resource);
            }
        }
        if (resourceConstraints.direction != "in") {
            // Get the resource from the me participant and add it to the peerConnection
            
            //TODO: IMPLEMENT AND CHECK!!!!!!!!!!!!!!
            var channel;
           // var thisParticipant = this;

            if (resourceConstraints.length > 0) {
                // TODO: Solve the problem where for many resourceConstraints, we would have a loop with callbacks inside.
                constraints = resourceConstraints[0]; // <dirtyFix>
                var media = false;
                var data = false;
                switch (constraints.type) {
                case ResourceType.SCREEN:
                    media = true;
                    break;     
                case ResourceType.AUDIO_MIC:
                    media = true;
                    break;
                case ResourceType.VIDEO_CAM:
                    media = true;
                    break;
                case ResourceType.AUDIO_VIDEO:
                    media = true;
                    break;
                case ResourceType.FILE:
                    data = true;
                    break;
                case ResourceType.CHAT:
                    data = true;
                    break;
                }
            }

            // needed to be implemented the resources types
            //wiuth the resources types see what do we want to have
            //if chat -> codec for chat | if filesharing -> codec for filesharing
            // create data channel and setup chat        
            if (data && constraints.direction != "in") {
                //if(thisParticipant.dataBroker.channels.length <= 1){
                    hasDataChannel = true;
                    channel = thisParticipant.RTCPeerConnection.createDataChannel("dataChannel"); // TODO: CREATE DATACHANNEL ONLY IF THERE IS NOT DATARESOURCE YET.
                    thisParticipant.setDataBroker(constraints.constraints.dataBroker);
                    thisParticipant.dataBroker.addDataChannel(channel,thisParticipant.identity);
                //}
                var resourceData = this.me.getResources(constraints)[0];

                resourceData.connections.push(thisParticipant.RTCPeerConnection);

                channel.onopen = function () {
                    thisParticipant.dataBroker.onDataChannelEvt();
                    //thisParticipant.onRTCEvt("onResourceParticipantAddedEvt", resourceData);
                }

                // setup chat on incoming data channel
               // pc = thisParticipant.RTCPeerConnnection;
                thisParticipant.me.RTCPeerConnnection.ondatachannel = function (evt) {
                    channel = evt.channel;
                };
                
            }
            if (media && constraints.direction != "in") {
                var resourceMedia = this.me.getResources(constraints);
                                
                //If it doesnt find the constraints means that the audio and video were merged into AudioVideo
                if(resourceMedia.length==0){
                    constraints.type=ResourceType.AUDIO_VIDEO;
                    resourceMedia = this.me.getResources(constraints)[0];
                }
                
                var stream = this.me.RTCPeerConnection.getStreamById(resourceMedia[0].id);
                thisParticipant.RTCPeerConnection.addStream(stream);
                resourceMedia[0].connections.push(thisParticipant.RTCPeerConnection);
            }
        }
        
        if (!message) {
            // setlocal description, send update
            var messageBody = new Object();
            messageBody.newConstraints=resourceConstraints;
            this.sendMessage(messageBody, MessageType.UPDATE, constraints, callback, errorCallback);
            
        } else {
            // set remotedescription, set localdescription send updated 
            console.log("ADD_RESOURCE <- Participant");
            console.log("message: ", message);
            if(message.body.newConnectionDescription == ""){

            }else{
                var description = new RTCSessionDescription(message.body.newConnectionDescription);
                this.RTCPeerConnection.setRemoteDescription(description,
                        onSetSessionDescriptionSuccess, onSetSessionDescriptionError);
                console.log("Remote Description set: ", description);
                console.log("Participant: ", this);
            }

            var messageBody = new Object();
            messageBody.newConstraints=resourceConstraints;
            messageBody.from = message.from;
            this.sendMessage(messageBody, MessageType.UPDATED, constraints, callback, errorCallback);
        }
        callback();
    }
}

/**
 * Searches and retrieves Resources.
 *
 * @param {ResourceConstraints} [resourceConstraints] - Searches the Resources by constraints.
 * @param {ResourceType} [resourceType] - Searches the Resources by type.
 * @param {string} id - Searches the Resources by ID.
 *
 */
Participant.prototype.getResources = function (resourceConstraints, resourceType, id) {
    
    var resources = new Array();
    
    if (resourceConstraints) {
        this.resources.forEach(function (element, index, array) {
            if (element.constraint.type == resourceConstraints.type && element.constraint.direction == resourceConstraints.direction) resources.push(array[index]);
        });
        return resources;
    }

    if (resourceType) {
        this.resources.forEach(function (element, index, array) {
            if (element.type === resourceType) resources.push(array[index]);
        });
        return resources;
    }
    if (id) {
        this.resources.forEach(function (element, index, array) {
            if (element.id === id) resources.push(array[index]);
        });
        return resources;
    }

    // If no filter, return all the resources.
    return this.resources;
}

/**@ignore
 * getStreams
 * 
 * @returns Stream [] ... gets the resources array attribute
 * 
 */
Participant.prototype.getStreams = function() {
    if (this.me.identity.rtcIdentity == this.identity.rtcIdentity)
        return this.RTCPeerConnection.getLocalStreams();
    else
        return this.RTCPeerConnection.getRemoteStreams();
}

/**
 * Sets the DataBroker to a Participant
 * @param {DataBroker} databroker - DataBroker to set.
 * 
 */
Participant.prototype.setDataBroker = function( databroker ) {
    this.dataBroker = databroker;
}

// ------------------------------- 
// Conversation.js 
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
 * Conversation class
 * @class
 * @param participants list of {@link Participant} involved in the conversation 
 * @param id Unique Conversation identification
 * @param owner the {@link Participant} organizing the conversation 
 * @param hosting the {@link Identity} that is providing the signalling message server 
 * @param rtcEvtHandler Event handler implemented by the Application to receive and process RTC events triggered by WebRTC Media Engine
 * @param msgHandler {@link Message} handler implemented by the Application to receive and process Messages from the {@link MessagingStub}
 *
 */
function Conversation(myIdentity, rtcEvtHandler, msgHandler, iceServers, constraints) {
     /**
     * The list of {@link Participant} in the Conversation.
     * @private
     * @type Participant[]
     */
    this.participants = [];
    
     /**
     * Unique Conversation identification.
     * @private
     * @type string
     */
    this.id;
    
     /**
     * The {@link Participant} that manages the Conversation having additional features 
     * Eg, add and remove participants, mute/unmute/share resources, etc. 
     * It may change in the middle of the conversation by sending a "OfferRole" {@link Message}.
     * @private
     * @type Participant
     */
    this.owner;
    this.rtcEvtHandler = rtcEvtHandler;
    this.msgHandler = msgHandler;
    
    this.dataBroker = new DataBroker();
    
     /**
     * The {@link Identity} that is providing the conversation signalling messaging server.
     * @private
     * @type Identity
     */
    this.hosting;
    
     /**
     * ICE servers setup data.
     * @private
     * @type String
     */
    this.iceServers=iceServers;
    
    /*
     * TODO: 
     * - hosting could be empty, in this case the communication is purely P2P
     * - if hosting is NOT empty, then the Conversation has to add a listener to the MessagingStub
     *   of the hosting-identity
     * - if hosting is empty, then the participants are invoking addListener of 
     */
    this.resources = [];
    //this.status;
    //this.recording;
    //this.subject;
    //this.agenda = [];
    //this.startingTime;
    //this.duration;

    //this.eventHandler;
    this.myParticipant = new Participant();
    this.myParticipant.identity = myIdentity;
    thisConversation = this;
}



/**
 * A Conversation is opened for invited participants. 
 * Creates the remote participant, resolves and gets the stub, 
 * creates the peer connection, connects to the stub and sends invitation
 * 
 * @param {string[]} rtcIdentity list of users to be invited
 * @param {string} [invitation] body to be attached to INVITATION {@link MESSAGE}
 * @@callback callback to handle responses triggered by this operation
 */
Conversation.prototype.open = function (rtcIdentity, resourceConstraints, invitationBody, callback, errorCallback) {

    var that = this;

    this.myParticipant.createMyself(this.myParticipant.identity, resourceConstraints, this.onRTCEvt.bind(this), this.onMessage.bind(this), function () {

        that.id = "context-" + guid();
        that.owner = that.myParticipant;
        that.owner.contextId = that.id;

        that.myParticipant.contextId = that.id;
        if (that.myParticipant.hosting == null)
            that.myParticipant.hosting = that.myParticipant.identity;
        
        //define hosting
        if(invitationBody.hosting)
            that.hosting = invitationBody.hosting;

        var localParticipant = that.myParticipant;
        var localIDP = localParticipant.identity.idp;
        var toIdentity;
        //add a verification if rtcIdentity is already an identity or if is a rtcIdentity only
        //
        
        localIDP.createIdentities(rtcIdentity, function (identity) {
            console.log("rtcIdentity: ", identity);
            if (identity instanceof Array) {
                identity.forEach(function (element, index, array) {
                    var participant = new Participant();
                    console.log("owner: ", this.owner);
                    toIdentity = element
                       
                    participant.hosting = that.myParticipant.hosting;

                    console.log("Calling to Identity: ", toIdentity);

                    console.log("Created remote participant: ", participant);
                    /*var constraints = new Array();
                    that.resources.every(function (element, index, array) {
                        constraints.push(element.constraint);
                    });
                    that.myParticipant.resources.every(function (element, index, array) {
                        constraints.push(element.constraint);
                    });*/

                    participant.setDataBroker(that.dataBroker);
                    participant.createRemotePeer(toIdentity, localParticipant, that.id, resourceConstraints, that.onRTCEvt.bind(that), that.onMessage.bind(that), that.iceServers);
                    
                    if(that.hosting && that.hosting == that.myParticipant.identity.rtcIdentity){
                        participant.identity.messagingStub = that.myParticipant.identity.messagingStub;
                    }
                    
                    that.addParticipant(participant, invitationBody, resourceConstraints);
                    
                });
            }
        });





    }, errorCallback);
};

/**
 * Opens a conversation by accepting an incoming invitation.
 * Sends the message to the addressed participant (the one who sent the invitation)
 * Sets the Conversation status to OPENED.
 * @param {Message} invitation the invitation message received for the accepted conversation
 * @param {string} answer the answer to be sent with the accepted message
 * @param {string} [constraints] any constraint on how the invitation was accepted e.g. only audio but not video  
 * @callback callback the callback that handles events triggered by this function 
 */
Conversation.prototype.acceptInvitation = function(recvInvitation, answerBody, callback, errorCallback) {

    // Swap direction because we are receiving
    var direction = "in_out";
   /* if(recvInvitation.body.constraints[0].direction=="in") direction="out";
    if(recvInvitation.body.constraints[0].direction=="out") direction="in";
    recvInvitation.body.constraints[0].direction=direction;
     onsole.log("CONVERSATION..> acceptInvitation: ", recvInvitation);*/
    console.log("cenas\n\n\n",recvInvitation)
    if (!this.setStatus(ConversationStatus.OPENED)) {
        // TODO: ERROR, Status cant be changed
        return;
    }

    var that = this;
    var chatID = new Object();
    var id1;
    var videoID = new Object();
    var id2;
    var fileID = new Object();
    var id3;
    var iteration;
    var i;
    for(i=0;i<recvInvitation.body.constraints.length;i++){
        if(recvInvitation.body.constraints[i].type == "file"){
            id3 = recvInvitation.body.constraints[i].id;
            fileID.index = i;
        }else{
            if(recvInvitation.body.constraints[i].type == "chat"){
                id1 = recvInvitation.body.constraints[i].id;
                chatID.index = i;
            }else{
                if(recvInvitation.body.constraints[i].type == "audioVideo"){
                    id2 = recvInvitation.body.constraints[i].id;
                    videoID.index = i;
                }
            }
        }
    }
    this.myParticipant.createMyself(this.myParticipant.identity, recvInvitation.body.constraints, this.onRTCEvt.bind(this), this.onMessage.bind(this), function () {
        //TODO: THINK OF MULTIPARTY CASE, YOU RECEIVE A CALL BUT THE INVITE IS FOR MANY PEOPLE
        that.id = recvInvitation.contextId;
        //this.owner.contextId=this.id;
        that.myParticipant.contextId=that.id;

        //var participant = new Participant();
        //var localParticipant = this.owner;
        console.log("CONVERSATION > SS1: ", that.myParticipant.hosting);
        if(that.myParticipant.hosting == null){
            that.myParticipant.hosting = recvInvitation.from;
            console.log("CONVERSATION > SS: ", that.myParticipant.hosting);
            console.log("CONVERSATION > SS: ", recvInvitation.from);
        }


        var localParticipant = that.myParticipant;
        //console.log("CONSTRAINTS AFTER!!!!:" + recvInvitation.body.constraints[0].constraints.id);


        var localIDP = localParticipant.identity.idp;
        var toIdentity;

        var constraints = recvInvitation.body.constraints; // <dirtyFix>

        console.log("recvInvitation.body.constraints: ", recvInvitation.body.constraints);
        for(iteration=0;iteration<constraints.length;iteration++){
            if(constraints[iteration].type==ResourceType.CHAT || constraints[iteration].type==ResourceType.FILE){
                //beginof: create a codec with the data received
                var codec=new Codec(constraints[iteration].constraints.type,constraints[iteration].constraints.CodecLibUrl);
                console.log("constraints.type==ResourceType.CHAT: ", that.myParticipant.resources);
                that.myParticipant.resources[iteration].codec.id=constraints[iteration].constraints.id;
                var resource = new Resource(constraints[iteration], codec);
                resource.codec.setDataBroker(that.dataBroker);
                //endof: create a codec with the data received
            }
        }
        //constraints = new Array(constraints); // </dirtyFix>

        //Create an array to all peers that I want to connect
        //recvInvitation.body.peers[i] is defined when the clients are selected in the application
        var peers = new Array();
        peers.push(recvInvitation.from.rtcIdentity);
        console.log("recv: ", recvInvitation);
        for(var i = 0; i < recvInvitation.body.peers.length; i++){
            if(recvInvitation.body.peers[i] !== that.myParticipant.identity.rtcIdentity)
                peers.push(recvInvitation.body.peers[i]);
        }

        //now should be createIdentities because of multiparty
        localIDP.createIdentities(peers, function(identity){

            if(identity instanceof Array){
                console.log("Identity: ", identity);

                identity.forEach(function(element, index, array){
                        var participant = new Participant();

                        toIdentity = element;
                        that.hosting = recvInvitation.body.hosting;
                        console.log("THIS.HOSTING", recvInvitation.body.hosting);
                        if(typeof that.owner === 'undefined'){
                            that.owner = participant;
                        }
                        participant.hosting = that.owner;
                        if(that.hosting == recvInvitation.from.rtcIdentity){
                            console.log("THIS.HOSTING", that.hosting);
                            console.log("THIS.OWNER", that.owner);
                            toIdentity.messagingStub = recvInvitation.from.messagingStub;
                        }
                        else{
                            toIdentity.messagingStub = that.myParticipant.identity.messagingStub;
                        }


                        participant.setDataBroker(that.dataBroker);
                        if(chatID.id != null){
                            constraints[chatID.index].id = {id: id1};
                        }
                        if(videoID.id != null){
                            constraints[videoID.index].id = {id: id2};
                        }
                        if(fileID.id != null){
                            constraints[fileID.index].id = {id: id3};
                        }

                        participant.createRemotePeer(toIdentity, localParticipant, that.id, constraints,that.onRTCEvt.bind(that), that.onMessage.bind(that), that.iceServers);
                        that.participants.push(participant);
                        if(recvInvitation.from.rtcIdentity === toIdentity.rtcIdentity){
                            //Only do the RTCPeerConnection to the identity that is inviting
                            //for the other identities only creates the participants
                            console.log("ENTREI > acceptInvitation: ", recvInvitation);
                            var description = new RTCSessionDescription(recvInvitation.body.connectionDescription);
                            participant.RTCPeerConnection.setRemoteDescription(description, onSetSessionDescriptionSuccess, onSetSessionDescriptionError);
                        }
                        participant.connectStub(function() {
                            if(recvInvitation.from.rtcIdentity === toIdentity.rtcIdentity){
                                participant.sendMessage(answerBody, MessageType.ACCEPTED, constraints, callback, errorCallback);
                            }

                        });
                    },
                    function(error){
                        console.log(error);
                    });
            }
        });

    }, errorCallback);
};

/**
 * If to-field of the message is empty, then send message to all participants, send only to specified participants 
 * if to-field is filled.
 * (Message.to-field is a list of identities.) 
 * @param {MESSAGE} message the {@link Message} to be sent to the specified Identities or or ALL participants
 */
Conversation.prototype.sendMessage = function(message) {
    if (!message)
        return;

    /*
     *  TODO: 
     *  if this.hosting is set, then ALL Messages are send via the MessagingStub
     *  of the hosting identity.
     *  Only if this.hosting is NOT SET we iterate through the participants
     */

    if (this.hosting) {
        // seems that there is a special Identity assigned to "host" this conversation
        // in this case ALL Messages must be sent via the messagingStub of this identity
        // TODO: Check following ASSUMPTION: 
        // Only one message is sent to the Messaging stub of the hosting-identity. The MessagingServer is responsible 
        // to forward individual messages to all attached participants of this conversation.
        var p = this.getParticipant(this.hosting);
        if (p)
            p.sendMessage(message);
    }
    else {
        // send to all participants via their own messaging stubs, if to is not set or empty
        if (!message.to) {
            for (var p in this.participants)
                this.participants[p].sendMessage(message);
        }
        else {
            // send to all participants that we have for the given identities
            for (var i in message.to) {
                // check for participant matching this identity
                var p = this.getParticipant(message.to[i]);
                if (p)
                    p.sendMessage(message);
            }
        }
    }
};

/** @ignore
 * Set the status of this conversation. 
 * TODO: This method should be private and only be changed by internal state-changes 
 * @param status ConversationStatus ... the new status of the conversation
 */
Conversation.prototype.setStatus = function(status) {
    // DONE: implement the state machine checks here !!!
    // TODO: PAUSED AND STOPPED are not in the Enums !!!
    // TODO: Change the UML so returns true or false if the state change is not allowed.
    // (@Vasco) the previous state machine verifications it was not working in a correct way 
    // Changed verify below
    console.log("In setStatus");
    switch (this.status) {
        case ConversationStatus.CREATED:
            if (status != ConversationStatus.OPENED) {
                console.log("transition is not permited " + status + " actual state: " + this.status);
                return false;
            } else {
                this.status = status;
                return true;
            }
        case ConversationStatus.OPENED:
            if (status != ConversationStatus.ACTIVE && status != ConversationStatus.INACTIVE && status != ConversationStatus.FAILED && status != ConversationStatus.PLAYING && status != ConversationStatus.CLOSED) {
                console.log("transition is not permited " + status + " actual state: " + this.status);
                return false;
            } else {
                this.status = status;
                return true;
            }
        case ConversationStatus.INACTIVE:
            if (status != ConversationStatus.ACTIVE) {
                console.log("transition is not permited " + status + " actual state: " + this.status);
                return false;
            } else {
                this.status = status;
                return true;
            }
        case ConversationStatus.FAILED:
            console.log("transition is not permited");
            return false;
        case ConversationStatus.ACTIVE:
            if (status != ConversationStatus.INACTIVE && status != ConversationStatus.CLOSED && status != ConversationStatus.FAILED && status != ConversationStatus.RECORDING && status != ConversationStatus.PLAYING) {
                return false;
                console.log("transition is not permited " + status + " actual state: " + this.status);
            } else {
                this.status = status;
                return true;
            }
        case ConversationStatus.CLOSED:
            console.log("transition is not permited " + status + " actual state: " + this.status);
            return false;
        case ConversationStatus.RECORDING:
            if (status != ConversationStatus.FAILED && status != ConversationStatus.INACTIVE && status != ConversationStatus.CLOSED && status != ConversationStatus.PLAYING) {
                console.log("transition is not permited " + status + " actual state: " + this.status);
                return false;
            } else {
                this.status = status;
                return true;
            }
        case ConversationStatus.PLAYING:
            if (status != ConversationStatus.PAUSED && status != ConversationStatus.STOPPED && status != ConversationStatus.INACTIVE && status != ConversationStatus.ACTIVE) {
                console.log("transition is not permited " + status + " actual state: " + this.status);
                return false;
            } else {
                this.status = status;
                return true;
            }
        case ConversationStatus.PAUSED:
            if (status != ConversationStatus.PLAYING && status != ConversationStatus.STOPPED && status != ConversationStatus.INACTIVE && status != ConversationStatus.ACTIVE) {
                console.log("transition is not permited " + status + " actual state: " + this.status);
                return false;
            } else {
                this.status = status;
                return true;
            }
        case ConversationStatus.STOPPED:
            console.log("transition is not permited " + status + " actual state: " + this.status);
            return false;
        default:
            if (!this.status) {
                this.status = status;
                return true;
            }
            return false;
    }
};

/** 
 * Returns the status of this conversation
 */
Conversation.prototype.getStatus = function() {
    return(this.status);
};


/**
 * Close the conversation with the given message.
 * Sends this message to ALL participants and sets the conversation status to CLOSED
 * @param {Message} message the final message to be sent to ALL participants of this conversation
 * @return {boolean} True if successful, false if the participant is not the owner.
 */
Conversation.prototype.close = function() {
    if(this.owner==this.myParticipant)
    {
        this.participants.forEach(function(element,index,array){
            element.status=ParticipantStatus.PARTICIPATED;
            element.identity.messagingStub.removeListener("",element.identity.rtcIdentity,"");
            element.sendMessage("",MessageType.BYE,"","",function(){},function(){});
            if(element.RTCPeerConnection.signalingState && element.RTCPeerConnection.signalingState != "closed")
                element.RTCPeerConnection.close();
        });
        this.myParticipant.leave(false);
        this.setStatus(ConversationStatus.CLOSED);
        return true;
    }
    return false;
}


/**
 * Bye the conversation with the given message.
 * Sends this message to ALL participants and sets the conversation status to CLOSED
 * @param {Message} message the final message to be sent to ALL participants of this conversation
 */
Conversation.prototype.bye = function() {
    this.participants.forEach(function(element,index,array){
                                element.leave(true);
                                delete array[index];
    });
    this.myParticipant.leave(true);
    this.setStatus(ConversationStatus.CLOSED);
};


/**
 * Adds a participant to the conversation.
 * @param {Participant} participant the {@link Participant} to add to the conversation
 * @param {String} [invitation] the invitation to be attached to the {@link Message} body
 */
Conversation.prototype.addParticipant = function(participant, invitationBody, constraints, callback, callbackError) {
    this.participants.push(participant);    
    participant.connectStub(function() { // @pchainho: why do we need this?
        participant.sendMessage(invitationBody, MessageType.INVITATION, constraints, callback, callbackError)
    });
};

/*** Returns the participants of the conversation as an Array.
 * @returns {Participants[]}
 */
Conversation.prototype.getParticipants = function() {
    return(this.participants);
};


/**@ignore
 * Callback for events from the Participants (received via the MessagingStub)
 * @param message : Message
 */
Conversation.prototype.onMessage = function(message) {
    // TODO: implement eventHandling
    switch (message.type) {

        case MessageType.ACCEPTED:
            console.log("MESSAGEACCEPTEDCONVERSATION: ", message);
            // TODO: change state of the conversation and forward to app-layer
            break;
        case MessageType.CONNECTIVITY_CANDIDATE:

            // put candidate to PC
            break;
        case MessageType.NOT_ACCEPTED:
            this.participants.forEach(function(element, index, array){
                if(element.status==ParticipantStatus.PARTICIPATED){
                    array.splice(index, 1);
                }
            });
            if(this.participants.length==0) this.bye();
            break;
        case MessageType.CANCEL:
            break;
        case MessageType.ADD_RESOURCE:
            break;
        case MessageType.UPDATE:
            break;
        case MessageType.UPDATED:
            break;
        case MessageType.REDIRECT:
            break;
        case MessageType.BYE:
            if(this.owner.identity.rtcIdentity == message.from.rtcIdentity){
                this.participants.forEach(function (element, index, array) {
                    element.leave(false);
                    delete array[index];
                });
                this.myParticipant.leave(false);
                this.setStatus(ConversationStatus.CLOSED);
            }
            else {
                this.participants.forEach(function(element, index, array){
                    if(element.status==ParticipantStatus.PARTICIPATED){
                        array.splice(index, 1);
                    }
                });
                if(this.participants.length==0) this.bye();
            }
            
            break;
        case MessageType.OFFER_ROLE: // set new moderator of the conversatoin
            break;
        case MessageType.INVITATION:
            // IF RECEIVED, SOMETHING IS WRONG
           /*INVITATION
                Participant should only receive invitations in multiparty conversation. In this case it will be automatically accepted, the peerconnection is set and the Accepted message sent.*/

            break;
        case MessageType.RESOURCE_REMOVED:
            break;

        case MessageType.SHARE_RESOURCE:
            break;
        default:
            // forward to application level
            break;
    }
    this.msgHandler(message);
};

/** @ignore */
Conversation.prototype.onRTCEvt = function(event, evt) {
    // TODO To implement and pass the events up
    switch (event) {

        case 'onnegotiationneeded':
            this.rtcEvtHandler(event, evt);
            break;
        case 'onicecandidate':
            this.rtcEvtHandler(event, evt);
            break;
        case 'onsignalingstatechange':
            this.rtcEvtHandler(event, evt);
            break;
        case 'onaddstream':
            this.rtcEvtHandler(event, evt);
            break;
        case 'onaddlocalstream':
            this.rtcEvtHandler(event,evt);
            break;
        case 'onremovestream':
            this.rtcEvtHandler(event, evt);
            break;
        case 'oniceconnectionstatechange':
            this.rtcEvtHandler(event, evt);
            break;
        case 'ondatachannel':
            this.rtcEvtHandler(event, evt);
            break;
        default:
            this.rtcEvtHandler(event, evt);
            break;

    }
};

/**@ignore
 * Records a conversation.
 */
Conversation.prototype.record = function() {
    // TODO: to be re-fined and implemented
};

/**@ignore
 * Playback a (part of a) conversation.
 * @param timing : ??? ... time index information
 * @param resources : Resource[1..*] ... the resource to be played back
 */
Conversation.prototype.play = function(timing, resources) {
    // TODO: to be re-fined and implemented
};

/**@ignore
 * Pause playback of a conversation.
 */
Conversation.prototype.pause = function() {
    // TODO: to be re-fined and implemented
};


/**@ignore
 * Helper function to get the matching Particpant for a given Identity.
 * @param identity : Identity ... the identity to search for
 * @returns the Particpant of the current conversation that matches the given Identity
 */
Conversation.prototype.getParticipant = function(identity) {
    if (!identity)
        return;
    var match;
    for (var p in this.participants)
        if (this.participants[p].identity.rtcIdentity == identity.rtcIdentity)
            match = this.participants[p];
    return match;
};

/**
 * ConversationAddResource
 */
Conversation.prototype.addResource = function(resourceConstraints, message, onSuccessCallback, onErrorCallback) {

    //see what's in the resource (resourceConstraints)
    var thisConversation = this;
    // If it comes with a message, means we add a resource from an incoming petition to the corresponding participant.
    if(!message){
    var count=0;
    var internalSuccessCallback = function(){
            if(count<thisConversation.participants.length){ 
                count++;
                console.log("Adding the resource for the participant number: " + count);
                thisConversation.participants[count-1].addResource(resourceConstraints,"",internalSuccessCallback, onErrorCallback);
            }
            else{
                onSuccessCallback();
            }

    }
    
            thisConversation.myParticipant.addResource(resourceConstraints,"",internalSuccessCallback, onErrorCallback);
    }
    else{
        // Swap direction because we are receiving
        var direction = "in_out";
   
        thisConversation.myParticipant.addResource(resourceConstraints,"",function() {
            thisConversation.getParticipant(message.from).addResource(resourceConstraints,message,onSuccessCallback,onErrorCallback);
        }, onErrorCallback);


        
    }
 };
 
Conversation.reject = function(message){
    console.log("reject....-----",message)
    if(message.to instanceof Array)
        message.to[0].resolve(function(stub){stub.sendMessage(MessageFactory.createNotAccepted(message))});
    else
        message.to.resolve(function(stub){stub.sendMessage(MessageFactory.createNotAccepted(message))});
}