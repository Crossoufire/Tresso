import {toast} from "sonner";
import authClient from "~/utils/auth-client";
import {Button} from "~/components/ui/button";
import {authOptions} from "~/react-query/query-options";
import {createFileRoute, redirect} from "@tanstack/react-router";
import {CheckSquare, LogIn, StretchVertical, Zap} from "lucide-react";


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
        <div className="min-h-screen bg-gradient-to-br flex flex-col">
            <header className="p-6">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-400 rounded-lg flex items-center justify-center">
                        <StretchVertical className="w-5 h-5 text-white"/>
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent">
                        Tresso
                    </span>
                </div>
            </header>
            <div className="flex-1 flex items-center justify-center px-6 py-12">
                <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                                Organize your work and life with{" "}
                                <span className="bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent">
                                    Tresso
                                </span>
                            </h1>
                            <p className="text-xl text-gray-300 leading-relaxed">
                                A very simple, powerful way to organize your projects with boards, lists, and cards.
                                Keep everything structured and get more done.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="flex flex-col items-center text-center p-4 rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/20">
                                <div className="w-12 h-12 bg-blue-900/50 rounded-lg flex items-center justify-center mb-3">
                                    <CheckSquare className="w-6 h-6 text-blue-400"/>
                                </div>
                                <h3 className="font-semibold mb-1">Organize Tasks</h3>
                                <p className="text-sm text-gray-300">Create boards, lists, and cards to structure your work</p>
                            </div>
                            <div className="flex flex-col items-center text-center p-4 rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/20">
                                <div className="w-12 h-12 bg-purple-900/50 rounded-lg flex items-center justify-center mb-3">
                                    <Zap className="w-6 h-6 text-purple-400"/>
                                </div>
                                <h3 className="font-semibold mb-1">Stay Productive</h3>
                                <p className="text-sm text-gray-300">Drag, drop, and prioritize with ease</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-center lg:justify-end">
                        <div className="w-full max-w-md">
                            <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/20 p-8">
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <StretchVertical className="w-8 h-8"/>
                                    </div>
                                    <h2 className="text-2xl font-bold mb-2">
                                        Welcome to Tresso
                                    </h2>
                                    <p className="text-gray-300">
                                        Sign in to access your boards and start organizing
                                    </p>
                                </div>
                                <Button
                                    size="lg"
                                    onClick={handleGoogleSignIn}
                                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700
                                    font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                                >
                                    <LogIn className="w-5 h-5 mr-1"/> Continue with Google
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="absolute top-30 left-35 w-28 h-28 bg-blue-500/20 rounded-full blur-xl"></div>
            <div className="absolute top-40 right-20 w-32 h-32 bg-purple-500/20 rounded-full blur-xl"></div>
            <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-pink-500/20 rounded-full blur-xl"></div>
        </div>
    );
}
