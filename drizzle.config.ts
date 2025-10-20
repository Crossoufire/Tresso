import {serverEnv} from "~/env/server";
import type {Config} from "drizzle-kit";


export default {
    strict: true,
    verbose: true,
    out: "./drizzle",
    breakpoints: true,
    dialect: "sqlite",
    casing: "snake_case",
    schema: "./src/lib/server/database/schemas/index.ts",
    dbCredentials: {
        url: serverEnv.DATABASE_URL,
    },
} satisfies Config;
