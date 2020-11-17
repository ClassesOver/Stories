
export interface ILinks {
    self?: string;
    followers?: string;
    followed?: string;
    avatar?: string;
}

export type UserIdType  = string | undefined | false | null;

export interface IUserInfo {
    id: number | boolean;
    username?: string;
    last_seen?: string;
    about_me?: string;
    post_count?: number;
    follower_count?: number;
    followed_count?: number;
    _links?: ILinks;
}
export interface IAuthenticated {
    userId: UserIdType; 
    accessToken: string | boolean;
    userInfo: IUserInfo;
    initUser: boolean;
}
