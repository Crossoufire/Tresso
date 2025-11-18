import {ColumnType} from "~/lib/types/types";
import {ArrowLeft, LogOut} from "lucide-react";
import authClient from "~/lib/utils/auth-client";
import {Button} from "~/lib/client/components/ui/button";
import {Column} from "~/lib/client/components/board/Column";
import {arrayMove, SortableContext} from "@dnd-kit/sortable";
import {NewColumn} from "~/lib/client/components/board/NewColumn";
import React, {useCallback, useEffect, useRef, useState} from "react";
import {useQueryClient, useSuspenseQuery} from "@tanstack/react-query";
import {EditableText} from "~/lib/client/components/board/EditableText";
import {createFileRoute, Link, useNavigate, useRouter} from "@tanstack/react-router";
import {useHorizontalDragScroll} from "~/lib/client/hooks/use-horizontal-drag-scroll";
import {authOptions, boardDetailsOptions} from "~/lib/client/react-query/query-options";
import {DndContext, DragEndEvent, PointerSensor, TouchSensor, useSensor, useSensors} from "@dnd-kit/core";
import {useUpdateBoardMutation, useUpdateColumnMutation} from "~/lib/client/react-query/mutations";


export const Route = createFileRoute("/_private/board/$boardId")({
    params: { parse: ({ boardId }) => ({ boardId: Number(boardId) }) },
    loader: ({ context: { queryClient }, params: { boardId } }) => queryClient.ensureQueryData(boardDetailsOptions(boardId)),
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
    const updateColumnMutation = useUpdateColumnMutation(boardId);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const boardData = useSuspenseQuery(boardDetailsOptions(boardId)).data;
    const [columns, setColumns] = useState<ColumnType[]>(boardData.columns);
    const horizontalDragScroll = useHorizontalDragScroll(scrollContainerRef);

    const sensors = useSensors(
        useSensor(TouchSensor, { activationConstraint: { distance: 10 } }),
        useSensor(PointerSensor, { activationConstraint: { distance: 10 } }),
    );

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setColumns(boardData.columns);
    }, [boardData.columns]);

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

    const onDragEndHandler = (ev: DragEndEvent) => {
        const { active, over } = ev;
        if (!active.id || !over?.id || (over.id === active.id)) return;

        setColumns((prev) => {
            const overColIdx = columns.findIndex((col) => col.id === over.id);
            const activeColIdx = columns.findIndex((col) => col.id === active.id);

            const newColumns = arrayMove(prev, activeColIdx, overColIdx);

            const prevNeig = newColumns[overColIdx - 1];
            const nextNeig = newColumns[overColIdx + 1];

            const newOrder = !prevNeig && !nextNeig ?
                1024 : prevNeig ?
                    nextNeig ? prevNeig.order + (nextNeig.order - prevNeig.order) / 2 :
                        prevNeig.order + 1024 : nextNeig.order / 2;

            updateColumnMutation.mutate({
                data: {
                    boardId,
                    order: newOrder,
                    id: Number(active.id),
                },
            });

            return newColumns;
        });
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

            <DndContext sensors={sensors} onDragEnd={onDragEndHandler}>
                <div ref={scrollContainerRef} className="flex-grow min-h-0 flex flex-col overflow-x-auto">
                    <div {...horizontalDragScroll} className="flex flex-grow min-h-0 h-full pl-2 pb-4 mt-4 w-fit">
                        <SortableContext items={columns.map((col) => col.id)}>
                            {columns.map((col, idx) =>
                                <Column
                                    col={col}
                                    key={col.id}
                                    ref={columnRef}
                                    previousOrder={columns[idx - 1] ? columns[idx - 1].order : 0}
                                    nextOrder={columns[idx + 1] ? columns[idx + 1].order : col.order + 1}
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
            </DndContext>

            <div className="-z-1 absolute top-2/5 left-35 w-28 h-28 bg-blue-500/20 rounded-full blur-xl"></div>
            <div className="-z-1 absolute top-40 right-20 w-32 h-32 bg-purple-500/20 rounded-full blur-xl"></div>
            <div className="-z-1 absolute bottom-20 left-2/3 w-24 h-24 bg-pink-500/20 rounded-full blur-xl"></div>
        </div>
    );
}
