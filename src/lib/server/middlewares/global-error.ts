import z from "zod";
import {createMiddleware} from "@tanstack/react-start";
import {FormattedError} from "~/lib/utils/error-classes";


function createCleanError(originalError: Error, message?: string): Error {
    const cleanError = new Error(message ? message : originalError.message);
    cleanError.name = originalError.name;
    delete cleanError.stack;

    return cleanError;
}


/**
 * Error Types and Logic
 * redirect: thrown in code but returned and handled frontend side by tanstack router.
 * notFound: thrown in code but returned and handled frontend side by tanstack router.
 * FormattedError: Expected Error with pre-formatted message for frontend side.
 * ZodError: Unexpected Error on validation, send admin email, return generic error message.
 * Error: Unexpected Error anywhere, send admin email, return generic error message.
 **/
export const errorMiddleware = createMiddleware({ type: "function" }).server(async ({ next }) => {
    try {
        const results = await next();
        return results;
    }
    catch (err: any) {
        if (process.env.NODE_ENV !== "production") {
            console.error("Error:", err);
        }
        if (err instanceof FormattedError) {
            throw createCleanError(err);
        }
        else if (err instanceof z.ZodError) {
            throw createCleanError(err, "A Validation error occurred. Please try again later.");
        }
        else {
            throw createCleanError(err, "An Unexpected error occurred. Please try again later.");
        }
    }
});
