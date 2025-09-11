import {boardDetailsOptions, boardsListOptions} from "~/react-query/query-options";


export const CONTENT_TYPES = {
    card: "application/app-card",
    column: "application/app-column",
};


export type BoardsType = Awaited<ReturnType<NonNullable<typeof boardsListOptions["queryFn"]>>>
export type BoardType = Awaited<ReturnType<NonNullable<ReturnType<typeof boardDetailsOptions>["queryFn"]>>>;
export type ColumnWithCards = BoardType["columns"][0] & { cards: BoardType["cards"] };
export type CardType = BoardType["cards"][0];
export type CardLabel = CardType["labels"][number];
