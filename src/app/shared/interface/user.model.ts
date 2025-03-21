export interface User {
    uid: string;
    name: string;
    avatar: string;
    email: string;
    status: string;
    fcmToken: string | null;
    unreadMessages: Array<string>;
}