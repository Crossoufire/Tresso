import {ArrowLeft, LogOut} from "lucide-react";
import authClient from "~/lib/utils/auth-client";
import {ColumnWithCards} from "~/lib/types/types";
import {Button} from "~/lib/client/components/ui/button";
import {Column} from "~/lib/client/components/board/Column";
import {useDragScroll} from "~/lib/client/hooks/use-drag-scroll";
import {NewColumn} from "~/lib/client/components/board/NewColumn";
import React, {useCallback, useMemo, useRef, useState} from "react";
import {useQueryClient, useSuspenseQuery} from "@tanstack/react-query";
import {EditableText} from "~/lib/client/components/board/EditableText";
import {useUpdateBoardMutation} from "~/lib/client/react-query/mutations";
import {createFileRoute, Link, useNavigate, useRouter} from "@tanstack/react-router";
import {authOptions, boardDetailsOptions} from "~/lib/client/react-query/query-options";


export const Route = createFileRoute("/_private/board/$boardId")({
    params: { parse: ({ boardId }) => ({ boardId: Number(boardId) }) },
    loader: ({ context: { queryClient }, params: { boardId } }) => queryClient.ensureQueryData(boardDetailsOptions(boardId)),
    component: BoardPage,
})


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
    const dragScroll = useDragScroll(scrollContainerRef);

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

    const scrollToEnd = useCallback(() => {
        if (!scrollContainerRef.current) return;
        scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
    }, []);

    const columnRef = useCallback(() => {
        if (!scrollContainerRef.current || !newColumnAddedRef.current) return;

        scrollToEnd();
        newColumnAddedRef.current = false;
    }, [scrollToEnd]);

    const cardsMapById = useMemo(() => {
        return new Map(boardData.cards.map((card) => [card.id, card]));
    }, [boardData.cards]);

    const columns = useMemo(() => {
        const columnsMap = new Map<number, ColumnWithCards>();

        for (const column of [...boardData.columns]) {
            columnsMap.set(column.id, { ...column, cards: [] });
        }

        for (const card of cardsMapById.values()) {
            const column = columnsMap.get(card.columnId);
            column?.cards.push(card);
        }

        return [...columnsMap.values()].sort((a, b) => a.order - b.order);
    }, [boardData.columns, cardsMapById]);

    return (
        <div className="flex flex-col h-screen">
            <title>{`${boardData.name} - Tresso`}</title>

            <header className="flex items-center justify-between p-4 border-b  backdrop-blur-sm flex-shrink-0">
                <div className="flex items-center gap-4">
                    <Button size="sm" variant="ghost" asChild={true}>
                        <Link to="/boards">
                            <ArrowLeft className="h-4 w-4 mr-1"/> All Boards
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
                    <LogOut className="h-4 w-4 mr-2"/> Logout
                </Button>
            </header>

            <div ref={scrollContainerRef} className="flex-grow min-h-0 flex flex-col overflow-x-auto">
                <div {...dragScroll} className="flex flex-grow min-h-0 h-full pl-2 pb-4 mt-6 w-fit">
                    {columns.map((col, idx) =>
                        <Column
                            col={col}
                            key={col.id}
                            ref={columnRef}
                            previousOrder={columns[idx - 1] ? columns[idx - 1].order : 0}
                            nextOrder={columns[idx + 1] ? columns[idx + 1].order : col.order + 1}
                        />
                    )}
                    <NewColumn
                        boardId={boardData.id}
                        onExpand={scrollToEnd}
                        editInitially={columns.length === 0}
                        onNewColumnAdded={() => (newColumnAddedRef.current = true)}
                    />
                    <div className="w-8 h-1"/>
                </div>
            </div>

            <div className="-z-1 absolute top-2/5 left-35 w-28 h-28 bg-blue-500/20 rounded-full blur-xl"></div>
            <div className="-z-1 absolute top-40 right-20 w-32 h-32 bg-purple-500/20 rounded-full blur-xl"></div>
            <div className="-z-1 absolute bottom-20 left-2/3 w-24 h-24 bg-pink-500/20 rounded-full blur-xl"></div>
        </div>
    );
}
