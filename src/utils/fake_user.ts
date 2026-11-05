export interface MockUser {
    sub: string;
    name?: string;
    given_name?: string;
    family_name?: string;
    email?: string;
    email_verified?: boolean;
    picture?: string;
    custom_prop?: string;
}

const PREDEFINED_USERS: Record<string, MockUser> = {
    john: {
        sub: "123-456-789",
        name: "John Doe",
        given_name: "John",
        family_name: "Doe",
        email: "john.doe@example.org",
        email_verified: true,
        picture: "/images/avatars/john.svg",
    },
    jane: {
        sub: "555-555-555",
        name: "Jane Smith",
        given_name: "Jane",
        family_name: "Smith",
        email: "jane.smith@example.org",
        email_verified: true,
        picture: "/images/avatars/jane.svg",
    },
    admin: {
        sub: "987-654-321",
        name: "Admin User",
        given_name: "Admin",
        family_name: "User",
        email: "admin@example.org",
        email_verified: true,
        picture: "/images/avatars/admin.svg",
    },
    anonymous: {
        sub: "111-222-333",
        name: "Without E-Mail",
        picture: "/images/avatars/anonymous.svg",
    },
    unverified: {
        sub: "222-333-444",
        name: "With unverified E-Mail",
        email: "unverified@example.org",
        email_verified: false,
        picture: "/images/avatars/unverified.svg",
    },
    customized: {
        sub: "333-444-555",
        name: "With customized params",
        given_name: "Customized",
        family_name: "User",
        email: "customized@example.org",
        email_verified: true,
        picture: "/images/avatars/customized.svg",
        custom_prop: "custom_value"
    }
};

export function generateFakeUser(userSelection: string, scope: string, origin: string): MockUser {
    let user: MockUser;
    
    if (userSelection && PREDEFINED_USERS[userSelection]) {
        user = PREDEFINED_USERS[userSelection];
    } else {
        user = PREDEFINED_USERS.john;
    }

    const picture = user.picture ? new URL(user.picture, origin).toString() : undefined;
    
    if (scope) {
        const scopeSet = new Set(scope.split(" "));
        const filteredUser: MockUser = { sub: user.sub };
        if (scopeSet.has("profile")) {
            filteredUser.name = user.name;
            filteredUser.given_name = user.given_name;
            filteredUser.family_name = user.family_name;
            filteredUser.picture = picture;
            if(user.custom_prop)
                filteredUser.custom_prop = user.custom_prop;
        }
        if (scopeSet.has("email")) {
            filteredUser.email = user.email;
            filteredUser.email_verified = user.email_verified;
        }
        return filteredUser;
    }
    return { ...user, picture };
}

export function getAvailableUsers() {
    return Object.keys(PREDEFINED_USERS);
}
