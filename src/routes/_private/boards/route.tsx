import {toast} from "sonner";
import {useState} from "react";
import authClient from "~/lib/utils/auth-client";
import {formatUpdatedAt} from "~/lib/utils/utils";
import {Input} from "~/lib/client/components/ui/input";
import {Label} from "~/lib/client/components/ui/label";
import {Button} from "~/lib/client/components/ui/button";
import {useQueryClient, useSuspenseQuery} from "@tanstack/react-query";
import {Card, CardHeader, CardTitle} from "~/lib/client/components/ui/card";
import {CreateBoardDialog} from "~/lib/client/components/boards/CreateBoardDialog";
import {createFileRoute, Link, useNavigate, useRouter} from "@tanstack/react-router";
import {authOptions, boardsListOptions} from "~/lib/client/react-query/query-options";
import {CalendarClock, Columns3, Ellipsis, GripVertical, LogOut, Pencil, Tag, Trash2, WalletCards} from "lucide-react";
import {useDeleteBoardMutation, useUpdateBoardMutation} from "~/lib/client/react-query/mutations";
import {DeleteConfirmationDialog} from "~/lib/client/components/DeleteConfirmationDialog";
import {DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger} from "~/lib/client/components/ui/dropdown-menu";
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
    const deleteBoardMutation = useDeleteBoardMutation();
    const updateBoardMutation = useUpdateBoardMutation();
    const boardsList = useSuspenseQuery(boardsListOptions).data;
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [deletingBoard, setDeletingBoard] = useState<{ id: number, name: string } | null>(null);
    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
    const [editingBoard, setEditingBoard] = useState<{ id: number, name: string } | null>(null);

    const handleUpdateBoardName = () => {
        const trimmedName = newName.trim();
        if (editingBoard && trimmedName && trimmedName !== editingBoard.name) {
            updateBoardMutation.mutate({ data: { id: editingBoard.id, name: trimmedName } }, {
                onError: () => toast.error("Failed to update board name"),
                onSuccess: () => setIsEditModalOpen(false),
            });
            return;
        }

        setIsEditModalOpen(false);
    }

    const onDeleteBoard = (boardId: number) => {
        deleteBoardMutation.mutate({ data: { id: boardId } }, {
            onSuccess: () => {
                setDeletingBoard(null);
                toast.success("Board deleted successfully");
            },
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
        <main className="min-h-screen px-5 py-6 sm:px-8 lg:px-10">
            <title>Your Boards - Tresso</title>
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-10">
                <header className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <span className="grid size-8 place-items-center rounded-lg bg-foreground text-background">
                            <GripVertical/>
                        </span>
                        <span className="font-heading text-base font-medium tracking-tight">Tresso</span>
                    </div>
                    <Button variant="ghost" onClick={handleLogout}>
                        <LogOut data-icon="inline-start"/> Sign out
                    </Button>
                </header>

                <section className="flex flex-col gap-3 border-b pb-7 sm:flex-row sm:items-end sm:justify-between">
                    <div className="flex flex-col gap-2">
                        <p className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">Workspace</p>
                        <h1 className="font-heading text-3xl font-medium tracking-[-0.03em] sm:text-4xl">Your boards</h1>
                        <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                            Open a board or create a new space for the next piece of work.
                        </p>
                    </div>
                    <span className="w-fit rounded-full bg-secondary px-2.5 py-1 text-xs text-muted-foreground ring-1 ring-foreground/8">
                        {boardsList.length} {boardsList.length === 1 ? "board" : "boards"}
                    </span>
                </section>

                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {boardsList.map((board) =>
                        <article key={board.id} className="group relative">
                            <Link
                                to="/board/$boardId"
                                params={{ boardId: board.id }}
                                className="block rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                            >
                                <Card
                                    style={{
                                        backgroundColor: board.color,
                                        backgroundImage: "linear-gradient(145deg, rgb(255 255 255 / 0.08), rgb(0 0 0 / 0.58))",
                                    }}
                                    className="h-48 bg-transparent py-0 text-white shadow-sm ring-0 transition-transform duration-200 group-hover:-translate-y-0.5"
                                >
                                    <CardHeader className="flex h-full grid-cols-1 flex-col justify-between gap-6 p-5 pr-14">
                                        <CardTitle className="line-clamp-2 text-xl leading-snug font-medium tracking-tight text-white">
                                            {board.name}
                                        </CardTitle>

                                        <div className="flex flex-col gap-4">
                                            <div className="flex items-center gap-2 text-xs text-white/85">
                                                <span className="inline-flex items-center gap-1.5 rounded-md bg-black/20 px-2 py-1 backdrop-blur-sm" title="Columns">
                                                    <Columns3 className="size-3.5"/> {board.columnsCount}
                                                </span>
                                                <span className="inline-flex items-center gap-1.5 rounded-md bg-black/20 px-2 py-1 backdrop-blur-sm" title="Cards">
                                                    <WalletCards className="size-3.5"/> {board.cardsCount}
                                                </span>
                                                <span className="inline-flex items-center gap-1.5 rounded-md bg-black/20 px-2 py-1 backdrop-blur-sm" title="Labels">
                                                    <Tag className="size-3.5"/> {board.labelsCount}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-white/70" title="Last updated">
                                                <CalendarClock className="size-3.5"/>
                                                <span className="truncate">Updated {formatUpdatedAt(board.updatedAt)}</span>
                                            </div>
                                        </div>
                                    </CardHeader>
                                </Card>
                            </Link>

                            <DropdownMenu
                                open={openDropdownId === board.id}
                                onOpenChange={(open) => setOpenDropdownId(open ? board.id : null)}
                            >
                                <DropdownMenuTrigger
                                    render={
                                        <Button
                                            type="button"
                                            size="icon-sm"
                                            variant="ghost"
                                            className="absolute top-3 right-3 bg-black/15 text-white/80 hover:bg-black/30 hover:text-white"
                                            aria-label={`Options for ${board.name}`}
                                        />
                                    }
                                >
                                    <Ellipsis/>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-44">
                                    <DropdownMenuGroup>
                                        <DropdownMenuItem onClick={() => {
                                            handleOpenEditModal(board);
                                            setOpenDropdownId(null);
                                        }}>
                                            <Pencil/> Rename
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            variant="destructive"
                                            disabled={deleteBoardMutation.isPending}
                                            onClick={() => setDeletingBoard({ id: board.id, name: board.name })}
                                        >
                                            <Trash2/> Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </article>
                    )}

                    <CreateBoardDialog/>
                </section>
            </div>

            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Rename board</DialogTitle>
                        <DialogDescription>Choose a clear, recognizable name for this board.</DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-2 py-1">
                        <Label htmlFor="board-name">Board name</Label>
                        <Input
                            id="board-name"
                            value={newName}
                            maxLength={100}
                            disabled={updateBoardMutation.isPending}
                            onChange={(event) => setNewName(event.target.value)}
                            onKeyDown={(event) => event.key === "Enter" && handleUpdateBoardName()}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" disabled={updateBoardMutation.isPending} onClick={() => setIsEditModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button disabled={!newName.trim() || updateBoardMutation.isPending} onClick={handleUpdateBoardName}>
                            Save changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {deletingBoard &&
                <DeleteConfirmationDialog
                    open={true}
                    isPending={deleteBoardMutation.isPending}
                    onOpenChange={(open) => !open && setDeletingBoard(null)}
                    onConfirm={() => onDeleteBoard(deletingBoard.id)}
                    title="Delete this board?"
                    description={`“${deletingBoard.name}” and all of its columns and cards will be permanently deleted.`}
                />
            }
        </main>
    );
}
