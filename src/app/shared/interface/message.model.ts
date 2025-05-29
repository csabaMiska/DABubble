import { Reaction } from "../interface/reaction.model";

export interface Message {
    messageFrom: string;
    messageId: string;
    senderId: string;
    isSender: boolean;
    receiverId: string;
    content: string;
    timestamp: string;
    lastAnswerTimestamp: string;
    answers: { [answerID: string]: Message};
    reactions: { [reactionId: string]: Reaction};
}