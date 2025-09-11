import {relations} from "drizzle-orm";
import {user} from "~/server/database/schemas/auth.schema";
import {integer, primaryKey, sqliteTable, text} from "drizzle-orm/sqlite-core";


export const usersRelations = relations(user, ({ many }) => ({
    boards: many(boards),
}));


export const boards = sqliteTable("boards", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    color: text("color").notNull(),
    userId: integer("user_id").notNull().references(() => user.id),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(new Date()),
});


export const boardsRelations = relations(boards, ({ many, one }) => ({
    columns: many(columns),
    cards: many(cards),
    labels: many(labels),
    user: one(user, {
        fields: [boards.userId],
        references: [user.id],
    }),
}));


export const columns = sqliteTable("columns", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    order: integer("order").notNull(),
    archived: integer("archived", { mode: "boolean" }).default(false).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).default(new Date()).notNull(),
    boardId: integer("board_id").notNull().references(() => boards.id, { onDelete: "cascade" }),
});


export const columnsRelations = relations(columns, ({ many, one }) => ({
    cards: many(cards),
    board: one(boards, {
        fields: [columns.boardId],
        references: [boards.id],
    }),
}));


export const cards = sqliteTable("cards", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    content: text("content"),
    order: integer("order").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(new Date()),
    boardId: integer("board_id").notNull().references(() => boards.id, { onDelete: "cascade" }),
    columnId: integer("column_id").notNull().references(() => columns.id, { onDelete: "cascade" }),
});


export const cardsRelations = relations(cards, ({ many, one }) => ({
    board: one(boards, {
        fields: [cards.boardId],
        references: [boards.id],
    }),
    column: one(columns, {
        fields: [cards.columnId],
        references: [columns.id],
    }),
    labels: many(cardsToLabels),
}));


export const labels = sqliteTable("labels", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    color: text("color").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).default(new Date()).notNull(),
    boardId: integer("board_id").notNull().references(() => boards.id, { onDelete: "cascade" }),
});


export const labelsRelations = relations(labels, ({ one, many }) => ({
    board: one(boards, {
        fields: [labels.boardId],
        references: [boards.id],
    }),
    cards: many(cardsToLabels),
}));


export const cardsToLabels = sqliteTable("cards_to_labels", {
    cardId: integer("card_id").notNull().references(() => cards.id, { onDelete: "cascade" }),
    labelId: integer("label_id").notNull().references(() => labels.id, { onDelete: "cascade" }),
}, (table) => [primaryKey({ columns: [table.cardId, table.labelId] })]);


export const cardsToLabelsRelations = relations(cardsToLabels, ({ one }) => ({
    card: one(cards, {
        fields: [cardsToLabels.cardId],
        references: [cards.id],
    }),
    label: one(labels, {
        fields: [cardsToLabels.labelId],
        references: [labels.id],
    }),
}));
