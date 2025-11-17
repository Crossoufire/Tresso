import {boardDetailsOptions, boardsListOptions} from "~/lib/client/react-query/query-options";


export const CONTENT_TYPES = {
    card: "board-card",
    column: "board-column",
};


export type ColTransferType = {
    id: number;
    name: string;
} | null;


export type CardTransferType = {
    id: number;
    title: string;
} | null;


export type CardType = BoardType["cards"][number];
export type CardLabel = CardType["labels"][number];
export type ColumnWithCards = BoardType["columns"][number] & { cards: BoardType["cards"] };
export type BoardsType = Awaited<ReturnType<NonNullable<typeof boardsListOptions["queryFn"]>>>
export type BoardType = Awaited<ReturnType<NonNullable<ReturnType<typeof boardDetailsOptions>["queryFn"]>>>;
