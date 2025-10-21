import {toast} from "sonner";
import {flushSync} from "react-dom";
import {cn} from "~/lib/utils/utils";
import {twMerge} from "tailwind-merge";
import {MoreHorizontal, Plus} from "lucide-react";
import {Card} from "~/lib/client/components/board/Card";
import {Button} from "~/lib/client/components/ui/button";
import {NewCard} from "~/lib/client/components/board/NewCard";
import {ColumnWithCards, CONTENT_TYPES} from "~/lib/types/types";
import React, {useCallback, useMemo, useRef, useState} from "react";
import {EditableText} from "~/lib/client/components/board/EditableText";
import {useDeleteColumnMutation, useUpdateCardOrderMutation, useUpdateColumnMutation} from "~/lib/client/react-query/mutations";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "~/lib/client/components/ui/dropdown-menu";


interface ColumnProps {
	nextOrder: number;
	col: ColumnWithCards;
	previousOrder: number;
	ref: React.Ref<HTMLDivElement>;
}


export const Column = ({ ref, col, nextOrder, previousOrder }: ColumnProps) => {
	const listRef = useRef<HTMLUListElement>(null!);
	const colNameEditState = useState(false);
	const deleteColumnMutation = useDeleteColumnMutation();
	const [newCardEdit, setNewCardEdit] = useState(false);
	const updateColumnMutation = useUpdateColumnMutation(col.boardId);
	const [acceptCardDrop, setAcceptCardDrop] = useState(false);
	const updateCardOrderMutation = useUpdateCardOrderMutation(col.boardId);
	const [acceptColumnDrop, setAcceptColumnDrop] = useState<"none" | "left" | "right">("none");

	const cardRef = useCallback((node: HTMLElement | null) => {
		node?.scrollIntoView({ block: "nearest" });
	}, []);

	const sortedCards = useMemo(() => {
		return [...col.cards].sort((a, b) => a.order - b.order);
	}, [col.cards]);

	const onDragOverHandler = (ev: React.DragEvent) => {
		if (ev.dataTransfer.types.includes(CONTENT_TYPES.column)) {
			ev.preventDefault();
			ev.stopPropagation();
			const rect = ev.currentTarget.getBoundingClientRect();
			const midpoint = (rect.left + rect.right) / 2;
			setAcceptColumnDrop(ev.clientX <= midpoint ? 'left' : 'right');
		}
	}

	const onDropHandler = (ev: React.DragEvent) => {
		const transfer = JSON.parse(ev.dataTransfer.getData(CONTENT_TYPES.column) || "null");
		if (!transfer) return;

		const droppedOrder = acceptColumnDrop === "left" ? previousOrder : nextOrder;
		const moveOrder = (droppedOrder + col.order) / 2;

		updateColumnMutation.mutate({
			data: {
				id: transfer.id,
				order: moveOrder,
				boardId: col.boardId,
			}
		})

		setAcceptColumnDrop("none");
	}

	const onDragStartHandler = (ev: React.DragEvent) => {
		ev.dataTransfer.effectAllowed = "move";
		ev.dataTransfer.setData(CONTENT_TYPES.column, JSON.stringify({ id: col.id, name: col.name }));
	}

	const onChangeTextHandler = (value: string) => {
		updateColumnMutation.mutate({
			data: {
				id: col.id,
				name: value,
				boardId: col.boardId,
			}
		})
	}

	const onAddCardClickHandler = () => {
		flushSync(() => setNewCardEdit(true));
		listRef.current.scrollTop = listRef.current.scrollHeight;
	}

	const onDeleteHandler = () => {
		if (!window.confirm("Are you sure? All the associated cards will also be deleted!")) return;
		deleteColumnMutation.mutate({ data: { id: col.id, boardId: col.boardId } }, {
			onSuccess: () => toast.success("Column successfully deleted"),
		})
	}

	const cardDndProps = {
		onDragOver: (ev: React.DragEvent) => {
			if (ev.dataTransfer.types.includes(CONTENT_TYPES.card)) {
				ev.preventDefault();
				setAcceptCardDrop(true);
			}
		},
		onDragLeave: () => {
			setAcceptCardDrop(false);
		},
		onDrop: (ev: React.DragEvent) => {
			const transfer = JSON.parse(ev.dataTransfer.getData(CONTENT_TYPES.card) || "null");
			if (!transfer) return;

			updateCardOrderMutation.mutate({
				data: {
					id: transfer.id,
					columnId: col.id,
					order: (sortedCards[sortedCards.length - 1]?.order ?? 0) + 1,
				},
			})

			setAcceptCardDrop(false);
		},
	};

	return (
		<div
			ref={ref}
			onDrop={onDropHandler}
			onDragOver={onDragOverHandler}
			onDragLeave={() => setAcceptColumnDrop("none")}
			className={twMerge("border-l-2 border-r-2 border-l-transparent border-r-transparent -mr-[2px] last:mr-0 " +
				"px-2 flex-shrink-0 flex flex-col max-h-full",
				acceptColumnDrop === "left" ? "border-l-red-800 border-r-transparent" :
					acceptColumnDrop === "right" ? "border-r-red-800 border-l-transparent" : "",
			)}
		>
			<div
				onDragStart={onDragStartHandler}
				{...(col.cards.length ? {} : cardDndProps)}
				draggable={!colNameEditState[0] && !deleteColumnMutation.isPending}
				className={cn("flex-shrink-0 flex flex-col max-h-full w-80 rounded-md group bg-gray-800 relative",
					acceptCardDrop && `outline-2 outline-red-800`)
				}
			>
				<div className="p-2 flex justify-between" {...(col.cards.length ? cardDndProps : {})}>
					<EditableText
						fieldName="name"
						buttonClass="px-2"
						editState={colNameEditState}
						onChange={(value) => onChangeTextHandler(value)}
						inputClass="rounded-md py-2 px-2 font-medium text-sm"
						value={(updateColumnMutation.isPending && updateColumnMutation.variables.data.name)
							? updateColumnMutation.variables.data.name : col.name
						}
					/>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								size="icon"
								variant="ghost"
								className="opacity-60 hover:opacity-100"
								disabled={deleteColumnMutation.isPending}
							>
								<MoreHorizontal className="size-4"/>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem
								onSelect={onDeleteHandler}
								disabled={deleteColumnMutation.isPending}
								className="text-destructive focus:text-destructive cursor-pointer"
							>
								Delete Column
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				<ul ref={listRef} className="flex-grow overflow-auto p-1 mr-1.5">
					{sortedCards.map((card, idx, cards) =>
						<Card
							card={card}
							ref={cardRef}
							key={card.id}
							columnId={col.id}
							previousOrder={cards[idx - 1] ? cards[idx - 1].order : 0}
							nextOrder={cards[idx + 1] ? cards[idx + 1].order : card.order + 1}
						/>
					)}
				</ul>
				{newCardEdit ?
					<NewCard
						columnId={col.id}
						boardId={col.boardId}
						onComplete={() => setNewCardEdit(false)}
						nextOrder={col.cards.length === 0 ? 1 : col.cards[col.cards.length - 1].order + 1}
					/>
					:
					<div className="p-3" {...(col.cards.length ? cardDndProps : {})}>
						<Button onClick={onAddCardClickHandler} disabled={deleteColumnMutation.isPending}>
							<Plus/> Add Card
						</Button>
					</div>
				}
			</div>
		</div>
	)
}
