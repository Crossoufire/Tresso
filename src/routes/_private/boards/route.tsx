import {toast} from "sonner";
import React, {useState} from "react";
import authClient from "~/lib/utils/auth-client";
import {formatUpdatedAt} from "~/lib/utils/utils";
import {Input} from "~/lib/client/components/ui/input";
import {Label} from "~/lib/client/components/ui/label";
import {getBoardGradient} from "~/lib/utils/gradients";
import {Button} from "~/lib/client/components/ui/button";
import {useQueryClient, useSuspenseQuery} from "@tanstack/react-query";
import {Card, CardHeader, CardTitle} from "~/lib/client/components/ui/card";
import {createFileRoute, Link, useNavigate, useRouter} from "@tanstack/react-router";
import {authOptions, boardsListOptions} from "~/lib/client/react-query/query-options";
import {CalendarClock, Columns3, LogOut, MoreVertical, Plus, Tag, WalletCards} from "lucide-react";
import {useCreateBoardMutation, useDeleteBoardMutation, useUpdateBoardMutation} from "~/lib/client/react-query/mutations";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "~/lib/client/components/ui/dropdown-menu";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "~/lib/client/components/ui/dialog";


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
    const [newName, setNewName] = useState("");
    const createBoardMutation = useCreateBoardMutation();
    const deleteBoardMutation = useDeleteBoardMutation();
    const updateBoardMutation = useUpdateBoardMutation();
    const boardsList = useSuspenseQuery(boardsListOptions).data;
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
    const [editingBoard, setEditingBoard] = useState<{ id: number, name: string } | null>(null);

    const handleUpdateBoardName = () => {
        if (editingBoard && newName && newName.trim() && newName.trim() !== editingBoard.name) {
            updateBoardMutation.mutate({ data: { id: editingBoard.id, name: newName.trim() } }, {
                onError: () => toast.error("Failed to update board name"),
                onSuccess: () => setIsEditModalOpen(false),
            });
        }
        else {
            setIsEditModalOpen(false);
        }
    }

    const onNewBoardClick = (name: string, color: string) => {
        createBoardMutation.mutate({ data: { name, color } });
    }

    const onDeleteBoard = (ev: React.MouseEvent, boardId: number) => {
        ev.preventDefault();
        ev.stopPropagation();
        if (!window.confirm("Are you really sure to delete this board?")) return;

        deleteBoardMutation.mutate({ data: { id: boardId } }, {
            onSuccess: () => toast.success("Board deleted successfully"),
        });
    }

    const handleOpenEditModal = (board: { id: number; name: string }) => {
        setEditingBoard(board);
        setNewName(board.name);
        setIsEditModalOpen(true);
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
                    <h1 className="text-3xl font-bold mb-1">
                        Your Boards
                    </h1>
                    <p className="text-muted-foreground">
                        Manage and organize your projects with ease
                    </p>
                </div>
                <Button variant="ghost" onClick={handleLogout}>
                    <LogOut className="size-4 mr-1"/> Logout
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
                {boardsList.map((board, idx) =>
                    <Link key={board.id} to="/board/$boardId" params={{ boardId: board.id }} className="group">
                        <Card
                            className={`h-40 transition-all duration-200 cursor-pointer border-2 
                            hover:border-primary/30 ${getBoardGradient(board.id, idx)} relative overflow-hidden`}
                        >
                            <CardHeader className="h-full flex flex-col justify-between p-6 pt-2">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <CardTitle className="text-xl font-semibold line-clamp-2">
                                            {board.name}
                                        </CardTitle>
                                    </div>
                                    <DropdownMenu
                                        open={openDropdownId === board.id}
                                        onOpenChange={(open) => setOpenDropdownId(open ? board.id : null)}
                                    >
                                        <DropdownMenuTrigger asChild className="absolute top-2 right-1">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={(ev) => ev.preventDefault()}
                                            >
                                                <MoreVertical className="size-4 text-muted-foreground"/>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48">
                                            <DropdownMenuItem
                                                onClick={(ev) => {
                                                    ev.preventDefault();
                                                    ev.stopPropagation();
                                                    handleOpenEditModal(board);
                                                    setOpenDropdownId(null);
                                                }}
                                            >
                                                Rename board
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={(ev) => onDeleteBoard(ev, board.id)}
                                                className="text-destructive focus:text-destructive"
                                            >
                                                Delete board
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <div className="py-3">
                                    <div className="flex items-center gap-6 text-gray-300 mb-1">
                                        <div className="flex items-center gap-1" title="Columns">
                                            <Columns3 className="size-4 text-yellow-600 shadow-md"/>
                                            <span>{board.columnsCount}</span>
                                        </div>
                                        <div className="flex items-center gap-1" title="Cards">
                                            <WalletCards className="size-4 text-green-600"/>
                                            <span>{board.cardsCount}</span>
                                        </div>
                                        <div className="flex items-center gap-1" title="Labels">
                                            <Tag className="size-4 text-cyan-600 shadow-md"/>
                                            <span>{board.labelsCount}</span>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center gap-1 text-xs text-gray-300" title="Last updated">
                                        <CalendarClock className="size-4 shrink-0 text-teal-500"/>
                                        <span className="truncate">
                                            Updated {formatUpdatedAt(board.updatedAt)}
                                        </span>
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>
                    </Link>
                )}

                <Card
                    onClick={() => onNewBoardClick("New Board", "#000000")}
                    className="h-40 border-2 border-dashed border-muted-foreground/25 hover:border-primary/50
                    transition-colors duration-200 cursor-pointer group"
                >
                    <CardHeader className="h-full flex items-center">
                        <div className="text-center">
                            <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-3 group-hover:bg-primary/10 duration-200">
                                <Plus className="size-6 text-neutral-300 group-hover:text-primary duration-200"/>
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

            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Rename board</DialogTitle>
                        <DialogDescription>
                            Enter a new name for the board.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="pt-3 pb-2">
                        <Label htmlFor="name" className="mb-2">
                            New Name
                        </Label>
                        <Input
                            id="name"
                            value={newName}
                            className="col-span-3"
                            onChange={(ev) => setNewName(ev.target.value)}
                            onKeyDown={(ev) => ev.key === "Enter" && handleUpdateBoardName()}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdateBoardName}>
                            Save changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
