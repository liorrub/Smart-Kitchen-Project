import {
    AVATAR_CATALOG,
    AVATAR_DEFAULT,
    isValidAvatarKey,
    resolveAvatarKey
} from "./avatarCatalog";

describe("avatarCatalog", () => {
    it("has 10 entries", () => {
        expect(AVATAR_CATALOG).toHaveLength(10);
    });

    it("default key is masculine", () => {
        expect(AVATAR_DEFAULT).toBe("masculine");
    });

    it("isValidAvatarKey returns true for valid keys", () => {
        expect(isValidAvatarKey("masculine")).toBe(true);
        expect(isValidAvatarKey("feminine")).toBe(true);
        expect(isValidAvatarKey("chef_masculine")).toBe(true);
        expect(isValidAvatarKey("chef_feminine")).toBe(true);
        expect(isValidAvatarKey("foodie_masculine")).toBe(true);
        expect(isValidAvatarKey("foodie_feminine")).toBe(true);
        expect(isValidAvatarKey("baker_masculine")).toBe(true);
        expect(isValidAvatarKey("baker_feminine")).toBe(true);
        expect(isValidAvatarKey("healthy_masculine")).toBe(true);
        expect(isValidAvatarKey("healthy_feminine")).toBe(true);
    });

    it("isValidAvatarKey returns false for old SVG-era keys", () => {
        expect(isValidAvatarKey("chef_masculine_01")).toBe(false);
        expect(isValidAvatarKey("home_cook_neutral_01")).toBe(false);
        expect(isValidAvatarKey("foodie_neutral_01")).toBe(false);
    });

    it("isValidAvatarKey returns false for invalid inputs", () => {
        expect(isValidAvatarKey("")).toBe(false);
        expect(isValidAvatarKey(null)).toBe(false);
        expect(isValidAvatarKey("unknown_key")).toBe(false);
        expect(isValidAvatarKey(undefined)).toBe(false);
    });

    it("resolveAvatarKey returns the key when valid", () => {
        expect(resolveAvatarKey("baker_feminine")).toBe("baker_feminine");
        expect(resolveAvatarKey("healthy_masculine")).toBe("healthy_masculine");
    });

    it("resolveAvatarKey falls back to masculine for invalid keys", () => {
        expect(resolveAvatarKey("garbage")).toBe("masculine");
        expect(resolveAvatarKey("chef_masculine_01")).toBe("masculine");
        expect(resolveAvatarKey(null)).toBe("masculine");
        expect(resolveAvatarKey(undefined)).toBe("masculine");
    });

    it("every entry has key, label, and family", () => {
        for (const entry of AVATAR_CATALOG) {
            expect(entry.key).toBeTruthy();
            expect(entry.label).toBeTruthy();
            expect(entry.family).toBeTruthy();
        }
    });

    it("has expected families", () => {
        const families = [...new Set(AVATAR_CATALOG.map(a => a.family))];
        expect(families).toContain("General");
        expect(families).toContain("Chef");
        expect(families).toContain("Foodie");
        expect(families).toContain("Baker");
        expect(families).toContain("Healthy");
    });

    it("all keys are valid according to isValidAvatarKey", () => {
        for (const entry of AVATAR_CATALOG) {
            expect(isValidAvatarKey(entry.key)).toBe(true);
        }
    });
});
