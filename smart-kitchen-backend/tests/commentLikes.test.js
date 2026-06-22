"use strict";

// CommentLikes backend unit tests.
// Run with: npm install --save-dev jest && npx jest tests/commentLikes.test.js
// These tests mock Sequelize models and the socket layer.

jest.mock("../models", () => ({
    CommentLike: {
        findOrCreate: jest.fn(),
        destroy: jest.fn(),
        count: jest.fn(),
        findAll: jest.fn()
    },
    RecipeComment: {
        findByPk: jest.fn(),
        findAll: jest.fn()
    },
    User: {},
    sequelize: {
        fn: jest.fn((fn, col) => `${fn}(${col})`),
        col: jest.fn((c) => c)
    }
}));

jest.mock("../socket/index", () => ({
    getIO: jest.fn(() => ({
        to: jest.fn(() => ({ emit: jest.fn() }))
    }))
}));

jest.mock("../middleware/auth", () => ({
    resolveAuthUser: jest.fn(async () => false),
    requireAuth: jest.fn((req, res, next) => next())
}));

const { CommentLike, RecipeComment } = require("../models");
const { likeComment, unlikeComment } = require("../controllers/commentLikesController");
const { getCommentsByRecipe } = require("../controllers/recipeCommentsController");

// Helper to build mock req/res/next
function mockReq(overrides = {}) {
    return {
        params: { commentId: "42" },
        authUser: { userId: 5, userRole: "user" },
        headers: {},
        ...overrides
    };
}

function mockRes() {
    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
    };
    return res;
}

const next = jest.fn();

describe("commentLikesController — likeComment", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        CommentLike.count.mockResolvedValue(5);
    });

    it("returns 404 when comment does not exist", async () => {
        RecipeComment.findByPk.mockResolvedValue(null);
        const res = mockRes();
        await likeComment(mockReq(), res, next);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ success: false })
        );
    });

    it("returns 403 when user tries to like their own comment", async () => {
        RecipeComment.findByPk.mockResolvedValue({ commentId: 42, userId: 5, recipeId: 101 });
        const res = mockRes();
        await likeComment(mockReq(), res, next);
        expect(res.status).toHaveBeenCalledWith(403);
        const body = res.json.mock.calls[0][0];
        expect(body.error.code).toBe("SELF_LIKE_NOT_ALLOWED");
    });

    it("creates a like and returns likeCount and isLikedByMe:true", async () => {
        RecipeComment.findByPk.mockResolvedValue({ commentId: 42, userId: 9, recipeId: 101 });
        CommentLike.findOrCreate.mockResolvedValue([{}, true]);
        CommentLike.count.mockResolvedValue(5);
        const res = mockRes();
        await likeComment(mockReq(), res, next);
        expect(res.status).toHaveBeenCalledWith(201);
        const body = res.json.mock.calls[0][0];
        expect(body.data.isLikedByMe).toBe(true);
        expect(body.data.likeCount).toBe(5);
    });

    it("does not create a duplicate row on repeat like (findOrCreate idempotent)", async () => {
        RecipeComment.findByPk.mockResolvedValue({ commentId: 42, userId: 9, recipeId: 101 });
        CommentLike.findOrCreate.mockResolvedValue([{}, false]); // false = already existed
        CommentLike.count.mockResolvedValue(5);
        const res = mockRes();
        await likeComment(mockReq(), res, next);
        expect(res.status).toHaveBeenCalledWith(200); // 200 not 201 on existing
        expect(CommentLike.findOrCreate).toHaveBeenCalledTimes(1);
    });

    it("response includes commentId in the data envelope", async () => {
        RecipeComment.findByPk.mockResolvedValue({ commentId: 42, userId: 9, recipeId: 101 });
        CommentLike.findOrCreate.mockResolvedValue([{}, true]);
        CommentLike.count.mockResolvedValue(3);
        const res = mockRes();
        await likeComment(mockReq(), res, next);
        expect(res.json.mock.calls[0][0].data.commentId).toBe(42);
    });
});

describe("commentLikesController — unlikeComment", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        CommentLike.destroy.mockResolvedValue(1);
        CommentLike.count.mockResolvedValue(2);
    });

    it("returns 404 when comment does not exist", async () => {
        RecipeComment.findByPk.mockResolvedValue(null);
        const res = mockRes();
        await unlikeComment(mockReq(), res, next);
        expect(res.status).toHaveBeenCalledWith(404);
    });

    it("removes the like and returns isLikedByMe:false", async () => {
        RecipeComment.findByPk.mockResolvedValue({ commentId: 42, userId: 9, recipeId: 101 });
        const res = mockRes();
        await unlikeComment(mockReq(), res, next);
        expect(CommentLike.destroy).toHaveBeenCalledWith(
            expect.objectContaining({ where: { userId: 5, commentId: 42 } })
        );
        const body = res.json.mock.calls[0][0];
        expect(body.data.isLikedByMe).toBe(false);
    });

    it("is safe when called again after already unliked (destroy returns 0)", async () => {
        RecipeComment.findByPk.mockResolvedValue({ commentId: 42, userId: 9, recipeId: 101 });
        CommentLike.destroy.mockResolvedValue(0); // row did not exist
        const res = mockRes();
        await unlikeComment(mockReq(), res, next);
        expect(res.status).toHaveBeenCalledWith(200);
    });
});

describe("getCommentsByRecipe — enrichment", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("returns likeCount and isLikedByMe on each comment", async () => {
        const mockComment = {
            commentId: 100,
            content: "Great recipe!",
            userId: 1,
            toJSON: () => ({ commentId: 100, content: "Great recipe!", userId: 1 })
        };
        RecipeComment.findAll = jest.fn().mockResolvedValue([mockComment]);
        CommentLike.findAll
            .mockResolvedValueOnce([{ commentId: 100, likeCount: "6" }]) // count query
            .mockResolvedValueOnce([]);                                    // user liked query

        const req = { params: { id: "101" }, headers: {} };
        const res = mockRes();
        const { resolveAuthUser } = require("../middleware/auth");
        resolveAuthUser.mockResolvedValue(false);

        await getCommentsByRecipe(req, res, next);

        const body = res.json.mock.calls[0][0];
        expect(body.success).toBe(true);
        expect(body.data[0].likeCount).toBe(6);
        expect(body.data[0].isLikedByMe).toBe(false);
    });

    it("returns isLikedByMe:true for a comment the user has liked", async () => {
        const mockComment = {
            commentId: 101,
            content: "Love this!",
            userId: 4,
            toJSON: () => ({ commentId: 101, content: "Love this!", userId: 4 })
        };
        RecipeComment.findAll = jest.fn().mockResolvedValue([mockComment]);
        CommentLike.findAll
            .mockResolvedValueOnce([{ commentId: 101, likeCount: "3" }])
            .mockResolvedValueOnce([{ commentId: 101 }]); // user liked this one

        const req = { params: { id: "101" }, headers: { "x-user-id": "5" }, authUser: { userId: 5 } };
        const res = mockRes();
        const { resolveAuthUser } = require("../middleware/auth");
        resolveAuthUser.mockResolvedValue(true);

        await getCommentsByRecipe(req, res, next);

        const body = res.json.mock.calls[0][0];
        expect(body.data[0].isLikedByMe).toBe(true);
    });

    it("returns empty array immediately when no comments exist", async () => {
        RecipeComment.findAll = jest.fn().mockResolvedValue([]);
        const req = { params: { id: "999" }, headers: {} };
        const res = mockRes();
        await getCommentsByRecipe(req, res, next);
        expect(res.json.mock.calls[0][0].data).toEqual([]);
        expect(CommentLike.findAll).not.toHaveBeenCalled();
    });
});
