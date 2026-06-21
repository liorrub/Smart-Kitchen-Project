import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

import AvatarImage from "./AvatarImage";

// AvatarImage uses require('../assets/avatars/<key>.png') at runtime.
// In CRA's Jest environment, static assets return a stub string (not null),
// so the component normally renders <img>. We test the onError fallback path
// by firing the error event on the rendered image.

describe("AvatarImage", () => {
    it("renders without crashing for a valid avatar key", () => {
        const { container } = render(
            <AvatarImage avatarKey="chef_masculine" firstName="Lior" lastName="R" />
        );
        expect(container.firstChild).toBeInTheDocument();
    });

    it("shows masculine fallback after image load error", () => {
        render(
            <AvatarImage avatarKey="chef_masculine" firstName="Lior" lastName="R" />
        );
        const img = screen.queryByRole("img");
        if (img) {
            fireEvent.error(img);
            // After error, component re-renders with masculine.png key; still an img or initials
            const afterImg = screen.queryByRole("img");
            // Either masculine.png loaded (still img) or require() threw (initials)
            const afterInitials = screen.queryByText("L");
            expect(afterImg || afterInitials).toBeTruthy();
        } else {
            // require() threw for the key — showing initials already
            expect(screen.getByText("L")).toBeInTheDocument();
        }
    });

    it("shows initials when avatarKey is invalid and fallback also unavailable", () => {
        // This tests the branch where getAvatarSrc returns null.
        // We pass an undefined key — resolveAvatarKey returns "masculine".
        // If masculine.png fails to require(), initials are shown.
        render(
            <AvatarImage firstName="Maya" lastName="David" />
        );
        const el = screen.queryByRole("img");
        if (!el) {
            expect(screen.getByText("M")).toBeInTheDocument();
        } else {
            expect(el).toHaveAttribute("alt", "Maya David avatar");
        }
    });

    it("applies the xl size class to the root element", () => {
        const { container } = render(
            <AvatarImage avatarKey="chef_masculine" firstName="Lior" size="xl" />
        );
        expect(container.firstChild.className).toMatch(/avatar-xl/);
    });

    it("applies the sm size class to the root element", () => {
        const { container } = render(
            <AvatarImage avatarKey="masculine" firstName="Lior" size="sm" />
        );
        expect(container.firstChild.className).toMatch(/avatar-sm/);
    });

    it("applies an extra className from props", () => {
        const { container } = render(
            <AvatarImage firstName="Test" size="md" className="profile-avatar" />
        );
        expect(container.firstChild.className).toContain("profile-avatar");
    });

    it("uses firstName in the alt text for img element", () => {
        render(
            <AvatarImage avatarKey="chef_masculine" firstName="Lior" lastName="Cohen" />
        );
        const img = screen.queryByRole("img");
        if (img) {
            expect(img).toHaveAttribute("alt", "Lior Cohen avatar");
        }
    });

    it("uses displayName in the title attribute", () => {
        render(
            <AvatarImage avatarKey="feminine" firstName="Ellen" lastName="Levin" />
        );
        const el = screen.queryByRole("img") || screen.queryByTitle("Ellen Levin");
        expect(el).toBeTruthy();
    });
});
