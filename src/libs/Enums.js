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
        /** Message to finish the communication with a peer */
        BYE                     : "bye",
        /** Message to add a new {@link Resource} */
        UPDATE                  : "update",
        /** Answer to add a new {@link Resource} */
        UPDATED                 : "updated",
        /** To publish Identity Presence and Context data  */
        CONTEXT                 : "context",
        /** To subscribe to receive Context messages from an Identity */
        SUBSCRIBE               : "subscribe",
        /**Response to subscribe message**/
        SUBSCRIBE_ACCEPTED      : "subscribeAccepted",
        /** Message to offer a role (TO BE IMPLEMENTED) */
        OFFER_ROLE              : "offerRole",
        /** Message to setup redirection (TO BE IMPLEMENTED) */
        REDIRECT                : "redirect",
        /** Message to share a {@link Resource} in the conversation (TO BE IMPLEMENTED) */
        SHARE_RESOURCE          : "shareResource",
        /** Message to share a {@link Resource} in the conversation (TO BE IMPLEMENTED) */
        MESSAGE                 : "messageChat",
        /** Message to Creat/Read/Update/Delete in mongoDB or SQL */
        CRUD_OPERATION          : "crud_operation"
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
        MUSIC                   : "music",
        /**chat addHocChat**/
        ADHOC_CHAT              : "addHocChat"
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

var SubscriptionType = {
        IDENTITY_STATUS_SUBSCRIPTION         : "statusSubscription",
        IDENTITY_CONTEXT_SUBSCRIPTION        : "contextSubscription"
};

var NotAcceptedType = {
        BUSY        : "busy",
        NOT_FOUND   : "notFound",
        REJECTED    : "rejected",
        TIME_OUT    : "timeout" 
};

var AppType = {
        MOBILE_NOTIFICATION_APP         : "mobileNotificationApp",
        NOTIFICATION_APP                        : "notificationApp",
        MOBILE_WEB_APP                          : "mobileWebApp",
        WEB_APP                                         : "WebApp"
};