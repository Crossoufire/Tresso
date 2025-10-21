import {z} from "zod";


// --- USER ---------------------------------------------------------------------

export const userSchema = z.object({
    name: z.string(),
    email: z.email(),
    id: z.number(),
});


// --- COLUMNS ---------------------------------------------------------------------

export const columnSchema = z.object({
    id: z.number(),
    name: z.string(),
    order: z.number(),
    boardId: z.number(),
    archived: z.boolean(),
});

export const createColumnSchema = columnSchema.pick({ name: true, boardId: true });

export const updateColumnSchema = columnSchema.partial().required({ id: true, boardId: true });

export const deleteColumnSchema = columnSchema.pick({ id: true, boardId: true });

// --- LABELS ---------------------------------------------------------------------

export const labelSchema = z.object({
    id: z.number(),
    name: z.string(),
    color: z.string(),
    boardId: z.number(),
});

export const createLabelSchema = labelSchema.omit({ id: true });

export const updateLabelSchema = labelSchema.partial().required({ id: true }).omit({ boardId: true });

export const deleteLabelSchema = labelSchema.partial().required({ id: true, boardId: true });

export const labelToCardSchema = z.object({
    cardId: z.number(),
    labelId: z.number(),
});


// --- CARDS ---------------------------------------------------------------------

export const cardSchema = z.object({
    id: z.number(),
    title: z.string(),
    order: z.number(),
    boardId: z.number(),
    columnId: z.number(),
    content: z.string().optional(),
});

export const createCardSchema = cardSchema.omit({ id: true });

export const updateCardSchema = cardSchema.pick({ id: true, order: true, columnId: true });

export const deleteCardSchema = cardSchema.pick({ id: true });

export const updateCardTitleSchema = cardSchema.pick({ id: true, title: true });

export const updateCardContentSchema = cardSchema.pick({ id: true, content: true });


// --- BOARDS ---------------------------------------------------------------------

export const boardSchema = z.object({
    id: z.number(),
    name: z.string(),
    color: z.string(),
    cards: z.array(cardSchema),
    columns: z.array(columnSchema),
});

export const createBoardSchema = boardSchema.omit({ id: true, cards: true, columns: true });

export const updateBoardSchema = boardSchema.partial().omit({ cards: true, columns: true }).required({ id: true });

export const deleteBoardSchema = boardSchema.pick({ id: true });
