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
    this.updatedIdentities = new Array();       // For update, multy peers.
    this.updater;
    this.candidates = new Array();
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
    
    if(resourceConstraints.length == 1){
        if(resourceConstraints[0].type == ResourceType.ADHOC_CHAT){
            var codec = new Codec("chat", domainUrl, null, this);
            var resource = new Resource(resourceConstraints[0], codec);
            this.resources.push(resource);
            callback();
        }
    }else{
        
        // Create RTCPeerConnection 
        try {
            // Create an RTCPeerConnection via the polyfill (adapter.js).
           // var pc = new RTCPeerConnection({'iceServers': new Array()});
            //this.RTCPeerConnection = pc;
            console.log('Created RTCPeerConnection.');
        }
        catch (e) {
            console.log('Failed to create PeerConnection, exception: ' + e.message);
            alert('Cannot create RTCPeerConnection object; \
              WebRTC is not supported by this browser.');
            return;
        }

        //this.setRTCPeerConnection(pc);
        
        
        
        
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

                if (resourceConstraints[numbResource].direction!="in" && (resourceConstraints[numbResource].type == "audioVideo" || resourceConstraints[numbResource].type == "audioMic" || resourceConstraints[numbResource].type == "screen")) {
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

                       // pc.addStream(stream);
                        var resource = new Resource(resourceConstraints[numbResource -1]);
                        resource.id=stream.id;
                        resource.stream = stream;
                        //resource.constraint = resourceConstraints[numbResource];
                        console.log( resourceConstraints[numbResource]);
                        resource.constraint.constraints = {id: stream.id};
                        resource.owner = that.identity;
                        //resource.connections.push(pc);
                        thisParticipant.resources.push(resource);

                        callback();
                    }, function(){});
                   // return;
                }
                if (resourceConstraints[numbResource].direction!="in" &&  (resourceConstraints[numbResource].type != "audioVideo" || resourceConstraints[numbResource].type != "audioMic"  || resourceConstraints[numbResource].type != "screen") ) {
                    
                    if (resourceConstraints[numbResource].type == "chat" || resourceConstraints[numbResource].type == "file" ) {
                        var codec = new Codec(resourceConstraints[numbResource].type);
                        //codec.id=resourceConstraints[numb].id;
                        console.log(codec);
                        if(resourceConstraints[numbResource].id) codec.id = resourceConstraints[numbResource].id;
                        var resource = new Resource(resourceConstraints[numbResource], codec);
                        console.log(resource);
                        //resource.connections.push(pc);
                        resource.owner = thatIdentity;
                        thatResources.push(resource);
                        console.log(thatResources)
                        var evt = new Object();
                        evt.codec = codec;
                        that.onRTCEvt('onResourceParticipantAddedEvt', evt);
                    }
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
    }
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

    if(resourceConstraints.length == 1){
        if(resourceConstraints[0].type == ResourceType.ADHOC_CHAT){
            var codec = new Codec("chat", domainUrl, null, this);
            var resource = new Resource(resourceConstraints[0], codec);
            this.resources.push(resource);
            //callback();
        }
    }else{
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
                        console.log("DATA BROKER--", thisParticipant.dataBroker)
                        //thisParticipant.setDataBroker(constraints.constraints.dataBroker);
                        thisParticipant.dataBroker.addDataChannel(channel, thisParticipant.identity);
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
                    //var stream = that.me.RTCPeerConnection.getStreamById(resourceMedia.constraint.constraints.id);
                    pc.addStream(resourceMedia.stream);
                    resourceMedia.connections.push(pc);
                }

                if (constraints[ite].direction != "out") {
                    if (constraints[ite].type =="audioVideo" || constraints[ite].type =="audioMic" || constraints[ite].type =="screen") {
                        var resource = new Resource(resourceConstraints[ite]);
                        resource.owner = that.identity;
                        resource.connections.push(pc);
                        thisParticipant.resources.push(resource);
                    }
                    if (constraints[ite].type =="chat" || constraints[ite].type =="file") {
                        var resource = new Resource(resourceConstraints[ite]);
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
                    console.log('Creating RTCPeerConnection with:\n' + '  config: \'' + JSON.stringify(iceServers) + '\';\n' + '  constraints: \'' + JSON.stringify(mediaConstraints) + '\'.');

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
                this.getResources(mediaConstraints)[0]=mediaConstraints;

                console.log("this.me.indentity: " + this.me.identity.rtcIdentity);
                console.log("this.hosting.rtcIdentity " + this.hosting);
                if(this.me.identity.rtcIdentity == this.hosting.rtcIdentity){
                    //see if the hosting is equal to this.me
                    //send a accepted message with no SDP
                    this.me.connectedIdentities.push(this.me.identity.rtcIdentity);
                    this.me.connectedIdentities.push(message.from.rtcIdentity);
                    var answerBody = new Object();
                    answerBody.connected = this.me.connectedIdentities;
                    answerBody.from = message.from;
                    answerBody.to = "";
                    this.me.sendMessage(answerBody, MessageType.ACCEPTED, mediaConstraints);
                }
                setStatus(ParticipantStatus.PARTICIPATING);
            }else{
                if(message.body.connected){
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
                if(this.RTCPeerConnection){
                     this.RTCPeerConnection.addIceCandidate(candidate);
                }else{
                    this.candidates.push(message);
                }
            }
            break;
        case MessageType.NOT_ACCEPTED:
            //setStatus(ParticipantStatus.FAILED);
            this.status = ParticipantStatus.FAILED;
            this.leave(false);
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
                if(this.getResources(mediaConstraints[0])[0]){
                    this.getResources(mediaConstraints[0])[0].constraint=mediaConstraints[0];
                    this.getResources(mediaConstraints[0])[0].id=mediaConstraints[0].id;
                }
                if(this.me.identity.rtcIdentity == this.me.updater){
                    //see if the hosting is equal to this.me
                    //send a accepted message with no SDP
                    this.me.updatedIdentities.push(this.me.identity.rtcIdentity);
                    this.me.updatedIdentities.push(message.from.rtcIdentity);
                    var answerBody = new Object();
                    answerBody.updatedIdentities = this.me.updatedIdentities;
                    answerBody.from = message.from;
                    answerBody.to = "";
                    this.me.sendMessage(answerBody, MessageType.UPDATED, mediaConstraints);
                }
            }else{
                if(message.body.updatedIdentities.length != 0){
                    for(var i = 0; i < message.body.updatedIdentities.length; i++){
                        //ignore the message if my rtcIdentity is in the this.connectedIdentities
                        if(message.body.updatedIdentities[i] == that.me.identity.rtcIdentity){
                            exist = true;
                            break;
                        }
                    }

                    if(!exist){
                        console.log("mediaConstraints[0]",mediaConstraints[0])
                        if(mediaConstraints[0].direction == "in_out"){
                        //if not send a message to the all of candidates
                            that.sendMessage("", MessageType.UPDATE, mediaConstraints);
                        }
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

            console.log("---", this)
            // IF GETS HERE IT IS NORMAL FOR THE MULTIPARTY
            if(this.RTCPeerConnection){
                var mediaConstraints = message.body.constraints;
                var description = new RTCSessionDescription(message.body.connectionDescription);
                this.RTCPeerConnection.setRemoteDescription(description, onSetSessionDescriptionSuccess, onSetSessionDescriptionError);
            }
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
    console.log("constraints",constraints);
     console.log("messageBody",messageBody);
      console.log("messageType",messageType);
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
    /*for(i = 0;i<constraints.length;i++){
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
            // define new type of constraints because when isn't possible to send the DataBroker in message...
            var constraintsAux =new Array();
            var i;
            var iteration;

            for(iteration=0;iteration<constraints.length;iteration++){
                var aux = new Object()
                if(constraints[iteration].constraints){
                    aux.id = constraints[iteration].constraints.id;
                }else{
                    aux.id = constraints[iteration].id;
                }

                // swap direction invitation        
                if(this.me.identity.rtcIdentity != this.hosting.rtcIdentity) {
                    if(constraints[iteration].direction == 'in_out'){
                        aux.type = constraints[iteration].type;
                        aux.direction =  constraints[iteration].direction;
                        constraintsAux.push(aux);
                    }
                }else{
                    aux.type = constraints[iteration].type;
                    aux.direction =  constraints[iteration].direction;
                    constraintsAux.push(aux);
                } 
            }

                if (!messageBody) message = MessageFactory.createInvitationMessage(this.me.identity, this.identity, this.contextId, constraintsAux);
                else message = MessageFactory.createInvitationMessage(this.me.identity, this.identity, this.contextId, constraintsAux, messageBody.conversationURL, messageBody.subject, messageBody.hosting, messageBody.agenda, messageBody.peers);
                setStatus(ParticipantStatus.PENDING); // TODO: OR WAITING?? Check for errors.
                
                if(!this.RTCPeerConnection){
                    //message.type = MessageType.MESSAGE;
                    //message.to = message.to.rtcIdentity
                    this.me.identity.messagingStub.sendMessage(message);
                }else{
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

                        }, function(error){console.log("errorCallback(error)", error); errorCallback(error)});
                    }, function(error){errorCallback(error)/*console.log("errorCallback(error)", error);*/}, sdpConstraints);
                }

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
            console.log("EURECA",this)
            if(!this.RTCPeerConnection){
                    //message.type = MessageType.MESSAGE;
                    //message.to = message.to.rtcIdentity
                    this.me.identity.messagingStub.sendMessage(message);
            }else{

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
            console.log("MESSAGE: ", message);
            if (!messageBody)
            {   
                var constraintsAux =new Array();
            
                var aux = new Object();
                aux.id = constraints[0].id;
                aux.type = constraints[0].type;
                aux.direction =  constraints[0].direction;
                constraintsAux.push(aux);
                message = MessageFactory.createUpdateMessage(this.me.identity,this.identity,this.contextId, constraints);
            }else{
                var constraintsAux =new Array();
                var aux = new Object();
                aux.id = messageBody.newConstraints.id;
                aux.type = messageBody.newConstraints.type;
                aux.direction =  messageBody.newConstraints.direction;
                constraintsAux.push(aux);
                message = MessageFactory.createUpdateMessage(this.me.identity,this.identity,this.contextId, constraints);
            }   
         
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
            if(this.me.identity.rtcIdentity === this.me.updater){ 
                    //send a accepted message with no SDP inside
                    var message = new Object();
                    message = MessageFactory.createUpdatedMessage(messageBody.from,"",this.contextId,constraints, this.updatedIdentities,this.hosting.rtcIdentity);
                    message.body.from = messageBody.from.rtcIdentity;
                    thisParticipant.identity.messagingStub.sendMessage(message);

            }else{
                if (!messageBody)
                {
                    var constraintsAux =new Array();
            
                    var aux = new Object();
                    aux.id = constraints[0].id;
                    aux.type = constraints[0].type;
                    aux.direction =  constraints[0].direction;
                    constraintsAux.push(aux);
                    message = MessageFactory.createUpdatedMessage(this.me.identity, this.identity, this.contextId, constraintsAux);
                }else{ 
                    var constraintsAux =new Array();
            
                    var aux = new Object();
                    aux.id = messageBody.newConstraints.id;
                    aux.type = messageBody.newConstraints.type;
                    aux.direction =  messageBody.newConstraints.direction;
                    constraintsAux.push(aux);
                    message = MessageFactory.createUpdatedMessage(this.me.identity,this.identity,this.contextId, constraintsAux,messageBody.hosting);
                }
                 for(var i = 0;i < thisParticipant.candidates.length;i++){
                    thisParticipant.onMessage(thisParticipant.candidates[i]);
                    thisParticipant.candidates.splice(i,1);
                }
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
        for(var i=0;i< this.resources.length; i++){
            if(this.resources[i].stream){
                 this.resources[i].stream.stop();
            }

        }
        /*this.RTCPeerConnection.getLocalStreams().forEach(function(element, index, array){
            array[index].stop();
        });*/
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
        if(this.resources[i].constraint != null && this.resources[i].constraint != undefined) {
            if(this.resources[i].constraint.type =="chat" || this.resources[i].constraint.type =="file" ){    
                dataChannel = true;
            }
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
        //resourceConstraints = resourceConstraints[0]; // <dirtyFix>
        var iteration = 0;
        var recursiveFunction = function(resourceConstraints, message, iteration, recursive){
            console.log("resourceConstraints--", resourceConstraints)
            console.log("resourceConstraints--", iteration)
            if(resourceConstraints[iteration] instanceof Object){
                   switch (resourceConstraints[iteration].type) {
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

                if (doGetUserMedia === true && resourceConstraints[iteration].direction != "in") {


                    if(!getMedia || resourceConstraints[iteration].type == "screen"){
                        getUserMedia(constraints, function (stream) {
                            var evt = new Object();
                            evt.stream = stream;
                            streamGetMedia = stream;
                            
                            thisParticipant.rtcEvtHandler('onaddlocalstream', evt);

                            //if(!micAlready & !camAlready){
                                //thisParticipant.RTCPeerConnection.addStream(stream);
                                var resource = new Resource(resourceConstraints[iteration]);
                                resource.id = stream.id;
                                resource.stream = stream;
                                resource.constraint.constraints= {id: stream.id};
                                //resource.connections.push(thisParticipant.RTCPeerConnection);
                                thisParticipant.resources.push(resource);
                            //}
                            //else{
                                if(micAlready){
                                    var resource = thisParticipant.me.getResources("",ResourceType.AUDIO_MIC)[0];
                                    stream2.addTrack(resource.stream);
                                }
                                if(camAlready){
                                    var resource = thisParticipant.me.getResources("",ResourceType.VIDEO_CAM)[0];
                                    resource.stream.addTrack(stream); 
                                }
                                resource.type=ResourceType.AUDIO_VIDEO;   
                                resource.constraint.type=ResourceType.AUDIO_VIDEO;
                            //}

                            callback();
                        }, errorCallback);
        }
        else{
            var evt = new Object();
            evt.stream = streamGetMedia;
            thisParticipant.rtcEvtHandler('onaddlocalstream', evt);
            if(!micAlready & !camAlready){
                                //thisParticipant.RTCPeerConnection.addStream(streamGetMedia);
                                var resource = this.resources[idMedia];
                                resource.constraint.constraints= {id: streamGetMedia.id};
                                //resource.connections.push(thisParticipant.RTCPeerConnection);
                                thisParticipant.resources.push(resource);
                            }
                            else{
                                if(micAlready){
                                    var resource = thisParticipant.me.getResources("",ResourceType.AUDIO_MIC)[0];
                                    resource.stream.addTrack(streamGetMedia);
                                }
                                if(camAlready){
                                    var resource = thisParticipant.me.getResources("",ResourceType.VIDEO_CAM)[0];
                                    resource.stream.addTrack(streamGetMedia); 
                                }
                                resource.type=ResourceType.AUDIO_VIDEO;   
                                resource.constraint.type=ResourceType.AUDIO_VIDEO;
                            }

                            if(resourceConstraints.length == iteration){
                                callback();
                            }else{
                                iteration = iteration +1;
                                recursive(resourceConstraints, message, recursiveCallback,iteration, recursive)
                            }
                        }
                        return;
                    }
                    if (doDataChannel === true && resourceConstraints[iteration].direction != "in") {
                        console.log(thisParticipant);
                        var codec = new Codec(resourceConstraints[iteration].type);

                        var resource = new Resource(resourceConstraints, codec);
                        if(resourceConstraints.id) codec.id = resourceConstraints[iteration].id;
                        //resource.connections.push(thisParticipant.RTCPeerConnection);
                        resource.id= guid();
                        resourceConstraints[iteration].id = resource.id;
                        resource.owner = this.identity;
                        //this.resources.push(resource);
                        var evt = new Object();
                        evt.codec = codec;
                        thisParticipant.onRTCEvt('onResourceParticipantAddedEvt', evt);
                }
                if(resourceConstraints.length == iteration){
                    callback();
                }else{
                    iteration = iteration +1;
                    recursive(resourceConstraints, message,iteration, recursive)
                }
            }else{
                if(resourceConstraints.length == iteration){
                    callback();
                }else{
                    iteration = iteration +1;
                    recursive(resourceConstraints, message,iteration, recursive)
                }
            }
    }

       
    recursiveFunction(resourceConstraints, message, iteration, recursiveFunction);


      
    } else {
        var iteration = 0;
        var thisMe = this.me;
        var thisParticipant = this;
        var recursiveFunction = function(resourceConstraints, message, iteration, recursive){
           /*if(resourceConstraints instanceof Array){
            resourceConstraints = resourceConstraints[iteration]
        }*/
        //resourceConstraints = resourceConstraints[0]
        if (resourceConstraints[iteration].direction != "out") {
            if (resourceConstraints[iteration].type == "audioVideo" || resourceConstraints[iteration].type == "screen" || resourceConstraints[iteration].type == "audioMic") {

                var resource = new Resource(resourceConstraints[iteration]);
                if(!resourceConstraints[iteration].id){
                    resource.id = resource.constraint.constraints.id;

                    resourceConstraints[iteration].id = resource.constraint.constraints.id;
                }else{
                    resource.id = resourceConstraints[iteration].constraints.id;

                    resourceConstraints[iteration].id = resource.id;
                }
                resource.owner = this.identity;
                if(!thisParticipant.RTCPeerConnection){
                    var mediaConstraints = {optional: [{RtpDataChannels: true}]};
                    thisParticipant.RTCPeerConnection = new RTCPeerConnection({'iceServers': new Array()}, mediaConstraints);
                    thisParticipant.setRTCPeerConnection(thisParticipant.RTCPeerConnection);
                    thisParticipant.RTCPeerConnection.addStream(thisParticipant.me.getResources("",ResourceType.AUDIO_VIDEO)[0].stream);
                }
                resource.connections.push(thisParticipant.RTCPeerConnection);
                thisParticipant.resources.push(resource);
            }
            if (resourceConstraints[iteration].type == "chat" || resourceConstraints[iteration].type == "file") {
                var resource = new Resource(resourceConstraints[iteration]);
                if(!resourceConstraints[iteration].id){
                    resource.id = guid();

                    resourceConstraints[iteration].id = resource.id ;
                }else{
                    resource.id = resourceConstraints[iteration].id;

                    resourceConstraints[iteration].id = resource.id;
                }
                    var codec = new Codec(resourceConstraints[iteration].type);
                     var evt = new Object();
                    evt.codec = codec;
                    thisParticipant.onRTCEvt('onResourceParticipantAddedEvt', evt);
                    //resource.codec = codec;
                    resource.owner = thisParticipant.identity;
                    if(!thisParticipant.RTCPeerConnection){
                        var mediaConstraints = {optional: [{RtpDataChannels: true}]};
                        thisParticipant.RTCPeerConnection = new RTCPeerConnection({'iceServers': new Array()}, mediaConstraints);
                        thisParticipant.setRTCPeerConnection(thisParticipant.RTCPeerConnection);
                    }
                    resource.connections.push(thisParticipant.RTCPeerConnection);
                    thisParticipant.resources.push(resource);
                }
            
           
            // needed to be implemented the resources types
            //wiuth the resources types see what do we want to have
            //if chat -> codec for chat | if filesharing -> codec for filesharing
            // create data channel and setup chat        
            if (((resourceConstraints[iteration].type == "chat" || resourceConstraints[iteration].type == "file") && resourceConstraints[iteration].direction != "in") && dataChannel == false) {
                //if(thisParticipant.dataBroker.channels.length <= 1){
                    channel = thisParticipant.RTCPeerConnection.createDataChannel("dataChannel"); // TODO: CREATE DATACHANNEL ONLY IF THERE IS NOT DATARESOURCE YET.
                    //thisParticipant.setDataBroker(constraints.constraints.dataBroker);
                    thisParticipant.dataBroker.addDataChannel(channel,thisParticipant.identity);
                //}
                var resourceData = thisParticipant.getResources(resourceConstraints[iteration])[0];
                resourceData.connections.push(thisParticipant.RTCPeerConnection);

                channel.onopen = function () {
                    thisParticipant.dataBroker.onDataChannelEvt();
                    //thisParticipant.onRTCEvt("onResourceParticipantAddedEvt", resourceData);
                }

                // setup chat on incoming data channel
               // pc = thisParticipant.RTCPeerConnection;
                thisParticipant.me.RTCPeerConnection.ondatachannel = function (evt) {
                    channel = evt.channel;
                };
                
            }
            if(dataChannel && (resourceConstraints[iteration].type == "chat" || resourceConstraints[iteration].type == "file")){
                var resourceData = this.me.getResources(resourceConstraints)[0];

                resourceData.connections.push(thisParticipant.RTCPeerConnection);
                thisParticipant.dataBroker.onDataChannelEvt();
            }
            if ( (resourceConstraints[iteration].type == "audioVideo" || resourceConstraints[iteration].type == "audioMic" || resourceConstraints[iteration].type == "screen") && resourceConstraints[iteration].direction != "in") {
                var resourceMedia = thisMe.getResources(resourceConstraints[iteration]);
                                
                //If it doesnt find the constraints means that the audio and video were merged into AudioVideo
                if(resourceMedia.length==0){
                    constraints.type=ResourceType.AUDIO_VIDEO;
                    resourceMedia = thisMe.getResources(resourceConstraints[iteration])[0];
                }

                if(!thisParticipant.RTCPeerConnection){
                    var mediaConstraints = {optional: [{RtpDataChannels: true}]};
                    thisParticipant.RTCPeerConnection = new RTCPeerConnection({'iceServers': new Array()}, mediaConstraints);
                    thisParticipant.setRTCPeerConnection(thisParticipant.RTCPeerConnection);
                }
                resourceMedia[0].connections.push(thisParticipant.RTCPeerConnection);
            }
        }

        if(resourceConstraints.length == iteration+1){    
            if (!message) {
                // setlocal description, send update
                var messageBody = new Object();
                messageBody.newConstraints=resourceConstraints;
                thisParticipant.sendMessage(messageBody, MessageType.UPDATE, resourceConstraints, callback, errorCallback);
                
            } else {
                // set remotedescription, set localdescription send updated 
                if(message.body.newConnectionDescription == ""){

                }else{
                    var description = new RTCSessionDescription(message.body.newConnectionDescription);
                    thisParticipant.RTCPeerConnection.setRemoteDescription(description,
                            onSetSessionDescriptionSuccess, onSetSessionDescriptionError);
                }


                var messageBody = new Object();
                messageBody.newConstraints=resourceConstraints;
                messageBody.from = message.from;
                thisParticipant.sendMessage(messageBody, MessageType.UPDATED, resourceConstraints, callback, errorCallback);
            }
        }
        if(resourceConstraints.length == iteration){
            callback();
        }else{
            iteration = iteration +1;
            if(resourceConstraints.length != iteration){
                recursive(resourceConstraints, message,iteration, recursive)
            }
        }
        }
        recursiveFunction(resourceConstraints, message, iteration, recursiveFunction);
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

Participant.prototype.removeResource = function( resourceConstraints, message ) {
    console.log("RemoveResource-->", this.me);
    var resources = this.me.getResources(resourceConstraints[0]);
    for(var i = 0; i< resourceConstraints.length;i++){
        if(this.me.getResources(resourceConstraints[i])){
            for(var j = 0; j< this.me.resources.length; j++){
                if(this.me.resources[j].constraint.type == resourceConstraints[i].type){
                    if(this.me.resources[j].stream){
                        this.me.resources[j].stream.stop();
                    }
                    console.log("BIMBO")
                    this.me.resources.splice(j,1);
                }
            }
        }

    }
    console.log("RemoveResource-->", resources);

}