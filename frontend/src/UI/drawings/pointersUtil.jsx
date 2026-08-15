export default function handlePointers(el, msgRelay) {
    
    el.onpointerdown = e => {
        el.setPointerCapture(e.pointerId);

        msgRelay({
            el: el.id,
            type: e.type,
            x: e.clientX,
            y: e.clientY
        });
    };

    el.onpointermove = e => {
        msgRelay({
          el: el.id,
            type: e.type,
            x: e.clientX,
            y: e.clientY
        });
    };

    el.onpointerup = e => {
        msgRelay({
          el: el.id,
            type: e.type,
            x: e.clientX,
            y: e.clientY
        });

        if (el.hasPointerCapture(e.pointerId)) {
            el.releasePointerCapture(e.pointerId);
        }
    };

    el.onpointercancel = e => {
        if (el.hasPointerCapture(e.pointerId)) {
            el.releasePointerCapture(e.pointerId);
        }
    };
    
    return () => {
        el.onpointerdown = null;
        el.onpointermove = null;
        el.onpointerup = null;
        el.onpointercancel = null;
    };
}