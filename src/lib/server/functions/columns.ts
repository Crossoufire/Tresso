import {and, eq} from "drizzle-orm";
import {db} from "~/lib/server/database/db";
import {notFound} from "@tanstack/router-core";
import * as s from "~/lib/server/database/schemas";
import {createServerFn} from "@tanstack/react-start";
import {authMiddleware} from "~/lib/server/middlewares/authentication";
import {createColumnSchema, deleteColumnSchema, updateColumnSchema} from "~/lib/utils/zod";


export const createColumn = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .inputValidator(createColumnSchema)
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

        return createdCol;
    });


export const updateColumn = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .inputValidator(updateColumnSchema)
    .handler(async ({ data, context: { currentUser } }) => {
        const targetBoard = await db.query.boards.findFirst({
            where: and(eq(s.boards.id, data.boardId), eq(s.boards.userId, currentUser.id))
        });

        if (!targetBoard) {
            throw notFound();
        }

        await db
            .update(s.columns)
            .set({ ...data })
            .where(eq(s.columns.id, data.id));
    });


export const deleteColumn = createServerFn({ method: "GET" })
    .middleware([authMiddleware])
    .inputValidator(deleteColumnSchema)
    .handler(async ({ data, context: { currentUser } }) => {
        const targetBoard = await db.query.boards.findFirst({
            where: and(eq(s.boards.id, data.boardId), eq(s.boards.userId, currentUser.id))
        });

        if (!targetBoard) {
            throw notFound();
        }

        await db
            .delete(s.columns)
            .where(eq(s.columns.id, data.id));
    });
