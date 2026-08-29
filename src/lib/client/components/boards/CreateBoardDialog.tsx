import {toast} from "sonner";
import React, {useState} from "react";
import {Loader2, Plus} from "lucide-react";
import {Input} from "~/lib/client/components/ui/input";
import {Button} from "~/lib/client/components/ui/button";
import {useCreateBoardMutation} from "~/lib/client/react-query/mutations";
import {Field, FieldDescription, FieldGroup, FieldLabel} from "~/lib/client/components/ui/field";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger} from "~/lib/client/components/ui/dialog";


const DEFAULT_BOARD_COLOR = "#3b82f6";


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
            <DialogTrigger asChild>
                <Button type="button" variant="outline" className="h-40 w-full flex-col gap-3 border-dashed">
                    <Plus data-icon="inline-start"/>
                    <span>Create a new board</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md" showCloseButton={!createBoardMutation.isPending}>
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <DialogHeader>
                        <DialogTitle>Create board</DialogTitle>
                        <DialogDescription>
                            Give your workspace a name and a color you can spot at a glance.
                        </DialogDescription>
                    </DialogHeader>

                    <FieldGroup className="gap-5">
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
                                Use a short, recognizable name for this workspace.
                            </FieldDescription>
                        </Field>

                        <Field data-disabled={createBoardMutation.isPending || undefined}>
                            <FieldLabel htmlFor="board-color">Board color</FieldLabel>
                            <Input
                                type="color"
                                value={color}
                                id="board-color"
                                className="h-12"
                                disabled={createBoardMutation.isPending}
                                onChange={(event) => setColor(event.target.value)}
                            />
                            <FieldDescription className="flex items-center gap-2">
                                <span
                                    aria-hidden="true"
                                    className="size-2 rounded-full"
                                    style={{ backgroundColor: color }}
                                />
                                {color.toUpperCase()} will be used as the board accent.
                            </FieldDescription>
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
