import z from "zod";
import {createMiddleware} from "@tanstack/react-start";
import {FormattedError} from "~/lib/utils/error-classes";
import {isNotFound, isRedirect} from "@tanstack/react-router";


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
    catch (err) {
        if (isRedirect(err) || isNotFound(err) || err instanceof FormattedError) {
            throw err;
        }

        console.error("Error:", err);

        if (err instanceof z.ZodError) {
            throw new Error("A Validation error occurred. Please try again later.", { cause: err });
        }
        else {
            throw new Error("An Unexpected error occurred. Please try again later.", { cause: err });
        }
    }
});
