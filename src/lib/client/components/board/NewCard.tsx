import {Loader2} from "lucide-react";
import {Button} from "~/lib/client/components/ui/button";
import {Textarea} from "~/lib/client/components/ui/textarea";
import React, {ChangeEvent, KeyboardEvent, useRef} from "react";
import {useOnClickOutside} from "~/lib/client/hooks/use-clicked-outside";
import {useCreateCardMutation} from "~/lib/client/react-query/mutations";


interface NewCardProps {
    boardId: number;
    columnId: number;
    onComplete: () => void;
}


export function NewCard({ columnId, boardId, onComplete }: NewCardProps) {
    const formRef = useRef<HTMLFormElement>(null);
    const createCardMutation = useCreateCardMutation(boardId);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    const onSubmitHandler = (ev: React.SubmitEvent<HTMLFormElement>) => {
        ev.preventDefault();
        if (createCardMutation.isPending) return;

        const formData = new FormData(ev.currentTarget);

        createCardMutation.mutate({ data: { boardId, columnId, title: formData.get("title") as string } }, {
            onSuccess: () => {
                if (textAreaRef.current) {
                    textAreaRef.current.value = "";
                }
            },
        });
    };

    const onKeyDownHandler = (ev: KeyboardEvent<HTMLTextAreaElement>) => {
        if (ev.key === "Enter") {
            ev.preventDefault();
            buttonRef.current?.click();
        }
        if (ev.key === "Escape") {
            onComplete();
        }
    };

    const onChangeHandler = (ev: ChangeEvent<HTMLTextAreaElement>) => {
        ev.currentTarget.style.height = ev.currentTarget.scrollHeight + "px";
    };

    const handleClickOutside = () => {
        if (createCardMutation.isPending) return;

        const value = textAreaRef.current?.value?.trim();
        if (value) {
            createCardMutation.mutate({ data: { boardId, columnId, title: value } }, {
                onSuccess: onComplete,
            });
            return;
        }

        onComplete();
    };

    useOnClickOutside(formRef, handleClickOutside);

    return (
        <form method="post" ref={formRef} onSubmit={onSubmitHandler} className="shrink-0 border-t p-2">
            <div className="flex flex-col gap-2">
                <div>
                    <Textarea
                        name="title"
                        required={true}
                        autoFocus={true}
                        maxLength={200}
                        ref={textAreaRef}
                        disabled={createCardMutation.isPending}
                        onChange={onChangeHandler}
                        onKeyDown={onKeyDownHandler}
                        placeholder="What needs to be done?"
                        className="min-h-20 resize-none bg-background/65"
                    />
                </div>
                <div>
                    <div className="flex items-center justify-end gap-2">
                        <Button size="sm" type="button" variant="ghost" onClick={onComplete} disabled={createCardMutation.isPending}>
                            Cancel
                        </Button>
                        <Button size="sm" ref={buttonRef} disabled={createCardMutation.isPending} type="submit">
                            {createCardMutation.isPending && <Loader2 data-icon="inline-start" className="animate-spin"/>} Add card
                        </Button>
                    </div>
                </div>
            </div>
        </form>
    );
}
