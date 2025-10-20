/**
 This file is the entry point for the server in production mode.
 It loads the TanStack Start handler and registers static file routes.
 **/

import path from "path";
import {fileURLToPath} from "bun";


const PORT = Number(process.env.PORT ?? 3000);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CLIENT_DIR = path.resolve(__dirname, "dist/client");
const SERVER_ENTRY = path.resolve(__dirname, "dist/server/server.js");


const startServer = async () => {
    console.log("[INFO] Starting server...");

    // Load TanStack Start handler
    const { default: handler } = await import(SERVER_ENTRY);
    console.log("[SUCCESS] TanStack Start handler loaded");

    // Scan and register static file routes at startup
    const glob = new Bun.Glob("**/*");
    const routes: Record<string, () => Response> = {};

    for await (const relativePath of glob.scan({ cwd: CLIENT_DIR })) {
        const filepath = path.join(CLIENT_DIR, relativePath);
        const route = `/${relativePath.split(path.sep).join(path.posix.sep)}`;

        // Create route handler that serves file on-demand
        routes[route] = () => {
            const file = Bun.file(filepath);
            return new Response(file, {
                headers: {
                    "Content-Type": file.type || "application/octet-stream",
                    "Cache-Control": "public, max-age=31536000, immutable",
                },
            })
        }
    }

    console.log(`[SUCCESS] Registered ${Object.keys(routes).length} static routes`);

    // Start Bun server
    const server = Bun.serve({
        port: PORT,
        routes: {
            ...routes,
            "/*": (req: Request) => handler.fetch(req),
        },
        error(err: unknown) {
            console.error("[ERROR]", err);
            return new Response("Internal Server Error", { status: 500 });
        },
    })

    console.log(`[SUCCESS] Server running on http://localhost:${server.port}`);
};


startServer().catch((err) => {
    console.error('[ERROR] Failed to start server:', err);
    process.exit(1);
})
