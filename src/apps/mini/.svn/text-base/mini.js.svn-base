var localVideo;
var remoteVideo;
var myIdentity;
var conversation;

/* Definition of the STUN and TURN servers that are used for the setup of the RTCPeerConnection 
*/
var STUN = {url: "stun:stun.server.ip:port"};
var TURN = {
	url: "turn:turn.server.ip",
	username: "username",
	credential: "password"
};
var iceServers = {"iceServers": [STUN, TURN]};

/* Definition of the constraints for the initial creation of the RTCPeerConnection, in this example the conversation is requested with audio/video in both directions */
var constraints = [{
    constraints: "",
    type: ResourceType.AUDIO_VIDEO,
    direction: "in_out"
}];

// informational callbacks from WebRTC engine
onCreateSessionDescriptionError = function(){ console.log("Error on Session description creation")};
onSetSessionDescriptionError = function(){console.log("Error on Session description assignment")};
onSetSessionDescriptionSuccess = function(){console.log("Session description success")};

/* This method performs the main initialization logic.
-	It uses the IDP to create an Identity object from the entered URI
-	It resolves the Identity, i.e. downloads the corresponding messagingStub for the users domain.
-	It establishes the connection between the stub and the domains Messaging Server.
*/
function login() {
	var myRtcIdentity = document.getElementById('loginText').value;

	localVideo = document.getElementById('localVideo');
	remoteVideo = document.getElementById('remoteVideo');

	// bind main event listener listener 
	var listener = this.onMessage.bind(this);
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

/* This method performs all required actions to establish the communication with the user(s), represented by the entered URI(s). This includes:
-	Requesting access to local media sources (camera, microphone)
-	Resolving of the target URI(s) and downloading of the corresponding messagingStub(s)
-	Connection of the stub(s) with the target domains
-	Sending of the invitation message to the target users
-	Handling of response and establishment of the RTCPeerConnection
*/
function doCall() {
	var peers = document.getElementById('callTo').value.split(";");
	conversation = new Conversation(myIdentity, this.onRTCEvt.bind(this),
this.onMessage.bind(this), iceServers);
	var invitation = new Object();
	invitation.peers = peers;
	conversation.open(peers, constraints, invitation);	
}

/* This method is the callback for incoming Wonder messages. In this minimal example, it just handles incoming Invitations and Bye messages. 
On incoming invitations, a confirmation dialog is displayed with the options to accept or reject the call. The Bye handling just performs some cleanup actions. */
function onMessage(message) {
	switch (message.type) {
		case MessageType.BYE:
			localVideo.src = '';
			remoteVideo.src = '';
			conversation = null;
			break;
		case MessageType.INVITATION:
			var accept = confirm("Incoming call from: " + 
					message.from.rtcIdentity + " Accept?");
			if (accept == true)	{
				//  Create new conversation object
				conversation = new Conversation(myIdentity,
this.onRTCEvt.bind(this), this.onMessage.bind(this), iceServers, constraints);
				conversation.acceptInvitation(message);
			}
			else
				conversation.reject(message);
			break;
		default:
			break;
	}
};

/* This method is the callback for RTC Events. These events are triggered by the WebRTC engine in the browser as result of the ICE negotiations between the peers.
The main events to handle are the “onaddstream”, which indicates that a remote stream was added to the RTCPeerConnection and the “onaddlocalstream” which is the counterpart for locally added streams.
The implemented actions just assign the streams to the corresponding video-tags of the html page.*/
function onRTCEvt(event, evt) {
	switch (event) {
		case 'onaddstream':
			attachMediaStream(remoteVideo, evt.stream);
			break;
		case 'onaddlocalstream':
			attachMediaStream(localVideo, evt.stream);
			break;
		default:
			break;
	}
};

/* This method ends the established communication and performs some cleanup. Main instruction is “conversation.bye()” which sends a BYE message to the peer and takes care of the RTCPeerConnection and local media cleanup. */
function hangup() {
	localVideo.src = '';
	remoteVideo.src = '';
	conversation.bye();
	conversation = null;
}
