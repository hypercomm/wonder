var localVideo;
var miniVideo;
var remoteVideo;

var conversation;
var myIdentity;

var constraints;
var videoCount;
var peers;

var onCreateSessionDescriptionError;
var onSetSessionDescriptionError;
var onSetSessionDescriptionSuccess;

function var_init() {
    // TODO: Handle properly the error callbacks
    onCreateSessionDescriptionError = function () {};
    onSetSessionDescriptionError = function () {};
    onSetSessionDescriptionSuccess = function () {};

    codecChat = "";
    codecFile = "";

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

document.getElementById('logout_btn').onclick = function () {
    myIdentity.messagingStub.impl.disconnect(myRtcIdentity, onMessage);
    myIdentity = null;
    myRtcIdentity = "";
    setStatus(myRtcIdentity);
}


document.onreadystatechange = function () {
    if (document.readyState == 'complete') {

        localVideo = document.getElementById('localVideo');
        if (window.location.toString().split("#")[1] || window.location.toString().split("#")[2] || window.location.toString().split("#")[3]) {
            document.getElementById('login').style.visibility = 'hidden';
            console.log("window.location: ", window.location.toString().split("#")[1]);
            console.log("window.location: ", window.location.toString().split("#")[2]);
            console.log("window.location: ", window.location.toString().split("#")[3]);
            myRtcIdentity = window.location.toString().split("#")[3];

            Idp.getInstance().createIdentity(myRtcIdentity, function (identity) {
                myIdentity = identity;
                myIdentity.resolve(function (stub) {
                    stub.addListener(onMessage);
                    stub.connect(myRtcIdentity, "", function () {});
                });

                Idp.getInstance().createIdentity(window.location.toString().split("#")[2], function (identity) {
                    otherIdentity = identity;
                    var credentials = new Object();
                    credentials.username = myRtcIdentity;
                    credentials.password = "";
                    otherIdentity.resolve(function (stub) {
                        stub.addListener(onMessage);
                        stub.connect(myRtcIdentity, credentials, function () {
                            console.log(stub);
                            stub.impl.connected(myRtcIdentity, window.location.toString().split("#")[1]);


                        });
                    });
                });
            });

        } else {
            console.log("no notification");
        }
    }
}

/* do a call with type */
function doIndividualCall(type) {
    peers = seePersonsToCall(document.getElementById('callTo').value);
    console.log("calling: " + peers + " ...");

    if (!peers) {
        console.error('Peers Value:' + peers);
        console.error("All the identities must be from the same domain to do a Multiparty Conversation!")
    } else {
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
                }, {
                constraints: "",
                type: ResourceType.AUDIO_VIDEO,
                direction: "in_out"
                }, {
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

/* get IMS credentials from UI */
function getIMScredentials() {
    var credentials = new Object();
    var realmString = $("#imsPrivateId").val().split("@");

    credentials.user = $("#imsPrivateId").val();
    credentials.pubID = "sip:" + $("#imsPublicId").val() + "@" + realmString[1];
    credentials.role = "";
    credentials.pass = $("#imsPass").val();
    credentials.realm = realmString[1];
    credentials.pcscf = $("#imsProxy").val();

    localStorage.setItem("imsLoginCredentials", JSON.stringify(credentials));
    return credentials;
}

/* initialize IMS connection */
function initializeIMS(localIMScredentials) {
    var_init();
    var credentials = localIMScredentials;
    myRtcIdentity = localIMScredentials.user;
    console.log("Identity: " + myRtcIdentity);
    console.log('Initializing...');

    resetStatus();
    setStatus(myRtcIdentity);

    /** WONDER Initialization */
    var idp = new Idp(myRtcIdentity);
    var listener = this.onMessage.bind(this);

    console.log("TRYING to register as: " + myRtcIdentity);
    idp.createIdentity(myRtcIdentity, function (identity) {
        myIdentity = identity;
        myIdentity.resolve(function (stub) {
                stub.addListener(listener);
                stub.connect(myRtcIdentity, credentials, function () {
                        $("#userID").text("Registered as: " + myIdentity.rtcIdentity);
                        $('#modalIMS').modal('hide');
                    },
                    function () {
                        console.log("REGISTRATION FAILED - please check the given credentials!");
                    });
            },
            function (e) {
                console.log(e);
            });
    });
    $('#modalIMS').modal('hide');
}

function initialize() {
    /** HTML related code */
    var_init();

    myRtcIdentity = $('#loginText').val();

    if (myRtcIdentity != "") {
        login.setData(myRtcIdentity);
        (function () {
            hideModule.login();
        })();
    }
    console.log('Initializing...');

    resetStatus();
    setStatus(myRtcIdentity);

    /** WONDER Initialization */
    var listener = this.onMessage.bind(this);
    Idp.getInstance().createIdentity(myRtcIdentity, function (identity) {
        myIdentity = identity;
        myIdentity.resolve(function (stub) {
            stub.addListener(listener);
            stub.connect(myRtcIdentity, "", function () {});
        });
    });
}

function sendFile() {
    var newMessage = new DataMessage(codecFile.id, "", myRtcIdentity, 'fileInput');
    codecFile.send(JSON.stringify(newMessage));
}

function doCall() {
    console.log(peers);
    conversation = new Conversation(myIdentity, this.onRTCEvt.bind(this), this.onMessage.bind(this), iceServers);
    var invitation = new Object();
    invitation.peers = peers;
    if (peers.length > 1)
        invitation.hosting = myRtcIdentity;

    for (var i = 0; i < peers.length; i++) {
        peersString = peersString + " - " + peers[i];
    }
    console.log("sending constraints: ", constraints);

    $("#callingModal").text("Calling: " + peersString);
    $('#modalInviting').modal('show');
    document.getElementById('callSound').play();

    conversation.open(peers, "", constraints, invitation, function () {}, function () {});

}

function hangup() {
    peersString = "";

    var divChat = document.getElementById('textChat');
    while (divChat.firstChild) {
        divChat.removeChild(divChat.firstChild);
    }
    localVideo.src = '';
    var div = document.getElementById('remote');
    while (div.firstChild) {
        console.log("div.firstChild: ", div.firstChild);
        div.removeChild(div.firstChild);
    }
    if (conversation != null && conversation.owner.identity.rtcIdentity == myRtcIdentity)
        conversation.close();
    else if (conversation != null) {
        conversation.bye();
    }
    conversation = null;
    var_init();
}

function closeConversation() {
    peersString = "";
    localVideo.src = '';
    $('#modalInviting').modal('hide');
    conversation = null;
    var_init();
}

function onMessage(message) {
    // TODO: implement eventHandling
    switch (message.type) {
    case MessageType.ACCEPTED:
        console.log("received new constraints: ", constraints);
        $('#modalInviting').modal('hide');
        document.getElementById('callSound').pause();

        for (var i = 0; i < constraints.length; i++) {
            if (constraints[i].type == 'audioVideo') {
                showModule.av();
            }
            if (constraints[i].type == 'audio') {
                showModule.audio();
            }
            if (constraints[i].type == 'chat') {
                showModule.chat();
            }
            if (constraints[i].type == 'file') {

            }
        }
        break;
    case MessageType.CONNECTIVITY_CANDIDATE:
        // put candidate to PC
        break;
    case MessageType.NOT_ACCEPTED:
        console.log("NOT_ACCEPTED RECEIVED");
        $('#modalInviting').modal('hide');
        finishNotAccepted = false;
        $.notify(message.from.rtcIdentity + " rejected", "error");
        for (var i = 0; i < conversation.participants.length; i++) {
            if (conversation.participants[i].status == "pending" || conversation.participants[i].status == "participating")
                break;
            if (i == conversation.participants.length - 1)
                finishNotAccepted = true;
        }
        if (conversation.owner.identity.rtcIdentity == myRtcIdentity && finishNotAccepted) {
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
        if (conversation != null && message.from.rtcIdentity == conversation.owner.identity.rtcIdentity) {
            peersString = "";
            localVideo.src = '';
            conversation = null;

            var div = document.getElementById('remote');

            while (div.firstChild) {
                console.log("div.firstChild: ", div.firstChild);
                div.removeChild(div.firstChild);
            }

            var divChat = document.getElementById('textChat');
            while (divChat.firstChild) {
                divChat.removeChild(divChat.firstChild);
            }
            hideModule.av();
            var_init();
        }
        if (conversation != null && conversation.getStatus() === ConversationStatus.CLOSED) {
            localVideo.src = '';
            conversation = null;
            hideModule.av();
            var_init();
        }
        removeVideoTag(message.from.rtcIdentity);
        $('#modalInviting').modal('hide');
        break;
    case MessageType.OFFER_ROLE: // set new moderator of the conversatoin
        break;
    case MessageType.INVITATION:
        console.log("Application received an invitation:", message);
        var that = this;
        var Acceptbtn = document.getElementById('AcceptButton');
        $("#receivingModal").text(message.from.rtcIdentity + " is trying to call you..");
        $('#modalInvite').modal('show');
        document.getElementById('ringingSound').play();
        /*  Create new conversation */
        Acceptbtn.onclick = function () {
            for (var i = 0; i < message.body.constraints.length; i++) {
                if (message.body.constraints[i].type == 'audioVideo') {
                    showModule.av();
                }
                if (message.body.constraints[i].type == 'audio') {
                    showModule.audio();
                }
                if (message.body.constraints[i].type == 'chat') {
                    showModule.chat();
                }
                if (message.body.constraints[i].type == 'file') {}
            }
            $('#modalInvite').modal('hide');
            conversation = new Conversation(myIdentity, that.onRTCEvt.bind(that), that.onMessage.bind(that), iceServers, constraints);
            conversation.acceptInvitation(message, "", function () {}, function () {});
        }
        break;
    case MessageType.RESOURCE_REMOVED:

        break;
    case MessageType.REMOVE_PARTICIPANT:
        peersString = "";
        localVideo.src = '';
        conversation = null;
        hideModule.chat();
        var div = document.getElementById('remote');
        while (div.firstChild) {
            console.log("div.firstChild: ", div.firstChild);
            div.removeChild(div.firstChild);
        }
        var divChat = document.getElementById('textChat');
        while (divChat.firstChild) {
            divChat.removeChild(divChat.firstChild);
        }
        var_init();
        if (!$('#modalInvite')[0].hidden)
            $('#modalInvite').modal.modal('hide');
        break;
    case MessageType.SHARE_RESOURCE:
        break;
    case MessageType.UPDATE:
        console.log("UPDATE RECEIVED");
        showModule.chat();
        conversation.addResource(message.body.newConstraints, message, function () {
            reattachMediaStream(video0, video0);
        }, function () {});
        break;
    case MessageType.UPDATED:
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
        if (evt.codec.type == "chat") {
            codecIDChat = evt.codec.id;
            codecChat = evt.codec;
            conversation.dataBroker.addCodec(codecChat);
            codecChat.addListener(onData);
            showModule.chat();
        }
        if (evt.codec.type == "file") {
            codecIDFile = evt.codec.id;
            codecFile = evt.codec;
            conversation.dataBroker.addCodec(codecFile);
            codecFile.addListener(onData);
            showModule.chat();
        }
        break;
    case 'onaddlocalstream':
        console.log("LOCALVIDEO: ", localVideo);
        attachMediaStream(localVideo, evt.stream);
        for (var i = 0; i < constraints.length; i++) {}
        break;
    default:
        break;
    }
};

function setStatus(state) {
    document.getElementById('status').innerHTML = state;
}

function resetStatus() {
    setStatus('resetStatus');
}

function onData(code, msg) {
    msg = JSON.parse(msg);
    console.log(msg);
    showModule.chat();

    var iDiv = document.getElementById('textChat');

    var innerDiv = document.createElement('li');
    innerDiv.className = 'list-group-item block-2';

    iDiv.appendChild(innerDiv);

    innerDiv.innerHTML = '<span class="label label-default">' + msg.from + "</span>" + " <span>" + msg.body + "</span>";

    $("#datachannelmessage").attr("value", "");
    $("#datachannelmessage").text("");
    $("#textChat").animate({
        scrollTop: $("#textChat").height()
    }, 1000);
}


function sentMessageData() {
    var messageText = $('.summernote').code();
    var newMessage = new DataMessage(codecIDChat, "", myRtcIdentity, messageText);
    codecChat.send(JSON.stringify(newMessage));

    var iDiv = document.getElementById('textChat');

    // Now create and append to iDiv
    var innerDiv = document.createElement('li');
    innerDiv.className = 'list-group-item block-2';
    iDiv.appendChild(innerDiv);
    innerDiv.innerHTML = '<span class="label label-primary">You</span>' + ' <span>' + newMessage.body + '</span>';
}

sentMessageDataFile = function () {
    console.log("codecIDFile-------", codecIDFile)
    // var fileElement = document.getElementById('fileInput');
    //var file = fileElement.files[0];
    //console.log("file.----",fileElement);
    var newMessage = new DataMessage(codecIDFile, "", myRtcIdentity, 'fileInput');
    codecFile.send(JSON.stringify(newMessage));
};


function updateConversation() {
    conversation.addResource([{
        type: ResourceType.AUDIO_VIDEO,
        direction: "in_out"
    }], "", function () {}, function () {});
}


function addVideoTag(stream, participant) {

    var div = document.createElement('div');
    div.className = 'video-container videoUiWrapper';
    div.id = participant;
    var videoID = 'video-' + cleanID(participant);
    var $video = $('<video id="' + videoID + '" width="100%" autoplay loop></video>');
    $(div).append($video);

    $('.person_name').append(participant);

    $('#remote').append($(div));

    var videoRemote = document.getElementById(videoID);
    attachMediaStream(videoRemote, stream)

    $("#" + videoID).videoUI({
        'playMedia': false,
        'progressMedia': false,
        'timerMedia': false,
        'volumeMedia': 10,
        'fullscreenMedia': true,
        'autoHide': false,
        'autoPlay': true
    });

    function cleanID(id) {
        id = id.toUpperCase();
        id = id.replace(/\=/, "-");
        id = id.replace(/\./, "-");
        id = id.replace(/\,/, "-");
        return id.replace(/[^a-zA-Z0-9]/, "");
    }
}

function removeVideoTag(participant) {

    var div = document.getElementById(participant);
    if (div != null && div.parentNode != null)
        div.parentNode.removeChild(div)
    var divRemote = document.getElementById('remote');
    console.log("divdivRemote.firstChild: ", divRemote.childElementCount);
    if (divRemote.childElementCount == 0) {
        hangup();
    }
}

function seePersonsToCall(string) {
    var peerstocall = string.split(";");
    var peersFinal = new Array();
    var permit = true;
    console.log("++++ current Peers to call: " + peerstocall);
    try {
        for (var i = 0; i < peerstocall.length; i++) {
            if (peerstocall[i].split("@").length == 1) {
                peersFinal.push(peerstocall[i] + "");
                //peersFinal.push(peerstocall[i] + "@vertx.wonder");
            } else {
                if (peerstocall[i].split("@")[1] != myRtcIdentity.split("@") && peerstocall.length > 1) {
                    permit = false;
                    break;
                }
                peersFinal.push(peerstocall[i]);
            }
        }
        if (!permit)
            return false;
        else
            return peersFinal;
    } catch (e) {
        console.log("error: " + e);
        peersFinal.push(peerstocall);
        return peersFinal;
    }
}
