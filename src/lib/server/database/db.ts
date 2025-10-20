import * as schema from "./schemas";
import {serverEnv} from "~/env/server";
import {drizzle} from "drizzle-orm/libsql";
import {createClient} from "@libsql/client";
import {createServerOnlyFn} from "@tanstack/react-start";


const client = createClient({ url: serverEnv.DATABASE_URL });


export const db = createServerOnlyFn(() => drizzle(client, { schema }))();
