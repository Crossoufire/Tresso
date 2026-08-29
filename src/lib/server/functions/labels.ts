import {and, eq} from "drizzle-orm";
import {db} from "~/lib/server/database/db";
import {notFound} from "@tanstack/react-router";
import * as s from "~/lib/server/database/schemas";
import {createServerFn, createServerOnlyFn} from "@tanstack/react-start";
import {authMiddleware} from "~/lib/server/middlewares/authentication";
import {createLabelSchema, deleteLabelSchema, updateLabelSchema} from "~/lib/types/schemas";


const touchBoard = createServerOnlyFn(async (boardId: number) => {
    await db
        .update(s.boards)
        .set({ updatedAt: new Date() })
        .where(eq(s.boards.id, boardId));
});


export const createLabel = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .validator(createLabelSchema)
    .handler(async ({ data, context: { currentUser } }) => {
        const targetBoard = await db.query.boards.findFirst({
            where: and(eq(s.boards.id, data.boardId), eq(s.boards.userId, currentUser.id)),
        });

        if (!targetBoard) {
            throw notFound();
        }

        const [newLabel] = await db
            .insert(s.labels)
            .values({ ...data })
            .returning();

        await touchBoard(data.boardId);

        return newLabel;
    });


export const updateLabel = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .validator(updateLabelSchema)
    .handler(async ({ data, context: { currentUser } }) => {
        const label = await db.query.labels.findFirst({
            where: eq(s.labels.id, data.id),
            with: { board: true }
        });

        if (!label || label.board.userId !== currentUser.id) {
            throw notFound();
        }

        const [updatedLabel] = await db
            .update(s.labels)
            .set({ ...data })
            .where(eq(s.labels.id, data.id))
            .returning();

        await touchBoard(label.boardId);

        return updatedLabel;
    });


export const deleteLabel = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .validator(deleteLabelSchema)
    .handler(async ({ data, context: { currentUser } }) => {
        const label = await db.query.labels.findFirst({
            where: eq(s.labels.id, data.id),
            with: { board: true },
        });

        if (!label || label.board.userId !== currentUser.id) {
            throw notFound();
        }

        await db
            .delete(s.labels)
            .where(eq(s.labels.id, data.id));

        await touchBoard(label.boardId);
    });
