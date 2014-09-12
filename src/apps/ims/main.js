var GUI_STATES = {
	'UNREGISTERED': '1',
	'REGISTERED': '2',
	'IN_CHAT_ONLY': '3',
	'IN_CALL': '4',
	'IN_CALL_WITH_CHAT': '5',
	'CHAT_INACTIVE' : '6',
	'CHAT_ACTIVE' : '7',
	'CANCEL_ALLOWED' : '8',
	'CANCEL_NOT_ALLOWED' : '9'
};


var localVideo;
var miniVideo;
var remoteVideo;
var inCall;

var conversation;
var myIdentity;

codecChat = "";
codecFile = "";

var codecIDFile;
var codecIDChat;
var config;


var mediaConstraints = {optional: [{RtpDataChannels: true}]};

// TODO: Handle properly the error callbacks
var onCreateSessionDescriptionError = function() {
};
var onSetSessionDescriptionError = function() {
};
var onSetSessionDescriptionSuccess = function() {
};

//$(document).on("ready", initialize);
$(window).load(initialize);

function setGUIState(state, msg) {
	switch (state) {
		case GUI_STATES.UNREGISTERED:
			inCall = false;
			$("#settings_div").hide();
			$("#login_div").show();
			$("#logout_div").hide();
			$("#video_div").hide();
			$("#chat_div").hide();
			cleanupVideo();
			cleanupChat();
			setInfo("UNREGISTERED");
			break;
		case GUI_STATES.REGISTERED:
			inCall = false;
			$("#login_div").hide();
			$("#chat_div").hide();
			$("#logout_div").show();
			$("#btnCall").removeAttr("disabled");
			$("#btnChat").removeAttr("disabled");
			$("#btnUpdate").attr("disabled", "true");
			$("#btnHangup").attr("disabled", "true");
			$("#btnCancel").hide();
			cleanupVideo();
			cleanupChat();
			setInfo("REGISTERED");
			break;
		case GUI_STATES.IN_CHAT_ONLY:
			inCall = true;
			$("#login_div").hide();
			$("#logout_div").show();
			$("#chat_div").show();
			$("#video_div").hide();

			$("#btnCall").attr("disabled", "true");
			$("#btnChat").attr("disabled", "true");
			$("#btnUpdate").removeAttr("disabled");
			$("#btnHangup").removeAttr("disabled");
			$("#btnCancel").hide();

			$("#chat_div").removeClass("offset");

			setInfo("Conversation in Chat-Only mode.");
			break;
		case GUI_STATES.IN_CALL:
			inCall = true;
			$("#login_div").hide();
			$("#logout_div").show();
			$("#chat_div").hide();
			$("#video_div").show();

			$("#btnCall").attr("disabled", "true");
			$("#btnChat").attr("disabled", "true");
			$("#btnUpdate").attr("disabled", "true");
			$("#btnHangup").removeAttr("disabled");
			$("#btnCancel").hide();

			$("#localVideo").addClass("small");
			$("#localVideo").removeClass("large");
			$("#remoteVideo").removeClass("small");
			$("#remoteVideo").addClass("large");
			setInfo("IN_CALL");
			break;
		case GUI_STATES.IN_CALL_WITH_CHAT:
			inCall = true;
			$("#login_div").hide();
			$("#logout_div").show();
			$("#chat_div").show();
			$("#video_div").show();

			$("#btnCall").attr("disabled", "true");
			$("#btnChat").attr("disabled", "true");
			$("#btnUpdate").attr("disabled", "true");
			$("#btnHangup").removeAttr("disabled");
			$("#btnCancel").hide();

			$("#chat_div").addClass("offset");

			$("#localVideo").addClass("small");
			$("#localVideo").removeClass("large");
			$("#remoteVideo").removeClass("small");
			$("#remoteVideo").addClass("large");
			setInfo("IN_CALL");
			break;
		case GUI_STATES.CHAT_INACTIVE:
			$("#sendMessageData").attr("disabled", "true");
			$("#sendFile").attr("disabled", "true");
			$("#fileInput").attr("disabled", "true");
			break;
		case GUI_STATES.CHAT_ACTIVE:
			$("#sendMessageData").removeAttr("disabled");
			$("#sendFile").removeAttr("disabled");
			$("#fileInput").removeAttr("disabled");
			break;
		case GUI_STATES.CANCEL_ALLOWED:
			$("#btnCancel").show();
			break;
		case GUI_STATES.CANCEL_NOT_ALLOWED:
			$("#btnCancel").hide();
			break;
		default:
			break;
	}
	if ( msg )
		setInfo(msg);
}

function cleanupVideo() {
	localVideo.src = '';
	remoteVideo.src = '';
	conversation = null;
	chatResource = null;
}
function cleanupChat() {
	document.getElementById("textChat").innerHTML = "";
	document.getElementById("datachannelmessage").value = "";
}

function initialize() {
	$("#tests_div").hide();
	console.log('Initializing');
	localVideo = document.getElementById('localVideo');
	remoteVideo = document.getElementById('remoteVideo');
	config = new Config("wonder", "settings_div", "profiles");
	config.loadProfileNames();
	setGUIState(GUI_STATES.UNREGISTERED);
}

function login() {
	myRtcIdentity = $("#private_ID").val() + "@" + $("#realm").val();

	var credentials = new Object();
	credentials.user = $("#private_ID").val() + "@" + $("#realm").val();
	credentials.pubID = "sip:" + $("#public_ID").val() + "@" + $("#realm").val();;
	credentials.role = $("#my_role").val();
	credentials.pass = $("#pass").val();
	credentials.realm = $("#realm").val();
	credentials.pcscf = $("#proxy_host").val() + ":" + $("#proxy_port").val();
//	var idp = new Idp(myRtcIdentity, {protocol : "http", domain : "150.140.184.247", port : '8088', path: "phase2/idp_php/index.php?jsonp=returnIdentity&filter_rtcIdentity="});
	var idp = new Idp(myRtcIdentity);
	var listener = this.onMessage.bind(this);

	setInfo("TRYING to register as: " + myRtcIdentity);
	idp.createIdentity(myRtcIdentity, function(identity) {
		myIdentity = identity;
		myIdentity.resolve(function(stub) {
			stub.addListener(listener);
			stub.connect(myRtcIdentity, credentials, function() {
				$("#userID").text("Registered as: " + myIdentity.rtcIdentity);
				setGUIState(GUI_STATES.REGISTERED, "connected as: " + myRtcIdentity);
			},
					function() {
						setInfo("REGISTRATION FAILED - please check the given credentials!");
					});
		},
				function(e) {
					console.log(e);
				});
	});
}

function logout() {
	// if in a call, hangup first
	if (inCall) {
		hangUp();
		setInfo("Session closed and logged out.");
	} else
		setInfo("Logged out");
	// disconnect localStub
	myIdentity.messagingStub.disconnect();
	setGUIState(GUI_STATES.UNREGISTERED);
}

function getIceServers() {
	var stun = $("#stun").val();
	var turn = $("#turn").val();
	var turn_user = $("#turn_user").val();
	var turn_pass = $("#turn_pass").val();
	var pc_config = {"iceServers": []};
	if (stun)
		pc_config.iceServers.push({url: "stun:" + stun});
	if (turn)
		pc_config.iceServers.push({
			url: "turn:" + turn,
			username: turn_user,
			credential: turn_pass
		});
	console.log("pc_config = " + JSON.stringify(pc_config));
	return pc_config;
}

function doCall(type) {

	var peers = $("#callee").val().split(";");
	var constraints = [];

	conversation = new Conversation(myIdentity, this.onRTCEvt.bind(this), this.onMessage.bind(this), getIceServers());
	var invitation = new Object();
	invitation.peers = peers;
	if (type === "chat") {
		constraints.push({
			constraints: "",
			type: ResourceType.CHAT,
			direction: "in_out"
		});
		constraints.push({
			constraints: "",
			type: ResourceType.FILE,
			direction: "in_out"
		});
		setInfo("Starting Chat conversation ...");
	}
	else {
		constraints.push({
			constraints: "",
			type: ResourceType.CHAT,
			direction: "in_out"
		});
		constraints.push({
			constraints: "",
			type: ResourceType.AUDIO_VIDEO,
			direction: "in_out"
		});
		constraints.push({
			constraints: "",
			type: ResourceType.FILE,
			direction: "in_out"
		});
		setInfo("Starting A/V conversation ...");
	}
	conversation.open(peers, "", constraints, invitation, function() {
		console.log("conversation opened");
	},
	function() {
		console.log("error on opening conversation");
	});
	setGUIState(GUI_STATES.CANCEL_ALLOWED);
}

function doCancel() {
	console.log("canceling action");
    conversation.close();
    conversation=null;
	setGUIState(GUI_STATES.REGISTERED);
}

function hangUp() {
	if (inCall) {
		setInfo('Session terminated from local side.');
		if ( conversation )
			conversation.bye();
		conversation = null;
		setGUIState(GUI_STATES.REGISTERED);
	}
}

function setGUIStateFromConstraints(constraints) {
	var isAV = false;
	var isChat = false;
	for (var i = 0; i < constraints.length; i++) {
		isAV = isAV || constraints[i].type === ResourceType.AUDIO_VIDEO;
		isChat = isChat || constraints[i].type === ResourceType.CHAT;
	}
	if (isAV)
		if (isChat)
			setGUIState(GUI_STATES.IN_CALL_WITH_CHAT);
		else
			setGUIState(GUI_STATES.IN_CALL);
	else
		setGUIState(GUI_STATES.IN_CHAT_ONLY);
}

function onMessage(message) {
	// TODO: implement eventHandling
	switch (message.type) {

		case MessageType.ACCEPTED:
			setGUIStateFromConstraints(message.body.constraints);
			setInfo("received ACCEPTED message.");
			break;
		case MessageType.CONNECTIVITY_CANDIDATE:
			break;
		case MessageType.NOT_ACCEPTED:
			console.log("Call not ACCEPTED by peer");
			setGUIState(GUI_STATES.REGISTERED, "Call rejected by peer");
			alert("Call rejected by peer");
			break;
		case MessageType.CANCEL:
			console.log("######## CANCEL");
			break;
		case MessageType.ADD_RESOURCE:
			console.log("######## ADD_RESOURCE");
			break;
		case MessageType.REDIRECT:
			break;
		case MessageType.BYE:
			setGUIState(GUI_STATES.REGISTERED);
			conversation = null;
			break;
		case MessageType.OFFER_ROLE: // set new moderator of the conversatoin
			break;
		case MessageType.INVITATION:
			setInfo("Incoming call from: " + message.from.rtcIdentity);
			var conf = confirm("Incoming call from: " + message.from.rtcIdentity + " Accept?");
			if (conf == true) {
				/*  Create new conversation */
				conversation = new Conversation(myIdentity, this.onRTCEvt.bind(this), this.onMessage.bind(this), getIceServers(), message.body.constraints);
				conversation.acceptInvitation(message, "",
						function() {
							console.log("conversation accepted");
						},
						function() {
							console.log("error on accepting conversation");
						});
				setGUIStateFromConstraints(message.body.constraints);
			}
			else {
				Conversation.reject(message);
			}
			break;
		case MessageType.RESOURCE_REMOVED:
			console.log("######## REMOVED_RESOURCE");
			break;
		case MessageType.REMOVE_PARTICIPANT:
			console.log("received REMOVE_PARTICIPANT --> CANCEL");
//			conversation.close();
			setGUIState(GUI_STATES.REGISTERED);
			localVideo.src = '';
			conversation = null;
			break;
		case MessageType.SHARE_RESOURCE:
			break;
		case MessageType.UPDATE:
			console.log("UPDATE RECEIVED");
			// HTML5 BUG WORKAROUND
			// The HTML5 video tag element does not display new MediaTracks when added, so you have to manually reattach the media stream
			conversation.addResource(message.body.newConstraints, message, function() {
				reattachMediaStream(remoteVideo, remoteVideo);
			}, function() {
				console.log("Error on addResource");
			});
			setGUIState(GUI_STATES.IN_CALL_WITH_CHAT);
			break;
		case MessageType.UPDATED:
			setGUIState(GUI_STATES.IN_CALL_WITH_CHAT);
			break;
		default:
			break;
	}
}
;

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
			attachMediaStream(document.getElementById('remoteVideo'), evt.stream);
			// TODO: change state of the conversation and forward to app-layerevt
			break;
		case 'onremovestream':
			break;
		case 'oniceconnectionstatechange':
			break;
		case 'ondatachannel':
			console.log("########## on datachannel event")
			break;
		case 'onResourceParticipantAddedEvt':
			setGUIState(GUI_STATES.CHAT_ACTIVE);
			console.log("onResourceParticipantAddedEvt", evt);
			if (evt.codec.type == "chat") {
				codecIDChat = evt.codec.id;
				codecChat = evt.codec;
				conversation.dataBroker.addCodec(codecChat);
				codecChat.addListener(onData);
				////document.getElementById('chat').style.visibility = 'visible';
			}
			if (evt.codec.type == "file") {
				codecIDFile = evt.codec.id;
				codecFile = evt.codec;
				conversation.dataBroker.addCodec(codecFile);
				codecFile.addListener(onData);
				//document.getElementById('fileSharing').style.visibility = 'visible';
			}
			break;
		case 'onaddlocalstream':
			attachMediaStream(document.getElementById('localVideo'), evt.stream);
			break;
		default:
			break;
	}
}

function setInfo(state) {
	document.getElementById('logging').innerHTML = state;
}

function appendInfo(msg) {
	var info = document.getElementById('logging').innerHTML;
	setInfo( info + " " + msg);
}

function resetInfo() {
	setInfo('resetStatus');
}

function onData(code, msg) {
	// TODO To implement and pass the events up
	console.log(msg);
	appendChatMessage(msg.body, msg.from);
};

function sendMessageData() {
	var newMessage = new DataMessage(codecIDChat, "", myRtcIdentity, document.getElementById("datachannelmessage").value);
	codecChat.send(JSON.stringify(newMessage));
	appendChatMessage(newMessage.body);
};

function appendChatMessage(msg, from) {
	var iDiv = document.getElementById('textChat');
	// Now create and append to iDiv
	var innerDiv = document.createElement('div');
	innerDiv.className = 'block-2';
	iDiv.appendChild(innerDiv);
	if ( from ) 
		innerDiv.innerHTML = "<b>" + from + "</b>" + " : " + msg;
	else
		innerDiv.innerHTML = "You:" + " : " + msg;
};


sendMessageDataFile = function() {
	console.log("codecIDFile-------", codecIDFile)
	var newMessage = new DataMessage(codecIDFile, "", myRtcIdentity, 'fileInput');
	codecFile.send(JSON.stringify(newMessage));
};


function updateConversation() {
	// updates Chat-only to A/V with chat
	conversation.addResource([{
			constraints: "",
			type: ResourceType.AUDIO_VIDEO,
			direction: "in_out"
		}], "", 
	function() {
		console.log("addResource successCallback")
	},
	function() {
		console.log("addResource errorCallback")
	});
};
