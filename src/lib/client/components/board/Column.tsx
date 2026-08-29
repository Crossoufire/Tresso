import {toast} from "sonner";
import {flushSync} from "react-dom";
import {cn} from "~/lib/utils/utils";
import {Card} from "~/lib/client/components/board/Card";
import {Button} from "~/lib/client/components/ui/button";
import {NewCard} from "~/lib/client/components/board/NewCard";
import {EditableText} from "~/lib/client/components/board/EditableText";
import {ArrowLeft, ArrowRight, MoreHorizontal, Plus} from "lucide-react";
import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {CardTransferType, ColTransferType, ColumnWithCards, CONTENT_TYPES} from "~/lib/types/types";
import {useDeleteColumnMutation, useUpdateCardOrderMutation, useUpdateColumnMutation} from "~/lib/client/react-query/mutations";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger} from "~/lib/client/components/ui/dropdown-menu";


interface ColumnProps {
    nextOrder: number;
    col: ColumnWithCards;
    nextNextOrder: number;
    previousOrder: number;
    nextColumnOrder?: number;
    columns: ColumnWithCards[];
    previousColumnOrder?: number;
    previousPreviousOrder: number;
    ref: React.Ref<HTMLDivElement>;
}


export const Column = (props: ColumnProps) => {
    const { ref, col, columns, previousOrder, previousColumnOrder, previousPreviousOrder, nextOrder, nextColumnOrder, nextNextOrder } = props;

    const didMountRef = useRef(false);
    const listRef = useRef<HTMLUListElement>(null!);
    const colNameEditState = useState(false);
    const deleteColumnMutation = useDeleteColumnMutation();
    const [newCardEdit, setNewCardEdit] = useState(false);
    const updateColumnMutation = useUpdateColumnMutation(col.boardId);
    const [acceptCardDrop, setAcceptCardDrop] = useState(false);
    const updateCardOrderMutation = useUpdateCardOrderMutation(col.boardId);
    const isColumnPending = updateColumnMutation.isPending || deleteColumnMutation.isPending;
    const [acceptColDrop, setAcceptColDrop] = useState<"none" | "left" | "right">("none");

    useEffect(() => {
        didMountRef.current = true;
    }, []);

    const cardRef = useCallback((node: HTMLElement | null) => {
        if (!didMountRef.current || !node) return;
        node.scrollIntoView({ block: "center" });
    }, []);

    const sortedCards = useMemo(() => {
        return [...col.cards].sort((a, b) => a.order - b.order);
    }, [col.cards]);

    const onDropHandler = (ev: React.DragEvent) => {
        const transfer = JSON.parse(ev.dataTransfer.getData(CONTENT_TYPES.column) || "null") as ColTransferType;
        if (!transfer) return;

        const droppedOrder = (acceptColDrop === "left") ? previousOrder : nextOrder;
        const moveOrder = (droppedOrder + col.order) / 2;

        updateColumnMutation.mutate({
            data: {
                id: transfer.id,
                order: moveOrder,
                boardId: col.boardId,
            }
        })

        setAcceptColDrop("none");
    }

    const onDragOverHandler = (ev: React.DragEvent) => {
        if (!ev.dataTransfer.types.includes(CONTENT_TYPES.column)) return;

        ev.preventDefault();
        ev.stopPropagation();
        const rect = ev.currentTarget.getBoundingClientRect();
        const midpoint = (rect.left + rect.right) / 2;
        setAcceptColDrop(ev.clientX <= midpoint ? "left" : "right");
    }

    const onDragStartHandler = (ev: React.DragEvent) => {
        ev.dataTransfer.effectAllowed = "move";
        const data: ColTransferType = { id: col.id, name: col.name };
        ev.dataTransfer.setData(CONTENT_TYPES.column, JSON.stringify(data));
    }

    const onChangeColName = (newName: string) => {
        updateColumnMutation.mutate({
            data: {
                id: col.id,
                name: newName,
                boardId: col.boardId,
            }
        })
    }

    const moveColumn = (order: number) => {
        updateColumnMutation.mutate({
            data: {
                order,
                id: col.id,
                boardId: col.boardId,
            }
        });
    };

    const onMoveLeftHandler = () => {
        if (previousColumnOrder === undefined) return;
        moveColumn((previousPreviousOrder + previousColumnOrder) / 2);
    };

    const onMoveRightHandler = () => {
        if (nextColumnOrder === undefined) return;
        moveColumn((nextColumnOrder + nextNextOrder) / 2);
    };

    const onAddCardClickHandler = () => {
        flushSync(() => setNewCardEdit(true));
        listRef.current.scrollTop = listRef.current.scrollHeight;
    }

    const onDeleteHandler = () => {
        if (!window.confirm("Are you sure? All the associated cards will also be deleted!")) return;

        deleteColumnMutation.mutate({ data: { id: col.id, boardId: col.boardId } }, {
            onSuccess: () => toast.success("Column successfully deleted"),
        })
    }

    const cardDndProps = {
        onDragOver: (ev: React.DragEvent) => {
            if (ev.dataTransfer.types.includes(CONTENT_TYPES.card)) {
                ev.preventDefault();
                setAcceptCardDrop(true);
            }
        },
        onDrop: (ev: React.DragEvent) => {
            const transfer = JSON.parse(ev.dataTransfer.getData(CONTENT_TYPES.card) || "null") as CardTransferType;
            if (!transfer) return;

            updateCardOrderMutation.mutate({
                data: {
                    id: transfer.id,
                    columnId: col.id,
                    order: (sortedCards[0]?.order ?? 0) - 1,
                },
            })

            setAcceptCardDrop(false);
        },
        onDragLeave: () => {
            setAcceptCardDrop(false);
        },
    };

    return (
        <div
            ref={ref}
            onDrop={onDropHandler}
            onDragOver={onDragOverHandler}
            onDragLeave={() => setAcceptColDrop("none")}
            className={cn(
                "border-l-2 border-r-2 border-l-transparent border-r-transparent -mr-0.5 last:mr-0 px-2 shrink-0 flex flex-col max-h-full",
                acceptColDrop === "left"
                    ? "border-l-cyan-950 border-r-transparent"
                    : acceptColDrop === "right"
                        ? "border-r-cyan-950 border-l-transparent"
                        : "",
            )}
        >
            <div
                onDragStart={onDragStartHandler}
                {...(col.cards.length ? {} : cardDndProps)}
                draggable={!colNameEditState[0] && !deleteColumnMutation.isPending}
                className={cn(
                    "shrink-0 flex flex-col max-h-full w-80 rounded-md group bg-gray-800 relative",
                    acceptCardDrop && `outline-2 outline-cyan-900`)
                }
            >
                <div className="p-2 flex justify-between" {...(col.cards.length ? cardDndProps : {})}>
                    <EditableText
                        fieldName="name"
                        buttonClass="px-2"
                        onChange={onChangeColName}
                        editState={colNameEditState}
                        inputClass="rounded-md py-2 px-2 font-medium text-sm"
                        value={(updateColumnMutation.isPending && updateColumnMutation.variables.data.name)
                            ? updateColumnMutation.variables.data.name : col.name
                        }
                    />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="opacity-60 hover:opacity-100"
                                disabled={deleteColumnMutation.isPending}
                                onPointerDown={(ev) => ev.stopPropagation()}
                            >
                                <MoreHorizontal className="size-4"/>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={onMoveLeftHandler} disabled={isColumnPending || previousColumnOrder === undefined}>
                                <ArrowLeft className="size-4"/> Move Left
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={onMoveRightHandler} disabled={isColumnPending || nextColumnOrder === undefined}>
                                <ArrowRight className="size-4"/> Move Right
                            </DropdownMenuItem>
                            <DropdownMenuSeparator/>
                            <DropdownMenuItem
                                onSelect={onDeleteHandler}
                                disabled={isColumnPending}
                                className="text-destructive focus:text-destructive cursor-pointer"
                            >
                                Delete Column
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <ul ref={listRef} className="grow overflow-auto p-1 mr-1.5">
                    {sortedCards.map((card, idx, cards) =>
                        <Card
                            card={card}
                            ref={cardRef}
                            key={card.id}
                            columns={columns}
                            columnId={col.id}
                            firstCardOrder={cards[0].order}
                            lastCardOrder={cards[cards.length - 1].order}
                            nextCardOrder={cards[idx + 1]?.order}
                            previousCardOrder={cards[idx - 1]?.order}
                            previousOrder={cards[idx - 1] ? cards[idx - 1].order : 0}
                            previousPreviousOrder={cards[idx - 2] ? cards[idx - 2].order : 0}
                            nextOrder={cards[idx + 1] ? cards[idx + 1].order : card.order + 1}
                            nextNextOrder={cards[idx + 2] ? cards[idx + 2].order : (cards[idx + 1]?.order ?? card.order) + 1}
                        />
                    )}
                </ul>
                {newCardEdit ?
                    <NewCard
                        columnId={col.id}
                        boardId={col.boardId}
                        onComplete={() => setNewCardEdit(false)}
                        nextOrder={col.cards.length === 0 ? 1 : col.cards[col.cards.length - 1].order + 1}
                    />
                    :
                    <div className="p-3" {...(col.cards.length ? cardDndProps : {})}>
                        <Button onClick={onAddCardClickHandler} disabled={deleteColumnMutation.isPending}>
                            <Plus/> Add Card
                        </Button>
                    </div>
                }
            </div>
        </div>
    );
}
