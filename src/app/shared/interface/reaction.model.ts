export interface Reaction {
    emoji: {
        annotation: string;
        group: number;
        order: number;
        shortcodes: string[];
        tags: string[];
        unicode: string;
        version: number;
        skinTone: number;
    };
    user: string;
    users: string[];
    counter: number;
}