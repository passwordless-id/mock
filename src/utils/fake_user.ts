export interface MockUser {
    sub: string;
    name?: string;
    given_name?: string;
    family_name?: string;
    email?: string;
    email_verified?: boolean;
    picture?: string;
}

const PREDEFINED_USERS: Record<string, MockUser> = {
    john: {
        sub: "123-456-789",
        name: "John Doe",
        given_name: "John",
        family_name: "Doe",
        email: "john.doe@example.org",
        email_verified: true,
        picture: "https://www.loremfaces.net/48/id/2.jpg",
    },
    jane: {
        sub: "555-555-555",
        name: "Jane Smith",
        given_name: "Jane",
        family_name: "Smith",
        email: "jane.smith@example.org",
        email_verified: true,
        picture: "https://www.loremfaces.net/48/id/1.jpg",
    },
    admin: {
        sub: "987-654-321",
        name: "Admin User",
        given_name: "Admin",
        family_name: "User",
        email: "admin@example.org",
        email_verified: true,
        picture: "https://www.loremfaces.net/48/id/3.jpg",
    },
    anonymous: {
        sub: "111-222-333",
        name: "Anonymous User",
        picture: "https://www.loremfaces.net/48/id/4.jpg",
    },
    unverified: {
        sub: "222-333-444",
        name: "Unverified User",
        email: "unverified@example.org",
        email_verified: false,
        picture: "https://www.loremfaces.net/48/id/5.jpg",
    },
};

export function generateFakeUser(userSelection?: string, scope?: string): MockUser {
    let user: MockUser;
    
    if (userSelection && PREDEFINED_USERS[userSelection]) {
        user = PREDEFINED_USERS[userSelection];
    } else {
        user = PREDEFINED_USERS.john;
    }
    
    if (scope) {
        const scopeSet = new Set(scope.split(" "));
        const filteredUser: MockUser = { sub: user.sub };
        if (scopeSet.has("profile")) {
            filteredUser.name = user.name;
            filteredUser.given_name = user.given_name;
            filteredUser.family_name = user.family_name;
            filteredUser.picture = user.picture;
        }
        if (scopeSet.has("email")) {
            filteredUser.email = user.email;
            filteredUser.email_verified = user.email_verified;
        }
        return filteredUser;
    }
    return user;
}

export function getAvailableUsers() {
    return Object.keys(PREDEFINED_USERS);
}
