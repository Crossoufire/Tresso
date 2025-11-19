import {ArrowLeft, LogOut} from "lucide-react";
import authClient from "~/lib/utils/auth-client";
import {CardType, ColumnType} from "~/lib/types/types";
import {Card} from "~/lib/client/components/board/Card";
import {Button} from "~/lib/client/components/ui/button";
import {Column} from "~/lib/client/components/board/Column";
import {arrayMove, SortableContext} from "@dnd-kit/sortable";
import {NewColumn} from "~/lib/client/components/board/NewColumn";
import React, {useCallback, useRef, useState} from "react";
import {useQueryClient, useSuspenseQuery} from "@tanstack/react-query";
import {EditableText} from "~/lib/client/components/board/EditableText";
import {useUpdateBoardMutation} from "~/lib/client/react-query/mutations";
import {createFileRoute, Link, useNavigate, useRouter} from "@tanstack/react-router";
import {useHorizontalDragScroll} from "~/lib/client/hooks/use-horizontal-drag-scroll";
import {authOptions, boardDetailsOptions} from "~/lib/client/react-query/query-options";
import {DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent, PointerSensor, TouchSensor, useSensor, useSensors} from "@dnd-kit/core";


export const Route = createFileRoute("/_private/board/$boardId")({
    params: { parse: ({ boardId }) => ({ boardId: Number(boardId) }) },
    loader: ({ context: { queryClient }, params: { boardId } }) => {
        return queryClient.ensureQueryData(boardDetailsOptions(boardId));
    },
    component: BoardPage,
});


function BoardPage() {
    const router = useRouter();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { boardId } = Route.useParams();
    const newColumnAddedRef = useRef(false);
    const boardNameEditState = useState(false);
    const updateBoardMutation = useUpdateBoardMutation();
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const boardData = useSuspenseQuery(boardDetailsOptions(boardId)).data;
    const [columns, setColumns] = useState<ColumnType[]>(boardData.columns);
    const horizontalDragScroll = useHorizontalDragScroll(scrollContainerRef);
    const [activeCard, setActiveCard] = useState<CardType | null>(null);
    const [activeColumn, setActiveColumn] = useState<ColumnType | null>(null);

    const sensors = useSensors(
        useSensor(TouchSensor, { activationConstraint: { distance: 10 } }),
        useSensor(PointerSensor, { activationConstraint: { distance: 10 } }),
    );

    // useEffect(() => {
    //     // eslint-disable-next-line react-hooks/set-state-in-effect
    //     setColumns(boardData.columns);
    // }, [boardData.columns]);

    const changeBoardNameHandler = (newName: string) => {
        updateBoardMutation.mutate({ data: { id: boardData.id, name: newName } });
    };

    const handleLogout = async () => {
        await authClient.signOut();
        await router.invalidate();
        queryClient.setQueryData(authOptions.queryKey, null);
        await navigate({ to: "/", replace: true });
        queryClient.removeQueries();
    }

    const onDragStartHandler = (ev: DragStartEvent) => {
        if (ev.active.data.current?.type === "column") {
            setActiveColumn(ev.active.data.current.column);
        }

        if (ev.active.data.current?.type === "card") {
            setActiveCard(ev.active.data.current.card);
        }
    }

    const onDragOverHandler = (ev: DragOverEvent) => {
        const { active, over } = ev;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;
        if (activeId === overId) return;

        const isOverCard = over.data.current?.type === "card";
        const isActiveCard = active.data.current?.type === "card";

        if (!isActiveCard) return;

        const findColumn = (id: string | number) => {
            const idNum = Number(id);
            if (columns.some((col) => col.id === idNum)) {
                return columns.find((col) => col.id === idNum);
            }
            return columns.find((col) => col.cards.some((card) => card.id === idNum));
        };

        const overColumn = findColumn(Number((overId as string).split("-").pop()));
        const activeColumn = findColumn(Number((activeId as string).split("-").pop()));
        if (!activeColumn || !overColumn) return;

        // Moving Card to diff Column
        if (activeColumn.id !== overColumn.id) {
            setColumns((prev) => {
                const overColIdx = prev.findIndex((col) => col.id === overColumn.id);
                const activeColIdx = prev.findIndex((col) => col.id === activeColumn.id);
                if (activeColIdx === -1 || overColIdx === -1) return prev;

                const overCol = prev[overColIdx];
                const activeCol = prev[activeColIdx];

                // Find index of the card in the CURRENT state
                const activeCardId = Number((activeId as string).split("-").pop());
                const activeCardIdx = activeCol.cards.findIndex((c) => c.id === activeCardId);
                if (activeCardIdx === -1) return prev;

                const newActiveCards = [...activeCol.cards];
                const [movedCard] = newActiveCards.splice(activeCardIdx, 1);

                movedCard.columnId = overCol.id;
                const newOverCards = [...overCol.cards];

                if (isOverCard) {
                    const overCardId = Number((overId as string).split("-").pop());
                    const overCardIdx = overCol.cards.findIndex((c) => c.id === overCardId);

                    const isBelowOverItem = over && active.rect.current.translated && active.rect.current.translated.top > over.rect.top + over.rect.height;
                    const modifier = isBelowOverItem ? 1 : 0;
                    const newIndex = overCardIdx >= 0 ? overCardIdx + modifier : newOverCards.length + 1;

                    newOverCards.splice(newIndex, 0, movedCard);
                }
                else {
                    newOverCards.push(movedCard);
                }

                const newColumns = [...prev];
                newColumns[activeColIdx] = { ...activeCol, cards: newActiveCards };
                newColumns[overColIdx] = { ...overCol, cards: newOverCards };

                return newColumns;
            });
        }
        // Moving Card inside same Column
        else if (activeColumn.id === overColumn.id && isOverCard) {
            const overCardId = Number((overId as string).split("-").pop());
            const activeCardId = Number((activeId as string).split("-").pop());

            const overIndex = activeColumn.cards.findIndex((col) => col.id === overCardId);
            const activeIndex = activeColumn.cards.findIndex((col) => col.id === activeCardId);

            if (activeIndex !== overIndex) {
                setColumns((prev) => {
                    const colIdx = prev.findIndex((col) => col.id === activeColumn.id);
                    const col = prev[colIdx];

                    const newCards = arrayMove(col.cards, activeIndex, overIndex);

                    const newColumns = [...prev];
                    newColumns[colIdx] = { ...col, cards: newCards };

                    return newColumns;
                });
            }
        }
    }

    const onDragEndHandler = (ev: DragEndEvent) => {
        setActiveCard(null);
        setActiveColumn(null);

        const { active, over } = ev;
        if (!over) return;
        if (active.id === over.id) return;

        const isActiveColumn = active.data.current?.type === "column";
        const isActiveCard = active.data.current?.type === "card";

        if (isActiveColumn) {
            const activeColId = Number((active.id as string).split("-").pop());
            const overColId = Number((over.id as string).split("-").pop());

            setColumns((prev) => {
                const activeIndex = prev.findIndex((col) => col.id === activeColId);
                const overIndex = prev.findIndex((col) => col.id === overColId);
                return arrayMove(prev, activeIndex, overIndex);
            });
            // TODO: Call mutation to save Column Order
        }

        if (isActiveCard) {
            // TODO: Call mutation to save final state
        }
    };

    const scrollToEnd = useCallback(() => {
        if (!scrollContainerRef.current) return;
        scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
    }, []);

    const columnRef = useCallback(() => {
        if (!scrollContainerRef.current || !newColumnAddedRef.current) return;

        scrollToEnd();
        newColumnAddedRef.current = false;
    }, [scrollToEnd]);

    return (
        <div className="flex flex-col h-screen">
            <title>{`${boardData.name} - Tresso`}</title>

            <header className="flex items-center justify-between p-4 border-b  backdrop-blur-sm flex-shrink-0">
                <div className="flex items-center gap-4">
                    <Button size="sm" variant="ghost" asChild={true}>
                        <Link to="/boards">
                            <ArrowLeft className="size-4 mr-1"/> All Boards
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold">
                        <EditableText
                            fieldName="name"
                            buttonClass="text-2xl"
                            editState={boardNameEditState}
                            onChange={changeBoardNameHandler}
                            inputClass="text-2xl font-medium rounded-md py-0.5 px-4 focus:outline-none focus:ring-2 focus:ring-gray-800"
                            value={(updateBoardMutation.isPending && updateBoardMutation.variables.data.name) ?
                                updateBoardMutation.variables.data.name : boardData.name}
                        />
                    </h1>
                </div>
                <Button size="sm" variant="ghost" onClick={handleLogout}>
                    <LogOut className="size-4 mr-2"/> Logout
                </Button>
            </header>

            <DndContext
                sensors={sensors}
                onDragEnd={onDragEndHandler}
                onDragOver={onDragOverHandler}
                onDragStart={onDragStartHandler}
            >
                <div ref={scrollContainerRef} className="flex-grow min-h-0 flex flex-col overflow-x-auto">
                    <div {...horizontalDragScroll} className="flex flex-grow min-h-0 h-full pl-2 pb-4 mt-4 w-fit">
                        <SortableContext items={columns.map((col) => `col-${col.id}`)}>
                            {columns.map((col) =>
                                <Column
                                    col={col}
                                    ref={columnRef}
                                    key={`col-${col.id}`}
                                />
                            )}
                        </SortableContext>
                        <NewColumn
                            boardId={boardData.id}
                            onExpand={scrollToEnd}
                            editInitially={columns.length === 0}
                            onNewColumnAdded={() => (newColumnAddedRef.current = true)}
                        />
                        <div className="w-8 h-1"/>
                    </div>
                </div>
                <DragOverlay>
                    {activeColumn &&
                        <Column
                            ref={columnRef}
                            col={activeColumn}
                        />
                    }
                    {activeCard &&
                        <Card card={activeCard}/>
                    }
                </DragOverlay>
            </DndContext>

            <div className="-z-1 absolute top-2/5 left-35 w-28 h-28 bg-blue-500/20 rounded-full blur-xl"></div>
            <div className="-z-1 absolute top-40 right-20 w-32 h-32 bg-purple-500/20 rounded-full blur-xl"></div>
            <div className="-z-1 absolute bottom-20 left-2/3 w-24 h-24 bg-pink-500/20 rounded-full blur-xl"></div>
        </div>
    );
}
