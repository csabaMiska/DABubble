export interface Message {
    messageId: string | any;
    senderId: string;
    receiverId: string;
    content: string;
    timestamp: string;
    reactions: Array<string>;
}