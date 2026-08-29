import {toast} from "sonner";
import {Loader2, Plus} from "lucide-react";
import React, {useRef, useState} from "react";
import {Input} from "~/lib/client/components/ui/input";
import {Button} from "~/lib/client/components/ui/button";
import {useCreateColumnMutation} from "~/lib/client/react-query/mutations";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "~/lib/client/components/ui/card";


interface NewColumProps {
    boardId: number;
    onExpand: () => void;
    editInitially: boolean;
    onNewColumnAdded: () => void;
}


export function NewColumn({ boardId, editInitially, onNewColumnAdded, onExpand }: NewColumProps) {
    const createColMutation = useCreateColumnMutation();
    const [editing, setEditing] = useState(editInitially);
    const inputRef = useRef<HTMLInputElement>(null);

    const cardRef = (ev: HTMLDivElement | null) => {
        if (!ev) return;
        onExpand();
    }

    const onSubmitHandler = (ev: React.SubmitEvent) => {
        ev.preventDefault();
        if (!inputRef.current || createColMutation.isPending) return;

        createColMutation.mutate({ data: { boardId, name: inputRef.current.value } }, {
            onSuccess: () => {
                if (inputRef.current) {
                    inputRef.current.value = "";
                }
                onNewColumnAdded();
                toast.success("New Column Created!");
            },
        });
    };

    return (
        <>
            {editing ?
                <form onSubmit={onSubmitHandler}>
                    <Card className="w-80 bg-card backdrop-blur-sm" ref={cardRef}>
                        <CardHeader>
                            <CardTitle>Add column</CardTitle>
                            <CardDescription>Create another stage for this workflow.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Input
                                required
                                autoFocus
                                type="text"
                                ref={inputRef}
                                name="columnName"
                                maxLength={100}
                                autoComplete="off"
                                placeholder="e.g. In review"
                                disabled={createColMutation.isPending}
                            />
                        </CardContent>
                        <CardFooter className="justify-end gap-2">
                            <Button variant="outline" type="button" onClick={() => setEditing(false)} disabled={createColMutation.isPending}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={createColMutation.isPending}>
                                {createColMutation.isPending && <Loader2 data-icon="inline-start" className="animate-spin"/>}
                                Add column
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
                :
                <Button onClick={() => setEditing(true)} variant="outline" className="w-80 justify-start bg-card/70 text-muted-foreground backdrop-blur-sm">
                    <Plus data-icon="inline-start"/> Add column
                </Button>
            }
        </>
    );
}
