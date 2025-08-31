import {Loader2, Plus} from "lucide-react";
import {Input} from "~/components/ui/input";
import {Button} from "~/components/ui/button";
import React, {useRef, useState} from "react";
import {useCreateColumnMutation} from "~/react-query/mutations";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "~/components/ui/card";


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
        createColMutation.mutate({ data: { boardId, name: inputRef.current.value } });
        inputRef.current.value = "";
        onNewColumnAdded();
    };

    const onBlurHandler = (ev: React.FocusEvent<HTMLFormElement>) => {
        if (!ev.currentTarget.contains(ev.relatedTarget)) {
            setEditing(false);
        }
    };

    if (editing) {
        return (
            <form onBlur={onBlurHandler} onSubmit={onSubmitHandler}>
                <Card className="min-w-72 ml-3">
                    <CardHeader>
                        <CardTitle>Add Column</CardTitle>
                        <CardDescription>Add a new column to this board</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Input
                            type="text"
                            ref={inputRef}
                            required={true}
                            autoFocus={true}
                            name="columnName"
                            autoComplete="off"
                            placeholder="Enter a name..."
                            disabled={createColMutation.isPending}
                        />
                    </CardContent>
                    <CardFooter className="flex justify-end items-center gap-3">
                        <Button variant="default" disabled={createColMutation.isPending}>
                            {createColMutation.isPending && <Loader2 className="animate-spin"/>} Add
                        </Button>
                        <Button variant="destructive" onClick={() => setEditing(false)} disabled={createColMutation.isPending}>
                            Cancel
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        )
    }

    return (
        <Button onClick={() => setEditing(true)} size="sm" className="ml-2">
            <Plus/>
        </Button>
    )
}
