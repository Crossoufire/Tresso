import {toast} from "sonner";
import authClient from "~/lib/utils/auth-client";
import {Button} from "~/lib/client/components/ui/button";
import {createFileRoute, redirect} from "@tanstack/react-router";
import {authOptions} from "~/lib/client/react-query/query-options";
import {ArrowRight, Columns3, GripVertical, Layers3} from "lucide-react";


export const Route = createFileRoute("/")({
    validateSearch: ({ search }) => search as { authExpired?: boolean },
    beforeLoad: async ({ context: { queryClient }, search }) => {
        const currentUser = queryClient.getQueryData(authOptions.queryKey);

        if (search.authExpired) {
            await queryClient.invalidateQueries({ queryKey: authOptions.queryKey });
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
        <main className="relative flex min-h-screen flex-col overflow-hidden">
            <header className="mx-auto flex w-full max-w-6xl items-center px-6 py-6 lg:px-8">
                <div className="flex items-center gap-2.5">
                    <span className="grid size-8 place-items-center rounded-lg bg-foreground text-background">
                        <GripVertical/>
                    </span>
                    <span className="font-heading text-base font-medium tracking-tight">Tresso</span>
                </div>
            </header>

            <div className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-16 px-6 py-12 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
                <section className="max-w-2xl">
                    <p className="mb-5 text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
                        Work, in clear view
                    </p>
                    <h1 className="font-heading text-5xl leading-[0.98] font-medium tracking-[-0.045em] text-balance sm:text-6xl lg:text-7xl">
                        A quieter place for work in progress.
                    </h1>
                    <p className="mt-7 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
                        Shape projects into boards, columns, and cards—then move the work forward without the noise.
                    </p>

                    <div className="mt-10 grid max-w-xl gap-px overflow-hidden rounded-xl bg-border ring-1 ring-border sm:grid-cols-2">
                        <div className="flex items-start gap-3 bg-card p-4">
                            <Columns3 className="mt-0.5 text-muted-foreground"/>
                            <div className="flex flex-col gap-1">
                                <p className="text-sm font-medium">Simple structure</p>
                                <p className="text-xs leading-5 text-muted-foreground">Only the boards and cards your work needs.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 bg-card p-4">
                            <Layers3 className="mt-0.5 text-muted-foreground"/>
                            <div className="flex flex-col gap-1">
                                <p className="text-sm font-medium">Fast movement</p>
                                <p className="text-xs leading-5 text-muted-foreground">Drag, reorder, and keep priorities visible.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mx-auto w-full max-w-sm rounded-2xl bg-card/80 p-1 ring-1 ring-foreground/10 backdrop-blur-xl">
                    <div className="flex flex-col gap-7 rounded-[calc(var(--radius)*1.4)] bg-background/45 p-7 sm:p-8">
                        <div className="flex flex-col gap-2">
                            <span className="grid size-10 place-items-center rounded-xl bg-secondary ring-1 ring-foreground/8">
                                <GripVertical/>
                            </span>
                            <h2 className="mt-3 font-heading text-xl font-medium tracking-tight">Welcome back</h2>
                            <p className="text-sm leading-6 text-muted-foreground">
                                Sign in to open your workspace and continue where you left off.
                            </p>
                        </div>
                        <Button size="lg" onClick={handleGoogleSignIn} className="w-full justify-between px-3">
                            Continue with Google
                            <ArrowRight data-icon="inline-end"/>
                        </Button>
                        <p className="text-center text-xs text-muted-foreground">One account. All of your boards.</p>
                    </div>
                </section>
            </div>
        </main>
    );
}
