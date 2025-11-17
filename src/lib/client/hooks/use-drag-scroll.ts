import React, {RefObject, useRef} from "react";


export const useDragScroll = (containerRef: RefObject<HTMLDivElement | null>) => {
    const drag = useRef({ isDown: false, startX: 0, scrollLeft: 0 });

    const onMouseDown = (ev: React.MouseEvent) => {
        const target = ev.target as HTMLElement;

        const interactiveSelector = '[draggable="true"], button, a, input, [role="menuitem"]';
        if (target.closest(interactiveSelector)) {
            return;
        }

        const container = containerRef.current;
        if (!container) return;

        drag.current.isDown = true;
        drag.current.scrollLeft = container.scrollLeft;
        container.classList.add("cursor-grabbing");
        drag.current.startX = ev.pageX - container.offsetLeft;
    };

    const onMouseMove = (ev: React.MouseEvent) => {
        if (!drag.current.isDown) return;
        ev.preventDefault();

        const container = containerRef.current;
        if (!container) return;
        
        container.scrollLeft = drag.current.scrollLeft - ((ev.pageX - container.offsetLeft) - drag.current.startX);
    };

    const endDrag = () => {
        drag.current.isDown = false;
        containerRef.current?.classList.remove("cursor-grabbing");
    };

    return { onMouseDown, onMouseMove, onMouseUp: endDrag, onMouseLeave: endDrag };
};
