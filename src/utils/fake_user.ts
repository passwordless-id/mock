export function generateFakeUser(scope?: string) {
    // default OpenID profile properties
    const user = {
        sub: "1234567890",
        name: "John Doe",
        email: "john.doe@example.org",
        email_verified: true,
        picture: "https://www.loremfaces.net/48/id/1.jpg",
        
    };
    if (scope) {
        const scopeSet = new Set(scope.split(" "));
        const filteredUser: Record<string, any> = { sub: user.sub };
        if (scopeSet.has("profile")) {
            filteredUser.name = user.name;
        }
        if (scopeSet.has("email")) {
            filteredUser.email = user.email;
            filteredUser.email_verified = user.email_verified;
        }
        return filteredUser;
    }
    return user;
}
