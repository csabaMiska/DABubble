import { Reaction } from "../interface/reaction.model";
import { MessageData } from "./message-data.model";

export interface Message {
    messageFrom: string;
    messageId: string;
    senderId: string;
    isSender: boolean;
    receiverId: string;
    content: MessageData;
    timestamp: string;
    lastAnswerTimestamp: string;
    answers: { [answerID: string]: Message};
    reactions: { [reactionId: string]: Reaction};
}