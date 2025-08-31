import {auth} from "~/server/auth/auth";
import {redirect} from "@tanstack/react-router";
import {createMiddleware} from "@tanstack/react-start";
import {getWebRequest} from "@tanstack/react-start/server";


export const authMiddleware = createMiddleware({ type: "function" }).server(async ({ next }) => {
    const { headers } = getWebRequest();
    const session = await auth.api.getSession({ headers, query: { disableCookieCache: true } });

    if (!session) {
        throw redirect({ to: "/", search: { authExpired: true }, statusCode: 401 });
    }

    return next({
        context: {
            currentUser: {
                ...session.user,
                id: Number(session.user.id),
            }
        }
    });
});
