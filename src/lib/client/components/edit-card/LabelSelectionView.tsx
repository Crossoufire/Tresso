import React from "react";
import {Button} from "~/lib/client/components/ui/button";
import {useQuery} from "@tanstack/react-query";
import {Edit2, Plus, Trash2} from "lucide-react";
import {CardLabel, CardType} from "~/lib/types/types";
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
        <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">Select Labels</h4>
                <Button size="sm" variant="outline" onClick={onStartCreate}>
                    <Plus className="h-3 w-3 mr-1"/> New
                </Button>
            </div>
            <ScrollArea className="h-48">
                <div className="space-y-1">
                    {(boardLabels && boardLabels.length > 0) ?
                        boardLabels.map((label) =>
                            <div key={label.id} className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                                <div className="flex items-center gap-2 flex-1">
                                    <Checkbox
                                        onCheckedChange={(value) => toggleLabelCardHandler(value, label)}
                                        checked={card.labels.some((l) => l.id === label.id)}
                                    />
                                    <div className="w-3 h-3 rounded" style={{ backgroundColor: label.color }}/>
                                    <span className="text-sm">{label.name}</span>
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
                        )
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