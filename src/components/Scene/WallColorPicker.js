import { useEffect, useRef, useState } from "react";
import { MdRestartAlt } from "react-icons/md";
import "./WallColorPicker.css";

/* ==========================================================
   WALL COLOR PICKER (own component – no npm package)
   Same look as react-colorful:
   - Saturation / brightness square
   - Hue bar
   - Hex input + preview + Reset
   value:    "#rrggbb" or "" (default grey)
   onChange: (hex) => void
========================================================== */

const DEFAULT_PICKER_COLOR = "#b4b4b4";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/* ---------- Colour conversion ---------- */

function hexToRgb(hex) {

    const clean = (hex || "").replace("#", "").trim();

    const full = clean.length === 3
        ? clean.split("").map(c => c + c).join("")
        : clean;

    if (!/^[0-9a-fA-F]{6}$/.test(full)) {
        return null;
    }

    return {
        r: parseInt(full.slice(0, 2), 16),
        g: parseInt(full.slice(2, 4), 16),
        b: parseInt(full.slice(4, 6), 16)
    };
}

function rgbToHex({ r, g, b }) {
    return "#" + [r, g, b]
        .map(v => clamp(Math.round(v), 0, 255).toString(16).padStart(2, "0"))
        .join("");
}

function rgbToHsv({ r, g, b }) {

    const rn = r / 255;
    const gn = g / 255;
    const bn = b / 255;

    const max = Math.max(rn, gn, bn);
    const min = Math.min(rn, gn, bn);
    const d = max - min;

    let h = 0;

    if (d !== 0) {
        if (max === rn) h = ((gn - bn) / d) % 6;
        else if (max === gn) h = (bn - rn) / d + 2;
        else h = (rn - gn) / d + 4;
        h *= 60;
        if (h < 0) h += 360;
    }

    return { h, s: max === 0 ? 0 : d / max, v: max };
}

function hsvToRgb({ h, s, v }) {

    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;

    let r = 0;
    let g = 0;
    let b = 0;

    if (h < 60) { r = c; g = x; }
    else if (h < 120) { r = x; g = c; }
    else if (h < 180) { g = c; b = x; }
    else if (h < 240) { g = x; b = c; }
    else if (h < 300) { r = x; b = c; }
    else { r = c; b = x; }

    return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 };
}

const hexToHsv = (hex) =>
    rgbToHsv(hexToRgb(hex) || hexToRgb(DEFAULT_PICKER_COLOR));

const hsvToHex = (hsv) => rgbToHex(hsvToRgb(hsv));

/* ---------- Pointer drag (returns 0..1 x / y inside the element) ---------- */

function useDrag(onMove) {

    const ref = useRef(null);
    const moveRef = useRef(onMove);

    moveRef.current = onMove;

    const update = (event) => {

        const rect = ref.current.getBoundingClientRect();

        moveRef.current(
            clamp((event.clientX - rect.left) / rect.width, 0, 1),
            clamp((event.clientY - rect.top) / rect.height, 0, 1)
        );
    };

    const onPointerDown = (event) => {
        event.preventDefault();
        event.stopPropagation();
        event.currentTarget.setPointerCapture(event.pointerId);
        update(event);
    };

    const onPointerMove = (event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            update(event);
        }
    };

    const onPointerUp = (event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }
    };

    return { ref, onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp };
}

/* ---------- Component ---------- */

function WallColorPicker({ value, onChange }) {

    const [hsv, setHsv] = useState(() => hexToHsv(value || DEFAULT_PICKER_COLOR));
    const [hexText, setHexText] = useState((value || "").replace("#", ""));

    if (typeof onChange !== "function") {
        // Shows in DevTools if the prop is not wired in SceneControls / Configurator
        console.warn("WallColorPicker: onChange is missing – pass onWallColorChange from Configurator.");
    }

    const emit = (hex) => {
        if (typeof onChange === "function") {
            onChange(hex);
        }
    };

    // Outside change (Reset / other component) -> sync the picker
    useEffect(() => {

        if (!value) {
            setHexText("");
            return;
        }

        if (value.toLowerCase() !== hsvToHex(hsv).toLowerCase()) {
            setHsv(hexToHsv(value));
        }

        setHexText(value.replace("#", ""));

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    const apply = (next) => {
        setHsv(next);
        const hex = hsvToHex(next);
        setHexText(hex.replace("#", ""));
        emit(hex);
    };

    const satDrag = useDrag((x, y) =>
        apply({ h: hsv.h, s: x, v: 1 - y })
    );

    const hueDrag = useDrag((x) =>
        apply({ h: Math.min(359.9, x * 360), s: hsv.s, v: hsv.v })
    );

    const handleHexChange = (event) => {

        const text = event.target.value
            .replace(/[^0-9a-fA-F]/g, "")
            .slice(0, 6);

        setHexText(text);

        if (text.length === 6 || text.length === 3) {
            const rgb = hexToRgb(text);
            if (rgb) {
                const hex = rgbToHex(rgb);
                setHsv(rgbToHsv(rgb));
                emit(hex);
            }
        }
    };

    const hueColor = hsvToHex({ h: hsv.h, s: 1, v: 1 });
    const currentColor = hsvToHex(hsv);

    return (
        <div className="wall-picker">

            <div className="wall-picker__box">

                {/* Saturation / brightness */}

                <div
                    ref={satDrag.ref}
                    className="wall-picker__sat"
                    style={{ backgroundColor: hueColor }}
                    onPointerDown={satDrag.onPointerDown}
                    onPointerMove={satDrag.onPointerMove}
                    onPointerUp={satDrag.onPointerUp}
                    onPointerCancel={satDrag.onPointerCancel}
                    role="slider"
                    aria-label="Saturation and brightness"
                    aria-valuetext={value || "Default"}
                >
                    <div
                        className="wall-picker__pointer"
                        style={{
                            left: `${hsv.s * 100}%`,
                            top: `${(1 - hsv.v) * 100}%`,
                            backgroundColor: currentColor
                        }}
                    />
                </div>

                {/* Hue */}

                <div
                    ref={hueDrag.ref}
                    className="wall-picker__hue"
                    onPointerDown={hueDrag.onPointerDown}
                    onPointerMove={hueDrag.onPointerMove}
                    onPointerUp={hueDrag.onPointerUp}
                    onPointerCancel={hueDrag.onPointerCancel}
                    role="slider"
                    aria-label="Hue"
                    aria-valuemin={0}
                    aria-valuemax={360}
                    aria-valuenow={Math.round(hsv.h)}
                >
                    <div
                        className="wall-picker__pointer hue"
                        style={{
                            left: `${(hsv.h / 360) * 100}%`,
                            backgroundColor: hueColor
                        }}
                    />
                </div>

            </div>

            {/* Preview + hex + reset */}

            <div className="wall-picker__row">

                <span
                    className={value ? "wall-picker__preview" : "wall-picker__preview default"}
                    style={value ? { backgroundColor: value } : undefined}
                />

                <div className="wall-picker__hex-field">
                    <span className="wall-picker__hash">#</span>
                    <input
                        className="wall-picker__hex"
                        type="text"
                        value={hexText}
                        placeholder="Default"
                        maxLength={6}
                        spellCheck={false}
                        autoComplete="off"
                        aria-label="Hex colour"
                        onChange={handleHexChange}
                    />
                </div>

                <button
                    type="button"
                    className="wall-picker__reset"
                    disabled={!value}
                    title="Back to default grey"
                    onClick={() => emit("")}
                >
                    <MdRestartAlt />
                    <span>Reset</span>
                </button>

            </div>

        </div>
    );
}

export default WallColorPicker;
