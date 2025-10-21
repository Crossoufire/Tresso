import React from "react";
import {Link} from "@tanstack/react-router";
import {ArrowLeft, Home} from "lucide-react";
import {Button} from "~/lib/client/components/ui/button";
import {Card, CardContent} from "~/lib/client/components/ui/card";


interface ErrorComponentProps {
    text: string;
    title: string;
    icon?: React.ReactNode;
}


export const ErrorComponent = ({ title, icon, text }: ErrorComponentProps) => {
    return (
        <div className="p-6">
            <title>{`Oops Error - Tresso`}</title>
            <div className="flex items-center justify-center p-4 mt-12">
                <Card className="w-full max-w-md">
                    <CardContent>
                        <div className="text-center space-y-6">
                            <div className="space-y-6">
                                <div className="flex flex-col justify-center items-center text-3xl font-semibold text-gray-300">
                                    <div>{icon}</div>
                                    <h2>{title}</h2>
                                </div>
                                <p className="leading-relaxed text-lg max-sm:text-base">
                                    {text}
                                </p>
                            </div>
                            <div className="flex justify-center items-center">
                                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex items-center gap-2"
                                        onClick={() => window.history.back()}
                                    >
                                        <ArrowLeft className="size-4"/> Go Back?
                                    </Button>
                                    <Button asChild className="flex items-center gap-2">
                                        <Link to="/">
                                            <Home className="size-4"/> Home
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="-z-1 absolute top-2/5 left-35 w-28 h-28 bg-blue-500/20 rounded-full blur-xl"></div>
            <div className="-z-1 absolute top-40 right-20 w-32 h-32 bg-purple-500/20 rounded-full blur-xl"></div>
            <div className="-z-1 absolute bottom-20 left-2/3 w-24 h-24 bg-pink-500/20 rounded-full blur-xl"></div>
        </div>
    );
};
