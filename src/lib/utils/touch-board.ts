import {eq} from "drizzle-orm";
import {createServerOnlyFn} from "@tanstack/react-start";
import {db} from "~/lib/server/database/db";
import {boards} from "~/lib/server/database/schemas";


export const touchBoard = createServerOnlyFn(async (boardId: number) => {
    await db
        .update(boards)
        .set({ updatedAt: new Date() })
        .where(eq(boards.id, boardId));
});
