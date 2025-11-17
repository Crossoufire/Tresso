import {boardDetailsOptions, boardsListOptions} from "~/lib/client/react-query/query-options";


export const CONTENT_TYPES = {
    card: "application/app-card",
    column: "application/app-column",
};


export type CardType = BoardType["cards"][number];
export type CardLabel = CardType["labels"][number];
export type ColumnWithCards = BoardType["columns"][number] & { cards: BoardType["cards"] };
export type BoardsType = Awaited<ReturnType<NonNullable<typeof boardsListOptions["queryFn"]>>>
export type BoardType = Awaited<ReturnType<NonNullable<ReturnType<typeof boardDetailsOptions>["queryFn"]>>>;
