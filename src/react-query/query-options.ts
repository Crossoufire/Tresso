import {queryOptions} from "@tanstack/react-query";
import {getCurrentUser} from "~/server/functions/auth";
import {getBoard, getBoards} from "~/server/functions/boards";


export const queryKeys = {
    authKey: () => ["currentUser"] as const,
    boardsList: () => ["boards", "list"] as const,
    boardDetails: (boardId: number) => ["boards", "detail", boardId] as const,
}


export const authOptions = () => queryOptions({
    queryKey: queryKeys.authKey(),
    queryFn: () => getCurrentUser(),
    staleTime: 10 * 60 * 1000,
})


export const boardsListOptions = () => queryOptions({
    queryKey: queryKeys.boardsList(),
    queryFn: () => getBoards(),
})


export const boardDetailsOptions = (boardId: number) => queryOptions({
    queryKey: queryKeys.boardDetails(boardId),
    queryFn: () => getBoard({ data: { boardId } }),
})
