import {toast} from "sonner";
import {CSS} from "@dnd-kit/utilities";
import React, {Ref, useState} from "react";
import {CardType} from "~/lib/types/types";
import {useSortable} from "@dnd-kit/sortable";
import {Badge} from "~/lib/client/components/ui/badge";
import {Button} from "~/lib/client/components/ui/button";
import {MessageSquareMore, MoreVertical} from "lucide-react";
import {EditCardDialog} from "~/lib/client/components/edit-card/EditCardDialog";
import {useDeleteCardMutation, useUpdateCardOrderMutation} from "~/lib/client/react-query/mutations";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "~/lib/client/components/ui/dropdown-menu";


interface CardProps {
    card: CardType,
    ref?: Ref<HTMLDivElement>;
}


export const Card = ({ card, ref }: CardProps) => {
    const deleteCardMutation = useDeleteCardMutation(card.boardId);
    const updateCardOrderMutation = useUpdateCardOrderMutation(card.boardId);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
        id: `card-${card.id}`,
        data: { type: "card", card },
        disabled: isEditDialogOpen || deleteCardMutation.isPending,
    });

    const style = {
        transition,
        opacity: isDragging ? 0.6 : 1,
        zIndex: isDragging ? 999 : undefined,
        transform: CSS.Transform.toString(transform),
    }

    const openEditDialog = (ev: React.MouseEvent) => {
        ev.stopPropagation();
        setIsEditDialogOpen(true);
    };

    const onDeleteHandler = (ev: React.MouseEvent) => {
        ev.stopPropagation();
        if (!window.confirm("Are you sure to delete this card?")) return;

        deleteCardMutation.mutate({ data: { id: card.id } }, {
            onSuccess: () => toast.success("Card successfully deleted"),
        });
    };

    return (
        <>
            <div
                style={style}
                {...listeners}
                {...attributes}
                onClick={openEditDialog}
                ref={(node) => {
                    setNodeRef(node);
                    if (typeof ref === "function") ref(node);
                }}
                className="bg-card text-sm rounded-md px-3 py-2.5 relative group hover:ring-2
                hover:ring-inset hover:ring-cyan-900 min-h-[60px] flex-shrink-0"
            >
                <div className="pr-5 flex flex-col">
                    {card.labels.length > 0 &&
                        <div className="flex flex-wrap gap-1 mb-2">
                            {card.labels.map((data) =>
                                <Badge key={data.label.id} style={{ backgroundColor: data.label.color }} className="py-0">
                                    {data.label.name}
                                </Badge>
                            )}
                        </div>
                    }
                    <h3 className="my-0 break-words">
                        {card.title}
                    </h3>
                    <div className={card.content ? "mt-2" : ""}>
                        {card.content && <MessageSquareMore className="size-4 opacity-70"/>}
                    </div>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            size="sm"
                            variant="ghost"
                            title="Card options"
                            className="absolute top-1 right-0.5 opacity-60 hover:opacity-80 has-[>svg]:px-1.5"
                        >
                            <MoreVertical className="size-4"/>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            onClick={openEditDialog}
                            disabled={updateCardOrderMutation.isPending || deleteCardMutation.isPending}
                        >
                            Edit Card
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={onDeleteHandler}
                            className="text-destructive focus:text-destructive cursor-pointer"
                            disabled={deleteCardMutation.isPending || updateCardOrderMutation.isPending}
                        >
                            Delete Card
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <EditCardDialog
                card={card}
                isDialogOpen={isEditDialogOpen}
                setDialogOpen={setIsEditDialogOpen}
            />
        </>
    );
}
