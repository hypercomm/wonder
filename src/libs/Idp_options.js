// Default IDP options, if nothing is given on application layer
// points to simple domain-based idp 
var idp_options = 
	{
		protocol : "http", 
		domain : "150.140.184.247", 
		port : '8088', 
		path: "/phase2/idp_php/index.php?jsonp=returnIdentity&filter_rtcIdentity="
	};

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