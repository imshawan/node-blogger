
enum Google {
    UserInfo = 'https://www.googleapis.com/oauth2/v1/userinfo',
    Token = 'https://oauth2.googleapis.com/token',
    GrantType = 'authorization_code',
    Scopes = 'email profile',
    ResponseType = 'code',
    RedirectUrl = '/auth/google'
}

export const OAuth = {
    Google
}