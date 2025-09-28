import * as z from "zod";
import {db} from "~/lib/server/database/db";
import * as s from "~/lib/server/database/schemas";
import {and, asc, desc, eq} from "drizzle-orm";
import {notFound} from "@tanstack/router-core";
import {createServerFn} from "@tanstack/react-start";
import {authMiddleware} from "~/lib/server/middlewares/authentication";
import {createBoardSchema, deleteBoardSchema, updateBoardSchema} from "~/lib/utils/zod";


export const getBoards = createServerFn({ method: "GET" })
    .middleware([authMiddleware])
    .handler(async ({ context: { currentUser } }) => {
        return db
            .select()
            .from(s.boards)
            .where(eq(s.boards.userId, currentUser.id))
            .orderBy(desc(s.boards.createdAt));
    });


export const getBoard = createServerFn({ method: "GET" })
    .middleware([authMiddleware])
    .validator(z.object({ boardId: z.number() }))
    .handler(async ({ data: { boardId }, context: { currentUser } }) => {
        const boardData = await db.query.boards.findFirst({
            where: and(eq(s.boards.id, boardId), eq(s.boards.userId, currentUser.id)),
            with: {
                labels: { orderBy: asc(s.labels.name) },
                columns: { orderBy: asc(s.columns.order) },
                cards: {
                    orderBy: asc(s.cards.order),
                    with: { labels: { with: { label: true } } },
                },
            },
        });

        if (!boardData) {
            throw notFound();
        }

        const board = {
            ...boardData,
            cards: boardData.cards.map(card => ({
                ...card,
                labels: card.labels.map((cardToLabel) => cardToLabel.label),
            })),
        };

        return board;
    });


export const createBoard = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .validator(createBoardSchema)
    .handler(async ({ data, context: { currentUser } }) => {
        const [newBoard] = await db
            .insert(s.boards)
            .values({
                ...data,
                userId: currentUser.id,
            }).returning({ id: s.boards.id });

        return newBoard.id;
    });


export const updateBoard = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .validator(updateBoardSchema)
    .handler(async ({ data, context: { currentUser } }) => {
        await db
            .update(s.boards)
            .set({ ...data })
            .where(and(eq(s.boards.id, data.id), eq(s.boards.userId, currentUser.id)));
    });


export const deleteBoard = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .validator(deleteBoardSchema)
    .handler(async ({ data: { id }, context: { currentUser } }) => {
        await db
            .delete(s.boards)
            .where(and(eq(s.boards.id, id), eq(s.boards.userId, currentUser.id)))
    });
