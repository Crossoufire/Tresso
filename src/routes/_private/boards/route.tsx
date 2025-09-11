import React from "react";
import {toast} from "sonner";
import authClient from "~/utils/auth-client";
import {Button} from "~/components/ui/button";
import {getBoardGradient} from "~/utils/gradients";
import {Card, CardHeader, CardTitle} from "~/components/ui/card";
import {useQueryClient, useSuspenseQuery} from "@tanstack/react-query";
import {authOptions, boardsListOptions} from "~/react-query/query-options";
import {Calendar, LogOut, MoreHorizontal, Plus, Users} from "lucide-react";
import {createFileRoute, Link, useNavigate, useRouter} from "@tanstack/react-router";
import {useCreateBoardMutation, useDeleteBoardMutation} from "~/react-query/mutations";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "~/components/ui/dropdown-menu";


export const Route = createFileRoute("/_private/boards")({
    loader: ({ context: { queryClient } }) => {
        return queryClient.ensureQueryData(boardsListOptions);
    },
    component: BoardsPage,
})


function BoardsPage() {
    const router = useRouter();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const createBoardMutation = useCreateBoardMutation();
    const deleteBoardMutation = useDeleteBoardMutation();
    const boardsList = useSuspenseQuery(boardsListOptions).data;

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

    const handleLogout = async () => {
        await authClient.signOut();
        await router.invalidate();
        queryClient.setQueryData(authOptions.queryKey, null);
        await navigate({ to: "/", replace: true });
        queryClient.removeQueries();
    }

    return (
        <div className="p-6">
            <title>{`Your Boards - Tresso`}</title>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-1">Your Boards</h1>
                    <p className="text-muted-foreground">Manage and organize your projects with ease</p>
                </div>
                <Button variant="ghost" onClick={handleLogout}>
                    <LogOut className="size-4 mr-1"/> Logout
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
                {boardsList.map((board, idx) =>
                    <Link key={board.id} to="/board/$boardId" params={{ boardId: board.id }} className="group">
                        <Card
                            className={`h-[160px] transition-all duration-200 cursor-pointer border-2 
                            hover:border-primary/30 ${getBoardGradient(board.id, idx)} relative overflow-hidden`}
                        >
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
                                <div className="flex items-center justify-between mt-4">
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Users className="h-3 w-3"/>
                                            <span>1</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="size-4"/>
                                            <div>
                                                <div>Created</div>
                                                <div>{board.createdAt.toLocaleDateString()}</div>
                                            </div>
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
                                <Plus className="h-6 w-6 text-neutral-300 group-hover:text-primary duration-200"/>
                            </div>
                            <p className="text-md font-medium text-neutral-300 group-hover:text-primary duration-200">
                                Create A New Board
                            </p>
                        </div>
                    </CardHeader>
                </Card>
            </div>
            <div className="-z-1 absolute top-2/5 left-35 w-28 h-28 bg-blue-500/20 rounded-full blur-xl"></div>
            <div className="-z-1 absolute top-40 right-20 w-32 h-32 bg-purple-500/20 rounded-full blur-xl"></div>
            <div className="-z-1 absolute bottom-20 left-2/3 w-24 h-24 bg-pink-500/20 rounded-full blur-xl"></div>
        </div>
    );
}
