import {useEffect} from "react";
import * as MobileDragDrop from "mobile-drag-drop";
import {scrollBehaviourDragImageTranslateOverride} from "mobile-drag-drop/scroll-behaviour";


export const useMobileDragDrop = () => {
    useEffect(() => {
        MobileDragDrop.polyfill({
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
