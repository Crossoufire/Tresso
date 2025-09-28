import {createFileRoute, redirect} from "@tanstack/react-router";
import {authOptions} from "~/lib/client/react-query/query-options";


export const Route = createFileRoute("/_private")({
    beforeLoad: ({ context: { queryClient } }) => {
        const currentUser = queryClient.getQueryData(authOptions.queryKey);

        if (!currentUser) {
            throw redirect({ to: "/" });
        }
    },
});
