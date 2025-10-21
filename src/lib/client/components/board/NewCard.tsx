import {Loader2} from "lucide-react";
import {Button} from "~/lib/client/components/ui/button";
import {Textarea} from "~/lib/client/components/ui/textarea";
import {useOnClickOutside} from "~/lib/client/hooks/use-clicked-outside";
import {useCreateCardMutation} from "~/lib/client/react-query/mutations";
import React, {ChangeEvent, FormEvent, KeyboardEvent, useRef} from "react";


interface NewCardProps {
	boardId: number;
	columnId: number;
	nextOrder: number;
	onComplete: () => void;
}


export function NewCard({ columnId, boardId, nextOrder, onComplete }: NewCardProps) {
	const formRef = useRef<HTMLFormElement>(null);
	const createCardMutation = useCreateCardMutation(boardId);
	const buttonRef = useRef<HTMLButtonElement>(null);
	const textAreaRef = useRef<HTMLTextAreaElement>(null);

	const onSubmitHandler = (ev: FormEvent<HTMLFormElement>) => {
		ev.preventDefault();

		const formData = new FormData(ev.currentTarget);
		if (textAreaRef.current) {
			textAreaRef.current.value = "";
		}

		createCardMutation.mutate({
			data: {
				boardId,
				columnId,
				order: nextOrder,
				title: formData.get("title") as string,
			}
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

	const onChangeHandler = (event: ChangeEvent<HTMLTextAreaElement>) => {
		const el = event.currentTarget;
		el.style.height = el.scrollHeight + "px";
	};

	const handleClickOutside = async () => {
		const value = textAreaRef.current?.value?.trim();
		if (value) {
			await createCardMutation.mutateAsync({
				data: {
					boardId,
					columnId,
					title: value,
					order: nextOrder,
				},
			});
			if (textAreaRef.current) {
				textAreaRef.current.value = "";
			}
		}

		onComplete();
	};

	useOnClickOutside(formRef, handleClickOutside);

	return (
		<form method="post" ref={formRef} onSubmit={onSubmitHandler} className="p-3">
			<div className="flex flex-col gap-3">
				<div>
					<Textarea
						name="title"
						required={true}
						autoFocus={true}
						ref={textAreaRef}
						onChange={onChangeHandler}
						onKeyDown={onKeyDownHandler}
						placeholder="Enter card content here..."
					/>
				</div>
				<div>
					<div className="flex justify-end items-center gap-2">
						<Button variant="outline" onClick={onComplete} disabled={createCardMutation.isPending}>
							Cancel
						</Button>
						<Button ref={buttonRef} variant="default" disabled={createCardMutation.isPending} type="submit">
							{createCardMutation.isPending && <Loader2 className="animate-spin"/>} Add
						</Button>
					</div>
				</div>
			</div>
		</form>
	);
}