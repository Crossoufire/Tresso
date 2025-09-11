/// <reference types="vite/client"/>
import {Toaster} from "sonner";
import React, {lazy} from "react";
import appCss from "~/styles.css?url";
import type {QueryClient} from "@tanstack/react-query";
import {authOptions} from "~/react-query/query-options";
import {createRootRouteWithContext, HeadContent, Outlet, Scripts} from "@tanstack/react-router";


export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
    beforeLoad: async ({ context: { queryClient } }) => {
        return queryClient.fetchQuery(authOptions);
    },
    head: () => ({
        meta: [
            { charSet: "utf-8" },
            { name: "viewport", content: "width=device-width, initial-scale=1" },
            { title: "Tresso" },
        ],
        links: [
            { rel: "stylesheet", href: appCss },
        ],
    }),
    component: RootComponent,
    shellComponent: RootComponent,
})


function RootComponent() {
    return (
        <RootDocument>
            <Outlet/>
        </RootDocument>
    )
}


function RootDocument({ children }: { children: React.ReactNode }) {
    return (
        <html suppressHydrationWarning>
        <head>
            <HeadContent/>
        </head>
        <body>

        <div className="h-screen flex flex-col min-h-0">
            <div className="flex-grow min-h-0 h-full flex flex-col">
                <Toaster/>
                {children}
            </div>
        </div>

        {import.meta.env.DEV && <ReactQueryDevtools/>}
        {import.meta.env.DEV && <TanStackRouterDevtools/>}

        <Scripts/>

        </body>
        </html>
    )
}


const TanStackRouterDevtools = lazy(() =>
    import("@tanstack/react-router-devtools").then((res) => ({ default: res.TanStackRouterDevtools }))
);

const ReactQueryDevtools = lazy(() =>
    import("@tanstack/react-query-devtools").then((res) => ({ default: res.ReactQueryDevtools }))
);