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
            element.sendMessage("",MessageType.REMOVE_PARTICIPANT,"","",function(){},function(){});
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
            this.participants.forEach(function(element, index, array){
                if(element.status==ParticipantStatus.PARTICIPATED){
                    array.splice(index, 1);
                }
            });
            if(this.participants.length==0) this.bye();
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
        case MessageType.REMOVE_PARTICIPANT:
            // Remove everyone without sending BYE ("silently")
            this.participants.forEach(function (element, index, array) {
                element.leave(false);
                delete array[index];
            });
            this.myParticipant.leave(false);
            this.setStatus(ConversationStatus.CLOSED);
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
}