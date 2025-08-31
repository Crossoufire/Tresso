import {registerGlobalMiddleware} from "@tanstack/react-start";
import {errorMiddleware} from "~/server/middlewares/global-error";


registerGlobalMiddleware({
    middleware: [errorMiddleware],
})
