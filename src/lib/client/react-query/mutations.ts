import {useMutation, useQueryClient,} from "@tanstack/react-query";
import {createBoard, deleteBoard, updateBoard} from "~/lib/server/functions/boards";
import {createLabel, deleteLabel, updateLabel} from "~/lib/server/functions/labels";
import {boardDetailsOptions, boardsListOptions} from "~/lib/client/react-query/query-options";
import {createColumn, deleteColumn, updateColumn} from "~/lib/server/functions/columns";
import {addLabelToCard, createCard, deleteCard, removeLabelFromCard, updateCardContent, updateCardOrder, updateCardTitle} from "~/lib/server/functions/cards";


// --- BOARDS LIST ----------------------------------------------------

export const useCreateBoardMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createBoard,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: boardsListOptions.queryKey }),
    });
};


export const useUpdateBoardMutation = () => {
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
};


export const useDeleteBoardMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteBoard,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: boardsListOptions.queryKey }),
    });
};


// --- COLUMNS --------------------------------------------------------

export const useCreateColumnMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createColumn,
        onSuccess: (data) => {
            queryClient.setQueryData(boardDetailsOptions(data.boardId).queryKey, (oldData) => {
                if (!oldData) return;
                return { ...oldData, columns: [...oldData.columns, data] };
            });
        }
    })
};


export const useUpdateColumnMutation = (boardId: number) => {
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
            return queryClient.invalidateQueries({ queryKey: boardDetailsOptions(boardId).queryKey });
        },
    })
};


export const useDeleteColumnMutation = () => {
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
};


// --- COLUMNS ----------------------------------------------------

export const useCreateCardMutation = (boardId: number) => {
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
};


export const useUpdateCardOrderMutation = (boardId: number) => {
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
            return queryClient.invalidateQueries({ queryKey: boardDetailsOptions(boardId).queryKey });
        },
    })
};


export const useUpdateCardTitleMutation = (boardId: number) => {
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
};


export const useUpdateCardContentMutation = (boardId: number) => {
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
};


export const useDeleteCardMutation = (boardId: number) => {
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
};


export const useAddLabelToCardMutation = (boardId: number) => {
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
};


export const useRemoveLabelFromCardMutation = (boardId: number) => {
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
};


// --- LABELS ----------------------------------------------------

export const useCreateLabelMutation = () => {
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
};


export const useUpdateLabelMutation = () => {
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
};


export const useDeleteLabelMutation = () => {
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
};
