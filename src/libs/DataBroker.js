/**
 * @fileOverview WebRTC Framework to facilitate the development of Applications that seamless interoperate between each other
 * @author Paulo Chainho <paulo-g-chainho@ptinovacao.pt>
 * @author Steffen Druesedow <Steffen.Druesedow@telekom.de>
 * @author Miguel Seijo Simo <Miguel.Seijo@telekom.de>
 * @author Vasco Amaral <vasco-m-amaral@ptinovacao.pt>
 * @author Kay Haensge <Kay.Haensge@telekom.de>
 * @author Luis Oliveira <luis-f-oliveira@ptinovacao.pt>
 */

/**
 * Class DataBroker
 * @class
 */
function DataBroker(){

	//constructor DataBroker
	this.codecs = [];
	this.channels = [];
}

/**
 * onDataChannelEvt
 */

DataBroker.prototype.onDataChannelEvt = function( msg ){

	var that = this;
	console.log(msg);
	/*console.log(this.codecs);
	console.log(this.channels);*/
	for(var i = 0; i < this.channels.length; i++){
		this.channels[i].channel.onmessage = function(msg){
			var msgObject = msg.data; //JSON.parse(msg.data);
			//that.codecs[0].onData(msgObject);
			for(var i = 0; i < that.codecs.length; i++){
				console.log("that.codecs[i].id: ", that.codecs[i].id);
				console.log("msgObject.codecId: ", msgObject.codecId);
				if( that.codecs[i].id == msgObject.codecId ){
					console.log("that.codecs[i], ", that.codecs[i]);
					that.codecs[i].onData(msgObject);
					break;
				}else{
					that.codecs[i].onData(msgObject);
				}
					
			}
		}	
	}

	/*this.channels[0].channel.onmessage = function(msg){
		var msgObject = JSON.parse(msg.data);
		that.codecs[0].onData(msgObject)
		/*for(var i = 0; i < that.codecs.length; i++){
			if( that.codecs[i].id == msgObject.codecId )
				
		}
	}




	this.channels[0].channel.onmessage = function(msg){
		for(var i = 0; i < that.codecs.length; i++){
			if( that.codecs[i].id == msgObject.codecId )
				
		}*/

	
}

/**
 * addCodec
 */

DataBroker.prototype.addCodec = function(codec){
    console.log("ADDD CODEC DATA BROKER\n\n\n",this)
    codec.dataBroker=this;
	this.codecs.push(codec);

}

/**
 * removeCodec
 */

DataBroker.prototype.removeCodec = function(){


	//removecodec

}

/**
 * addDataChannel
 */

DataBroker.prototype.addDataChannel = function(dataChannel, identity){


	//see the UML
	var channel = {
		"identity": identity,
		"channel": dataChannel
	};
	this.channels.push(channel);

}

/**
 * removeDataChannel
 */

DataBroker.prototype.removeDataChannel = function(identity){
    this.channels.forEach(function(element, index, array){
        if(element.identity==identity) array.splice(index,1);
    });

	//removecodec

}

/**
 * send
 */

DataBroker.prototype.send = function( msg ){
	
	console.log("MENSAGEM: ", msg);
	var index = -1;
	var msgObject =msg;// JSON.parse(msg);
	
	if( msgObject.to == "" || typeof msgObject.to === 'undefined' ){
		for(var i = 0; i < this.channels.length; i++){
			console.log("channels--->",this.channels[i].channel);
			if(this.channels[i].channel.readyState == 'open')
				this.channels[i].channel.send(msg);
		}
			
	}
	else {
		for(var i = 0; i < this.channels.length; i++){
			if( this.channels[i].identity.rtcIdentity === msgObject.to )
				index = i;
		}
		if(index !== -1)
			this.channels[index].channel.send(msg);
	}

	console.log(this.channels);
	console.log(this.codecs);

}