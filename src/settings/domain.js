// Default settings to be used by IDP Server, Vertx Msg Server and Vertx Msg Stub
// Should be colocated with Vertx server.java

//for H.W. showcase
//var a = document.createElement("a");
//a.setAttribute("href", window.location.href);
//
//var idp_options = 
//        {
//                protocol : "http", 
//                domain : a.hostname, 
//                port : a.port, 
//                path: "/wonder/idp_php/index.php?jsonp=returnIdentity&filter_rtcIdentity="
//        };

var idp_options = 
        {
                protocol : "http", 
                domain : "localhost", 
                port : '80', 
                path: "/wonder/idp_php/index.php?jsonp=returnIdentity&filter_rtcIdentity="
        };

domainUrl = "http://127.0.0.1/FinalPT/branches/Master/api/MessagingStub_PTIN.js";
servicesRegistryAddress = "test.my_persistor";
// IDP options for websockets, if nothing is given on application layer
// points to idp mongo
/*
var idp_options  = {
	protocol: "ws",
	domain: "150.140.184.246",
	port: "28017",
	path: "",
	wsQuery: wsQuery
}
*/
    
// Default IDP options, if nothing is given on application layer
// points to idp mongo 
/*var idp_options = 
	{
		protocol : "http", 
		domain : "150.140.184.246", 
		port : '28017', 
		path: "/webrtc/users/?jsonp=returnIdentity&filter_rtcIdentity="
	};
*/

// Address of Vertx WONDER Message Server

vertx_settings = 
	{
    address: "http://"+idp_options.domain + ":4443/eventbus"
	}

// ICE Servers

var TURN = {
url:"turn:150.140.184.242:3478", 
username: "wonder", 
credential:"w0nd3r"
};
var STUN ={url: "stun:150.140.184.242:3478"};
iceServers = { "iceServers": [STUN, TURN]};
