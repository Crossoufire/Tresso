import {twMerge} from "tailwind-merge";
import {type ClassValue, clsx} from "clsx";


export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}


export const formatUpdatedAt = (updatedAt: Date) => {
    return updatedAt.toLocaleString("fr-FR", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};
