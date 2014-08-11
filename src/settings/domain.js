// Default settings to be used by IDP Server, Vertx Msg Server and Vertx Msg Stub
// Should be colocated with Vertx server.java


 idp_options = 
	{
		protocol : "https", 
		domain : "pchainho.wonder.pt", 
		port : "443", 
		path: "/idp/index.php?jsonp=returnIdentity&filter_rtcIdentity="
	}


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
    address: "https://"+idp_options.domain + ":4443/eventbus"
	}