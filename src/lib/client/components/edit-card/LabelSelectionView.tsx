import React from "react";
import {Button} from "~/lib/client/components/ui/button";
import {useQuery} from "@tanstack/react-query";
import {Edit2, Plus, Trash2} from "lucide-react";
import {CardLabel, CardType} from "~/lib/types/types";
import {Checkbox} from "~/lib/client/components/ui/checkbox";
import {ScrollArea} from "~/lib/client/components/ui/scroll-area";
import {boardDetailsOptions} from "~/lib/client/react-query/query-options";
import {useAddLabelToCardMutation, useRemoveLabelFromCardMutation} from "~/lib/client/react-query/mutations";
import {Label} from "~/lib/client/components/ui/label";


interface LabelSelectionViewProps {
    card: CardType;
    isPending: boolean;
    onStartCreate: () => void;
    onDelete: (labelId: number) => void;
    onStartEdit: (label: CardLabel) => void;
}


export function LabelSelectionView({ card, onStartCreate, onStartEdit, onDelete, isPending }: LabelSelectionViewProps) {
    const addLabelToCardMutation = useAddLabelToCardMutation(card.boardId);
    const removeLabelFromCardMutation = useRemoveLabelFromCardMutation(card.boardId);
    const { data: boardLabels } = useQuery({
        ...boardDetailsOptions(card.boardId),
        refetchOnMount: false,
        select: (data) => data.labels,
    });

    const toggleLabelCardHandler = (checked: string | boolean, label: CardLabel) => {
        if (checked) {
            addLabelToCardMutation.mutate({ data: { cardId: card.id, labelId: label.id } });
        }
        else {
            removeLabelFromCardMutation.mutate({ data: { cardId: card.id, labelId: label.id } });
        }
    };

    return (
        <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">Select Labels</h4>
                <Button size="sm" variant="outline" onClick={onStartCreate}>
                    <Plus className="size-4"/> New
                </Button>
            </div>
            <ScrollArea className="h-48">
                <div className="space-y-1">
                    {(boardLabels && boardLabels.length > 0) ?
                        boardLabels.map((label) => {
                            const checkboxId = `label-checkbox-${label.id}`;
                            return (
                                <div key={label.id} className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                                    <div className="flex items-center gap-2 flex-1">
                                        <Checkbox
                                            id={checkboxId}
                                            checked={card.labels.some((l) => l.id === label.id)}
                                            onCheckedChange={(value) => toggleLabelCardHandler(value, label)}
                                        />
                                        <Label htmlFor={checkboxId} className="flex-1 font-normal cursor-pointer select-none">
                                            <div className="size-3 rounded shrink-0" style={{ backgroundColor: label.color }}/>
                                            <div className="text-sm">{label.name}</div>
                                        </Label>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => onStartEdit(label)}>
                                            <Edit2 className="h-2.5 w-2.5"/>
                                        </Button>
                                        <Button size="sm" variant="ghost" disabled={isPending} onClick={() => onDelete(label.id)}
                                                className="h-6 w-6 p-0 text-destructive hover:text-destructive">
                                            <Trash2 className="h-2.5 w-2.5"/>
                                        </Button>
                                    </div>
                                </div>
                            );
                        })
                        :
                        <div className="text-sm text-muted-foreground">
                            No labels found on this board.
                        </div>
                    }
                </div>
            </ScrollArea>
        </div>
    );
}