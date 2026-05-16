export interface User {
    _id: string;
    username: string;
    fullname: string;
    email: string;
    role: 'User' | 'Admin';
    createdAt: string;
    updatedAt: string;
}

// Request Interfaces //

export interface SigninPayload {
    username: string;
    password: string;
}

export interface SignupPayload {
    email: string;
    username: string;
    password: string;
    fullname: string;
}

// Response Interfaces //

export interface SigninResponse {
    message: string;
    accessToken: string;
    user: User;

}

export interface RefreshResponse {
    accessToken: string;
}

