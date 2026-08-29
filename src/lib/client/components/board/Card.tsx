import {toast} from "sonner";
import {cn} from "~/lib/utils/utils";
import React, {Ref, useState} from "react";
import {Badge} from "~/lib/client/components/ui/badge";
import {Button} from "~/lib/client/components/ui/button";
import {EditCardDialog} from "~/lib/client/components/edit-card/EditCardDialog";
import {CardTransferType, CardType, ColumnWithCards, CONTENT_TYPES} from "~/lib/types/types";
import {useDeleteCardMutation, useMoveCardMutation} from "~/lib/client/react-query/mutations";
import {ArrowDown, ArrowDownToLine, ArrowUp, ArrowUpToLine, MessageSquareMore, MoreVertical} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
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
    nextCardId?: number;
    ref: Ref<HTMLLIElement>;
    previousCardId?: number;
    columns: ColumnWithCards[];
}


export const Card = ({ card, columns, columnId, nextCardId, previousCardId, ref }: CardProps) => {
    const moveCardMutation = useMoveCardMutation(card.boardId);
    const deleteCardMutation = useDeleteCardMutation(card.boardId);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const isPending = moveCardMutation.isPending || deleteCardMutation.isPending;
    const [acceptDrop, setAcceptDrop] = useState<"none" | "top" | "bottom">("none");

    const onDropHandler = (ev: React.DragEvent) => {
        ev.stopPropagation();

        const transfer = JSON.parse(ev.dataTransfer.getData(CONTENT_TYPES.card) || "null") as CardTransferType;
        if (!transfer || acceptDrop === "none") return;

        moveCardMutation.mutate({
            data: {
                columnId,
                id: transfer.id,
                targetCardId: card.id,
                placement: acceptDrop === "top" ? "before" : "after",
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

    const moveCard = (placement: "start" | "end", targetColumnId = columnId) => {
        moveCardMutation.mutate({
            data: {
                placement,
                id: card.id,
                columnId: targetColumnId,
            }
        });
    };

    const onMoveUpHandler = () => {
        if (previousCardId === undefined) return;
        moveCardMutation.mutate({
            data: {
                columnId,
                id: card.id,
                placement: "before",
                targetCardId: previousCardId,
            },
        });
    };

    const onMoveDownHandler = () => {
        if (nextCardId === undefined) return;
        moveCardMutation.mutate({
            data: {
                columnId,
                id: card.id,
                placement: "after",
                targetCardId: nextCardId,
            },
        });
    };

    const onMoveToColHandler = (targetColumn: ColumnWithCards) => {
        moveCard("start", targetColumn.id);
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
                    role="button"
                    draggable={!isPending}
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
                                onClick={(ev) => ev.stopPropagation()}
                                onPointerDown={(ev) => ev.stopPropagation()}
                                className="absolute top-1 right-0.5 opacity-60 hover:opacity-80 has-[>svg]:px-1.5"
                            >
                                <MoreVertical className="size-4"/>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" onClick={stopCardClick} onPointerDown={stopCardClick}>
                            <DropdownMenuGroup>
                                <DropdownMenuItem disabled={isPending} onSelect={openEditDialog}>
                                    Edit Card
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator/>
                            <DropdownMenuGroup>
                                <DropdownMenuItem
                                    onSelect={() => moveCard("start")}
                                    disabled={isPending || previousCardId === undefined}
                                >
                                    <ArrowUpToLine/> Move to Top
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={onMoveUpHandler} disabled={isPending || previousCardId === undefined}>
                                    <ArrowUp/> Move Up
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={onMoveDownHandler} disabled={isPending || nextCardId === undefined}>
                                    <ArrowDown/> Move Down
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onSelect={() => moveCard("end")}
                                    disabled={isPending || nextCardId === undefined}
                                >
                                    <ArrowDownToLine/> Move to Bottom
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger disabled={isPending || columns.length <= 1}>
                                    Move to column
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent className="max-w-64" onClick={stopCardClick} onPointerDown={stopCardClick}>
                                    <DropdownMenuGroup>
                                        {columns
                                            .filter((targetColumn) => targetColumn.id !== columnId)
                                            .map((targetColumn) =>
                                                <DropdownMenuItem key={targetColumn.id} onSelect={() => onMoveToColHandler(targetColumn)}>
                                                    <span className="truncate">{targetColumn.name}</span>
                                                </DropdownMenuItem>
                                            )
                                        }
                                    </DropdownMenuGroup>
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>
                            <DropdownMenuSeparator/>
                            <DropdownMenuGroup>
                                <DropdownMenuItem
                                    disabled={isPending}
                                    onSelect={onDeleteHandler}
                                    className="text-destructive focus:text-destructive cursor-pointer"
                                >
                                    Delete Card
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
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
