import "./global-middleware";
import {toast} from "sonner";
import {routeTree} from "~/routeTree.gen";
import {NotFound} from "~/lib/client/components/NotFound";
import {MutationCache, QueryClient} from "@tanstack/react-query";
import {ErrorCatchBoundary} from "~/lib/client/components/ErrorCatchBoundary";
import {routerWithQueryClient} from "@tanstack/react-router-with-query";
import {createRouter as createTanStackRouter} from "@tanstack/react-router";


export function createRouter() {
    const queryClient: QueryClient = new QueryClient({
        mutationCache: new MutationCache({
            onError: (error) => {
                toast.error(error.message);
            },
        }),
        defaultOptions: {
            queries: {
                retry: false,
                staleTime: 2 * 1000,
                refetchOnWindowFocus: false,
                refetchOnReconnect: () => !queryClient.isMutating(),
            },
        },
    });

    const router = routerWithQueryClient(
        createTanStackRouter({
            routeTree,
            context: { queryClient },
            defaultSsr: false,
            defaultPreload: false,
            scrollRestoration: true,
            defaultPreloadStaleTime: 0,
            defaultStructuralSharing: true,
            defaultNotFoundComponent: NotFound,
            defaultErrorComponent: ErrorCatchBoundary,
        }),
        queryClient,
    )

    return router;
}


declare module "@tanstack/react-router" {
    interface Register {
        router: ReturnType<typeof createRouter>;
    }
}
