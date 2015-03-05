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
 * @class
 * The Resource class represents the digital assets that are shared among participants in the conversation.
 * 
 * @param {ResourceConstraint} resourceConstraint - Constraints of the Resource. Object with the following syntax {type: ResourceType, constraints: codec or MediaStreamConstraints}
 * @param {Codec} [codec] - For data types only, Codec used.
 *
 */

function Resource( resourceConstraint, codec ) {

  this.constraint = resourceConstraint;      
  this.connections = new Array();
  this.owner;
  this.stream;
    
  if(codec) 
  {
      this.codec = codec;
      this.constraint.constraints=codec;
  }
}


/**
 * Resource class
 */
/*function Resource() {
	this.id;                        // We add a resource ID to identify it.
	this.type;                      // type of resource.
    this.stream;                    // StreamTrack (http://dev.w3.org/2011/webrtc/editor/getusermedia.html#mediastreamtrack) for this communication.
    this.data;                      // dataChannel for communication.
    this.evtHandler;                // eventHandler.
    this.status;                    // status this resource.
    this.owner;                     // owner this resource/stream.
    //this.codecs;                  <- still no discuss
    var thisresource = this;
    // Question: how to handle the creation of PeerConnections and add local MediaStreams? do we need them stored at each Resource having Tracks from this stream??
    // TODO: add stream attribute and rename "stream" to "streamTrack"
 	
    /**
     * private method setStream
     *
     * @param stream..
     */
 /*   setStream = function(stream){
        thisresource.stream = stream;
    }

    /**
     * private method setData
     *
     * @param data
     */
/*    setData = function(data){
      thisresource.data = data;
    };

    /**
     * private method setStatus
     *
     * @param status ... sets the status attribute for a resource
     */
/*    this.setStatus = function(status){
      // TODO: ensure the transition in the state machine is allowed otherwise callback error
      switch(thisresource.status){
          case ResourceStatus.RECORDING:
              if(status != ResourceStatus.NOT_SHARED || status != ResourceStatus.ENDED || status != ResourceStatus.PLAYING){
                  console.log("error setStatus" + status);
                  break;
              }
              thisresource.status = status;
              break;
          case ResourceStatus.NOT_SHARED:
              if(status != ResourceStatus.SHARED || status != ResourceStatus.PLAYING || status != ResourceStatus.ENDED){
                  console.log("error setStatus" + status);
                  break;
              }
              thisresource.status = status;
              break;
          case ResourceStatus.PAUSED:
              if(status != ResourceStatus.STOPPED){
                  console.log("error setStatus" + status);
                  break;
              }
              thisresource.status = status
              break
          case ResourceStatus.PLAYING:
              if(status != ResourceStatus.PAUSED || status != ResourceStatus.STOPPED || status != ResourceStatus.SHARED || status != ResourceStatus.NOT_SHARED){
                  console.log("error setStatus" + status);
                  break;
              }
              thisresource.status = status;
              break;
          case ResourceStatus.SHARED:
              if(status != ResourceStatus.NOT_SHARED || status != ResourceStatus.RECORDING || status != ResourceStatus.PLAYING || status != ResourceStatus.ENDED){
                  console.log("error setStatus" + status);
                  break;
              }
              thisresource.status = status;
              break;
          case ResourceStatus.STOPPED:
              console.log("transition is not allowed");
              break;
          case ResourceStatus.ENDED:
              if(status != ResourceStatus.PLAYING){
                  console.log("error setStatus" + status);
                  break;
              }
              thisresource.status = status;
              break;
          case ResourceStatus.LIVE:
              if(status != ResourceStatus.SHARED || status != ResourceStatus.NOT_SHARED){
                  console.log("error setStatus" + status);
                  break;
              }
              thisresource.status = status;
              break;
          case ResourceStatus.NEW:
              if(status != ResourceStatus.LIVE){
                  console.log("error setStatus" + status);
                  break;
              }
              thisresource.status = status;
              break;
          default:
            thisresource.status = status;
            break;
      }
       
    }
};

/**
 * createStream
 * 
 * @param owner  : Participant ... owner of the stream
 * @param stream : MediaStream ... the stream
 * @param type   : ResourceType... type of resource
 */
/*Resource.prototype.createStream = function(owner,stream,type) {
    if(! stream || ! owner) return ;
    else{
        this.owner=owner;
        this.stream=stream;
        this.type = type;
        this.id = guid();
        this.setStatus(ResourceStatus.NEW);
    }

    // TODO  Where/how to assign the type,data,connection,evtHandler and status?

};


/**
 * getStatus
 * 
 * @returns ResourceStatus ... returns the resource status
 */
/*Resource.prototype.getStatus = function(){
    return this.status;
};


/**
 * destroy
 * 
 */
/*Resource.prototype.stop = function(){
// @pchainho TODO: only applicable for local Resources. 

    this.stream = null;
    //this.setStatus(ResourceStatus.ENDED); // @pchainho I guess this should only be done when "ended" event is fired. To study how to address Data Channel resources
	
	// TODO: depending on the type of the Resource it may imply the invocation of browser APIs eg for MediaStreamTracks call its operation stop()
};

/**
 * share
 * 
 * @param shared : Boolean ... establishes if the resource is shared or not
 * 
 */
/*Resource.prototype.share = function(shared){
// @pchainho TODO: only applicable for local Resources. For MediaStreamTracks call its operation stop()

    if(shared) this.setStatus( ResourceStatus.SHARED );
    else this.setStatus( ResourceStatus.NOT_SHARED);
	// TODO: depending on the type of the Resource it may imply the invocation of browser APIs
};

/**
 * record
 * 
 */
/*Resource.prototype.record = function(){
    // TODO Complete the function
};

/**
 * play
 * 
 * @param timing : Number ... the time to start playing
 * 
 */
/*Resource.prototype.play = function(timing){
    // this.status = ResourceStatus.PLAYING;
    // TODO What to do with the timing ? How to get it playing ?
};

/**
 * pause
 * 
 */
/*Resource.prototype.pause = function(){
    // this.status = ResourceStatus.PAUSED;
};

/**
 * create
 * 
 * @param owner : Participant ... specifies the owner of the resource
 * @param type  : ResourceType ... specifies the resource type
 * 
 */
/*Resource.prototype.create = function(owner, type){
    if(! owner || ! type)return ;
    else{
        this.owner=owner;
        this.type=type;
        this.id=guid();                  // unique uid for resource
        this.setStatus(ResourceStatus.NEW);
    }
    // TODO  Where/how to assign the stream,data,connection,evtHandler and status?
};  

/**
 * createData
 * 
 * @param owner : Participant ... specifies the owner of the resource
 * @param type  : ResourceType ... specifies the resource type
 * @param data  : DataChannel ... specifies the data channel
 * 
 */
/*Resource.prototype.createData = function(owner, type, data){

    if(! owner || ! type || ! data ) return ;
    else {
        this.owner=owner;
        this.type=type;
        this.data=data;
    }
    // TODO  Where/how to assign the stream,connection,evtHandler and status?
};

/**
 * EventHandler
 *
 * @param that
 */
/*stream.started = function(self){

}

/**
 * EventHandler
 *
 * @param that
 *//*
function mute(self){

}

/**
 * EventHandler
 *
 * @param that
 *//*
function unmute(self){

}

/**
 * EventHandler
 *
 * @param that
 *//*
function overconstrained(self){

}

/**
 * EventHandler
 *
 * @param that
 */
 /*
function ended(that){

}*/