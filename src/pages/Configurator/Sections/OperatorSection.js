import { useState, useEffect, useRef } from "react";

import {
    OPERATOR_OPTIONS,
    OPERATOR_BRACKETS,
    OPERATOR_ACCESSORIES,
    DEFAULT_OPERATOR,
    getOperatorImageUrl,
    applyAccessoryChange
} from "../../../Data/operatorData";

import { toggleValue } from "../../../utils/toggleValue";


/* ==========================================================
   OPERATOR SECTION (port of LOAD_HTML.js #OPERATOR_OPTIONS)

   Carousel = old populateCarousel():
   - one clone of the last slide in front, one clone of the
     first slide at the end
   - position 1..n = real slides, slide moves with translateX
   - after sliding onto a clone it jumps (no animation) to the
     real slide -> infinite loop
========================================================== */

const COUNT = OPERATOR_OPTIONS.length;

// [last clone, ...real slides, first clone]
const SLIDES = [
    OPERATOR_OPTIONS[COUNT - 1],
    ...OPERATOR_OPTIONS,
    OPERATOR_OPTIONS[0]
];

const toDataIndex = (position) => ((position - 1) % COUNT + COUNT) % COUNT;

const positionFromValue = (value) =>
    Math.max(0, OPERATOR_OPTIONS.findIndex(option => option.value === value)) + 1;

/* Image with the old retry (5 x 1s), hidden if it still fails */
function OperatorImage({ file }) {

    const [attempt, setAttempt] = useState(0);
    const [hidden, setHidden] = useState(!file);
    const timer = useRef(null);

    useEffect(() => () => clearTimeout(timer.current), []);

    const url = getOperatorImageUrl(file);

    const handleError = () => {
        if (attempt < 5) {
            timer.current = setTimeout(() => setAttempt(a => a + 1), 1000);
        } else {
            setHidden(true);
        }
    };

    return (
        <div className="carousel-operator-image">
            {url && (
                <img
                    src={attempt ? `${url}?retry=${attempt}` : url}
                    alt=""
                    style={{ visibility: hidden ? "hidden" : "visible" }}
                    onLoad={() => setHidden(false)}
                    onError={handleError}
                />
            )}
        </div>
    );
}

/* Accessory image – icon placeholder when nothing is selected */
function AccessoryImage({ file }) {

    const [failed, setFailed] = useState(false);

    useEffect(() => setFailed(false), [file]);

    const showImage = !!file && !failed;

    return (
        <div
            className={
                showImage
                    ? "image-placeholder-container"
                    : "image-placeholder-container empty"
            }
        >
            {showImage ? (
                <img
                    className="rw-image-input-img"
                    src={getOperatorImageUrl(file)}
                    alt=""
                    onError={() => setFailed(true)}
                />
            ) : (
                <svg
                    className="image-placeholder-icon"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.86 8.86-3 3.87L9 13.14 6 17h12l-3.86-5.14z" />
                </svg>
            )}
        </div>
    );
}

function OperatorSection({
    operator = DEFAULT_OPERATOR,
    onChange = () => { },
    renderSelectionIndicator
}) {

    const values = { ...DEFAULT_OPERATOR, ...operator };

    /* ---------- Carousel ---------- */

    const [position, setPosition] = useState(() => positionFromValue(values.operator));
    const [animate, setAnimate] = useState(true);

    // Restored / changed from outside -> jump without animation
    useEffect(() => {
        const current = OPERATOR_OPTIONS[toDataIndex(position)].value;
        if (current !== values.operator) {
            setAnimate(false);
            setPosition(positionFromValue(values.operator));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [values.operator]);

    // Turn animation back on after a jump
    useEffect(() => {
        if (animate) return undefined;
        const frame = requestAnimationFrame(() => setAnimate(true));
        return () => cancelAnimationFrame(frame);
    }, [animate]);

    const goTo = (nextPosition) => {
        setAnimate(true);
        setPosition(nextPosition);
        onChange({ operator: OPERATOR_OPTIONS[toDataIndex(nextPosition)].value });
    };

    // Old indexCorrectionList(): clone -> real slide
    const handleTransitionEnd = () => {
        if (position > COUNT) {
            setAnimate(false);
            setPosition(1);
        } else if (position < 1) {
            setAnimate(false);
            setPosition(COUNT);
        }
    };

    const activeDot = toDataIndex(position);

    /* ---------- Bracket ---------- */

    // Same as Glazing: clicking the selected bracket clears it
    
    const handleBracket = (value) => {
        toggleValue(values.bracket, value, bracket => onChange({ bracket }));
    };

    /* ---------- Render ---------- */

    return (
        <>
            <div className="operator-card">

                <div className="operator-select-header">
                    <div className="landmark-section-header">
                        Operator Model
                    </div>
                    <span className="operator-select-count">
                        {activeDot + 1} / {OPERATOR_OPTIONS.length}
                    </span>
                </div>

                <div className="operator-carousel-wrapper">

                    <div
                        className="operator-arrow"
                        role="button"
                        tabIndex={0}
                        aria-label="Previous operator"
                        onClick={() => goTo(position - 1)}
                        onKeyDown={e => e.key === "Enter" && goTo(position - 1)}
                    >
                        <svg viewBox="0 0 640 640">
                            <path d="M406.7 105.3C394.2 92.8 373.9 92.8 361.4 105.3L169.4 297.3C156.9 309.8 156.9 330.1 169.4 342.6L361.4 534.6C373.9 547.1 394.2 547.1 406.7 534.6C419.2 522.1 419.2 501.8 406.7 489.3L237.3 320L406.7 150.7C419.2 138.2 419.2 117.8 406.7 105.3Z" />
                        </svg>
                    </div>

                    <div className="carousel-container-slide">
                        <div
                            id="operator-carousel-container"
                            style={{
                                transform: `translateX(-${position * 100}%)`,
                                transition: animate ? "transform 0.3s ease" : "none"
                            }}
                            onTransitionEnd={handleTransitionEnd}
                        >
                            {SLIDES.map((option, index) => (
                                <div
                                    key={`${option.id}-${index}`}
                                    className={
                                        index === position
                                            ? "carousel-operator-item active"
                                            : "carousel-operator-item"
                                    }
                                >
                                    <OperatorImage file={option.image} />
                                    <h3>{option.name}</h3>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div
                        className="operator-arrow"
                        role="button"
                        tabIndex={0}
                        aria-label="Next operator"
                        onClick={() => goTo(position + 1)}
                        onKeyDown={e => e.key === "Enter" && goTo(position + 1)}
                    >
                        <svg viewBox="0 0 640 640">
                            <path d="M233.3 534.6C245.8 547.1 266.1 547.1 278.6 534.6L470.6 342.6C483.1 330.1 483.1 309.8 470.6 297.3L278.6 105.3C266.1 92.8 245.8 92.8 233.3 105.3C220.8 117.8 220.8 138.2 233.3 150.7L402.7 320L233.3 489.3C220.8 501.8 220.8 522.1 233.3 534.6Z" />
                        </svg>
                    </div>

                </div>

                <div className="operator-pagination">
                    {OPERATOR_OPTIONS.map((option, index) => (
                        <button
                            key={option.id}
                            type="button"
                            aria-label={`Select ${option.name}`}
                            className={
                                index === activeDot
                                    ? "operator-dot operator-dot-active"
                                    : "operator-dot"
                            }
                            onClick={() => goTo(index + 1)}
                        />
                    ))}
                </div>

            </div>

            <div className="operator-accessories">

                {/* ---------- Operator Bracket Mount ---------- */}

                <div className="operator-accessory-card">
                    <div className="horizontal-inputs" style={{ width: "100%" }}>
                        <div className="image-input-cell" style={{ width: "100%" }}>
                            <h3 className="config-option-label-style">
                                Operator Bracket Mount
                            </h3>
                            <div className="door-model-buttons">
                                {OPERATOR_BRACKETS.map(bracket => {
                                    const isSelected = values.bracket === bracket.value;
                                    return (
                                        <div
                                            key={bracket.value}
                                            role="radio"
                                            aria-checked={isSelected}
                                            tabIndex={0}
                                            className={
                                                isSelected
                                                    ? "door-model-button active"
                                                    : "door-model-button"
                                            }
                                            onClick={() => handleBracket(bracket.value)}
                                            onKeyDown={e => e.key === "Enter" && handleBracket(bracket.value)}
                                        >
                                            {bracket.label}
                                            {renderSelectionIndicator?.(isSelected)}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ---------- Accessories ---------- */}

                {OPERATOR_ACCESSORIES.map(item => {

                    const selected = values[item.id] || "NONE";
                    const qtyId = `${item.id}_QTY`;
                    const isNone = selected === "NONE";
                    const option = item.options.find(o => o.value === selected);

                    return (
                        <div className="operator-accessory-card" key={item.id}>

                            <AccessoryImage file={option?.img} />

                            <div
                                className="horizontal-inputs horizontal-inputs--quantity"
                                style={{ width: "75%" }}
                            >
                                <div className="image-input-cell">
                                    <h3 className="config-option-label-style">
                                        {item.label}
                                    </h3>
                                    <select
                                        id={`${item.id}_SELECT`}
                                        style={{ width: "75%" }}
                                        value={selected}
                                        onChange={e =>
                                            onChange(applyAccessoryChange({}, item.id, e.target.value))
                                        }
                                    >
                                        <option value="NONE">{item.noneLabel}</option>
                                        {item.options.map(o => (
                                            <option key={o.value} value={o.value}>
                                                {o.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="image-input-cell">
                                    <h3 className="config-option-label-style">Qty</h3>
                                    <select
                                        id={`${qtyId}_SELECT`}
                                        style={{ minWidth: 50 }}
                                        disabled={isNone}
                                        value={isNone ? "0" : (values[qtyId] || "1")}
                                        onChange={e => onChange({ [qtyId]: e.target.value })}
                                    >
                                        {isNone && <option value="0">0</option>}
                                        {item.quantities.map(q => (
                                            <option key={q} value={q}>{q}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                        </div>
                    );
                })}

            </div>
        </>
    );
}

export default OperatorSection;
