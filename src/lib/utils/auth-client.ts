import type {auth} from "~/lib/server/auth/auth";
import {createAuthClient} from "better-auth/react";
import {inferAdditionalFields} from "better-auth/client/plugins";


const authClient = createAuthClient({
    plugins: [inferAdditionalFields<typeof auth>()],
});


export default authClient;
