import type {Config} from "drizzle-kit";


export default {
    strict: true,
    verbose: true,
    out: "./drizzle",
    breakpoints: true,
    dialect: "sqlite",
    casing: "snake_case",
    schema: "./src/server/database/schemas/index.ts",
    dbCredentials: {
        url: process.env.DATABASE_URL as string,
    },
} satisfies Config;
