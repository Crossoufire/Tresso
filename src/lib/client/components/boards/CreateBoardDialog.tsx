import {toast} from "sonner";
import React, {useState} from "react";
import {Loader2, Plus} from "lucide-react";
import {Input} from "~/lib/client/components/ui/input";
import {Button} from "~/lib/client/components/ui/button";
import {useCreateBoardMutation} from "~/lib/client/react-query/mutations";
import {Field, FieldDescription, FieldGroup, FieldLabel} from "~/lib/client/components/ui/field";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger} from "~/lib/client/components/ui/dialog";


const DEFAULT_BOARD_COLOR = "#4f46e5";
const BOARD_COLORS = ["#4f46e5", "#2563eb", "#0891b2", "#059669", "#ca8a04", "#ea580c", "#dc2626", "#9333ea"];


export function CreateBoardDialog() {
    const [name, setName] = useState("");
    const createBoardMutation = useCreateBoardMutation();
    const [isOpen, setIsOpen] = useState(false);
    const [color, setColor] = useState(DEFAULT_BOARD_COLOR);

    const resetForm = () => {
        setName("");
        setColor(DEFAULT_BOARD_COLOR);
    };

    const handleOpenChange = (open: boolean) => {
        if (!open && createBoardMutation.isPending) return;

        setIsOpen(open);
        if (!open) resetForm();
    };

    const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!name.trim() || createBoardMutation.isPending) return;

        createBoardMutation.mutate({ data: { name, color } }, {
            onSuccess: () => {
                setIsOpen(false);
                resetForm();
                toast.success("Board created successfully");
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger
                render={
                    <Button
                        type="button"
                        variant="ghost"
                        className="h-48 w-full flex-col gap-3 bg-card/55 text-muted-foreground ring-1 ring-foreground/8 hover:bg-card hover:text-foreground"
                    />
                }
            >
                <span className="grid size-9 place-items-center rounded-lg bg-secondary ring-1 ring-foreground/8">
                    <Plus/>
                </span>
                <span className="text-sm font-medium">Create board</span>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md" showCloseButton={!createBoardMutation.isPending}>
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <DialogHeader>
                        <DialogTitle>Create board</DialogTitle>
                        <DialogDescription>
                            Give your workspace a name and a color you can spot at a glance.
                        </DialogDescription>
                    </DialogHeader>

                    <div
                        className="flex h-24 items-end rounded-xl p-4 text-white shadow-sm"
                        style={{
                            backgroundColor: color,
                            backgroundImage: "linear-gradient(145deg, rgb(255 255 255 / 0.08), rgb(0 0 0 / 0.58))",
                        }}
                    >
                        <span className="truncate font-heading text-lg font-medium">
                            {name.trim() || "Untitled board"}
                        </span>
                    </div>

                    <FieldGroup className="gap-4">
                        <Field data-disabled={createBoardMutation.isPending || undefined}>
                            <FieldLabel htmlFor="board-name">Board name</FieldLabel>
                            <Input
                                required
                                autoFocus
                                value={name}
                                id="board-name"
                                maxLength={100}
                                autoComplete="off"
                                placeholder="Product roadmap"
                                disabled={createBoardMutation.isPending}
                                onChange={(event) => setName(event.target.value)}
                            />
                            <FieldDescription>
                                Keep it short enough to recognize at a glance.
                            </FieldDescription>
                        </Field>

                        <Field data-disabled={createBoardMutation.isPending || undefined}>
                            <FieldLabel htmlFor="board-color">Board color</FieldLabel>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="color"
                                    value={color}
                                    id="board-color"
                                    className="h-8 w-12 shrink-0 cursor-pointer p-1"
                                    disabled={createBoardMutation.isPending}
                                    onChange={(event) => setColor(event.target.value)}
                                />
                                <div className="flex flex-wrap gap-1.5">
                                    {BOARD_COLORS.map((boardColor) =>
                                        <button
                                            type="button"
                                            key={boardColor}
                                            aria-label={`Use ${boardColor}`}
                                            aria-pressed={color === boardColor}
                                            disabled={createBoardMutation.isPending}
                                            onClick={() => setColor(boardColor)}
                                            style={{ backgroundColor: boardColor }}
                                            className="size-6 rounded-md ring-1 ring-black/20 transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                                        />
                                    )}
                                </div>
                            </div>
                            <FieldDescription>{color.toUpperCase()} fills the board tile.</FieldDescription>
                        </Field>
                    </FieldGroup>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={createBoardMutation.isPending}
                            onClick={() => handleOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!name.trim() || createBoardMutation.isPending}>
                            {createBoardMutation.isPending && <Loader2 data-icon="inline-start" className="animate-spin"/>}
                            Create board
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
