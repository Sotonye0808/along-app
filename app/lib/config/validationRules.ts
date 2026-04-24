export interface ValidationRules {
    usernameMin: number;
    usernameMax: number;
    passwordMin: number;
    otpLength: number;
    postTitleMax: number;
    postBodyMax: number;
    bioMax: number;
    tagsMax: number;
    patterns: {
        email: RegExp;
        username: RegExp;
        otp: RegExp;
    };
}

export const VALIDATION_RULES: ValidationRules = {
    usernameMin: 3,
    usernameMax: 20,
    passwordMin: 8,
    otpLength: 6,
    postTitleMax: 120,
    postBodyMax: 1000,
    bioMax: 280,
    tagsMax: 10,
    patterns: {
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        username: /^[a-zA-Z0-9_]+$/,
        otp: /^\d{6}$/,
    },
};
