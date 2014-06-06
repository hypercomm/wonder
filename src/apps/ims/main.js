var localVideo;
var miniVideo;
var remoteVideo;

var conversation;
var myIdentity;
// TODO: Handle properly the error callbacks
var onCreateSessionDescriptionError = function(){};
var onSetSessionDescriptionError = function(){};
var onSetSessionDescriptionSuccess = function(){};

var resources = ["chat"];

var constraints = new Array();
constraints.push({
    constraints: true,
    type: ResourceType.AUDIO_VIDEO,
    direction: ""

});
/* GENERAL SIGNALING FUNCTIONS */

/*
 * initialize()
 * 
 * 
 */

function initialize() {

    /** HTML related code */
    
    /*  Hide login form and get login name*/
    document.getElementById('login').style.visibility = 'hidden';
    document.getElementById('container').style.visibility = 'visible';
    document.getElementById('chat').style.visibility = 'visible';
    document.getElementById('updateConversation').style.visibility = 'visible';


    if (document.getElementById('loginText').value != "")
        myRtcIdentity = document.getElementById('loginText').value;

    /* Initialize the video elements and status */
    console.log('Initializing');
    card = document.getElementById('card');
    localVideo = document.getElementById('localVideo');
    miniVideo = document.getElementById('miniVideo');
    remoteVideo = document.getElementById('remoteVideo');
    resetStatus();
    setStatus("My identity: " + myRtcIdentity);
    
    
    /** WONDER Initialization */
	var idp = new Idp(myRtcIdentity, {domain : "150.140.184.247", port : '8088'});
//    var idp = new Idp(myRtcIdentity);
    var listener = this.onMessage.bind(this);
    idp.createIdentity(myRtcIdentity, function (identity) {
         myIdentity = identity;
         myIdentity.messagingStub.impl = new MessagingStub_IMS2Cloud();
         idp.myOwnMessagingStub = myIdentity.messagingStub;
         myIdentity.messagingStub.addListener(listener);

         var credentials = new Object();
         credentials.user = document.getElementById('loginText').value;
         credentials.pubID = "";
         credentials.role = "PC";
         credentials.pass = document.getElementById('password').value;
         credentials.realm = "imsserver.ece.upatras.gr";
         credentials.pcscf = "150.140.184.242:4060";

         myIdentity.messagingStub.connect(myRtcIdentity, credentials, function () {});
     },
     function (e) {
         console.log(e);
     });
}

function doCall() {
    conversation = new Conversation(myIdentity, this.onRTCEvt.bind(this), this.onMessage.bind(this), this.onDataMsg.bind(this), iceServers, constraints, function () {
        // Call the polyfill wrapper to attach the media stream to this element.
        //attachMediaStream(localVideo, conversation.getLocalStream());

        conversation.open(document.getElementById('callTo').value, "", conversation.getLocalStream(), mediaConstraints, constraints);
    }, function () {
        console.log("Error in getUserMedia");
    });
}

function hangup(){
    localVideo.src=''; 
    remoteVideo.src=''; 
    conversation.close();
    conversation=null;
    chatResource=null;
}

function onMessage(message) {
    // TODO: implement eventHandling
    switch (message.type) {

        case MessageType.ACCEPTED:
            
            break;
        case MessageType.CONNECTIVITY_CANDIDATE:
            
            // put candidate to PC
            break;
        case MessageType.NOT_ACCEPTED:
            
            break;
        case MessageType.CANCEL:
            
            break;
        case MessageType.ADD_RESOURCE:
            
            break;
        case MessageType.REDIRECT:
            
            break;
        case MessageType.BYE:
            localVideo.src=''; 
            remoteVideo.src=''; 
            conversation=null;
            chatResource=null;
            break;
        case MessageType.OFFER_ROLE: // set new moderator of the conversatoin
            
            break;
        case MessageType.INVITATION:
            var conf = confirm("Incoming call from: " + message.from.rtcIdentity + " Accept?");
            if (conf == true)
            {
                /*  Create new conversation */
                conversation = new Conversation(myIdentity, this.onRTCEvt.bind(this), this.onMessage.bind(this), this.onDataMsg.bind(this), iceServers, constraints, function() {                            
                            //attachMediaStream(localVideo, conversation.getLocalStream());
                            //localVideo.style.opacity = 1;
                            
                            conversation.acceptInvitation(message, "", conversation.getLocalStream(), mediaConstraints);
                        },function() {                            
                            console.log("Error in getUserMedia()");
                        });
            }
            else
                alert("Rejected");
            break;
        case MessageType.RESOURCE_REMOVED:
            
            break;
        case MessageType.REMOVE_PARTICIPANT:
            
            break;
        case MessageType.SHARE_RESOURCE:
            
            break;
        case MessageType.UPDATE:
            console.log("UPDATE RECEIVED");
             conversation.addResource([{"type" : ResourceType.AUDIO_MIC}, {"type" : ResourceType.VIDEO_CAM}], "updated", function(){
                attachMediaStream(localVideo, conversation.getLocalStream());    
            });
            break;
        case MessageType.UPDATED:
            break;
        default:
            
            break;
    }
};

function onRTCEvt(event, evt){
    // TODO To implement and pass the events up
    switch(event){

        case 'onnegotiationneeded':
            //onnegotiationNeeded(this);
            //this.rtcEvtHandler(event,evt);
            break;
        case 'onicecandidate':
            break;
        case 'onsignalingstatechange':
            break;
        case 'onaddstream':
            attachMediaStream(remoteVideo, evt.stream);
            // TODO: change state of the conversation and forward to app-layerevt
            break;
        case 'onremovestream':
            break;
        case 'oniceconnectionstatechange':
            break;
        case 'ondatachannel':
            break;
        case 'onResourceParticipantAddedEvt':
            console.log("onResourceParticipantAddedEvt", evt);
            chatResource = evt.codec;
            break;
        default: 
            break;
    }
};

function onDataMsg(msg){
    // TODO To implement and pass the events up
    console.log(msg);

    var iDiv = document.getElementById('textChat');

    // Now create and append to iDiv
    var innerDiv = document.createElement('div');
    innerDiv.className = 'block-2';

    // The variable iDiv is still good... Just append to it.
    iDiv.appendChild(innerDiv);
    innerDiv.innerHTML = "<b>" + msg.from + "</b>" + " : " + msg.body;

};


/* HTML Related functions */

function setStatus(state) {
    document.getElementById('status').innerHTML = state;
}

function resetStatus() {
    setStatus('resetStatus');
}


function sentMessageData(){
        
    var newMessage = new DataMessage(chatResource.id, "", myRtcIdentity,document.getElementById("datachannelmessage").value);
    chatResource.send(JSON.stringify(newMessage));
    
    
    var iDiv = document.getElementById('textChat');

    // Now create and append to iDiv
    var innerDiv = document.createElement('div');
    innerDiv.className = 'block-2';
    iDiv.appendChild(innerDiv);
    innerDiv.innerHTML = "You:" + " : " + newMessage.body;

}

function updateConversation(){
        
    conversation.addResource([{"type" : ResourceType.AUDIO_MIC}, {"type" : ResourceType.VIDEO_CAM}], "update", function(){
        attachMediaStream(localVideo, conversation.getLocalStream());    
    });
    
}
