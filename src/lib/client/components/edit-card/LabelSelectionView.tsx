import React from "react";
import {useQuery} from "@tanstack/react-query";
import {Edit2, Plus, Trash2} from "lucide-react";
import {CardLabel, CardType} from "~/lib/types/types";
import {Label} from "~/lib/client/components/ui/label";
import {Button} from "~/lib/client/components/ui/button";
import {Checkbox} from "~/lib/client/components/ui/checkbox";
import {ScrollArea} from "~/lib/client/components/ui/scroll-area";
import {boardDetailsOptions} from "~/lib/client/react-query/query-options";
import {useAddLabelToCardMutation, useRemoveLabelFromCardMutation} from "~/lib/client/react-query/mutations";


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
        <div className="flex flex-col gap-3 p-3">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                    <h4 className="text-sm font-medium">Labels</h4>
                    <p className="text-xs text-muted-foreground">Select or manage board labels.</p>
                </div>
                <Button size="sm" variant="outline" onClick={onStartCreate}>
                    <Plus data-icon="inline-start"/> New
                </Button>
            </div>
            <ScrollArea className="h-48">
                <div className="flex flex-col gap-1 pr-2">
                    {(boardLabels && boardLabels.length > 0) ?
                        boardLabels.map((label) => {
                            const checkboxId = `label-checkbox-${label.id}`;
                            
                            return (
                                <div key={label.id} className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-muted/50">
                                    <div className="flex flex-1 items-center gap-2">
                                        <Checkbox
                                            id={checkboxId}
                                            checked={card.labels.some((l) => l.id === label.id)}
                                            onCheckedChange={(value) => toggleLabelCardHandler(value, label)}
                                        />
                                        <Label htmlFor={checkboxId} className="flex-1 cursor-pointer font-normal select-none">
                                            <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: label.color }}/>
                                            <span className="truncate text-sm">{label.name}</span>
                                        </Label>
                                    </div>
                                    <div className="flex gap-0.5">
                                        <Button size="icon-xs" variant="ghost" aria-label={`Edit ${label.name}`} onClick={() => onStartEdit(label)}>
                                            <Edit2/>
                                        </Button>
                                        <Button size="icon-xs" variant="ghost" disabled={isPending} aria-label={`Delete ${label.name}`} onClick={() => onDelete(label.id)}
                                                className="text-destructive hover:text-destructive">
                                            <Trash2/>
                                        </Button>
                                    </div>
                                </div>
                            );
                        })
                        :
                        <div className="rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">
                            No labels found on this board.
                        </div>
                    }
                </div>
            </ScrollArea>
        </div>
    );
}
