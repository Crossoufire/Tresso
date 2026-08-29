import {and, eq} from "drizzle-orm";
import {db} from "~/lib/server/database/db";
import {notFound} from "@tanstack/react-router";
import * as s from "~/lib/server/database/schemas";
import {createServerFn} from "@tanstack/react-start";
import {authMiddleware} from "~/lib/server/middlewares/authentication";
import {createColumnSchema, deleteColumnSchema, updateColumnSchema} from "~/lib/types/schemas";


const touchBoard = async (boardId: number) => {
    await db
        .update(s.boards)
        .set({ updatedAt: new Date() })
        .where(eq(s.boards.id, boardId));
};


export const createColumn = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .validator(createColumnSchema)
    .handler(async ({ data, context: { currentUser } }) => {
        const targetBoard = await db.query.boards.findFirst({
            where: and(eq(s.boards.id, data.boardId), eq(s.boards.userId, currentUser.id)),
            with: { columns: true }
        });

        if (!targetBoard) {
            throw notFound();
        }

        const [createdCol] = await db
            .insert(s.columns)
            .values({
                name: data.name,
                archived: false,
                boardId: data.boardId,
                order: targetBoard.columns.length + 1,
            }).returning();

        await touchBoard(data.boardId);

        return createdCol;
    });


export const updateColumn = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .validator(updateColumnSchema)
    .handler(async ({ data, context: { currentUser } }) => {
        const targetColumn = await db.query.columns.findFirst({
            where: eq(s.columns.id, data.id),
            with: { board: true },
        });

        if (!targetColumn || targetColumn.board.userId !== currentUser.id) {
            throw notFound();
        }

        const { id, ...updates } = data;

        await db
            .update(s.columns)
            .set(updates)
            .where(and(eq(s.columns.id, id), eq(s.columns.boardId, targetColumn.boardId)));

        await touchBoard(targetColumn.boardId);
    });


export const deleteColumn = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .validator(deleteColumnSchema)
    .handler(async ({ data: { id }, context: { currentUser } }) => {
        const targetColumn = await db.query.columns.findFirst({
            where: eq(s.columns.id, id),
            with: { board: true },
        });

        if (!targetColumn || targetColumn.board.userId !== currentUser.id) {
            throw notFound();
        }

        await db
            .delete(s.columns)
            .where(and(eq(s.columns.id, id), eq(s.columns.boardId, targetColumn.boardId)));

        await touchBoard(targetColumn.boardId);
    });
