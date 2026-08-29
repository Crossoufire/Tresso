import {Plus} from "lucide-react";
import React, {useReducer, useState} from "react";
import {CardLabel, CardType} from "~/lib/types/types";
import {Button} from "~/lib/client/components/ui/button";
import {LabelFormView} from "~/lib/client/components/edit-card/LabelFormView";
import {LabelSelectionView} from "~/lib/client/components/edit-card/LabelSelectionView";
import {Popover, PopoverContent, PopoverTrigger,} from "~/lib/client/components/ui/popover";
import {useAddLabelToCardMutation, useCreateLabelMutation, useDeleteLabelMutation, useUpdateLabelMutation} from "~/lib/client/react-query/mutations";


type Action = { type: "START_CREATE" } | { type: "START_EDIT"; payload: CardLabel } | { type: "RESET" };

type State = {
    editingLabel: CardLabel | null;
    mode: "select" | "create" | "edit";
};

const initialState: State = {
    mode: "select",
    editingLabel: null,
};


function reducer(state: State, action: Action): State {
    switch (action.type) {
        case "START_CREATE":
            return { mode: "create", editingLabel: null };
        case "START_EDIT":
            return { mode: "edit", editingLabel: action.payload };
        case "RESET":
            return initialState;
        default:
            return state;
    }
}


interface LabelManagerPopoverProps {
    card: CardType;
}


export function LabelManagerPopover({ card }: LabelManagerPopoverProps) {
    const createLabelMutation = useCreateLabelMutation();
    const updateLabelMutation = useUpdateLabelMutation();
    const deleteLabelMutation = useDeleteLabelMutation();
    const [isOpen, setIsOpen] = useState(false);
    const [state, dispatch] = useReducer(reducer, initialState);
    const addLabelToCardMutation = useAddLabelToCardMutation(card.boardId);

    const handleCreate = (createData: { name: string; color: string }) => {
        createLabelMutation.mutate({ data: { ...createData, boardId: card.boardId } }, {
            onSuccess: (newLabel) => {
                dispatch({ type: "RESET" });
                addLabelToCardMutation.mutate({ data: { cardId: card.id, labelId: newLabel.id } });
            },
        });
    };

    const handleUpdate = (updatedData: { name: string; color: string }) => {
        if (!state.editingLabel) return;
        updateLabelMutation.mutate({ data: { id: state.editingLabel.id, ...updatedData } }, {
            onSuccess: () => dispatch({ type: "RESET" }),
        });
    };

    const handleDelete = (labelId: number) => {
        deleteLabelMutation.mutate({ data: { id: labelId, boardId: card.boardId } });
    };

    return (
        <Popover open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) dispatch({ type: "RESET" });
        }} modal={true}>
            <PopoverTrigger
                render={
                    <Button
                        size="icon-sm"
                        type="button"
                        variant="outline"
                        className="shrink-0"
                        aria-label="Manage labels"
                    />
                }
            >
                <Plus/>
            </PopoverTrigger>
            <PopoverContent className="w-80 gap-0 overflow-hidden p-0" align="end" side="top">
                {state.mode === "select" &&
                    <LabelSelectionView
                        card={card}
                        onDelete={handleDelete}
                        isPending={deleteLabelMutation.isPending}
                        onStartCreate={() => dispatch({ type: "START_CREATE" })}
                        onStartEdit={(label) => dispatch({ type: "START_EDIT", payload: label })}
                    />
                }
                {(state.mode === "create" || state.mode === "edit") &&
                    <LabelFormView
                        mode={state.mode}
                        initialLabel={state.editingLabel}
                        onBack={() => dispatch({ type: "RESET" })}
                        onSubmit={state.mode === "create" ? handleCreate : handleUpdate}
                        isPending={createLabelMutation.isPending || updateLabelMutation.isPending}
                    />
                }
            </PopoverContent>
        </Popover>
    );
}
