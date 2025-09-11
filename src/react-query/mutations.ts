import {useMutation, useQueryClient,} from "@tanstack/react-query";
import {boardDetailsOptions, queryKeys} from "~/react-query/query-options";
import {createBoard, deleteBoard, updateBoard} from "~/server/functions/boards";
import {createLabel, deleteLabel, updateLabel} from "~/server/functions/labels";
import {createColumn, deleteColumn, updateColumn} from "~/server/functions/columns";
import {addLabelToCard, createCard, deleteCard, removeLabelFromCard, updateCardContent, updateCardOrder, updateCardTitle} from "~/server/functions/cards";


// --- BOARDS ----------------------------------------------------

export function useCreateBoardMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createBoard,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.boardsList() }),
    });
}


export function useUpdateBoardMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateBoard,
        onSuccess: (_data, variables) => {
            queryClient.setQueryData(boardDetailsOptions(variables.data.id).queryKey, (oldData) => {
                if (!oldData) return;
                return { ...oldData, name: variables.data.name ?? "" };
            })
        }
    })
}


export function useDeleteBoardMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteBoard,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.boardsList() }),
    });
}


// --- COLUMNS ----------------------------------------------------

export function useCreateColumnMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createColumn,
        onSuccess: (data) => {
            queryClient.setQueryData(boardDetailsOptions(data.boardId).queryKey, (oldData) => {
                if (!oldData) return;
                return { ...oldData, columns: [...oldData.columns, data] }
            });
        }
    })
}


export function useUpdateColumnMutation(boardId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateColumn,
        onMutate: async (variables) => {
            await queryClient.cancelQueries();

            queryClient.setQueryData(boardDetailsOptions(boardId).queryKey, (oldData) => {
                if (!oldData) return;
                return {
                    ...oldData,
                    columns: oldData.columns.map(col => col.id === variables.data.id ? { ...col, ...variables.data } : col),
                };
            })
        },
        onSettled: () => {
            return queryClient.invalidateQueries({ queryKey: queryKeys.boardDetails(boardId) });
        },
    })
}


export function useDeleteColumnMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteColumn,
        onSuccess: async (_data, variables) => {
            queryClient.setQueryData(boardDetailsOptions(variables.data.boardId).queryKey, (oldData) => {
                if (!oldData) return;
                return {
                    ...oldData,
                    cards: oldData.cards.filter((card) => card.columnId !== variables.data.id),
                    columns: oldData.columns.filter((column) => column.id !== variables.data.id),
                }
            });
        },
    })
}


// --- COLUMNS ----------------------------------------------------

export function useCreateCardMutation(boardId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createCard,
        onSuccess: (data) => {
            queryClient.setQueryData(boardDetailsOptions(boardId).queryKey, (oldData) => {
                if (!oldData) return;
                return { ...oldData, cards: [...oldData.cards, data] }
            });
        }
    })
}


export function useUpdateCardOrderMutation(boardId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateCardOrder,
        onMutate: async (variables) => {
            await queryClient.cancelQueries();

            queryClient.setQueryData(boardDetailsOptions(boardId).queryKey, (oldData) => {
                if (!oldData) return;
                return {
                    ...oldData,
                    cards: oldData.cards.map((card) => card.id === variables.data.id ? { ...card, ...variables.data } : card),
                }
            })
        },
        onSettled: () => {
            return queryClient.invalidateQueries({ queryKey: queryKeys.boardDetails(boardId) });
        },
    })
}


export function useUpdateCardTitleMutation(boardId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateCardTitle,
        onSuccess: async (_data, variables) => {
            queryClient.setQueryData(boardDetailsOptions(boardId).queryKey, (oldData) => {
                if (!oldData) return;
                return {
                    ...oldData,
                    cards: oldData.cards.map((card) => card.id === variables.data.id ? { ...card, ...variables.data } : card),
                }
            })
        },
    })
}


export function useUpdateCardContentMutation(boardId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateCardContent,
        onSuccess: async (_data, variables) => {
            queryClient.setQueryData(boardDetailsOptions(boardId).queryKey, (oldData) => {
                if (!oldData) return;
                return {
                    ...oldData,
                    cards: oldData.cards.map((card) => card.id === variables.data.id ? { ...card, ...variables.data } : card),
                }
            })
        },
    })
}


export function useDeleteCardMutation(boardId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteCard,
        onSuccess: async (_data, variables) => {
            queryClient.setQueryData(boardDetailsOptions(boardId).queryKey, (oldData) => {
                if (!oldData) return;
                return {
                    ...oldData,
                    cards: oldData.cards.filter((card) => card.id !== variables.data.id),
                }
            });
        },
    })
}


export function useAddLabelToCardMutation(boardId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: addLabelToCard,
        onSuccess: async (data, variables) => {
            queryClient.setQueryData(boardDetailsOptions(boardId).queryKey, (oldData) => {
                if (!oldData) return;
                return {
                    ...oldData,
                    cards: oldData.cards.map((card) => card.id === variables.data.cardId ? { ...card, labels: [...card.labels, data] } : card),
                }
            });
        },
    })
}


export function useRemoveLabelFromCardMutation(boardId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: removeLabelFromCard,
        onSuccess: async (_data, variables) => {
            queryClient.setQueryData(boardDetailsOptions(boardId).queryKey, (oldData) => {
                if (!oldData) return;
                return {
                    ...oldData,
                    cards: oldData.cards.map((card) => card.id === variables.data.cardId ?
                        { ...card, labels: card.labels.filter((l) => l.id !== variables.data.labelId) } : card
                    ),
                }
            });
        },
    })
}


// --- LABELS ----------------------------------------------------

export function useCreateLabelMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createLabel,
        onSuccess: async (data) => {
            queryClient.setQueryData(boardDetailsOptions(data.boardId).queryKey, (oldData) => {
                if (!oldData) return;
                return {
                    ...oldData,
                    labels: [...oldData.labels, data],
                };
            });
        },
    });
}


export function useUpdateLabelMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateLabel,
        onSuccess: async (data) => {
            queryClient.setQueryData(boardDetailsOptions(data.boardId).queryKey, (oldData) => {
                if (!oldData) return;
                return {
                    ...oldData,
                    labels: oldData.labels.map((label) => label.id === data.id ? data : label),
                };
            });
        },
    })
}


export function useDeleteLabelMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteLabel,
        onSuccess: async (_data, variables) => {
            queryClient.setQueryData(boardDetailsOptions(variables.data.boardId).queryKey, (oldData) => {
                if (!oldData) return;
                return {
                    ...oldData,
                    labels: oldData.labels.filter((label) => label.id !== variables.data.id),
                    cards: oldData.cards.map((card) => {
                        return { ...card, labels: card.labels.filter((label) => label.id !== variables.data.id) }
                    }),
                }
            });
        },
    });
}
