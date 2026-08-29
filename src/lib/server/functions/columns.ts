import type {z} from "zod";
import {db} from "~/lib/server/database/db";
import {and, asc, eq, max} from "drizzle-orm";
import {notFound} from "@tanstack/react-router";
import * as s from "~/lib/server/database/schemas";
import {createServerFn, createServerOnlyFn} from "@tanstack/react-start";
import {authMiddleware} from "~/lib/server/middlewares/authentication";
import {createColumnSchema, deleteColumnSchema, moveColumnSchema, updateColumnSchema} from "~/lib/types/schemas";


const touchBoard = createServerOnlyFn(async (boardId: number) => {
    await db
        .update(s.boards)
        .set({ updatedAt: new Date() })
        .where(eq(s.boards.id, boardId));
});


export const moveColumnForUser = createServerOnlyFn((data: z.infer<typeof moveColumnSchema>, userId: number) => {
    return db.transaction((tx) => {
        const sourceColumn = tx
            .select({ id: s.columns.id, boardId: s.columns.boardId })
            .from(s.columns)
            .innerJoin(s.boards, eq(s.columns.boardId, s.boards.id))
            .where(and(eq(s.columns.id, data.id), eq(s.boards.userId, userId)))
            .get();

        if (!sourceColumn) {
            throw notFound();
        }

        const targetColumn = tx
            .select({ id: s.columns.id })
            .from(s.columns)
            .where(and(eq(s.columns.id, data.targetColumnId), eq(s.columns.boardId, sourceColumn.boardId)))
            .get();

        if (!targetColumn) {
            throw notFound();
        }

        const columnIds = tx
            .select({ id: s.columns.id })
            .from(s.columns)
            .where(eq(s.columns.boardId, sourceColumn.boardId))
            .orderBy(asc(s.columns.order), asc(s.columns.id))
            .all()
            .map((column) => column.id);

        const reorderedIds = data.id === data.targetColumnId ? columnIds : columnIds.filter((id) => id !== data.id);

        if (data.id !== data.targetColumnId) {
            const targetIndex = reorderedIds.indexOf(data.targetColumnId);
            reorderedIds.splice(targetIndex + (data.placement === "after" ? 1 : 0), 0, data.id);
        }

        const positions = reorderedIds.map((id, order) => ({ id, order }));

        for (const position of positions) {
            tx.update(s.columns)
                .set({ order: position.order })
                .where(and(eq(s.columns.id, position.id), eq(s.columns.boardId, sourceColumn.boardId)))
                .run();
        }

        tx.update(s.boards)
            .set({ updatedAt: new Date() })
            .where(eq(s.boards.id, sourceColumn.boardId))
            .run();

        return positions;
    }, { behavior: "immediate" });
});


export const createColumn = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .validator(createColumnSchema)
    .handler(({ data, context: { currentUser } }) => {
        return db.transaction((tx) => {
            const targetBoard = tx
                .select({ id: s.boards.id })
                .from(s.boards)
                .where(and(eq(s.boards.id, data.boardId), eq(s.boards.userId, currentUser.id)))
                .get();

            if (!targetBoard) {
                throw notFound();
            }

            const lastColumn = tx
                .select({ value: max(s.columns.order) })
                .from(s.columns)
                .where(eq(s.columns.boardId, data.boardId))
                .get();

            const [createdColumn] = tx
                .insert(s.columns)
                .values({
                    name: data.name,
                    archived: false,
                    boardId: data.boardId,
                    order: (lastColumn?.value ?? -1) + 1,
                })
                .returning()
                .all();

            tx.update(s.boards)
                .set({ updatedAt: new Date() })
                .where(eq(s.boards.id, data.boardId))
                .run();

            return createdColumn;
        }, { behavior: "immediate" });
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

        return data;
    });


export const moveColumn = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .validator(moveColumnSchema)
    .handler(({ data, context: { currentUser } }) => {
        return moveColumnForUser(data, currentUser.id);
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
