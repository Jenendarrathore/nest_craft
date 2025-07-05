export interface ActiveUserData {
    sub: number;
    email: string;
    username: string;
    roles: string[];
    permissions?: string[]; // optional, if you’re loading perms too
}
