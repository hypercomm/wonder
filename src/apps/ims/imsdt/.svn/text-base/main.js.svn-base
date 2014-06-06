var GUI_STATES = {
	'UNREGISTERED': '1',
	'REGISTERED': '2',
	'IN_CHAT_ONLY': '3',
	'IN_CALL': '4',
	'IN_CALL_WITH_CHAT': '5'
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

function setGUIState(state) {
	switch (state) {
		case GUI_STATES.UNREGISTERED:
			inCall = false;
			$("#settings_div").hide();
			$("#login_div").show();
			$("#logout_div").hide();
			$("#video_div").hide();
			$("#chat_div").hide();
			cleanupVideo();
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

			$("#chat_div").removeClass("offset");

			setInfo("Conversation started in Chat-Only mode.");
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

			$("#chat_div").addClass("offset");

			$("#localVideo").addClass("small");
			$("#localVideo").removeClass("large");
			$("#remoteVideo").removeClass("small");
			$("#remoteVideo").addClass("large");
			setInfo("IN_CALL");
			break;
		default:
			break;
	}
}

function cleanupVideo() {
	localVideo.src = '';
	remoteVideo.src = '';
	conversation = null;
	chatResource = null;
}
function cleanupChat() {
	document.getElementById("textChat").innerHTML = "";
}

function initialize() {
	$("#tests_div").hide();
	console.log('Initializing');
	localVideo = document.getElementById('localVideo');
	remoteVideo = document.getElementById('remoteVideo');
	loadSettings();
	setGUIState(GUI_STATES.UNREGISTERED);
}

function login() {
	myRtcIdentity = $("#my_ID").val() + "@" + $("#realm").val();

	var credentials = new Object();
	credentials.user = $("#my_ID").val() + "@" + $("#realm").val();
	credentials.pubID = "";
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
				setInfo("connected as: " + myRtcIdentity);
				setGUIState(GUI_STATES.REGISTERED);
			},
					function() {
						setInfo("REGISTRATION FAILED - please check the given credentials!");
					});
		},
				function(e) {
					console.log(e);
				});
		saveSettings();
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
			type: ResourceType.AUDIO_VIDEO,
			direction: "in_out"
		});
		setInfo("Starting A/V conversation ...");
	}
	conversation.open(peers, constraints, invitation, function() {
		console.log("conversation opened");
	},
			function() {
				console.log("error on opening conversation");
			});
}


function hangUp() {
	if (inCall) {
		setInfo('Session terminated from local side.');
		conversation.bye();
		conversation = null;
		setGUIState(GUI_STATES.REGISTERED);
	}
}

function setGUIMode(constraints) {
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
			setGUIMode(message.body.constraints);
			setInfo("received ACCEPTED message");
			break;
		case MessageType.CONNECTIVITY_CANDIDATE:
			break;
		case MessageType.NOT_ACCEPTED:
			alert("Call not ACCEPTED by peer");
			setGUIState(GUI_STATES.REGISTERED);
			break;
		case MessageType.CANCEL:
			break;
		case MessageType.ADD_RESOURCE:
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
				setGUIMode(message.body.constraints);
			}
			else
				alert("Rejected");
			break;
		case MessageType.RESOURCE_REMOVED:
			break;
		case MessageType.REMOVE_PARTICIPANT:
			conversation.close();
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
			break;
		case 'onResourceParticipantAddedEvt':
			//setGUIState(GUI_STATES.IN_CHAT_ONLY);
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

/* HTML Related functions */

function setInfo(state) {
	document.getElementById('logging').innerHTML = state;
}

function resetInfo() {
	setInfo('resetStatus');
}


function onData(code, msg) {
	// TODO To implement and pass the events up
	console.log(msg);
	var iDiv = document.getElementById('textChat');
	// Now create and append to iDiv
	var innerDiv = document.createElement('div');
	innerDiv.className = 'block-2';
	// The variable iDiv is still good... Just append to it.
	iDiv.appendChild(innerDiv);
	innerDiv.innerHTML = "<b>" + msg.from + "</b>" + " : " + msg.body;
}
;
function sentMessageData() {

	var newMessage = new DataMessage(codecIDChat, "", myRtcIdentity, document.getElementById("datachannelmessage").value);
	codecChat.send(JSON.stringify(newMessage));

	var iDiv = document.getElementById('textChat');

	// Now create and append to iDiv
	var innerDiv = document.createElement('div');
	innerDiv.className = 'block-2';
	iDiv.appendChild(innerDiv);
	innerDiv.innerHTML = "You:" + " : " + newMessage.body;
}

sentMessageDataFile = function() {
	console.log("codecIDFile-------", codecIDFile)

	// var fileElement = document.getElementById('fileInput');
	//var file = fileElement.files[0];
	//console.log("file.----",fileElement);
	var newMessage = new DataMessage(codecIDFile, "", myRtcIdentity, 'fileInput');
	codecFile.send(JSON.stringify(newMessage));
};


function updateConversation() {
	// updates Chat-only to A/V with chat
	conversation.addResource([{
			constraints: "",
			type: ResourceType.AUDIO_VIDEO,
			direction: "in_out"
		}], "", function() {
	});
}
