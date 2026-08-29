import {and, eq, max} from "drizzle-orm";
import {db} from "~/lib/server/database/db";
import {notFound} from "@tanstack/react-router";
import * as s from "~/lib/server/database/schemas";
import {createServerFn} from "@tanstack/react-start";
import {FormattedError} from "~/lib/utils/error-classes";
import {authMiddleware} from "~/lib/server/middlewares/authentication";
import {createCardSchema, deleteCardSchema, labelToCardSchema, updateCardContentSchema, updateCardSchema, updateCardTitleSchema} from "~/lib/types/schemas";


const touchBoard = async (boardId: number) => {
    await db
        .update(s.boards)
        .set({ updatedAt: new Date() })
        .where(eq(s.boards.id, boardId));
};


export const createCard = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .validator(createCardSchema)
    .handler(async ({ data, context: { currentUser } }) => {
        const targetBoard = await db.query.boards.findFirst({
            where: and(eq(s.boards.id, data.boardId), eq(s.boards.userId, currentUser.id)),
            with: {
                columns: {
                    where: eq(s.columns.id, data.columnId),
                },
            },
        });

        if (!targetBoard || targetBoard.columns.length === 0) {
            throw notFound();
        }

        const lastCard = await db
            .select({ value: max(s.cards.order) })
            .from(s.cards)
            .where(eq(s.cards.columnId, data.columnId));

        const newOrder = (lastCard[0]?.value ?? -1) + 1;

        const [newCard] = await db
            .insert(s.cards)
            .values({
                order: newOrder,
                title: data.title,
                boardId: data.boardId,
                columnId: data.columnId,
                content: data.content || null,
            }).returning();

        await touchBoard(data.boardId);

        return { ...newCard, labels: [] };
    });


export const updateCardOrder = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .validator(updateCardSchema)
    .handler(async ({ data, context: { currentUser } }) => {
        const cardData = await db.query.cards.findFirst({
            where: eq(s.cards.id, data.id),
            with: { board: true },
        });

        if (!cardData || cardData.board.userId !== currentUser.id) {
            throw notFound();
        }

        const targetColumn = await db.query.columns.findFirst({
            where: and(eq(s.columns.id, data.columnId), eq(s.columns.boardId, cardData.boardId)),
        });

        if (!targetColumn) {
            throw notFound();
        }

        const { id, ...updates } = data;
        const [updatedCard] = await db
            .update(s.cards)
            .set(updates)
            .where(and(eq(s.cards.id, id), eq(s.cards.boardId, cardData.boardId)))
            .returning();

        await touchBoard(cardData.boardId);

        return updatedCard;
    });


export const deleteCard = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .validator(deleteCardSchema)
    .handler(async ({ data, context: { currentUser } }) => {
        const cardData = await db.query.cards.findFirst({
            where: eq(s.cards.id, data.id),
            with: {
                board: {
                    columns: { userId: true },
                },
            },
        });

        if (!cardData || cardData.board.userId !== currentUser.id) {
            throw notFound();
        }

        await db
            .delete(s.cards)
            .where(eq(s.cards.id, data.id));

        await touchBoard(cardData.boardId);
    });


export const updateCardTitle = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .validator(updateCardTitleSchema)
    .handler(async ({ data, context: { currentUser } }) => {
        const cardData = await db.query.cards.findFirst({
            where: eq(s.cards.id, data.id),
            with: {
                board: {
                    columns: { userId: true },
                },
            },
        });

        if (!cardData || cardData.board.userId !== currentUser.id) {
            throw notFound();
        }

        await db
            .update(s.cards)
            .set({ title: data.title })
            .where(eq(s.cards.id, data.id));

        await touchBoard(cardData.boardId);
    });


export const updateCardContent = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .validator(updateCardContentSchema)
    .handler(async ({ data, context: { currentUser } }) => {
        const cardData = await db.query.cards.findFirst({
            where: eq(s.cards.id, data.id),
            with: {
                board: {
                    columns: { userId: true },
                },
            },
        });

        if (!cardData || cardData.board.userId !== currentUser.id) {
            throw notFound();
        }

        await db
            .update(s.cards)
            .set({ content: data.content })
            .where(eq(s.cards.id, data.id));

        await touchBoard(cardData.boardId);
    });


export const addLabelToCard = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .validator(labelToCardSchema)
    .handler(async ({ data: { cardId, labelId }, context: { currentUser } }) => {
        const card = await db.query.cards.findFirst({
            where: eq(s.cards.id, cardId),
            with: {
                board: {
                    columns: { userId: true },
                },
            },
        });

        if (!card || card.board.userId !== currentUser.id) {
            throw notFound();
        }

        const labelToAdd = await db.query.labels.findFirst({ where: eq(s.labels.id, labelId) });
        if (!labelToAdd || labelToAdd.boardId !== card.boardId) {
            throw new FormattedError("Label do not exist or do not belong to this board.");
        }

        await db
            .insert(s.cardsToLabels)
            .values({ cardId: card.id, labelId: labelId })
            .onConflictDoNothing();

        await touchBoard(card.boardId);

        return labelToAdd;
    });


export const removeLabelFromCard = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .validator(labelToCardSchema)
    .handler(async ({ data: { cardId, labelId }, context: { currentUser } }) => {
        const card = await db.query.cards.findFirst({
            where: eq(s.cards.id, cardId),
            with: {
                board: {
                    columns: { userId: true },
                },
            },
        });

        if (!card || card.board.userId !== currentUser.id) {
            throw notFound();
        }

        const labelToRemove = await db.query.labels.findFirst({ where: eq(s.labels.id, labelId) });
        if (!labelToRemove || labelToRemove.boardId !== card.boardId) {
            throw new FormattedError("Label do not exist or do not belong to this board.");
        }

        await db
            .delete(s.cardsToLabels)
            .where(and(eq(s.cardsToLabels.cardId, cardId), eq(s.cardsToLabels.labelId, labelId)));

        await touchBoard(card.boardId);
    });
