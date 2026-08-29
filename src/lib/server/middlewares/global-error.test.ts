import {describe, expect, test} from "bun:test";
import {notFound, redirect} from "@tanstack/react-router";
import {errorMiddleware} from "~/lib/server/middlewares/global-error";


const runMiddleware = errorMiddleware.options.server!;


describe("global error middleware", () => {
    test("passes not-found results through unchanged", async () => {
        const result = notFound();

        try {
            await runMiddleware({ next: async () => { throw result; } } as never);
            throw new Error("Expected middleware to throw");
        }
        catch (error) {
            expect(error).toBe(result);
        }
    });

    test("passes redirects through unchanged", async () => {
        const result = redirect({ href: "/" });

        try {
            await runMiddleware({ next: async () => { throw result; } } as never);
            throw new Error("Expected middleware to throw");
        }
        catch (error) {
            expect(error).toBe(result);
        }
    });
});
