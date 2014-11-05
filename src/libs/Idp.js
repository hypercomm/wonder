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
	/*console.log("created idp with domain:port: " + this.domain + ":" + this.port);
    console.log("Idp rtcIdentity: ", rtcIdentity);
    console.log("options: ", rtcIdentity);*/
    
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
        //console.log("Idp.this: ", this);
        rtcIdentity.idp = this;
    }
}

/**
 * This is a getter for an already created instance of the IDP.
 * The params are optional. In case there was no instance already created before, 
 * the params can also be given here and will then be used for initial creation of the object.
 */
Idp.getInstance = function(rtcIdentity, options) {
    //console.log("Idp.getInstance --> instance: ", this.instance);
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
	console.log("Idp > createIdentities: ", rtcIdentities);
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
            
            //console.log("data.rows[0]: ", data.rows[0]);
            
			var localStubURL = data.rows[0].localMsgStubURL;
			var generalStubURL = data.rows[0].messagingStubURL;
			var localConnectURL = data.rows[0].localConnectURL;
			var generalConnectURL = data.rows[0].connectURL;

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
			// SD: This check is not valid anymore with require.js and its injected configuration for the stubs, 
			// Check is wrong if same stub (from same download url) serves different domains.
			// --> must compare also the domains
			var ownDomain = that.ownRtcIdentity.substring(that.ownMessagingLibUrl.indexOf("@")+1);
			var otherDomain = rtcIdentity.substring(rtcIdentity.indexOf("@") + 1);
			console.log( "owndomain / otherdomain: " + ownDomain + " / " + otherDomain);
			if (localStubURL === that.ownMessagingLibUrl && ownDomain === otherDomain) {
				console.log("use localMsgStubURL for new Identity: " + localStubURL);
				identity.messagingStubLibUrl = that.ownMessagingLibUrl;
				identity.connectURL = localConnectURL;
			}
			else {
				identity.messagingStubLibUrl = generalStubURL;
				identity.connectURL = generalConnectURL;
			}

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

//// This test is to generic. It also matches for Clearwater accounts, which are numbers.
//	if(/^-?[\d.]+(?:e-?\d+)?$/.test(rtcIdentity)){ 
//		rtcIdentity = "pstn@imsserver.ece.upatras.gr";
//	    }else{
//		var split = rtcIdentity.split('@')
//		if(split.length ==2){
//		    if(/^-?[\d.]+(?:e-?\d+)?$/.test(split[0])){ 
//		        rtcIdentity = "pstn@imsserver.ece.upatras.gr";
//		    }
//		}
//	    }
    

    if(this.protocol == "ws"){
        this.wsQuery(rtcIdentity, this.returnIdentity);
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
