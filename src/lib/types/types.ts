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


export type CardLabel = CardType["labels"][number];
export type BoardLabel = BoardType["labels"][number];
export type ColumnType = BoardType["columns"][number];
export type CardType = BoardType["columns"][number]["cards"][number];
export type BoardsType = Awaited<ReturnType<NonNullable<typeof boardsListOptions["queryFn"]>>>
export type BoardType = Awaited<ReturnType<NonNullable<ReturnType<typeof boardDetailsOptions>["queryFn"]>>>;
