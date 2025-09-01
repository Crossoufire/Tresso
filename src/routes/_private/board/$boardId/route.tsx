import {ColumnWithCards} from "~/types/types";
import {Column} from "~/components/board/Column";
import {NewColumn} from "~/components/board/NewColumn";
import {createFileRoute, Link, useNavigate, useRouter} from "@tanstack/react-router";
import {useQueryClient, useSuspenseQuery} from "@tanstack/react-query";
import React, {useCallback, useMemo, useRef} from "react";
import {useUpdateBoardMutation} from "~/react-query/mutations";
import {boardDetailsOptions, queryKeys} from "~/react-query/query-options";
import authClient from "~/utils/auth-client";
import {EditableText} from "~/components/board/EditableText";
import {Button} from "~/components/ui/button";
import {ArrowLeft, LogOut} from "lucide-react";


export const Route = createFileRoute("/_private/board/$boardId")({
    params: { parse: ({ boardId }) => ({ boardId: Number(boardId) }) },
    loader: ({ context: { queryClient }, params: { boardId } }) => queryClient.ensureQueryData(boardDetailsOptions(boardId)),
    component: BoardPage,
})


function BoardPage() {
    const router = useRouter();
    const navigate = useNavigate();
    const startX = useRef(0);
    const queryClient = useQueryClient();
    const { boardId } = Route.useParams();
    const isDown = useRef(false);
    const scrollLeft = useRef(0);
    const newColumnAddedRef = useRef(false);
    const updateBoardMutation = useUpdateBoardMutation();
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const boardData = useSuspenseQuery(boardDetailsOptions(boardId)).data;

    const handleMouseUp = () => {
        isDown.current = false;
        scrollContainerRef.current?.classList.remove("cursor-grabbing");
    };

    const handleMouseLeave = () => {
        isDown.current = false;
        scrollContainerRef.current?.classList.remove("cursor-grabbing");
    };

    const handleMouseDown = (ev: React.MouseEvent<HTMLDivElement>) => {
        const target = ev.target as HTMLElement;

        const interactiveSelector = '[draggable="true"], button, a, input, [role="menuitem"]';
        if (target.closest(interactiveSelector)) {
            return;
        }

        const board = scrollContainerRef.current;
        if (!board) return;

        isDown.current = true;
        board.classList.add("cursor-grabbing");
        startX.current = ev.pageX - board.offsetLeft;
        scrollLeft.current = board.scrollLeft;
    };

    const handleMouseMove = (ev: React.MouseEvent<HTMLDivElement>) => {
        if (!isDown.current) return;
        ev.preventDefault();

        const board = scrollContainerRef.current;
        if (!board) return;

        const x = ev.pageX - board.offsetLeft;
        const walk = (x - startX.current);
        board.scrollLeft = scrollLeft.current - walk;
    };

    const onChangeBoardNameHandler = (newName: string) => {
        updateBoardMutation.mutate({ data: { id: boardData.id, name: newName } });
    }

    const columnRef = useCallback((_node: HTMLElement | null) => {
        if (scrollContainerRef.current && newColumnAddedRef.current) {
            newColumnAddedRef.current = false;
            scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
        }
    }, []);

    const cardsMapById = useMemo(() => {
        return new Map(boardData.cards.map((card) => [card.id, card]));
    }, [boardData.cards])

    const columns = useMemo(() => {
        const columnsMap = new Map<number, ColumnWithCards>();

        for (const column of [...boardData.columns]) {
            columnsMap.set(column.id, { ...column, cards: [] });
        }

        for (const card of cardsMapById.values()) {
            const columnId = card.columnId;
            const column = columnsMap.get(columnId);
            column?.cards.push(card);
        }

        return [...columnsMap.values()].sort((a, b) => a.order - b.order)
    }, [boardData.columns, cardsMapById])

    const handleLogout = async () => {
        await authClient.signOut();
        await router.invalidate();
        queryClient.setQueryData(queryKeys.authKey(), null);
        await navigate({ to: "/", replace: true });
        queryClient.removeQueries();
    }

    return (
        <div className="flex flex-col h-screen">
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
                            onChange={onChangeBoardNameHandler}
                            inputClass="text-2xl font-medium rounded-md py-0.5 px-4 focus:outline-none focus:ring-2 focus:ring-gray-800"
                            value={(updateBoardMutation.isPending && updateBoardMutation.variables.data.name) ?
                                updateBoardMutation.variables.data.name : boardData.name}
                        />
                    </h1>
                </div>
                <Button size="sm" variant="ghost" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2"/>
                    Logout
                </Button>
            </header>

            <div ref={scrollContainerRef} className="flex-grow min-h-0 flex flex-col overflow-x-auto">
                <div
                    onMouseUp={handleMouseUp}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    className="flex flex-grow min-h-0 h-full pl-2 pb-4 mt-6 w-fit"
                >
                    {columns.map((col, idx) => {
                        return (
                            <Column
                                col={col}
                                key={col.id}
                                ref={columnRef}
                                previousOrder={columns[idx - 1] ? columns[idx - 1].order : 0}
                                nextOrder={columns[idx + 1] ? columns[idx + 1].order : col.order + 1}
                            />
                        )
                    })}
                    <NewColumn
                        boardId={boardData.id}
                        editInitially={boardData.columns.length === 0}
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
