import {describe, expect, test} from "bun:test";
import {
    createBoardSchema,
    createCardSchema,
    createColumnSchema,
    createLabelSchema,
    moveCardSchema,
    positiveIdSchema,
    updateCardContentSchema,
} from "~/lib/types/schemas";


describe("server input schemas", () => {
    test("trims names, titles, descriptions, and colors", () => {
        expect(createBoardSchema.parse({ name: "  Roadmap  ", color: "  #A1b2C3  " })).toEqual({
            name: "Roadmap",
            color: "#A1b2C3",
        });
        expect(createCardSchema.parse({
            title: "  Ship validation  ",
            content: "  Add limits and trimming.  ",
            boardId: 1,
            columnId: 2,
        })).toEqual({
            title: "Ship validation",
            content: "Add limits and trimming.",
            boardId: 1,
            columnId: 2,
        });
    });

    test("rejects empty or oversized text fields", () => {
        expect(createColumnSchema.safeParse({ name: "   ", boardId: 1 }).success).toBe(false);
        expect(createColumnSchema.safeParse({ name: "a".repeat(101), boardId: 1 }).success).toBe(false);
        expect(createLabelSchema.safeParse({ name: "a".repeat(26), color: "#123456", boardId: 1 }).success).toBe(false);
        expect(createCardSchema.safeParse({ title: "a".repeat(201), boardId: 1, columnId: 1 }).success).toBe(false);
        expect(updateCardContentSchema.safeParse({ id: 1 }).success).toBe(false);
        expect(updateCardContentSchema.safeParse({ id: 1, content: "a".repeat(10_001) }).success).toBe(false);
    });

    test("allows an empty description so it can be cleared", () => {
        expect(updateCardContentSchema.parse({ id: 1, content: "   " })).toEqual({ id: 1, content: "" });
    });

    test("accepts only positive integer IDs", () => {
        expect(positiveIdSchema.safeParse(1).success).toBe(true);

        for (const invalidId of [0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY]) {
            expect(positiveIdSchema.safeParse(invalidId).success).toBe(false);
        }

        expect(moveCardSchema.safeParse({
            id: 1,
            columnId: 2,
            targetCardId: 0,
            placement: "before",
        }).success).toBe(false);
    });

    test("accepts six-digit hex colors only", () => {
        expect(createLabelSchema.safeParse({ name: "Urgent", color: "#eF4444", boardId: 1 }).success).toBe(true);

        for (const color of ["red", "#fff", "#12345678", "url(example.com)", "#gggggg"]) {
            expect(createLabelSchema.safeParse({ name: "Urgent", color, boardId: 1 }).success).toBe(false);
        }
    });
});
