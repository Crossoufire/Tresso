import {toast} from "sonner";
import {cn} from "~/lib/utils/utils";
import React, {Ref, useState} from "react";
import {Badge} from "~/lib/client/components/ui/badge";
import {Button} from "~/lib/client/components/ui/button";
import {EditCardDialog} from "~/lib/client/components/edit-card/EditCardDialog";
import {ArrowDown, ArrowUp, MessageSquareMore, MoreVertical} from "lucide-react";
import {CardTransferType, CardType, ColumnWithCards, CONTENT_TYPES} from "~/lib/types/types";
import {useDeleteCardMutation, useUpdateCardOrderMutation} from "~/lib/client/react-query/mutations";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger
} from "~/lib/client/components/ui/dropdown-menu";


interface CardProps {
    card: CardType,
    columnId: number;
    nextOrder: number;
    nextNextOrder: number;
    previousOrder: number;
    nextCardOrder?: number;
    ref: Ref<HTMLLIElement>;
    columns: ColumnWithCards[];
    previousCardOrder?: number;
    previousPreviousOrder: number;
}


export const Card = (props: CardProps) => {
    const { card, columns, columnId, nextOrder, nextCardOrder, nextNextOrder, previousOrder, previousCardOrder, previousPreviousOrder, ref } = props;

    const deleteCardMutation = useDeleteCardMutation(card.boardId);
    const updateCardOrderMutation = useUpdateCardOrderMutation(card.boardId);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const isPending = updateCardOrderMutation.isPending || deleteCardMutation.isPending;
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

    const openEditDialog = () => {
        setIsEditDialogOpen(true);
    };

    const stopCardClick = (ev: React.SyntheticEvent) => {
        ev.stopPropagation();
    };

    const moveCard = (order: number, targetColumnId = columnId) => {
        updateCardOrderMutation.mutate({
            data: {
                order,
                id: card.id,
                columnId: targetColumnId,
            }
        });
    };

    const onMoveUpHandler = () => {
        if (previousCardOrder === undefined) return;
        moveCard((previousPreviousOrder + previousCardOrder) / 2);
    };

    const onMoveDownHandler = () => {
        if (nextCardOrder === undefined) return;
        moveCard((nextCardOrder + nextNextOrder) / 2);
    };

    const onMoveToColHandler = (targetColumn: ColumnWithCards) => {
        const sortedTargetCards = [...targetColumn.cards].sort((a, b) => a.order - b.order);
        const lastOrder = sortedTargetCards[sortedTargetCards.length - 1]?.order ?? 0;
        moveCard(lastOrder + 1, targetColumn.id);
    };

    const onDeleteHandler = () => {
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
                                onPointerDown={(ev) => ev.stopPropagation()}
                                className="absolute top-1 right-0.5 opacity-60 hover:opacity-80 has-[>svg]:px-1.5"
                                onClick={(ev) => ev.stopPropagation()}
                            >
                                <MoreVertical className="size-4"/>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" onClick={stopCardClick} onPointerDown={stopCardClick}>
                            <DropdownMenuItem disabled={isPending} onSelect={openEditDialog}>
                                Edit Card
                            </DropdownMenuItem>
                            <DropdownMenuSeparator/>
                            <DropdownMenuItem onSelect={onMoveUpHandler} disabled={isPending || previousCardOrder === undefined}>
                                <ArrowUp className="size-4"/> Move Up
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={onMoveDownHandler} disabled={isPending || nextCardOrder === undefined}>
                                <ArrowDown className="size-4"/> Move Down
                            </DropdownMenuItem>
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger disabled={isPending || columns.length <= 1}>
                                    Move to column
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent className="max-w-64" onClick={stopCardClick} onPointerDown={stopCardClick}>
                                    {columns
                                        .filter((targetColumn) => targetColumn.id !== columnId)
                                        .map((targetColumn) =>
                                            <DropdownMenuItem key={targetColumn.id} onSelect={() => onMoveToColHandler(targetColumn)}>
                                                <span className="truncate">{targetColumn.name}</span>
                                            </DropdownMenuItem>
                                        )
                                    }
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>
                            <DropdownMenuSeparator/>
                            <DropdownMenuItem
                                disabled={isPending}
                                onSelect={onDeleteHandler}
                                className="text-destructive focus:text-destructive cursor-pointer"
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
