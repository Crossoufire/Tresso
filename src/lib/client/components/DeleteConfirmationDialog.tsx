import {Loader2, Trash2} from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogMedia,
    AlertDialogTitle,
} from "~/lib/client/components/ui/alert-dialog";


interface DeleteConfirmationDialogProps {
    open: boolean;
    title: string;
    description: string;
    isPending: boolean;
    onConfirm: () => void;
    onOpenChange: (open: boolean) => void;
}


export function DeleteConfirmationDialog({ open, title, description, isPending, onConfirm, onOpenChange }: DeleteConfirmationDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={(nextOpen) => {
            if (!isPending) onOpenChange(nextOpen);
        }}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogMedia className="text-destructive">
                        <Trash2/>
                    </AlertDialogMedia>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
                    <AlertDialogAction variant="destructive" disabled={isPending} onClick={onConfirm}>
                        {isPending && <Loader2 data-icon="inline-start" className="animate-spin"/>}
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
