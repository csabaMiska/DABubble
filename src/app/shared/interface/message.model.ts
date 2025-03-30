import { Reaction } from "../interface/reaction.model";

export interface Message {
    messageId: string;
    senderId: string;
    isSender: boolean;
    receiverId: string;
    content: string;
    timestamp: string;
    reactions: { [reactionId: string]: Reaction};
}