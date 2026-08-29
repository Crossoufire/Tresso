import React from "react";
import {Link} from "@tanstack/react-router";
import {ArrowLeft, ArrowRight, GripVertical} from "lucide-react";
import {Button} from "~/lib/client/components/ui/button";
import {Card, CardContent} from "~/lib/client/components/ui/card";


interface ErrorComponentProps {
    text: string;
    title: string;
    icon?: React.ReactNode;
}


export const ErrorComponent = ({ title, icon, text }: ErrorComponentProps) => {
    return (
        <main className="flex min-h-screen items-center justify-center p-6">
            <title>{`Oops Error - Tresso`}</title>
            <Card className="w-full max-w-md bg-card/80 backdrop-blur-xl">
                <CardContent className="flex flex-col gap-8 py-4">
                    <div className="flex items-center justify-between">
                        <span className="grid size-9 place-items-center rounded-lg bg-secondary text-muted-foreground">
                            <GripVertical/>
                        </span>
                        <span className="text-xs tracking-[0.16em] text-muted-foreground uppercase">Tresso</span>
                    </div>
                    <div className="flex flex-col gap-4">
                        {icon && <div className="text-muted-foreground">{icon}</div>}
                        <div className="flex flex-col gap-2">
                            <h1 className="font-heading text-2xl font-medium tracking-tight">{title}</h1>
                            <p className="text-sm leading-6 text-muted-foreground">{text}</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <Button type="button" variant="outline" className="flex-1" onClick={() => window.history.back()}>
                            <ArrowLeft data-icon="inline-start"/> Back
                        </Button>
                        <Button render={<Link to="/"/>} nativeButton={false} className="flex-1">
                            Home <ArrowRight data-icon="inline-end"/>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </main>
    );
};
