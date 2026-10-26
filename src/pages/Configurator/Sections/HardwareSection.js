import {
    HARDWARE_SETS,
    SPRING_TYPES,
    SPRING_CYCLES,
    INCLINED_TRACK_OPTIONS,
    LIFT_TYPES,
    JAMB_SEALS,
    HANGER_ANGLES,
    HANGER_ANGLE_QTY_MAX,
    SCREW_PACKAGES_MAX,
    SCREWS_PER_PACKAGE,
    JAMB_SEAL_CHART_URL,
    HIGHLIFT_MIN,
    HEADROOM_OFFSET,
    getHighliftMax,
    getAllowedLiftTypes,
    getSpringTypeDisabled,
    getSpringCycleDisabled
} from "../../../Data/hardwareData";



/* ==========================================================
   HARDWARE SECTION
   Port of the old #HARDWARE section (LOAD_HTML.js) +
   its rules (LOAD_DRIVEN_INPUTS.js).
   State lives in Configurator.js:
     hardware  – values (see DEFAULT_HARDWARE)
     onChange  – (patch) => void, rules applied by applyHardwareRules
========================================================== */

/* ---------- Small building blocks ---------- */

// Two-option switch (old combined-button / rw-sliding-button)
function SegmentedSwitch({ options, value, disabled = {}, onSelect, renderSelectionIndicator }) {

    const reason = Object.values(disabled)[0];

    return (
        <>
            <div className="segmented-toggle hw-segmented">

                {options.map(option => {

                    const isDisabled = !!disabled[option.value];
                    const isActive = value === option.value;

                    return (
                        <div
                            key={option.value}
                            role="radio"
                            aria-checked={isActive}
                            aria-disabled={isDisabled}
                            tabIndex={isDisabled ? -1 : 0}
                            title={disabled[option.value] || ""}
                            className={
                                [
                                    "segmented-option",
                                    isActive ? "active" : "",
                                    isDisabled ? "disabled" : ""
                                ].join(" ").trim()
                            }
                            onClick={() => {
                                if (!isDisabled) {
                                    onSelect(option.value);
                                }
                            }}
                            onKeyDown={event => {
                                if (!isDisabled && (event.key === "Enter" || event.key === " ")) {
                                    event.preventDefault();
                                    onSelect(option.value);
                                }
                            }}
                        >
                            {option.label}
                            {isActive && (
                                renderSelectionIndicator
                                    ? <span className="segmented-indicator">✓</span>
                                    : null
                            )}
                        </div>
                    );
                })}

            </div>

            {reason && (
                <div className="hw-note">{reason}</div>
            )}
        </>
    );
}

// - [ n ] + (old quantity-field)
function QuantityStepper({ id, value, max, disabled, onChange }) {

    const current = Number(value) || 0;

    const setValue = (next) => {
        const n = Math.floor(Number(next));
        onChange(Number.isFinite(n) ? Math.min(max, Math.max(0, n)) : 0);
    };

    return (
        <div className={disabled ? "hw-qty disabled" : "hw-qty"}>

            <button
                type="button"
                className="hw-qty__btn"
                aria-label="Decrease"
                disabled={disabled || current <= 0}
                onClick={() => setValue(current - 1)}
            >
                −
            </button>

            <input
                id={id}
                className="hw-qty__input"
                type="number"
                min={0}
                max={max}
                value={current}
                disabled={disabled}
                onChange={event => setValue(event.target.value)}
            />

            <button
                type="button"
                className="hw-qty__btn"
                aria-label="Increase"
                disabled={disabled || current >= max}
                onClick={() => setValue(current + 1)}
            >
                +
            </button>

        </div>
    );
}

/* ---------- Section ---------- */

function HardwareSection({
    hardware,
    onChange,
    renderSelectionIndicator
}) {

    const {
        hardwareSet,
        springType,
        inclinedTrack,
        liftType,
        highlift,
        springCycle,
        jambSeal,
        hangerAngle,
        hangerAngleQty,
        jambSealScrewPackages
    } = hardware;

    const hasHardware = !!hardwareSet;
    const isCommercial = hardwareSet === "C";

    const allowedLiftTypes = getAllowedLiftTypes(hardware);
    const visibleLiftTypes = LIFT_TYPES.filter(item =>
        allowedLiftTypes.includes(item.value)
    );

    const highliftMax = getHighliftMax(hardwareSet);
    const highliftValue = Number(highlift) || HIGHLIFT_MIN;

    // Old setupToggleRadioGroup: clicking the selected set clears it
    const handleHardwareSet = (value) => {
        onChange({ hardwareSet: value === hardwareSet ? "" : value });
    };

    return (
        <div className="hw-section">

            {/* ---------- Hardware Set ---------- */}

            <div className="landmark-section">

                <div className="landmark-section-header">Hardware Set</div>

                <div className="door-model-buttons">
                    {HARDWARE_SETS.map(item => (
                        <div
                            key={item.value}
                            role="radio"
                            aria-checked={hardwareSet === item.value}
                            tabIndex={0}
                            className={
                                hardwareSet === item.value
                                    ? "door-model-button active"
                                    : "door-model-button"
                            }
                            onClick={() => handleHardwareSet(item.value)}
                            onKeyDown={event => {
                                if (event.key === "Enter" || event.key === " ") {
                                    event.preventDefault();
                                    handleHardwareSet(item.value);
                                }
                            }}
                        >
                            {item.label}
                            {renderSelectionIndicator(hardwareSet === item.value)}
                        </div>
                    ))}
                </div>

            </div>

            {/* ---------- Spring Type + Inclined Track ---------- */}

            {hasHardware && (
                <div className="hw-row">

                    <div className="landmark-section">
                        <div className="landmark-section-header">Spring Type</div>
                        <SegmentedSwitch
                            options={SPRING_TYPES}
                            value={springType}
                            disabled={getSpringTypeDisabled(hardwareSet)}
                            onSelect={value => onChange({ springType: value })}
                            renderSelectionIndicator={renderSelectionIndicator}
                        />
                    </div>

                    {isCommercial && (
                        <div className="landmark-section">
                            <div className="landmark-section-header">Inclined Track</div>
                            <SegmentedSwitch
                                options={INCLINED_TRACK_OPTIONS}
                                value={inclinedTrack}
                                onSelect={value => onChange({ inclinedTrack: value })}
                                renderSelectionIndicator={renderSelectionIndicator}
                            />
                        </div>
                    )}

                </div>
            )}

            {/* ---------- Lift Type ---------- */}

            {hasHardware && visibleLiftTypes.length > 0 && (
                <div className="landmark-section">

                    <div className="landmark-section-header">Lift Type</div>

                    <div className="door-model-buttons hw-lift-grid">
                        {visibleLiftTypes.map(item => (
                            <div
                                key={item.value}
                                role="radio"
                                aria-checked={liftType === item.value}
                                tabIndex={0}
                                className={
                                    liftType === item.value
                                        ? "door-model-button active"
                                        : "door-model-button"
                                }
                                onClick={() => onChange({ liftType: item.value })}
                                onKeyDown={event => {
                                    if (event.key === "Enter" || event.key === " ") {
                                        event.preventDefault();
                                        onChange({ liftType: item.value });
                                    }
                                }}
                            >
                                {item.label}
                                {renderSelectionIndicator(liftType === item.value)}
                            </div>
                        ))}
                    </div>

                </div>
            )}

            {/* ---------- High Lift slider (High Lift only) ---------- */}

            {hasHardware && liftType === "HL" && (
                <div className="landmark-section">

                    <div className="landmark-section-header">
                        Highlift (in): <strong>{highliftValue}</strong>
                        <span className="hw-divider-text">|</span>
                        Low Headroom (in): <strong>{highliftValue + HEADROOM_OFFSET}</strong>
                    </div>

                    <input
                        id="HIGHLIFT"
                        className="hw-range"
                        type="range"
                        min={HIGHLIFT_MIN}
                        max={highliftMax}
                        value={highliftValue}
                        onChange={event => onChange({ highlift: Number(event.target.value) })}
                    />

                    <div className="hw-range__limits">
                        <span>{HIGHLIFT_MIN}"</span>
                        <span>{highliftMax}"</span>
                    </div>

                </div>
            )}

            {/* ---------- Spring Cycle + Jamb Seal ---------- */}

            <div className="hw-row">

                {hasHardware && (
                    <div className="landmark-section">
                        <div className="landmark-section-header">Spring Cycle</div>
                        <SegmentedSwitch
                            options={SPRING_CYCLES}
                            value={springCycle}
                            disabled={getSpringCycleDisabled(hardwareSet)}
                            onSelect={value => onChange({ springCycle: value })}
                            renderSelectionIndicator={renderSelectionIndicator}
                        />
                    </div>
                )}

                <div className="landmark-section">
                    <label className="landmark-section-header" htmlFor="JAMB_SEAL">
                        Jamb Seal
                    </label>
                    <select
                        id="JAMB_SEAL"
                        className="hw-select"
                        value={jambSeal}
                        onChange={event => onChange({ jambSeal: event.target.value })}
                    >
                        {JAMB_SEALS.map(item => (
                            <option key={item.value} value={item.value}>{item.label}</option>
                        ))}
                    </select>
                </div>

            </div>

            {/* ---------- Hanger Angle + Qty + Screw Packages ---------- */}

            <div className="hw-row three">

                <div className="landmark-section">
                    <label className="landmark-section-header" htmlFor="HANGER_ANGLE">
                        Hanger Angle
                    </label>
                    <select
                        id="HANGER_ANGLE"
                        className="hw-select"
                        value={hangerAngle}
                        onChange={event => onChange({ hangerAngle: event.target.value })}
                    >
                        {HANGER_ANGLES.map(item => (
                            <option key={item.value} value={item.value}>{item.label}</option>
                        ))}
                    </select>
                </div>

                <div className="landmark-section">
                    <label className="landmark-section-header" htmlFor="HANGER_ANGLE_QTY">
                        Hanger Qty
                    </label>
                    <QuantityStepper
                        id="HANGER_ANGLE_QTY"
                        value={hangerAngleQty}
                        max={HANGER_ANGLE_QTY_MAX}
                        onChange={value => onChange({ hangerAngleQty: value })}
                    />
                </div>

                <div className="landmark-section">
                    <label className="landmark-section-header hw-header-with-info" htmlFor="JAMB_SEAL_SCREW_PACKAGES">
                        Screw Packages
                        <a
                            className="hw-info"
                            href={JAMB_SEAL_CHART_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Jamb seal chart"
                        >
                            ?
                        </a>
                    </label>
                    <QuantityStepper
                        id="JAMB_SEAL_SCREW_PACKAGES"
                        value={jambSealScrewPackages}
                        max={SCREW_PACKAGES_MAX}
                        onChange={value => onChange({ jambSealScrewPackages: value })}
                    />
                    <div className="hw-note">{SCREWS_PER_PACKAGE} screws per package</div>
                </div>

            </div>

        </div>
    );
}

export default HardwareSection;
