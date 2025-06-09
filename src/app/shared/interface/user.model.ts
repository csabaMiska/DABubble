import { Emoji } from "./emoji.model";

export interface User {
    type: 'User';
    uid: string;
    name: string;
    avatar: string;
    email: string;
    status: string;
    lastUsedEmojis: Array<{emoji: Emoji}>;
}