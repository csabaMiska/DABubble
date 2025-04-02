import { Emoji } from "../interface/emoji.model";

export interface Reaction {
    emoji: Emoji;
    user: string;
    users: string[];
    counter: number;
}