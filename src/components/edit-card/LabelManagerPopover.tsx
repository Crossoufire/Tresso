import {Plus} from "lucide-react";
import {Button} from "~/components/ui/button";
import {CardLabel, CardType} from "~/types/types";
import React, {useReducer, useState} from "react";
import {LabelFormView} from "~/components/edit-card/LabelFormView";
import {LabelSelectionView} from "~/components/edit-card/LabelSelectionView";
import {Popover, PopoverContent, PopoverTrigger,} from "~/components/ui/popover";
import {useCreateLabelMutation, useDeleteLabelMutation, useUpdateLabelMutation} from "~/react-query/mutations";


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

    const handleCreate = (createData: { name: string; color: string }) => {
        createLabelMutation.mutate({ data: { ...createData, boardId: card.boardId } }, {
            onSuccess: () => dispatch({ type: "RESET" }),
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
        <Popover open={isOpen} onOpenChange={setIsOpen} modal={true}>
            <PopoverTrigger asChild>
                <Button size="sm" type="button" variant="outline" className="h-8 w-8 p-0 shrink-0">
                    <Plus className="h-4 w-4"/>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end" side="top">
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
