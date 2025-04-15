import { Message } from "./message.model";

export interface Channel {
    type: 'Channel';
    chanelid: string;
    title: string;
    description: string;
    creatorUid: string;
    members: { 
        [menberUid: string]: {
            role: 'creator' | 'member';
        }
    };
    messages: { [messageId: string]: Message }
}