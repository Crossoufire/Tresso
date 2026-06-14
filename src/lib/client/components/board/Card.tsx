import {toast} from "sonner";
import {cn} from "~/lib/utils/utils";
import React, {Ref, useState} from "react";
import {Badge} from "~/lib/client/components/ui/badge";
import {Button} from "~/lib/client/components/ui/button";
import {MessageSquareMore, MoreVertical} from "lucide-react";
import {CardTransferType, CardType, CONTENT_TYPES} from "~/lib/types/types";
import {EditCardDialog} from "~/lib/client/components/edit-card/EditCardDialog";
import {useDeleteCardMutation, useUpdateCardOrderMutation} from "~/lib/client/react-query/mutations";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "~/lib/client/components/ui/dropdown-menu";


interface CardProps {
    card: CardType,
    columnId: number;
    nextOrder: number;
    previousOrder: number;
    ref: Ref<HTMLLIElement>;
}


export const Card = ({ card, columnId, nextOrder, previousOrder, ref }: CardProps) => {
    const deleteCardMutation = useDeleteCardMutation(card.boardId);
    const updateCardOrderMutation = useUpdateCardOrderMutation(card.boardId);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [acceptDrop, setAcceptDrop] = useState<"none" | "top" | "bottom">("none");

    const onDropHandler = (ev: React.DragEvent) => {
        ev.stopPropagation();

        const transfer = JSON.parse(ev.dataTransfer.getData(CONTENT_TYPES.card) || "null") as CardTransferType;
        if (!transfer) return;

        const droppedOrder = (acceptDrop === "top") ? previousOrder : nextOrder;
        const moveOrder = (droppedOrder + card.order) / 2;

        updateCardOrderMutation.mutate({
            data: {
                id: transfer.id,
                order: moveOrder,
                columnId: columnId,
            }
        });

        setAcceptDrop("none");
    };

    const onDragOverHandler = (ev: React.DragEvent) => {
        if (!ev.dataTransfer.types.includes(CONTENT_TYPES.card)) return;

        ev.preventDefault();
        ev.stopPropagation();
        const rect = ev.currentTarget.getBoundingClientRect();
        const midpoint = (rect.top + rect.bottom) / 2;
        setAcceptDrop(ev.clientY <= midpoint ? "top" : "bottom");
    };

    const onDragStartHandler = (ev: React.DragEvent) => {
        ev.dataTransfer.effectAllowed = "move";

        const data: CardTransferType = { id: card.id, title: card.title };
        ev.dataTransfer.setData(CONTENT_TYPES.card, JSON.stringify(data));
        ev.stopPropagation();
    };

    const openEditDialog = (ev: React.MouseEvent) => {
        ev.stopPropagation();
        setIsEditDialogOpen(true);
    };

    const onDeleteHandler = (ev: React.MouseEvent) => {
        ev.stopPropagation();
        if (!window.confirm("Are you sure to delete this card?")) return;

        deleteCardMutation.mutate({ data: { id: card.id } }, {
            onSuccess: () => toast.success("Card successfully deleted"),
        });
    };

    return (
        <>
            <li
                ref={ref}
                onDrop={onDropHandler}
                onDragOver={onDragOverHandler}
                onDragLeave={() => setAcceptDrop("none")}
                className={cn("border-t-2 border-b-2 border-t-transparent border-b-transparent -mb-0.5 last:mb-0 px-2 py-1",
                    acceptDrop === "top" ? "border-t-cyan-700 border-b-transparent" :
                        acceptDrop === "bottom" ? "border-b-cyan-700 border-t-transparent" : ""
                )}
            >
                <div
                    draggable
                    role="button"
                    onClick={openEditDialog}
                    onDragStart={onDragStartHandler}
                    className="bg-card cursor-pointer text-sm rounded-md px-3 py-2 relative group min-h-15"
                >
                    <div className="pr-5 flex flex-col h-full">
                        {card.labels.length > 0 &&
                            <div className="flex flex-wrap gap-1 mb-2">
                                {card.labels.map((label) =>
                                    <Badge key={label.id} style={{ backgroundColor: label.color }} className="py-0">
                                        {label.name}
                                    </Badge>
                                )}
                            </div>
                        }
                        <h3 className="my-0 whitespace-pre-wrap wrap-break-word">
                            {card.title}
                        </h3>
                        <div className="grow flex items-end mt-auto">
                            {card.content && <MessageSquareMore className="size-4 opacity-70 mt-2"/>}
                        </div>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                size="sm"
                                variant="ghost"
                                title="Card options"
                                className="absolute top-1 right-0.5 opacity-60 hover:opacity-80 has-[>svg]:px-1.5"
                            >
                                <MoreVertical className="size-4"/>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={openEditDialog}
                                disabled={updateCardOrderMutation.isPending || deleteCardMutation.isPending}
                            >
                                Edit Card
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={onDeleteHandler}
                                className="text-destructive focus:text-destructive cursor-pointer"
                                disabled={deleteCardMutation.isPending || updateCardOrderMutation.isPending}
                            >
                                Delete Card
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </li>
            <EditCardDialog
                card={card}
                isDialogOpen={isEditDialogOpen}
                setDialogOpen={setIsEditDialogOpen}
            />
        </>
    );
}
