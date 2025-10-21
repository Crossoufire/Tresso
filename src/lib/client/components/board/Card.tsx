import {toast} from "sonner";
import {Badge} from "~/lib/client/components/ui/badge";
import {Button} from "~/lib/client/components/ui/button";
import React, {DragEvent, useState} from "react";
import {CardType, CONTENT_TYPES} from "~/lib/types/types";
import {MessageSquareCode, MoreHorizontal} from "lucide-react";
import {EditCardDialog} from "~/lib/client/components/edit-card/EditCardDialog";
import {useDeleteCardMutation, useUpdateCardOrderMutation} from "~/lib/client/react-query/mutations";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "~/lib/client/components/ui/dropdown-menu";


interface CardProps {
    card: CardType,
    columnId: number;
    nextOrder: number;
    previousOrder: number;
    ref: React.Ref<HTMLLIElement>;
}


export const Card = ({ card, columnId, nextOrder, previousOrder, ref }: CardProps) => {
    const deleteCardMutation = useDeleteCardMutation(card.boardId);
    const updateCardOrderMutation = useUpdateCardOrderMutation(card.boardId);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [acceptDrop, setAcceptDrop] = useState<"none" | "top" | "bottom">("none");

    const onDragOverHandler = (ev: DragEvent<HTMLLIElement>) => {
        if (ev.dataTransfer.types.includes(CONTENT_TYPES.card)) {
            ev.preventDefault();
            ev.stopPropagation();
            const rect = ev.currentTarget.getBoundingClientRect();
            const midpoint = (rect.top + rect.bottom) / 2;
            setAcceptDrop(ev.clientY <= midpoint ? "top" : "bottom");
        }
    };

    const onDropHandler = (ev: DragEvent<HTMLLIElement>) => {
        ev.stopPropagation();

        const transfer = JSON.parse(ev.dataTransfer.getData(CONTENT_TYPES.card) || "null");
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

    const onDragStartHandler = (ev: DragEvent<HTMLDivElement>) => {
        ev.dataTransfer.effectAllowed = "move";
        ev.dataTransfer.setData(CONTENT_TYPES.card, JSON.stringify({ id: card.id, title: card.title }));
        ev.stopPropagation();
    };

    const openEditDialog = (ev: any) => {
        ev.stopPropagation();
        setIsEditDialogOpen(true);
    };

    const onDeleteHandler = (ev: any) => {
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
                className={
                    "border-t-2 border-b-2 -mb-[2px] last:mb-0 px-2 py-1 " +
                    (acceptDrop === "top" ? "border-t-red-800 border-b-transparent" : acceptDrop === "bottom"
                        ? "border-b-red-800 border-t-transparent" : "border-t-transparent border-b-transparent")
                }
            >
                <div
                    draggable
                    onClick={openEditDialog}
                    onDragStart={onDragStartHandler}
                    className="bg-card cursor-pointer text-sm rounded-md px-3 py-2 relative group min-h-[60px]"
                >
                    {card.labels.length > 0 &&
                        <div className="flex flex-wrap gap-1 mb-3">
                            {card.labels.map((label) =>
                                <Badge key={label.id} style={{ backgroundColor: label.color }} className="py-0">
                                    {label.name}
                                </Badge>
                            )}
                        </div>
                    }
                    <h3>{card.title}</h3>
                    {card.content && <MessageSquareCode className="mt-2 size-3 opacity-60"/>}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                size="sm"
                                variant="ghost"
                                title="Card options"
                                className="absolute top-1 right-1 opacity-60 hover:opacity-80"
                            >
                                <MoreHorizontal className="size-4"/>
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
