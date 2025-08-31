import {toast} from "sonner";
import {LogIn} from "lucide-react";
import authClient from "~/utils/auth-client";
import {Button} from "~/components/ui/button";
import {queryKeys} from "~/react-query/query-options";
import {createFileRoute, redirect} from "@tanstack/react-router";


export const Route = createFileRoute("/")({
    validateSearch: ({ search }) => search as { authExpired?: boolean },
    beforeLoad: async ({ context: { queryClient }, search }) => {
        const currentUser = queryClient.getQueryData(queryKeys.authKey());

        if (search.authExpired) {
            await queryClient.invalidateQueries({ queryKey: queryKeys.authKey() });
            queryClient.clear();
            throw redirect({ to: "/", replace: true });
        }

        if (currentUser) {
            throw redirect({ to: "/boards", replace: true });
        }
    },
    component: LoginPage,
});


function LoginPage() {
    const handleGoogleSignIn = async () => {
        await authClient.signIn.social({ provider: "google" }, {
            onError: (ctx) => {
                toast.error(ctx.error.message);
            },
        })
    };

    return (
        <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-6 p-8 rounded-lg shadow-md bg-white">
                <h1 className="text-2xl font-bold text-gray-900">
                    Welcome to Tresso
                </h1>
                <p className="text-gray-500">
                    Sign in to continue to your boards
                </p>
                <Button size="lg" className="w-full" onClick={handleGoogleSignIn}>
                    <LogIn className="mr-2"/>
                    Sign in with Google
                </Button>
            </div>
        </div>
    );
}
