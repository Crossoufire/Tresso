import {toast} from "sonner";
import {routeTree} from "~/routeTree.gen";
import {createRouter} from "@tanstack/react-router";
import {NotFound} from "~/lib/client/components/NotFound";
import {MutationCache, QueryClient} from "@tanstack/react-query";
import {ErrorCatchBoundary} from "~/lib/client/components/ErrorCatchBoundary";
import {setupRouterSsrQueryIntegration} from "@tanstack/react-router-ssr-query";


export function getRouter() {
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

    const router = createRouter({
        routeTree,
        defaultPreload: false,
        scrollRestoration: true,
        context: { queryClient },
        defaultPreloadStaleTime: 0,
        defaultStructuralSharing: true,
        defaultNotFoundComponent: NotFound,
        defaultErrorComponent: ErrorCatchBoundary,
    })

    setupRouterSsrQueryIntegration({
        router,
        queryClient,
        handleRedirects: true,
        wrapQueryClient: true,
    });

    return router;
}
