import {toast} from "sonner";
import {Loader2, Plus} from "lucide-react";
import {Input} from "~/lib/client/components/ui/input";
import {Button} from "~/lib/client/components/ui/button";
import React, {useRef, useState} from "react";
import {useCreateColumnMutation} from "~/lib/client/react-query/mutations";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "~/lib/client/components/ui/card";


interface NewColumProps {
    boardId: number;
    editInitially: boolean;
    onNewColumnAdded: () => void;
}


export function NewColumn({ boardId, editInitially, onNewColumnAdded }: NewColumProps) {
    const createColMutation = useCreateColumnMutation();
    const [editing, setEditing] = useState(editInitially);
    const inputRef = useRef<HTMLInputElement>(null);

    const onSubmitHandler = (ev: React.FormEvent<HTMLFormElement>) => {
        ev.preventDefault();
        if (!inputRef.current) return;

        createColMutation.mutate({ data: { boardId, name: inputRef.current.value } }, {
            onSuccess: () => toast.success("New Column Created!"),
        });

        inputRef.current.value = "";
        onNewColumnAdded();
    };

    return (
        <>
            {editing ?
                <form onSubmit={onSubmitHandler}>
                    <Card className="min-w-72 ml-3">
                        <CardHeader>
                            <CardTitle>Add Column</CardTitle>
                            <CardDescription>Add a new column to this board</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Input
                                required
                                autoFocus
                                type="text"
                                ref={inputRef}
                                name="columnName"
                                autoComplete="off"
                                placeholder="Enter a name..."
                                disabled={createColMutation.isPending}
                            />
                        </CardContent>
                        <CardFooter className="flex justify-end items-center gap-3">
                            <Button variant="destructive" type="button" onClick={() => setEditing(false)} disabled={createColMutation.isPending}>
                                Cancel
                            </Button>
                            <Button variant="default" type="submit" disabled={createColMutation.isPending}>
                                {createColMutation.isPending ? <Loader2 className="animate-spin"/> : "Add"}
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
                :
                <Button onClick={() => setEditing(true)} size="sm" className="ml-2">
                    <Plus/>
                </Button>
            }
        </>
    );
}
