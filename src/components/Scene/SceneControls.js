import { useEffect, useRef, useState } from "react";
import {
    MdTune,
    MdClose,
    MdAddPhotoAlternate,
    MdCropFree,
    MdDeleteOutline,
    MdCheck,
    MdLightMode,
    MdDarkMode
} from "react-icons/md";

import PhotoCanvas from "./PhotoCanvas";
import WallColorPicker from "./WallColorPicker";

import "./Scene.css";

/* ==========================================================
   SCENE CONTROLS (Porsche "Adjust scene")
   - Background: None / Landmark / My home / Upload
   - None       -> Wall colour picker (preview only)
   - Landmark / My home -> Time of day (Day / Night)
   background: "none" | "house" | "custom"
   customDimension: Landmark disabled (None / My home / Upload allowed)
========================================================== */

function SceneControls({
    viewMode,
    onViewModeChange,

    background,
    onBackgroundChange,
    houseThumbUrl,
    customDimension,

    wallColor,
    onWallColorChange,

    homePhoto,
    onUploadFile,
    onRemark,
    onRemove,

    uploading,
    message
}) {

    const [open, setOpen] = useState(false);

    const rootRef = useRef(null);
    const fileInputRef = useRef(null);

    // Close on outside click
    useEffect(() => {

        if (!open) {
            return undefined;
        }

        const handleOutside = (event) => {
            if (rootRef.current && !rootRef.current.contains(event.target)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleOutside);

        return () => document.removeEventListener("mousedown", handleOutside);

    }, [open]);

    const hasPhoto = !!homePhoto?.opening;
    const isNone = background === "none";
    const isNight = viewMode === "night";

    const handleFileChange = (event) => {

        const file = event.target.files?.[0];

        // Allow choosing the same file again later
        event.target.value = "";

        if (file) {
            setOpen(false);
            onUploadFile(file);
        }
    };

    const thumbClass = (value, extra = "") =>
        [
            "scene-controls__thumb",
            background === value ? "active" : "",
            extra
        ].join(" ").trim();

    const renderCheck = (value) =>
        background === value ? (
            <span className="scene-controls__check"><MdCheck /></span>
        ) : null;

    return (
        <div className="scene-controls" ref={rootRef}>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.heic,.heif,.tif,.tiff,.jfif,.avif,.svg"
                className="scene-controls__file"
                onChange={handleFileChange}
            />

            {!open && (
                <button
                    type="button"
                    className="scene-controls__toggle"
                    aria-expanded={false}
                    onClick={() => setOpen(true)}
                >
                    <MdTune />
                    <span>Adjust scene</span>
                </button>
            )}

            {open && (
                <div className="scene-controls__panel" role="dialog" aria-label="Adjust scene">

                    <div className="scene-controls__header">

                        <span className="scene-controls__heading">Adjust scene</span>

                        <button
                            type="button"
                            className="scene-controls__close"
                            aria-label="Close"
                            onClick={() => setOpen(false)}
                        >
                            <MdClose />
                        </button>

                    </div>

                    {/* ---------- Background ---------- */}

                    <div className="scene-controls__label">Background</div>

                    <div className="scene-controls__thumbs">

                        {/* None – plain wall colour */}

                        <div className="scene-controls__item">
                            <button
                                type="button"
                                className={thumbClass("none", "none")}
                                aria-pressed={isNone}
                                title="Plain background"
                                style={wallColor ? { background: wallColor } : undefined}
                                onClick={() => onBackgroundChange("none")}
                            >
                                {renderCheck("none")}
                            </button>
                            <span className="scene-controls__caption">None</span>
                        </div>

                        {/* Landmark photo – standard sizes only */}

                        <div className="scene-controls__item">
                            <button
                                type="button"
                                className={thumbClass("house")}
                                aria-pressed={background === "house"}
                                title={
                                    customDimension
                                        ? "Available for standard door sizes only"
                                        : "Landmark home"
                                }
                                disabled={customDimension}
                                onClick={() => onBackgroundChange("house")}
                            >
                                {/* Same-origin image – allowed by CSP 'self' */}
                                <img src={houseThumbUrl} alt="Landmark home" draggable={false} />
                                {renderCheck("house")}
                            </button>
                            <span className="scene-controls__caption">Landmark</span>
                        </div>

                        {/* Customer photo – any size */}

                        {hasPhoto && (
                            <div className="scene-controls__item">
                                <button
                                    type="button"
                                    className={thumbClass("custom")}
                                    aria-pressed={background === "custom"}
                                    title="My home"
                                    onClick={() => onBackgroundChange("custom")}
                                >
                                    {/* Drawn on canvas (CSP blocks data: <img>) */}
                                    <PhotoCanvas
                                        src={homePhoto.url}
                                        width={homePhoto.width}
                                        height={homePhoto.height}
                                        label="My home"
                                    />
                                    {renderCheck("custom")}
                                </button>
                                <span className="scene-controls__caption">My home</span>
                            </div>
                        )}

                        {/* Upload – any size */}

                        <div className="scene-controls__item">
                            <button
                                type="button"
                                className="scene-controls__thumb upload"
                                title={hasPhoto ? "Upload a different photo" : "Upload your home"}
                                disabled={uploading}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <MdAddPhotoAlternate />
                            </button>
                            <span className="scene-controls__caption">
                                {uploading ? "Loading…" : "Upload"}
                            </span>
                        </div>

                    </div>

                    {customDimension && (
                        <div className="scene-controls__hint">
                            The Landmark home is available for standard door sizes only.
                        </div>
                    )}

                    {hasPhoto && (
                        <div className="scene-controls__actions">

                            <button
                                type="button"
                                className="scene-controls__link"
                                onClick={() => {
                                    setOpen(false);
                                    onRemark();
                                }}
                            >
                                <MdCropFree />
                                <span>Re-mark garage door</span>
                            </button>

                            <button
                                type="button"
                                className="scene-controls__link"
                                onClick={onRemove}
                            >
                                <MdDeleteOutline />
                                <span>Remove photo</span>
                            </button>

                        </div>
                    )}

                    {isNone ? (

                        /* ---------- Wall colour (None only) ---------- */

                        <>
                            <div className="scene-controls__label">Wall colour</div>

                            <WallColorPicker
                                value={wallColor}
                                onChange={onWallColorChange}
                            />

                            <div className="scene-controls__hint">
                                Preview only – match the shade of your brick or wall.
                            </div>
                        </>

                    ) : (

                        /* ---------- Time of day (photos only) ---------- */

                        <>
                            <div className="scene-controls__label">Time of day</div>

                            <div className="scene-controls__segment">

                                <button
                                    type="button"
                                    className={!isNight ? "scene-controls__option active" : "scene-controls__option"}
                                    aria-pressed={!isNight}
                                    onClick={() => onViewModeChange("day")}
                                >
                                    <MdLightMode />
                                    <span>Day</span>
                                </button>

                                <button
                                    type="button"
                                    className={isNight ? "scene-controls__option active" : "scene-controls__option"}
                                    aria-pressed={isNight}
                                    onClick={() => onViewModeChange("night")}
                                >
                                    <MdDarkMode />
                                    <span>Night</span>
                                </button>

                            </div>
                        </>

                    )}

                    {message && (
                        <div className="scene-controls__message">{message}</div>
                    )}

                    {/* <div className="scene-controls__note">
                        Your photo stays on this device and is not uploaded to our servers.
                    </div> */}

                </div>
            )}

            {/* Error shown even when the panel is closed */}
            {!open && message && (
                <div className="scene-controls__toast">{message}</div>
            )}

        </div>
    );
}

export default SceneControls;
