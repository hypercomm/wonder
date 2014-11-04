var localVideo;
var miniVideo;
var remoteVideo;

var conversation;
var myIdentity;

var constraints;
var videoCount;
var peers;
var constraints;

var onCreateSessionDescriptionError;
var onSetSessionDescriptionError;
var onSetSessionDescriptionSuccess;

function var_init(){
    // TODO: Handle properly the error callbacks
    onCreateSessionDescriptionError = function(){};
    onSetSessionDescriptionError = function(){};
    onSetSessionDescriptionSuccess = function(){};

    codecChat="";
    codecFile="";

    var codecIDFile;
    var codecIDChat;
        
    videoCount = 0;
    peers = new Array();

    peersString = "";
    constraints = [{
            constraints: "",
            type: ResourceType.AUDIO_VIDEO,
            direction: "in_out"
        }];
}
var peersString = "";
/**
 *
 */

document.getElementById('logout').onclick = function(){

    myIdentity.messagingStub.impl.disconnect(myRtcIdentity, onMessage);
    myIdentity = null;
    myRtcIdentity = "";
    setStatus(myRtcIdentity);
    document.getElementById('login').style.visibility = 'visible';
    document.getElementById('videoContainer').style.visibility = 'hidden';
    document.getElementById('call').style.visibility = 'hidden';

}


document.onreadystatechange = function(){
    if(document.readyState == 'complete'){

        localVideo = document.getElementById('localVideo');
        if(window.location.toString().split("#")[1] || window.location.toString().split("#")[2] || window.location.toString().split("#")[3]){
            document.getElementById('login').style.visibility = 'hidden';
            console.log("window.location: ", window.location.toString().split("#")[1]);
            console.log("window.location: ",  window.location.toString().split("#")[2]);
            console.log("window.location: ",  window.location.toString().split("#")[3]);
            myRtcIdentity = window.location.toString().split("#")[3];

            Idp.getInstance().createIdentity(myRtcIdentity, function(identity) {
                myIdentity = identity;
                myIdentity.resolve(function(stub) {
                    stub.addListener(onMessage);
                    stub.connect(myRtcIdentity,"",function(){});
                });
                //#####
                
                Idp.getInstance().createIdentity(window.location.toString().split("#")[2], function(identity) {
                    otherIdentity = identity;
                    var credentials = new Object();
                    credentials.username = myRtcIdentity;
                    credentials.password = "";
                    otherIdentity.resolve(function(stub) {
                        stub.addListener(onMessage);
                        stub.connect(myRtcIdentity, credentials,function(){
                            console.log(stub);
                            stub.impl.connected(myRtcIdentity, window.location.toString().split("#")[1]);
                            
                           
                            document.getElementById('videoContainer').style.visibility = 'visible';
                            document.getElementById('call').style.visibility = 'visible';
                            //document.getElementById('chat').style.visibility = 'visible';
                            document.getElementById('updateConversation').style.visibility = 'visible';
                            
                        });
                    });
                });
                //#####
            });
            
            
        }else{
            console.log("no notification");
        }
    }
}


/*
 * WsQuery for ws get Identities
 */
 /*function wsQuery(rtcIdentity, callback){
        //that.EBViewModel.eb
        //myIdentity.messagingStub.impl.eventbus
        that.EBViewModel.eb.send("test.my_persistor",
                                          {
                                              action: "findone",
                                              collection: "users",
                                              matcher: {
                                                  rtcIdentity: rtcIdentity
                                              }
                                          }, function(reply){
                                              console.log(reply);
                                              var rows = new Array();
                                              rows.push(reply.result);

                                              var data = new Object();
                                              data.rows = rows;
                                              callback(data);
                                              //Idp.getInstance().treatIdentity(reply.result);
                                          });
            }
*/

/**
 * Test Function
 */
    function doIndividualCall(type) {
        peers = seePersonsToCall(document.getElementById('callTo').value);
        if(!peers){
            alert("All the identities must be from the same domain to do a Multiparty Conversation!")
        } else{
            if (type === "chat") {
                constraints[0].type = ResourceType.CHAT;
                console.log("Set constraints to " + constraints.type + ", constraints[0]: " + constraints[0].type);
            } else if (type === "s") {
                constraints[0].type = ResourceType.AUDIO_VIDEO;
                console.log("Set constraints to " + ResourceType.AUDIO_VIDEO);
            } else if (type === "audiovideo") {
               constraints = [{
                    constraints: "",
                    type: ResourceType.CHAT,
                    direction: "in_out"
                },{
                    constraints: "",
                    type: ResourceType.AUDIO_VIDEO,
                    direction: "in_out"
                },{
                    constraints: "",
                    type: ResourceType.FILE,
                    direction: "in_out"
                }];
                 
                console.log("Set constraints to " + ResourceType.AUDIO_VIDEO);
            }
            
            doCall();
        }
    }

/*
 * initialize()
 * 
 * 
 */

function initialize() {
    /** HTML related code */
    var_init();
    /*  Hide login form and get login name */
    document.getElementById('login').style.visibility = 'hidden';
    document.getElementById('videoContainer').style.visibility = 'visible';
    document.getElementById('call').style.visibility = 'visible';
    //document.getElementById('chat').style.visibility = 'visible';
    //document.getElementById('updateConversation').style.visibility = 'visible';


    if (document.getElementById('loginText').value != "")
        myRtcIdentity = document.getElementById('loginText').value + "@nodejs.wonder";

    /* Initialize the video elements and status */
    console.log('Initializing');
    card = document.getElementById('card');
    localVideo = document.getElementById('localVideo');
    miniVideo = document.getElementById('miniVideo');
    remoteVideo = document.getElementById('remoteVideo');
    resetStatus();
    setStatus("My identity: " + myRtcIdentity);
    
    
    /** WONDER Initialization */
    //var idp = new Idp(myRtcIdentity, {domain : "150.140.184.247", port : '8088'});
    //var idp = new Idp(myRtcIdentity);
    var listener = this.onMessage.bind(this);
    Idp.getInstance().createIdentity(myRtcIdentity, function(identity) {
        myIdentity = identity;
        myIdentity.resolve(function(stub) {
            stub.addListener(listener);
            stub.connect(myRtcIdentity,"",function(){});
        });
    });
}

function sendFile() {
    var newMessage = new DataMessage(codecFile.id, "",myRtcIdentity,'fileInput');
    codecFile.send(JSON.stringify(newMessage));
}

function doCall() {

    console.log(peers);
    conversation = new Conversation(myIdentity, this.onRTCEvt.bind(this), this.onMessage.bind(this), iceServers);
    var invitation = new Object();
    invitation.peers = peers;
    if(peers.length > 1)
        invitation.hosting = myRtcIdentity;
    
    for(var i = 0; i<peers.length; i++){
        peersString = peersString + " - " + peers[i];
    }
    $("#callingModal").text("Calling: " + peersString);
    $('#modalInviting').modal('show');

    conversation.open(peers, "", constraints, invitation, function(){}, function(){});

    var Cancelbtn = document.getElementById('CancelButton');
    Cancelbtn.onclick = function(){

        $('#modalInviting').modal('hide');
        closeConversation();
    }
   
}

function hangup(){
    peersString = "";
    document.getElementById('call').style.visibility = 'visible';
    document.getElementById('hangup').style.visibility = 'hidden';
    document.getElementById('chat').style.visibility = 'hidden';
    document.getElementById('fileSharing').style.visibility = 'hidden';
    document.getElementById('updateConversation').style.visibility = 'hidden';
    var divChat = document.getElementById('textChat');
    while(divChat.firstChild){
        divChat.removeChild(divChat.firstChild);
    }
    localVideo.src=''; 
    var div = document.getElementById('remote');
    while(div.firstChild){
        console.log("div.firstChild: ", div.firstChild);
        div.removeChild(div.firstChild);
    }
     if(conversation != null && conversation.owner.identity.rtcIdentity == myRtcIdentity)
        conversation.close();
    else if(conversation != null){
        conversation.bye();
    }
    conversation=null;
    var_init();
}

function closeConversation(){
    peersString = "";
    document.getElementById('call').style.visibility = 'visible';
    localVideo.src=''; 
    conversation.close();
    conversation=null;
    var_init();
}

function onMessage(message) {
    // TODO: implement eventHandling
    switch (message.type) {

        case MessageType.ACCEPTED:
            $('#modalInviting').modal('hide');
            document.getElementById('call').style.visibility = 'hidden';
            if(conversation.owner.identity.rtcIdentity == myRtcIdentity){
                document.getElementById('updateConversation').style.visibility = 'visible';
            }      
            document.getElementById('hangup').style.visibility = 'visible';
            for(var i=0; i< constraints.length; i++){
                if(constraints[i].type == 'audioVideo')
                    document.getElementById('updateConversation').style.visibility = 'hidden';
                if(constraints[i].type == 'chat')
                    document.getElementById('chat').style.visibility = 'visible';
                if(constraints[i].type == 'file')
                    document.getElementById('fileSharing').style.visibility = 'visible';
            }
            break;
        case MessageType.CONNECTIVITY_CANDIDATE:
            
            // put candidate to PC
            break;
        case MessageType.NOT_ACCEPTED:
            console.log("NOT_ACCEPTED RECEIVED");
            $('#modalInviting').modal('hide');
            finishNotAccepted = false;
            $.notify( message.from.rtcIdentity + " rejected", "error");
            for(var i = 0; i< conversation.participants.length; i++){
                if(conversation.participants[i].status == "pending" || conversation.participants[i].status == "participating")
                    break;
                if(i == conversation.participants.length-1)
                    finishNotAccepted = true;

            }
            if(conversation.owner.identity.rtcIdentity == myRtcIdentity && finishNotAccepted){
                localVideo.src = '';
                conversation.close();
                conversation = null;
            }
                
            if (conversation.getStatus() === ConversationStatus.CLOSED) {
                localVideo.src = '';
                conversation = null;
                var_init();
            }
            break;
        case MessageType.CANCEL:
            
            break;
        case MessageType.ADD_RESOURCE:
            
            break;
        case MessageType.REDIRECT:
            
            break;
        case MessageType.BYE:
            console.log("BYE RECEIVED", message);
            
            if(conversation != null && message.from.rtcIdentity == conversation.owner.identity.rtcIdentity){
                peersString = "";
                localVideo.src = '';
                conversation = null;
                if(document.getElementById('updateConversation').style.visibility == 'visible')
                    document.getElementById('updateConversation').style.visibility = 'hidden';

                document.getElementById('hangup').style.visibility = 'hidden';
                document.getElementById('chat').style.visibility = 'hidden';
                document.getElementById('fileSharing').style.visibility = 'hidden';
                
                document.getElementById('call').style.visibility = 'visible';
                var div = document.getElementById('remote');

                while(div.firstChild){
                    console.log("div.firstChild: ", div.firstChild);
                    div.removeChild(div.firstChild);
                }

                var divChat = document.getElementById('textChat');
                while(divChat.firstChild){
                    divChat.removeChild(divChat.firstChild);
                }
                var_init();
            }

            if (conversation != null && conversation.getStatus() === ConversationStatus.CLOSED) {
                localVideo.src = '';
                conversation = null;
                var_init();
                
            }

            removeVideoTag(message.from.rtcIdentity);
        
            //$('#modalInvite').modal({backdrop: 'static'}).modal('hide');
            
            break;
        case MessageType.OFFER_ROLE: // set new moderator of the conversatoin
            
            break;
        case MessageType.INVITATION:
            console.log("Application received an invitation:", message);
            var that = this;
            var Acceptbtn = document.getElementById('AcceptButton');
            var Rejectbtn = document.getElementById('RejectButton');
            //$('#modalInvite').modal({backdrop: 'static'}).modal('show');
            $("#receivingModal").text(message.from.rtcIdentity + " is trying to call you..");
            $('#modalInvite').modal('show')
            /*var conf = confirm("Incoming call from: " + message.from.rtcIdentity + " Accept?");
            if (conf == true)
            {
                /*  Create new conversation */
            Acceptbtn.onclick = function(){
                document.getElementById('hangup').style.visibility = 'visible';
                document.getElementById('call').style.visibility = 'hidden';
                for(var i=0; i< message.body.constraints.length; i++){
                    if(message.body.constraints[i].type == 'andudioVideo')
                        document.getElementById('updateConversation').style.visibility = 'hidden';
                    if(message.body.constraints[i].type == 'chat')
                        document.getElementById('chat').style.visibility = 'visible';
                    if(message.body.constraints[i].type == 'file')
                        document.getElementById('fileSharing').style.visibility = 'visible';
                }
                $('#modalInvite').modal({backdrop: 'static'}).modal('hide');
                conversation = new Conversation(myIdentity, that.onRTCEvt.bind(that), that.onMessage.bind(that), iceServers, constraints);                           
                conversation.acceptInvitation(message, "", function(){}, function(){});
            }

            Rejectbtn.onclick = function(){
                $('#modalInvite').modal({backdrop: 'static'}).modal('hide');
                Conversation.reject(message);
            }
            break;
        case MessageType.RESOURCE_REMOVED:
            
            break;
        case MessageType.REMOVE_PARTICIPANT:
            
            peersString = "";
            localVideo.src = '';
            conversation = null;
            if(document.getElementById('updateConversation').style.visibility == 'visible')
                document.getElementById('updateConversation').style.visibility = 'hidden';

            document.getElementById('hangup').style.visibility = 'hidden';
            document.getElementById('chat').style.visibility = 'hidden';
            document.getElementById('fileSharing').style.visibility = 'hidden';
            
            document.getElementById('call').style.visibility = 'visible';
            var div = document.getElementById('remote');

            while(div.firstChild){
                console.log("div.firstChild: ", div.firstChild);
                div.removeChild(div.firstChild);
            }

            var divChat = document.getElementById('textChat');
            while(divChat.firstChild){
                divChat.removeChild(divChat.firstChild);
            }
            var_init();
            if(!$('#modalInvite')[0].hidden)
                $('#modalInvite').modal({backdrop: 'static'}).modal('hide');
            break;
        case MessageType.SHARE_RESOURCE:
            
            break;
        case MessageType.UPDATE:
            console.log("UPDATE RECEIVED");
            document.getElementById('chat').style.visibility = 'visible';
            // HTML5 BUG WORKAROUND
            // The HTML5 video tag element does not display new MediaTracks when added, so you have to manually reattach the media stream
            conversation.addResource(message.body.newConstraints, message,function(){reattachMediaStream(video0,video0);},function(){});  
            break;
        case MessageType.UPDATED:
            document.getElementById('updateConversation').style.visibility = 'hidden';
            // HTML5 BUG WORKAROUND
            // The HTML5 video tag element does not display new MediaTracks when added, so you have to manually reattach the media stream
            //if(video0) {reattachMediaStream(video0,video0);}
            break;
        default:
            
            break;
    }
};

function onRTCEvt(event, evt) {
    // TODO To implement and pass the events up
    switch (event) {

    case 'onnegotiationneeded':
        //onnegotiationNeeded(this);
        //this.rtcEvtHandler(event,evt);
        break;
    case 'onicecandidate':
        break;
    case 'onsignalingstatechange':
        break;
    case 'onaddstream':
            console.log("onaddstream", evt);
            addVideoTag(evt.stream, evt.participant.identity.rtcIdentity);
            //attachMediaStream(remoteVideo, evt.stream);
            // TODO: change state of the conversation and forward to app-layerevt
        break;
    case 'onremovestream':
        console.log("onremovestream: ", evt);
        break;
    case 'oniceconnectionstatechange':

        break;
    case 'ondatachannel':
        console.log("ondatachannel");
        break;
    case 'onResourceParticipantAddedEvt':
        console.log("onResourcePorticipantAddedEvt", evt);
        if(evt.codec.type=="chat"){
            codecIDChat = evt.codec.id;
            codecChat=evt.codec;
            conversation.dataBroker.addCodec(codecChat);
            codecChat.addListener(onData);
            ////document.getElementById('chat').style.visibility = 'visible';
        }
        if(evt.codec.type=="file"){
            codecIDFile = evt.codec.id;
            codecFile=evt.codec;
            conversation.dataBroker.addCodec(codecFile);
            codecFile.addListener(onData);
            //document.getElementById('fileSharing').style.visibility = 'visible';
        }
        break;
    case 'onaddlocalstream':
        console.log("LOCALVIDEO: ", localVideo);
        
        attachMediaStream(localVideo, evt.stream);
        //document.getElementById('updateConversation').style.visibility = 'visible';
        //document.getElementById('hangup').style.visibility = 'visible';
        for(var i=0; i< constraints.length; i++){
            if(constraints[i].type == 'audioVideo')
                document.getElementById('updateConversation').style.visibility = 'hidden';
        }
        break;
    default:
        break;
    }
};


/* HTML Related functions */

function setStatus(state) {
    document.getElementById('status').innerHTML = state;
}

function resetStatus() {
    setStatus('resetStatus');
}

function onData(code,msg) {
        console.log(msg);

        var iDiv = document.getElementById('textChat');

        // Now create and append to iDiv
        var innerDiv = document.createElement('div');
        innerDiv.className = 'block-2';

        // The variable iDiv is still good... Just append to it.
        iDiv.appendChild(innerDiv);
        innerDiv.innerHTML = "<b>" + msg.from + "</b>" + " : " + msg.body; 
}


function sentMessageData(){
        
    var newMessage = new DataMessage(codecIDChat, "", myRtcIdentity,document.getElementById("datachannelmessage").value);
    codecChat.send(JSON.stringify(newMessage));
    
    
    var iDiv = document.getElementById('textChat');

    // Now create and append to iDiv
    var innerDiv = document.createElement('div');
    innerDiv.className = 'block-2';
    iDiv.appendChild(innerDiv);
    innerDiv.innerHTML = "You:" + " : " + newMessage.body;

}

sentMessageDataFile= function(){
         console.log("codecIDFile-------",codecIDFile)

       // var fileElement = document.getElementById('fileInput');
        //var file = fileElement.files[0];
        //console.log("file.----",fileElement);
        var newMessage = new DataMessage(codecIDFile, "",myRtcIdentity,'fileInput');
        codecFile.send(JSON.stringify(newMessage));
    };


function updateConversation(){
    conversation.addResource([{type : ResourceType.AUDIO_VIDEO, direction : "in_out"}],"",function(){}, function(){});
    //document.getElementById('update').style.visibility = 'visible';
}


function addVideoTag(stream,participant){
    /*var tagDiv = document.createElement('div');
    
    var videoDiv = document.createElement('div');
    videoDiv.className = 'block-2';
    tagDiv.appendChild(videoDiv);
    videoDiv.innerHTML = '<video id="video'+ participant +'"" controls autoplay loop muted width="300" height="300"></video>';

    var participantDiv = document.createElement('div');
    participantDiv.className = 'block-2';
    tagDiv.appendChild(participantDiv);
    participantDiv.innerHTML = participant;
    var videoRemote = document.getElementById("video"+participant);
    attachMediaStream(videoRemote,stream);

    console.log("stream: ", stream);
    //var $video = $('<video id="video'+ participant +'"" controls autoplay loop muted width="300" height="300"></video>');
    $('#remote').append(tagDiv);

    */
    var div = document.createElement('div');
    div.className = 'video-container';
    div.id = participant;
    var $video = $('<video id="video'+ participant +'"" controls autoplay loop width="250" height="250"></video>');
    $(div).append($video);
   

    var h2 = document.createElement('div');
    h2.className = 'name-person';
    h2.innerHTML = participant;
    div.appendChild(h2);
    $('#remote').append($(div));

    var videoRemote = document.getElementById("video"+participant);
    attachMediaStream(videoRemote,stream)
    /*var remoteVideos = document.getElementById('remote');
    var videoRemote = document.createElement('video');
    videoRemote.setAttribute('scr', stream); 
    videoRemote.play();
    remoteVideos.appendChild(videoRemote);*/
}


function removeVideoTag(participant){

    var div = document.getElementById(participant);
    if(div!=null && div.parentNode!=null)
        div.parentNode.removeChild(div)
    var divRemote = document.getElementById('remote');
    console.log("divdivRemote.firstChild: ", divRemote.childElementCount);
    if(divRemote.childElementCount == 0){
        document.getElementById('updateConversation').style.visibility = 'hidden';
        document.getElementById('hangup').style.visibility = 'hidden';
        hangup();
    }
        
}

function seePersonsToCall(string){
    var peerstocall = string.split(";");
    var peersFinal = new Array();
    var permit = true;
    for(var i =0; i < peerstocall.length; i++){
        if(peerstocall[i].split("@").length == 1){
            peersFinal.push(peerstocall[i] + "@nodejs.wonder");
        }
        else{
            if(peerstocall[i].split("@")[1] != myRtcIdentity.split("@") && peerstocall.length > 1)
            {
                permit = false;
                break;
            }
            peersFinal.push(peerstocall[i]);
        }
    }
    if(!permit)
        return false;
    else
        return peersFinal;
}
