import {Column} from "~/components/board/Column";
import {ColumnWithCards} from "~/types/types";
import {NewColumn} from "~/components/board/NewColumn";
import {useCallback, useMemo, useRef} from "react";
import {EditableText} from "~/components/board/EditableText";
import {createFileRoute} from "@tanstack/react-router";
import {useSuspenseQuery} from "@tanstack/react-query";
import {useUpdateBoardMutation} from "~/react-query/mutations";
import {boardDetailsOptions} from "~/react-query/query-options";


export const Route = createFileRoute("/_private/board/$boardId")({
    params: { parse: ({ boardId }) => ({ boardId: Number(boardId) }) },
    loader: ({ context: { queryClient }, params: { boardId } }) => queryClient.ensureQueryData(boardDetailsOptions(boardId)),
    component: BoardPage,
})


function BoardPage() {
    const { boardId } = Route.useParams();
    const newColumnAddedRef = useRef(false);
    const updateBoardMutation = useUpdateBoardMutation();
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const boardData = useSuspenseQuery(boardDetailsOptions(boardId)).data;

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

    return (
        <div ref={scrollContainerRef} className="flex-grow min-h-0 flex flex-col overflow-x-auto p-4">
            <h1 className="mx-6 mb-3 pt-4">
                <EditableText
                    fieldName="name"
                    buttonClass="text-2xl"
                    onChange={onChangeBoardNameHandler}
                    inputClass="text-2xl font-medium rounded-md py-0.5 px-4 focus:outline-none focus:ring-2 focus:ring-gray-800"
                    value={
                        (updateBoardMutation.isPending && updateBoardMutation.variables.data.name)
                            ? updateBoardMutation.variables.data.name : boardData.name
                    }
                />
            </h1>
            <div className="flex flex-grow min-h-0 h-full items-start px-8 pb-4 w-fit mt-3">
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
            </div>
            <div className="w-8 h-1 flex-shrink-0"/>
        </div>
    )
}
