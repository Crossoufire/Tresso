import {serverEnv} from "~/env/server";
import {defineConfig} from "drizzle-kit";


export default defineConfig({
    out: "./drizzle",
    schema: "./src/lib/server/database/schemas/index.ts",
    strict: true,
    verbose: true,
    breakpoints: true,
    dialect: "sqlite",
    casing: "snake_case",
    dbCredentials: {
        url: serverEnv.DATABASE_URL,
    },
});
