import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

import { getPhotoBitmap } from "./homePhoto";

/* ==========================================================
   PHOTO CANVAS
   Shows a stored home photo (data URL) WITHOUT an <img>.
   ConfigureOne CSP (img-src 'self' https://app.pendo.io)
   blocks data: / blob: images, but drawing on a canvas is
   allowed. Use it exactly like an <img>:
   className / style work the same, and the canvas keeps the
   photo's aspect ratio (width / height attributes).
========================================================== */

const PhotoCanvas = forwardRef(function PhotoCanvas(
    { src, width, height, className, style, label },
    ref
) {

    const canvasRef = useRef(null);

    // Parent refs get the <canvas> element (getBoundingClientRect etc.)
    useImperativeHandle(ref, () => canvasRef.current);

    useEffect(() => {

        if (!src) {
            return undefined;
        }

        let cancelled = false;

        getPhotoBitmap(src)
            .then(bitmap => {

                const canvas = canvasRef.current;

                if (cancelled || !canvas) {
                    return;
                }

                canvas.width = bitmap.width;
                canvas.height = bitmap.height;

                canvas.getContext("2d").drawImage(bitmap, 0, 0);
            })
            .catch(err => {
                console.error("Home photo could not be drawn:", err);
            });

        return () => {
            cancelled = true;
        };

    }, [src]);

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className={className}
            style={style}
            role="img"
            aria-label={label}
        />
    );
});

export default PhotoCanvas;
