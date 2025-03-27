export interface Message {
    messageId: string;
    senderId: string;
    isSender: boolean;
    receiverId: string;
    content: string;
    timestamp: string;
    reactions: Array<string>;
}