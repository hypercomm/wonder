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
 * Message - This class is a data-holder for all messages that are sent between the domains.  
 * @param {Identity} from - Sender of the message
 * @param {Identity[]} [to] - Recipients of the message
 * @param {MessageBody} body - Message body (a json struct)
 * @param  {MessageType} type - Type of the Message (@see MessageType)
 * @param  {string} [context] - ID of the conversation. (Optional. For conversation related messages it is mandatory.)
 */
function Message(from, to, body, type, context) {
    // generate unique id for this message
    this.id = guid();
    this.from = from;
    this.to = to;
    this.body = body;
    this.type = type;

    // Optional. For conversation related messages it is mandatory 
    this.contextId = context;

    this.reply_to_uri;
    this.previous;
}

/**
 * @ignore
 *
 * newReplyMessage - This is a special factory method for a "reply-message".
 * It takes a previous message and swaps their from and to fields.
 * 
 * @param {MessageBody} body - Message body (a json struct)
 * @param {Message} previousMessage - Message to generate the reply from.
 * @param {MessageType} type - Message type.
 * @param {Identity} me - reply_to_uri identity.
 */
Message.prototype.newReplyMessage = function(body, previousMessage, type, me) {
    if (!previousMessage || !body || !type)
        return;
    // create a new message with swapped from and to fields (taken from previous message)
    // DONE: take Myself as from, take all previous.to - ME plus original sender as to
    var to = new Array();

    // Take all previous to - ME
    previousMessage.to.every(function(element, index, array) {
        if (element != me)
            to.push(element);
    });

    // + original sender
    to.push(previousMessage.from);

    var rm = new Message(me, to, body, type);
    rm.previous = previousMessage;
    rm.reply_to_uri = me;
    return (rm);
};