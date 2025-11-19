import {toast} from "sonner";
import {flushSync} from "react-dom";
import {CSS} from "@dnd-kit/utilities";
import {ColumnType} from "~/lib/types/types";
import {MoreHorizontal, Plus} from "lucide-react";
import {Card} from "~/lib/client/components/board/Card";
import {Button} from "~/lib/client/components/ui/button";
import {NewCard} from "~/lib/client/components/board/NewCard";
import {SortableContext, useSortable} from "@dnd-kit/sortable";
import React, {useCallback, useEffect, useRef, useState} from "react";
import {EditableText} from "~/lib/client/components/board/EditableText";
import {useDeleteColumnMutation, useUpdateColumnMutation} from "~/lib/client/react-query/mutations";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "~/lib/client/components/ui/dropdown-menu";


interface ColumnProps {
    col: ColumnType;
    ref: React.Ref<HTMLDivElement>;
}


export const Column = ({ col, ref }: ColumnProps) => {
    const didMountRef = useRef(false);
    const colNameEditState = useState(false);
    const deleteColumnMutation = useDeleteColumnMutation();
    const cardContainerRef = useRef<HTMLDivElement>(null!);
    const [newCardEdit, setNewCardEdit] = useState(false);
    const updateColumnMutation = useUpdateColumnMutation(col.boardId);
    const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
        id: `col-${col.id}`,
        data: { type: "column", column: col },
        disabled: colNameEditState[0] || updateColumnMutation.isPending,
    });

    useEffect(() => {
        didMountRef.current = true;
    }, []);

    const style = {
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 999 : undefined,
        transform: CSS.Transform.toString(transform),
    }

    const cardRef = useCallback((node: HTMLElement | null) => {
        if (!didMountRef.current || !node) return;
        node.scrollIntoView({ block: "center" });
    }, []);

    const onChangeColName = (newName: string) => {
        updateColumnMutation.mutate({
            data: {
                id: col.id,
                name: newName,
                boardId: col.boardId,
            }
        })
    }

    const onAddCardClickHandler = () => {
        flushSync(() => setNewCardEdit(true));
        cardContainerRef.current.scrollTop = cardContainerRef.current.scrollHeight;
    }

    const onDeleteHandler = () => {
        if (!window.confirm("Are you sure? All the associated cards will also be deleted!")) return;
        deleteColumnMutation.mutate({ data: { id: col.id, boardId: col.boardId } }, {
            onSuccess: () => toast.success("Column successfully deleted"),
        })
    }

    return (
        <div
            style={style}
            ref={(node) => {
                setNodeRef(node);
                if (typeof ref === "function") ref(node);
            }}
            className="-mr-[2px] last:mr-0 px-2 flex-shrink-0 flex flex-col max-h-full"
        >
            <div
                {...listeners}
                {...attributes}
                // TODO: check if can remove it, for now need it when moving cols without moving horizontally
                draggable={!colNameEditState[0] && !deleteColumnMutation.isPending}
                className="flex-shrink-0 flex flex-col max-h-full w-80 rounded-md group bg-gray-800 relative"
            >
                <div className="p-2 flex justify-between">
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
                            >
                                <MoreHorizontal className="size-4"/>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onSelect={onDeleteHandler}
                                disabled={deleteColumnMutation.isPending}
                                className="text-destructive focus:text-destructive cursor-pointer"
                            >
                                Delete Column
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div ref={cardContainerRef} className="flex flex-grow flex-col gap-3 p-2 overflow-x-hidden overflow-y-auto">
                    <SortableContext items={col.cards.map((card) => `card-${card.id}`)}>
                        {col.cards.map((card) =>
                            <Card
                                card={card}
                                ref={cardRef}
                                key={`card-${card.id}`}
                            />
                        )}
                    </SortableContext>
                </div>
                {newCardEdit ?
                    <NewCard
                        columnId={col.id}
                        boardId={col.boardId}
                        onComplete={() => setNewCardEdit(false)}
                        nextOrder={col.cards.length === 0 ? 1 : col.cards[col.cards.length - 1].order + 1}
                    />
                    :
                    <div className="p-3">
                        <Button onClick={onAddCardClickHandler} disabled={deleteColumnMutation.isPending}>
                            <Plus/> Add Card
                        </Button>
                    </div>
                }
            </div>
        </div>
    );
}
