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
 * Enumeration for the {@link Message} types
 * @readonly
 * @enum {string}
 */
var MessageType = {
        /** Message to invite a peer to a conversation. */
        INVITATION              : "invitation",
        /** Answer for conversation accepted. */
        ACCEPTED                : "accepted",
        /** Message contains connectivity candidate */
        CONNECTIVITY_CANDIDATE  : "connectivityCandidate",
        /** Answer for conversation not accepted. */
        NOT_ACCEPTED            : "notAccepted",
        /** Message to cancel an invitation */
        CANCEL                  : "cancel",
        /** Message to add a {@link Resource} to the conversation */
        ADD_RESOURCE            : "addResource",
        /** Message to remove a {@link Participant} from the conversation */
        REMOVE_PARTICIPANT      : "removeParticipant",
        /** Message to finish the communication with a peer */
        BYE                     : "bye",
        /** Message to add a new {@link Resource} */
        UPDATE                  : "update",
        /** Answer to add a new {@link Resource} */
        UPDATED                 : "updated",
    
        /** Message to offer a role (TO BE IMPLEMENTED) */
        OFFER_ROLE              : "offerRole",
        /** Message to setup redirection (TO BE IMPLEMENTED) */
        REDIRECT                : "redirect",
        /** Message to remove a {@link Resource} from the conversation (TO BE IMPLEMENTED) */
        RESOURCE_REMOVED        : "resourceRemoved",
        /** Message to share a {@link Resource} in the conversation (TO BE IMPLEMENTED) */
        SHARE_RESOURCE          : "shareResource"
};

/**
 * Enumeration for the {@link Participant} statuses
 * @readonly
 * @enum {string}
 */
var ParticipantStatus = {
        WAITING                 : "waiting",
        PENDING                 : "pending",
        PARTICIPATING           : "participating",
        NOT_PARTICIPATING       : "not_participating",
        PARTICIPATED            : "participated",
        MISSED                  : "missed",
        FAILED                  : "failed",
        CREATED                 : "created",
        ACCEPTED                : "accepted"
};

var ConversationStatus = {
        OPENED                  : "opened",
        INACTIVE                : "inactive",
        FAILED                  : "failed",
        ACTIVE                  : "active",
        CLOSED                  : "closed",
        CREATED                 : "created",
        RECORDING               : "recording",
        PLAYING                 : "playing",
        PAUSED                  : "paused",
        STOPPED                 : "stopped"

};

var ConversationTopicStatus = {
        PENDING                 : "pending",
        ACTIVE                  : "active",
        INACTIVE                : "inactive",
        CLOSED                  : "closed"
};

var IdentityStatus = {
        IDLE                    : "idle",
        UNAVAILABLE             : "unavailable",
        BUSY                    : "busy",
        AVAILABLE               : "available",
        ON_CONVERSATION         : "onConversation"
};

/**
 * Enumeration for the {@link Resource} types
 * @readonly
 * @enum {string}
 */
var ResourceType = {
        /** Webcam + microphone as source for mediastream */
        AUDIO_VIDEO             : "audioVideo",
        /** Microphone as source for audiostream */
        AUDIO_MIC               : "audioMic",
        /** Webcam as source for videostream */
        VIDEO_CAM               : "videoCam",
        /** Plain text chat */
        CHAT                    : "chat",
        /** File sending (TO BE IMPLEMENTED)*/
        FILE                    : "file",
        /** Screen content as source for videostream (TO BE IMPLEMENTED)*/
        SCREEN                  : "screen",
        /** Other types */
        OTHER                   : "other",
        /** Photo (TO BE IMPLEMENTED) */
        PHOTO                   : "photo",
        /** Video (TO BE IMPLEMENTED) */
        VIDEO                   : "video",
        /** Music (TO BE IMPLEMENTED) */
        MUSIC                   : "music"
};


var ResourceStatus = {
        NEW                     : "new",
        SHARED                  : "shared",
        NOT_SHARED              : "notShared",
        PLAYING                 : "playing",
        PAUSED                  : "paused",
        STOPPED                 : "stopped",
        ENDED                   : "ended",
        RECORDING               : "recording",
        LIVE                    : "live"
};