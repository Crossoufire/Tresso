import {config} from "dotenv";
import {defineConfig} from "vite";
import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import tsConfigPaths from "vite-tsconfig-paths";
import {tanstackStart} from "@tanstack/react-start/plugin/vite";


config();


export default defineConfig({
    server: {
        port: 3000,
    },
    plugins: [
        tsConfigPaths({ projects: ["./tsconfig.json"] }),
        tailwindcss(),
        tanstackStart({
            spa: {
                enabled: true,
            },
            customViteReactPlugin: true,
        }),
        viteReact({
            babel: {
                plugins: [["babel-plugin-react-compiler", { target: "19" }]],
            },
        }),
    ],
})

