/**
 * @fileOverview WebRTC Framework to facilitate the development of Applications that seamless interoperate between each other
 * @author <a href="mailto:paulo-g-chainho@ptinovacao.pt">Paulo Chainho</a>
 * @author <a href="mailto:Steffen.Druesedow@telekom.de">Steffen Druesedow</a>
 * @author <a href="mailto:Miguel.Seijo@telekom.de">Miguel Seijo</a>
 * @author <a href="mailto:vasco-m-amaral@ptinovacao.pt">Vasco Amaral</a>
 * @author <a href="mailto:Kay.Haensge@telekom.de">Kay Haensge</a>
 * @author <a href="mailto:luis-f-oliveira@ptinovacao.pt">Luis Oliveira</a>
 */

//Codec.send() processa a msg e encaminha para DataBroker.send() q encaminha para channel.sen() 


//channel.onmessage --> deveria estar incorporado no Codec.prototype.onData??? e depois passar para o Broker e encaminhar para o utilizador correcto com o Codec correcto?...
//O DataBroker implementa channel.onmessage() e encaminha as mensagens recebidas para o Codec.onData(), seguindo o procedimento q falamos na última reunião e especificado no UML. Ie olha para o codecId em DataMsg.codecId() e procura na sua lista de DataBroker.codecs[]


/**
 * @class
 * Codec Class
 *
 */

function Codec(type, CodecLibUrl, dataBroker){
    this.listeners = [];
    this.id = guid();
    this.type = type;
    this.description;
    this.CodecLibUrl = CodecLibUrl;
    this.mime_type;
    this.dataBroker = dataBroker;
    this.chunkLength = 1000;
    this.arrayToStoreChunks = [];
}


/**
 * send function
 * @param.. input
 */

Codec.prototype.send = function( input ){
    var aux = JSON.parse(input);
    //How to change the mimetype of input.body is equal to this.mimetype 
    if(!this.dataBroker)
        return;
    if(this.type=="chat"){
        this.dataBroker.send(input);
    }else{ // case file Sharing...
        var reader = new window.FileReader();

        // get file from system
        var fileElement = document.getElementById(aux.body);
        var file = fileElement.files[0];
        var thatCodec = this;
        var readFile = function(event,text){
            var data = {}; // data object to transmit over data channel

            if (event) text = event.target.result; // on first invocation

            if (text.length > 1000) {
                data.message = text.slice(0, 1000); // getting chunk using predefined chunk length
            } else {
                data.message = text;
                data.last = true;
            }
            aux.body = data;
            thatCodec.dataBroker.send(JSON.stringify(aux));

            var remainingDataURL = text.slice(data.message.length);
            if (remainingDataURL.length) setTimeout(function () {
                readFile(null, remainingDataURL); // continue transmitting
            }, 500)
        };
        reader.readAsDataURL(file);
        reader.onload =readFile;
    }

}

/**
 * getReport function
 * @param.. reportHandler
 */

Codec.prototype.getReport = function( reportHandler ){

    //??

}


/**
 * onData function
 * @param.. dataMsg
 */

Codec.prototype.onData = function( dataMsg ){

    //take data and treat it
    console.log(this.listeners);
    if(this.type=="chat"){
        this.listeners.every(function(element, index, array){
            element('ondatamessage',dataMsg);
        });
    }else{
        //var data = JSON.parse(dataMsg.body.message);
        this.arrayToStoreChunks.push(dataMsg.body.message);
        if (dataMsg.body.last) {
            this.saveToDisk(this.arrayToStoreChunks.join(''), 'fileName');
            this.arrayToStoreChunks = []; // resetting array
        }
    }
}


/**
 * addListener function
 * @param.. listener
 */

Codec.prototype.addListener = function( listener ){

    this.listeners.push(listener);

}


/**
 * removeListener function
 * @param.. listener
 */

Codec.prototype.removeListener = function( listener ){

    var index = 0;
    if(this.listeners.indexOf(listener, index) !== -1){
        index = this.listeners.indexOf(listener, index);
        this.listeners.splice(index, 1);
    }


}


/**
 * setDataBroker function
 * @param.. listener
 */

Codec.prototype.setDataBroker = function( dataBroker ){

    this.dataBroker = dataBroker;

}

/**
 * save file to local Disk
 *
 * @param fileUrl
 * @param fileName
 */
Codec.prototype.saveToDisk= function(fileUrl, fileName) {
    var save = document.createElement('a');
    save.href = fileUrl;
    save.target = '_blank';
    save.download = fileName || fileUrl;
    var evt = document.createEvent('MouseEvents');
    evt.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);

    save.dispatchEvent(evt);

    (window.URL || window.webkitURL).revokeObjectURL(save.href);
}