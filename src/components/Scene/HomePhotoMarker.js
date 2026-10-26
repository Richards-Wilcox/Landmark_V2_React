import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MdClose } from "react-icons/md";

import PhotoCanvas from "./PhotoCanvas";

/* ==========================================================
   HOME PHOTO MARKER
   Full-screen dialog: customer drags a box around the
   garage door in their photo. Returns the box in image px.
   - Rendered on <body> (portal) so it covers the window
   - Photo drawn on a canvas (CSP blocks data: <img>)
   - Photo fitted to the free space by JS (no scroll bar)
========================================================== */

// Minimum box size (fraction of the image)
const MIN_BOX = 0.03;

const clamp01 = (value) => Math.max(0, Math.min(1, value));

function HomePhotoMarker({ photo, onConfirm, onCancel }) {

    const photoRef = useRef(null);
    const stageRef = useRef(null);
    const dragStartRef = useRef(null);

    // Photo display size: fitted inside the stage (no scroll bar)
    const [fitSize, setFitSize] = useState(null);

    // Box stored as fractions (0..1) of the image
    const [box, setBox] = useState(() => {

        const opening = photo?.opening;

        if (!opening) {
            return null;
        }

        return {
            x: opening.x / photo.width,
            y: opening.y / photo.height,
            width: opening.width / photo.width,
            height: opening.height / photo.height
        };
    });

    useLayoutEffect(() => {

        const stage = stageRef.current;

        if (!stage) {
            return undefined;
        }

        const fit = () => {

            const styles = getComputedStyle(stage);

            const availW =
                stage.clientWidth -
                parseFloat(styles.paddingLeft) -
                parseFloat(styles.paddingRight);

            const availH =
                stage.clientHeight -
                parseFloat(styles.paddingTop) -
                parseFloat(styles.paddingBottom);

            if (availW <= 0 || availH <= 0) {
                return;
            }

            const scale = Math.min(
                availW / photo.width,
                availH / photo.height
            );

            setFitSize({
                width: Math.floor(photo.width * scale),
                height: Math.floor(photo.height * scale)
            });
        };

        fit();

        const observer = new ResizeObserver(fit);
        observer.observe(stage);

        return () => observer.disconnect();

    }, [photo.width, photo.height]);

    // Lock page scroll while the dialog is open
    useEffect(() => {

        const previous = document.body.style.overflow;

        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previous;
        };

    }, []);

    // Esc = cancel
    useEffect(() => {

        const handleKey = (event) => {
            if (event.key === "Escape") {
                onCancel();
            }
        };

        document.addEventListener("keydown", handleKey);

        return () => document.removeEventListener("keydown", handleKey);

    }, [onCancel]);

    const getPoint = (event) => {

        const rect = photoRef.current.getBoundingClientRect();

        return {
            x: clamp01((event.clientX - rect.left) / rect.width),
            y: clamp01((event.clientY - rect.top) / rect.height)
        };
    };

    const handlePointerDown = (event) => {

        if (!photoRef.current) {
            return;
        }

        event.preventDefault();

        const point = getPoint(event);

        dragStartRef.current = point;

        setBox({ x: point.x, y: point.y, width: 0, height: 0 });

        event.currentTarget.setPointerCapture(event.pointerId);
    };

    const handlePointerMove = (event) => {

        const start = dragStartRef.current;

        if (!start) {
            return;
        }

        const point = getPoint(event);

        setBox({
            x: Math.min(start.x, point.x),
            y: Math.min(start.y, point.y),
            width: Math.abs(point.x - start.x),
            height: Math.abs(point.y - start.y)
        });
    };

    const handlePointerUp = (event) => {

        dragStartRef.current = null;

        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }
    };

    const isValid =
        !!box &&
        box.width >= MIN_BOX &&
        box.height >= MIN_BOX;

    const handleConfirm = () => {

        if (!isValid) {
            return;
        }

        onConfirm({
            x: Math.round(box.x * photo.width),
            y: Math.round(box.y * photo.height),
            width: Math.round(box.width * photo.width),
            height: Math.round(box.height * photo.height)
        });
    };

    // Rendered on <body>: position: fixed is then relative to the
    // window, not to a ConfigureOne container
    return createPortal(
        <div
            id="rw-photo-marker-root"
            className="home-photo-marker"
            role="dialog"
            aria-modal="true"
            aria-label="Mark your garage door"
        >

            <div className="home-photo-marker__panel">

                {/* Header */}

                <div className="home-photo-marker__header">

                    <div>
                        <h3 className="home-photo-marker__title">
                            Mark your garage door
                        </h3>
                        <p className="home-photo-marker__hint">
                            Drag a box around your garage door. For best results,
                            use a photo taken straight on.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="home-photo-marker__close"
                        aria-label="Cancel"
                        onClick={onCancel}
                    >
                        <MdClose />
                    </button>

                </div>

                {/* Photo + box */}

                <div className="home-photo-marker__stage" ref={stageRef}>

                    <div
                        className="home-photo-marker__image-wrap"
                        style={
                            fitSize
                                ? { width: fitSize.width, height: fitSize.height }
                                : { visibility: "hidden" }
                        }
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerCancel={handlePointerUp}
                    >

                        <PhotoCanvas
                            ref={photoRef}
                            className="home-photo-marker__image"
                            src={photo.url}
                            width={photo.width}
                            height={photo.height}
                            label="Your home"
                        />

                        {box && (
                            <div
                                className="home-photo-marker__box"
                                style={{
                                    left: `${box.x * 100}%`,
                                    top: `${box.y * 100}%`,
                                    width: `${box.width * 100}%`,
                                    height: `${box.height * 100}%`
                                }}
                            />
                        )}

                    </div>

                </div>

                {/* Footer */}

                <div className="home-photo-marker__footer">

                    <button
                        type="button"
                        className="home-photo-marker__button"
                        disabled={!box}
                        onClick={() => setBox(null)}
                    >
                        Clear
                    </button>

                    <div className="home-photo-marker__footer-right">

                        <button
                            type="button"
                            className="home-photo-marker__button"
                            onClick={onCancel}
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            className="home-photo-marker__button primary"
                            disabled={!isValid}
                            onClick={handleConfirm}
                        >
                            Use this photo
                        </button>

                    </div>

                </div>

            </div>

        </div>,
        document.body
    );
}

export default HomePhotoMarker;
