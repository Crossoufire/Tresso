import {useEffect} from "react";
import {polyfill} from "mobile-drag-drop";
import {scrollBehaviourDragImageTranslateOverride} from "mobile-drag-drop/scroll-behaviour";


export const useMobileDragDrop = () => {
    useEffect(() => {
        polyfill({
            holdToDrag: 300,
            dragImageTranslateOverride: scrollBehaviourDragImageTranslateOverride,
        });

        const fixIosSafari = () => {
        };

        window.addEventListener("touchmove", fixIosSafari, { passive: false });

        return () => {
            window.removeEventListener("touchmove", fixIosSafari);
        };
    }, []);
};
