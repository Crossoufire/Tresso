import {LoaderCircle, X} from "lucide-react";
import {Label} from "~/components/ui/label";
import {Badge} from "~/components/ui/badge";
import {Button} from "~/components/ui/button";
import {Textarea} from "~/components/ui/textarea";
import {CardType} from "~/types/types";
import React, {useEffect, useRef, useState} from "react";
import {EditableText} from "~/components/board/EditableText";
import {useOnClickOutside} from "~/hooks/use-clicked-outside";
import {LabelManagerPopover} from "~/components/edit-card/LabelManagerPopover";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,} from "~/components/ui/dialog";
import {useRemoveLabelFromCardMutation, useUpdateCardContentMutation, useUpdateCardTitleMutation} from "~/react-query/mutations";


interface EditCardDialogProps {
    card: CardType;
    isDialogOpen: boolean;
    setDialogOpen: (open: boolean) => void;
}


export function EditCardDialog({ card, isDialogOpen, setDialogOpen }: EditCardDialogProps) {
    const dialogRef = useRef(null);
    const [newContent, setNewContent] = useState(card.content || "");
    const updateCardTitleMutation = useUpdateCardTitleMutation(card.boardId);
    const [isEditingContent, setIsEditingContent] = useState(false);
    const updateCardContentMutation = useUpdateCardContentMutation(card.boardId);
    const removeLabelFromCardMutation = useRemoveLabelFromCardMutation(card.boardId);

    useEffect(() => {
        setIsEditingContent(false);
        setNewContent(card.content || "");
    }, [card]);

    const updateCardTitleHandler = (newTitle: string) => {
        updateCardTitleMutation.mutate({ data: { id: card.id, title: newTitle } });
    }

    const updateCardContentHandler = (newContent: string) => {
        if (newContent === card.content) {
            setIsEditingContent(false);
            return;
        }
        updateCardContentMutation.mutate({ data: { id: card.id, content: newContent } }, {
            onSuccess: () => setIsEditingContent(false),
        });
    }

    const removeSelectedLabel = (labelId: number) => {
        removeLabelFromCardMutation.mutate({ data: { cardId: card.id, labelId } });
    };

    useOnClickOutside(dialogRef, () => setIsEditingContent(false));

    return (
        <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="w-[500px] max-h-[80vh] overflow-y-auto" ref={dialogRef}>
                <DialogHeader>
                    <DialogTitle>Edit Card</DialogTitle>
                    <DialogDescription>
                        Update the card details, content, and manage labels.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <EditableText
                            fieldName="title"
                            buttonClass="text-xl px-2"
                            inputClass="w-full rounded-md py-2 px-2 text-xl"
                            onChange={(value) => updateCardTitleHandler(value)}
                            value={(updateCardTitleMutation.isPending && updateCardTitleMutation.variables.data.title) ?
                                updateCardTitleMutation.variables.data.title : card.title
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="content">Description</Label>
                        {isEditingContent ?
                            <div>
                                <Textarea
                                    id="content"
                                    className="min-h-[180px]"
                                    defaultValue={card.content || ""}
                                    placeholder="Enter card description..."
                                    onChange={(ev) => setNewContent(ev.target.value)}
                                />
                                <div className="flex gap-2 mt-2">
                                    <Button variant="outline" onClick={() => setIsEditingContent(false)} disabled={updateCardContentMutation.isPending}>
                                        Cancel
                                    </Button>
                                    <Button onClick={() => updateCardContentHandler(newContent)} disabled={updateCardContentMutation.isPending}>
                                        {updateCardContentMutation.isPending && <LoaderCircle className="animate-spin"/>} Save
                                    </Button>
                                </div>
                            </div>
                            :
                            <Textarea
                                style={{ resize: "none" }}
                                defaultValue={card.content || ""}
                                placeholder="Add a description to this card..."
                                onClick={() => setIsEditingContent(!isEditingContent)}
                                className="min-h-[70px] max-h-[300px] text-sm text-muted-foreground hover:bg-muted/50 cursor-pointer"
                            />
                        }
                    </div>
                    <div className="space-y-2">
                        <Label>Labels</Label>
                        <div className="flex items-center gap-2 min-h-[40px] p-2 border rounded-md">
                            <div className="flex flex-wrap gap-2 flex-1">
                                {card.labels.length === 0 ?
                                    <span className="text-sm text-muted-foreground">
                                        No labels assigned.
                                    </span>
                                    :
                                    card.labels.map((label) =>
                                        <Badge
                                            key={label.id}
                                            className="flex items-center gap-2"
                                            style={{ backgroundColor: label.color, color: "black" }}
                                        >
                                            {label.name}
                                            <div onClick={() => removeSelectedLabel(label.id)}>
                                                <X className="size-3 cursor-pointer hover:bg-black/20 rounded"/>
                                            </div>
                                        </Badge>
                                    )
                                }
                            </div>
                            <LabelManagerPopover card={card}/>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
