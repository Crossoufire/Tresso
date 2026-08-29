import * as React from "react";
import {cn} from "~/lib/utils/utils";
import {Label} from "~/lib/client/components/ui/label";


function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="field-group"
            className={cn("flex w-full flex-col gap-7", className)}
            {...props}
        />
    );
}


function Field({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            role="group"
            data-slot="field"
            className={cn("group/field flex w-full flex-col gap-2 data-[invalid=true]:text-destructive", className)}
            {...props}
        />
    );
}


function FieldLabel({ className, ...props }: React.ComponentProps<typeof Label>) {
    return (
        <Label
            data-slot="field-label"
            className={cn("group-data-[disabled=true]/field:opacity-50", className)}
            {...props}
        />
    );
}


function FieldDescription({ className, ...props }: React.ComponentProps<"p">) {
    return (
        <p
            data-slot="field-description"
            className={cn("text-muted-foreground text-sm leading-normal", className)}
            {...props}
        />
    );
}


export {Field, FieldDescription, FieldGroup, FieldLabel};
