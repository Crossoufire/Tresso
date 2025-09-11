import {Skull} from "lucide-react";
import {ErrorComponent} from "~/components/ErrorComponent";
import type {ErrorComponentProps} from "@tanstack/react-router";


export function ErrorCatchBoundary({}: Readonly<ErrorComponentProps>) {
    return (
        <ErrorComponent
            title={"Well, This is Awkward"}
            icon={<Skull className="w-10 h-10 animate-bounce"/>}
            footerText={"If this keeps happening, we probably broke something important."}
            text={"Sorry, it looks like something isn’t working right now. Please try refreshing the page or come back later."}
        />
    );
}
