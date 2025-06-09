import { Emoji } from "../interface/emoji.model";

export interface Reaction {
    [key: string]: {
        emoji: Emoji;
        counter: number;
        users: string[];
    };
}