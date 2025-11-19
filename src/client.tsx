import {hydrateRoot} from "react-dom/client";
import * as MobileDragDrop from "mobile-drag-drop";
import {StartClient} from "@tanstack/react-start/client";
import {scrollBehaviourDragImageTranslateOverride} from "mobile-drag-drop/scroll-behaviour";


if (typeof window !== "undefined" && !(window as any).__mobile_drag_drop_polyfilled) {
    (window as any).__mobile_drag_drop_polyfilled = true;

    MobileDragDrop.polyfill({
        holdToDrag: 300,
        dragImageTranslateOverride: scrollBehaviourDragImageTranslateOverride,
    });

    window.addEventListener("touchmove", () => {
    }, { passive: false });
}


hydrateRoot(document, <StartClient/>);
