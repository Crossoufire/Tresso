import {betterAuth} from "better-auth";
import {serverEnv} from "~/env/server";
import {clientEnv} from "~/env/client";
import {db} from "~/lib/server/database/db";
import {reactStartCookies} from "better-auth/react-start";
import {drizzleAdapter} from "better-auth/adapters/drizzle";


export const auth = betterAuth({
    appName: "Tresso",
    baseURL: clientEnv.VITE_BASE_URL,
    secret: serverEnv.BETTER_AUTH_SECRET,
    database: drizzleAdapter(db, {
        provider: "sqlite",
    }),
    socialProviders: {
        google: {
            clientId: serverEnv.GOOGLE_CLIENT_ID,
            clientSecret: serverEnv.GOOGLE_CLIENT_SECRET,
        },
    },
    advanced: {
        cookiePrefix: "tresso",
        database: {
            useNumberId: true,
        },
    },
    plugins: [
        reactStartCookies(),
    ]
});
