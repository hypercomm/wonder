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
 * This class creates WONDER-compliant messages. Please note that all functions in this class are static, so there is no need to create MessageFactory objects.
 */
function MessageFactory() {
}


/**
 * createInvitationMessage - Creates an Invitation message, the connectionDescription field will be empty and has to be filled before sending.
 *
 *
 * @param {Identity} from - The {@link Identity} that figures as sender of the message.
 * @param {Identity[]} to - The Array of {@link Identity} that figures as receiver of the message. 
 * @param {string} contextId - The contextId of the conversation related to the invitation.
 * @param {ResourceConstraints} constraints - The resource constraints for the resources initialized on conversation start.
 * @param {string} [conversationURL] - The URL of the conversation (optional).
 * @param {string} [subject] - The subject of the conversation. (optional).
 * @param {Identity} [hosting] - The host of the conversation (optional). [NOT IMPLEMENTED, by default the host will be the one starting the conversation]
 * @return The created Message
 *
 */
MessageFactory.createInvitationMessage = function(from, to, contextId, constraints, conversationURL, subject, hosting, agenda, peers) {
    var invitationBody = new Object();
    invitationBody.conversationURL = conversationURL;
    invitationBody.connectionDescription = "";
    invitationBody.subject = subject;
    invitationBody.hosting = hosting;
    invitationBody.agenda = agenda;
    invitationBody.peers = peers;
    invitationBody.constraints = constraints;

    var invitationMessage = new Message(from, to, invitationBody, MessageType.INVITATION, contextId);
    return invitationMessage;
}

/**
 * createAnswerMessage - Creates an Answer message, the connectionDescription field will be empty and has to be filled before sending.
 *
 * @param {Identity} from - The {@link Identity} that figures as sender of the message.
 * @param {Identity[]} to - The Array of {@link Identity} that figures as receiver of the message. 
 * @param {string} contextId - The contextId of the conversation related to the invitation.
 * @param {ResourceConstraints} constraints - The resource constraints for the resources initialized on conversation start.
 * @param {Identity} [hosting] - The host of the conversation (optional). [NOT IMPLEMENTED, by default the host will be the one starting the conversation]
 * @param {Identity[]} connected - Array of {@link Identity} that are already connected to the conversation. Used to establish the order in the connection flow for multiparty.
 * @return The created Message
 *
 */
MessageFactory.createAnswerMessage =  function(from, to, contextId, constraints, hosting, connected) {
    var answerBody = new Object();
    answerBody.connectionDescription = "";
    answerBody.hosting = hosting;
    answerBody.connected = connected;
    answerBody.constraints = constraints;
    
    var answerMessage = new Message(from,to,answerBody,MessageType.ACCEPTED,contextId);
    return answerMessage;
}

/**
 * createCandidateMessage - Creates a Message containing an ICE candidate
 *
 * @param {Identity} from - The {@link Identity} that figures as sender of the message.
 * @param {Identity[]} to - The Array of {@link Identity} that figures as receiver of the message. 
 * @param {string} contextId - The contextId of the conversation related to the invitation.
 * @param {string} label - The label of the candidate.
 * @param {string} id - The id of the candidate.
 * @param {string} candidate - The ICE candidate string.
 * @param {boolean} lastCandidate - Boolean indicating if the candidate is the last one. If true, include the full SDP in the candidate parameter for compatibility with domains that don't support trickling.
 * @return The created Message
 *
 */

MessageFactory.createCandidateMessage = function (from, to, contextId, label, id, candidate, lastCandidate) {
    if (lastCandidate == false) {
        var candidateBody = new Object();
        candidateBody.label = label;
        candidateBody.id = id;
        candidateBody.candidateDescription = candidate;
        candidateBody.lastCandidate = false;
    }
    else{
        var candidateBody = new Object();
        candidateBody.label = label;
        candidateBody.id = id;
        candidateBody.candidateDescription = "";
        candidateBody.connectionDescription = candidate;
        candidateBody.lastCandidate = true;
    }
    
    var candidateMessage = new Message(from,to,candidateBody,MessageType.CONNECTIVITY_CANDIDATE,contextId);
    return candidateMessage;
}



/**
 * createUpdateMessage - Creates an Update message, the newConnectionDescription field will be empty and has to be filled before sending.
 *
 *
 * @param {Identity} from - The {@link Identity} that figures as sender of the message.
 * @param {Identity[]} to - The Array of {@link Identity} that figures as receiver of the message. 
 * @param {string} contextId - The contextId of the conversation related to the invitation.
 * @param {ResourceConstraints} newConstraints - The resource constraints for the resources to update.
 * @return The created Message
 *
 */
MessageFactory.createUpdateMessage = function(from, to, contextId, newConstraints,hosting) {
    var updatebody = new Object();
    updatebody.newConnectionDescription = "";
    updatebody.newConstraints = newConstraints;
    updatebody.hosting = hosting;
    //updatebody.agenda = agenda;
    //updatebody.dataCodecs = dataCodecs;

    var updateMessage = new Message(from, to, updatebody, MessageType.UPDATE, contextId);
    return updateMessage;
}


/**
 * createUpdatedMessage - Creates an Updated message, the newConnectionDescription field will be empty and has to be filled before sending.
 *
 *
 * @param {Identity} from - The {@link Identity} that figures as sender of the message.
 * @param {Identity[]} to - The Array of {@link Identity} that figures as receiver of the message. 
 * @param {string} contextId - The contextId of the conversation related to the invitation.
 * @param {ResourceConstraints} newConstraints - The resource constraints for the resources to update.
 * @return The created Message
 *
 */
MessageFactory.createUpdatedMessage = function(from, to, contextId, newConstraints,updatedIdentities,hosting) {
    var updatebody = new Object();
    updatebody.newConnectionDescription = "";
    updatebody.newConstraints = newConstraints;
    updatebody.updatedIdentities = updatedIdentities;
    updatebody.hosting = hosting;
    //updatebody.agenda = agenda;
    //updatebody.dataCodecs = dataCodecs;
    
    var updateMessage = new Message(from, to, updatebody, MessageType.UPDATED, contextId);
    return updateMessage;
}

/**
 * createRemoveResourceMessage - Creates an RemoveResource message.
 *
 *
 * @param {Identity} from - The {@link Identity} that figures as sender of the message.
 * @param {Identity[]} to - The Array of {@link Identity} that figures as receiver of the message. 
 * @param {string} contextId - The contextId of the conversation related to the invitation.
 * @param {ResourceConstraints} resoureceConstraints - The resource constraints for the resources to remove.
 * @return The created Message
 *
 */
MessageFactory.createRemoveResourceMessage = function(from, to, contextId, resoureceConstraints) {
    var removebody = new Object();
    removebody.constraints = resoureceConstraints;
    
    var removeMessage = new Message(from, to, removebody, MessageType.RESOURCE_REMOVED, contextId);
    return removeMessage;
}

MessageFactory.createNotAccepted =  function(message) {
    var notAcceptedMessage = new Message(message.to, message.from,"",MessageType.NOT_ACCEPTED, message.contextId);
    return notAcceptedMessage;
}


MessageFactory.createContextMessage =  function(from, to, status, login, contextId) {
    var contextbody = new Object();
    contextbody.presence = status;
    contextbody.login = login;

    var contextMessage = new Message(from, to, contextbody, MessageType.CONTEXT, contextId);
    return contextMessage;
}


MessageFactory.createSubscribeMessage =  function(from, to, message) {

    var subscribebody = new Object();
    subscribebody.presence = SubscriptionType.IDENTITY_CONTEXT_SUBSCRIPTION;

    var subscribeMessage = new Message(from, to, subscribebody, MessageType.SUBSCRIBE, guid());
    return subscribeMessage;
}


MessageFactory.createMessageChat =  function(from, to, text) {

    console.log("MessageFactory.createMessageChat: " + to +" "+ from + 
        " " + text);
    var messageBody = text;


    var messageChat = new Message(from, to, messageBody, MessageType.MESSAGE, guid());
    return messageChat;
}

MessageFactory.createCRUDMessage =  function(from, operation, resource, doc) {
    var crudbody = new Object();
    crudbody.operation = operation;
    crudbody.resource = resource;
    crudbody.doc = doc;
    var crudMessage = new Message(from, "",crudbody, MessageType.CRUD_OPERATION, "");
    return crudMessage;
}