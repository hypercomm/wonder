var myIdentity;
var peerIdentity;
var initiator;
var contextId;
var invitationMessage;

var constraints = [{
		constraints: "",
		type: ResourceType.AUDIO_VIDEO,
		direction: "in_out"
	}];

function initWonder() {
	var myRtcIdentity = "user@domain.com";

	// bind main event listener listener 
	var listener = this.onWonderMessage.bind(this);
	// create own Identity
	Idp.getInstance().createIdentity(myRtcIdentity, function(identity) {
		// keep reference for later use
		myIdentity = identity;
		// download and instantiate (own) MessagingStub
		myIdentity.resolve(function(stub) {
			stub.addListener(listener);
			// connect own Stub to own domain
			stub.connect(myRtcIdentity, "", function() {
				console.log("own stub connected");
			});
		});
	});
}

function doCall(){
	// getUserMedia()
	// createPeerConnection()
	// PSEUDO-CODE
	peerConnection.createOffer( function(localDescription) {
		peerConnection.setLocalDescription(localDescription);
		sendWonderInvitation(callee, localDescription);
	});
}

function doAnswer(){
	// getUserMedia()
	// createPeerConnection()
	// PSEUDO-CODE
	peerConnection.createOffer( function(localDescription) {
		peerConnection.setLocalDescription(localDescription);
		sendWonderInvitationAccepted(invitationMessage, localDescription);
	});
}


function sendWonderInvitation(toUri, localDescription) {
	this.initiator = true;
	var that = this;
	Idp.getInstance().createIdentity(toUri, function(toIdentity) {
		that.peerIdentity = toIdentity;
		toIdentity.resolve(function(peerStub) {
			that.contextId = Math.floor((Math.random() * 100000) + 1);
			var invitationMessage = MessageFactory.createInvitationMessage(that.myIdentity, toIdentity, that.contextId, that.constraints);
			invitationMessage.body.connectionDescription = localDescription;
			peerStub.sendMessage(message);
		});
	});
}

function sendWonderInvitationAccepted(invitationMessage, localDescription) {
	this.initiator = false;
	this.contextId = invitationMessage.contextId;
	this.peerIdentity = invitationMessage.from;
	var acceptedMessage = MessageFactory.createAnswerMessage(peerIdentity, "", invitationMessage.contextId, constraints);
	acceptedMessage.body.connectionDescription = localDescription;
	myIdentity.messagingStub.sendMessage(acceptedMessage);
}

function sendWonderConnectivityCandidate(candidate) {
	var candidateMessage = MessageFactory.createCandidateMessage(myIdentity, peerIdentity, contextId, "label", "id", candidate);
	if (initiator)
		peerIdentity.messagingStub.sendMessage(candidateMessage);
	else
		myIdentity.messagingStub.sendMessage(candidateMessage);
}

function sendBye() {
	var byeMessage = new Message(myIdentity, peerIdentity, "", MessageType.BYE, contextId);
	if (initiator)
		peerIdentity.messagingStub.sendMessage(byeMessage);
	else
		myIdentity.messagingStub.sendMessage(byeMessage);
}

function onWonderMessage(message) {
	switch (message.type) {
		case MessageType.INVITATION:
			console.log("Incoming call from: " + message.from.rtcIdentity + " Accept?");
			doAnswer();
			break;
		case MessageType.ACCEPTED:
			// setRemoteDescription()
			// perform GUI actions etc
			break;
		case MessageType.BYE:
			// cleanup WebRTC and GUI stuff
			break;
		case MessageType.CONNECTIVITY_CANDIDATE:
			// extract and create RTCIceCandidate from message
			peerConnection.addIceCandidate(candidate, onAddIceCandidateSuccess, onAddIceCandidateError);
			break;
		default:
			break;
	}
};