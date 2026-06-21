import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

import FollowButton from "./FollowButton";
import * as followService from "../services/followService";

jest.mock("../services/followService");

describe("FollowButton", () => {
    beforeEach(() => {
        followService.followUser.mockResolvedValue({});
        followService.unfollowUser.mockResolvedValue({});
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("renders Follow when not following", () => {
        render(<FollowButton targetUserId={2} initialIsFollowing={false} />);
        expect(screen.getByRole("button")).toHaveTextContent("Follow");
    });

    it("renders Following when already following", () => {
        render(<FollowButton targetUserId={2} initialIsFollowing={true} />);
        expect(screen.getByRole("button")).toHaveTextContent("Following");
    });

    it("calls followUser and switches to Following on click", async () => {
        const onChange = jest.fn();
        render(
            <FollowButton targetUserId={2} initialIsFollowing={false} onFollowChange={onChange} />
        );

        fireEvent.click(screen.getByRole("button"));

        await waitFor(() =>
            expect(screen.getByRole("button")).toHaveTextContent("Following")
        );
        expect(followService.followUser).toHaveBeenCalledWith(2);
        expect(onChange).toHaveBeenCalledWith(1);
    });

    it("calls unfollowUser and switches to Follow on click", async () => {
        const onChange = jest.fn();
        render(
            <FollowButton targetUserId={2} initialIsFollowing={true} onFollowChange={onChange} />
        );

        fireEvent.click(screen.getByRole("button"));

        await waitFor(() =>
            expect(screen.getByRole("button")).toHaveTextContent("Follow")
        );
        expect(followService.unfollowUser).toHaveBeenCalledWith(2);
        expect(onChange).toHaveBeenCalledWith(-1);
    });

    it("shows loading indicator during request", async () => {
        followService.followUser.mockImplementation(
            () => new Promise(resolve => setTimeout(resolve, 200))
        );
        render(<FollowButton targetUserId={2} initialIsFollowing={false} />);
        fireEvent.click(screen.getByRole("button"));
        expect(screen.getByRole("button")).toHaveTextContent("...");
    });

    it("is disabled while request is in flight", async () => {
        followService.followUser.mockImplementation(
            () => new Promise(resolve => setTimeout(resolve, 200))
        );
        render(<FollowButton targetUserId={2} initialIsFollowing={false} />);
        fireEvent.click(screen.getByRole("button"));
        expect(screen.getByRole("button")).toBeDisabled();
    });

    it("does not call followUser again if clicked while loading", async () => {
        let resolveFollow;
        followService.followUser.mockImplementation(
            () => new Promise(resolve => { resolveFollow = resolve; })
        );
        render(<FollowButton targetUserId={2} initialIsFollowing={false} />);

        fireEvent.click(screen.getByRole("button"));
        fireEvent.click(screen.getByRole("button")); // second click while disabled

        resolveFollow({});
        await waitFor(() =>
            expect(screen.getByRole("button")).toHaveTextContent("Following")
        );
        expect(followService.followUser).toHaveBeenCalledTimes(1);
    });
});
