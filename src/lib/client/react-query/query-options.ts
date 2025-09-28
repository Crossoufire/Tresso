import {queryOptions} from "@tanstack/react-query";
import {getCurrentUser} from "~/lib/server/functions/auth";
import {getBoard, getBoards} from "~/lib/server/functions/boards";


export const authOptions = queryOptions({
    queryKey: ["currentUser"],
    queryFn: () => getCurrentUser(),
    staleTime: 10 * 60 * 1000,
})


export const boardsListOptions = queryOptions({
    queryKey: ["boards", "list"],
    queryFn: () => getBoards(),
})


export const boardDetailsOptions = (boardId: number) => queryOptions({
    queryKey: ["boards", "detail", boardId],
    queryFn: () => getBoard({ data: { boardId } }),
})
