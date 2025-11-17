import React, {RefObject, useRef} from "react";


export const useDragScroll = (containerRef: RefObject<HTMLDivElement | null>) => {
    const drag = useRef({ isDown: false, startX: 0, scrollLeft: 0 });

    const onMouseDown = (ev: React.MouseEvent) => {
        const el = containerRef.current;
        if (!el) return;

        drag.current.isDown = true;
        drag.current.scrollLeft = el.scrollLeft;
        el.classList.add("cursor-grabbing");
        drag.current.startX = ev.pageX - el.offsetLeft;
    };

    const onMouseMove = (ev: React.MouseEvent) => {
        if (!drag.current.isDown) return;

        const el = containerRef.current;
        if (!el) return;

        const x = ev.pageX - el.offsetLeft;
        el.scrollLeft = drag.current.scrollLeft - (x - drag.current.startX);
    };

    const endDrag = () => {
        drag.current.isDown = false;
        containerRef.current?.classList.remove("cursor-grabbing");
    };

    return { onMouseDown, onMouseMove, onMouseUp: endDrag, onMouseLeave: endDrag };
};