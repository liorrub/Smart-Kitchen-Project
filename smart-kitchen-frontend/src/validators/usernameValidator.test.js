import { validateRegisterForm } from "./userValidator";

// Test username validation via the full register form validator.
// The username rule is: 3–30 chars, start with letter, letters/numbers/underscore/period only,
// no trailing punctuation, no consecutive punctuation.

const BASE_VALID = {
    firstName: "Lior",
    lastName: "Test",
    email: "lior@test.com",
    password: "password123",
    city: "Tel Aviv",
    age: "25",
    cookingLevel: "beginner"
};

function withUsername(username) {
    return { ...BASE_VALID, username };
}

describe("username validation in registerForm", () => {
    it("accepts valid usernames", () => {
        expect(validateRegisterForm(withUsername("lior_1"))).toBeNull();
        expect(validateRegisterForm(withUsername("maya5"))).toBeNull();
        expect(validateRegisterForm(withUsername("chef.cook99"))).toBeNull();
        expect(validateRegisterForm(withUsername("abc"))).toBeNull();
    });

    it("rejects missing username", () => {
        expect(validateRegisterForm({ ...BASE_VALID })).toMatch(/username/i);
    });

    it("rejects username that is too short", () => {
        expect(validateRegisterForm(withUsername("ab"))).toMatch(/username/i);
    });

    it("rejects username that is too long", () => {
        expect(validateRegisterForm(withUsername("a".repeat(31)))).toMatch(/username/i);
    });

    it("rejects username starting with a digit", () => {
        expect(validateRegisterForm(withUsername("1lior"))).toMatch(/username/i);
    });

    it("rejects username ending with underscore", () => {
        expect(validateRegisterForm(withUsername("lior_"))).toMatch(/username/i);
    });

    it("rejects username ending with period", () => {
        expect(validateRegisterForm(withUsername("lior."))).toMatch(/username/i);
    });

    it("rejects consecutive underscores", () => {
        expect(validateRegisterForm(withUsername("lior__test"))).toMatch(/username/i);
    });

    it("rejects spaces in username", () => {
        expect(validateRegisterForm(withUsername("lior test"))).toMatch(/username/i);
    });
});
