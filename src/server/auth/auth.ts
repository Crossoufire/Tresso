import {betterAuth} from "better-auth";
import {db} from "~/server/database/db";
import {reactStartCookies} from "better-auth/react-start";
import {drizzleAdapter} from "better-auth/adapters/drizzle";


export const auth = betterAuth({
    appName: "Tresso",
    baseURL: process.env.VITE_BASE_URL,
    secret: process.env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(db, {
        provider: "sqlite",
    }),
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
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
