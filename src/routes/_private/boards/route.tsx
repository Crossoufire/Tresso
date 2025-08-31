import React from "react";
import {toast} from "sonner";
import {Button} from "~/components/ui/button";
import {getBoardGradient} from "~/utils/gradients";
import {useSuspenseQuery} from "@tanstack/react-query";
import {createFileRoute, Link} from "@tanstack/react-router";
import {boardsListOptions} from "~/react-query/query-options";
import {Card, CardHeader, CardTitle} from "~/components/ui/card";
import {Calendar, MoreHorizontal, Plus, Users} from "lucide-react";
import {useCreateBoardMutation, useDeleteBoardMutation} from "~/react-query/mutations";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "~/components/ui/dropdown-menu";


export const Route = createFileRoute("/_private/boards")({
    loader: ({ context: { queryClient } }) => {
        return queryClient.ensureQueryData(boardsListOptions());
    },
    component: BoardsPage,
})


function BoardsPage() {
    const createBoardMutation = useCreateBoardMutation();
    const deleteBoardMutation = useDeleteBoardMutation();
    const boardsList = useSuspenseQuery(boardsListOptions()).data;

    const onNewBoardClick = (name: string, color: string) => {
        createBoardMutation.mutate({ data: { name, color } });
    }

    const onDeleteBoard = (ev: React.FormEvent, boardId: number) => {
        ev.preventDefault();
        ev.stopPropagation();
        if (!window.confirm("Are you really sure to delete this board?")) return;

        deleteBoardMutation.mutate({ data: { id: boardId } }, {
            onSuccess: () => toast.success("Board deleted successfully"),
        });
    }

    return (
        <div className="max-w-7xl p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-1">Your Boards</h1>
                <p className="text-muted-foreground">Manage and organize your projects with ease</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {boardsList.map((board, idx) =>
                    <Link key={board.id} to="/board/$boardId" params={{ boardId: board.id }} className="group">
                        <Card className={`h-[160px] transition-all duration-200 cursor-pointer border-2 hover:border-primary/30 
                        ${getBoardGradient(board.id, idx)} relative overflow-hidden`}>
                            <CardHeader className="h-full flex flex-col justify-between p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <CardTitle className="text-lg font-semibold line-clamp-2">
                                            {board.name}
                                        </CardTitle>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild className="absolute top-3 right-3">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={(ev) => ev.preventDefault()}
                                                className="opacity-0 group-hover:opacity-100"
                                            >
                                                <MoreHorizontal className="h-4 w-4 text-muted-foreground"/>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48">
                                            <DropdownMenuItem
                                                onClick={(ev) => onDeleteBoard(ev, board.id)}
                                                className="text-destructive focus:text-destructive"
                                            >
                                                Delete board
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                {/*// TODO: Change maybe replace with createdAt, and lastUpdated ? potentially the number of columns and cards */}
                                <div className="flex items-center justify-between mt-4">
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Users className="h-3 w-3"/>
                                            <span>1</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="size-3"/>
                                            <span>{board.createdAt.toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>
                    </Link>
                )}

                <Card
                    onClick={() => onNewBoardClick("New Board", "#000000")}
                    className="h-[160px] border-2 border-dashed border-muted-foreground/25 hover:border-primary/50
                    transition-colors duration-200 cursor-pointer group"
                >
                    <CardHeader className="h-full flex items-center">
                        <div className="text-center">
                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-2 group-hover:bg-primary/10 duration-200">
                                <Plus className="h-6 w-6 text-muted-foreground group-hover:text-primary duration-200"/>
                            </div>
                            <p className="text-md font-medium text-muted-foreground group-hover:text-primary duration-200">
                                Create A New Board
                            </p>
                        </div>
                    </CardHeader>
                </Card>
            </div>
        </div>
    );
}
