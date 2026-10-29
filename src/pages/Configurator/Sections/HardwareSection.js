import { useState, useEffect } from "react";

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

import { getOperatorImageUrl } from "../../../Data/operatorData";
import { toggleValue } from "../../../utils/toggleValue";

/* ==========================================================
   HARDWARE SECTION
   Port of the old #HARDWARE section (LOAD_HTML.js) +
   its rules (LOAD_DRIVEN_INPUTS.js).

   State lives in Configurator.js:
     hardware            – values (see DEFAULT_HARDWARE)
     onChange            – (patch) => void, rules applied by applyHardwareRules
     advancedOptions     – Decorative Hardware values (same EW ids as before:
                           DEC_HARDWARE, FULL_SETS, L_HANDLE ... MAGNETIC_SET)
     setAdvancedOptions  – setter for advancedOptions

   Decorative Hardware moved here from the Advanced card.
   Its values stay in advancedOptions, so EW sync and
   INPUT_JSON save / restore are unchanged.
========================================================== */

/* ---------- Decorative hardware options ---------- */

const NO_YES = [
    { value: "N", label: "NO" },
    { value: "Y", label: "YES" }
];

const DEC_HARDWARE_OPTIONS = [
    { value: "FS", label: "Full Sets" },
    { value: "IC", label: "Individual Components" },
    { value: "MS", label: "Magnetic Sets" }
];

/* No images in the old code – add a 3rd value
   (e.g. "5-6517.jpg") to show one in the tile */
const MAGNETIC_SET_OPTIONS = [
    ["5-6517", "Manor"],
    ["5-6518", "Mission"]
];

/* [value, label, image] – images from the old LOAD_HTML.js selects
   (5-6507 / 5-6508 images are swapped there – kept the same) */
const FULL_SET_OPTIONS = [
    ["5-6501", 'Colonial 16" and Lift - Cast', "5-6501 FullSet.jpg"],
    ["5-6502", 'Colonial 16" and Pull - Cast', "5-6502 FullSet.jpg"],
    ["5-6503", 'Spade 16" and Lift - Stamp', "5-6503 FullSet.jpg"],
    ["5-6504", 'Spade 16" and Pull - Stamp', "5-6504 FullSet.jpg"],
    ["5-6505", 'Spade Narrow 16" and Lift - Stamp', "5-6505 FullSet.jpg"],
    ["5-6506", 'Spade Narrow 16" and Pull - Stamp', "5-6506 FullSet.jpg"],
    ["5-6507", 'Spade 24" and Lift - Stamp', "5-6508 FullSet.jpg"],
    ["5-6508", 'Spade 24" and Pull - Stamp', "5-6507 FullSet.jpg"],
    ["5-6509", 'Spade 30" and Lift - Stamp', "5-6509 FullSet.jpg"],
    ["5-6510", 'Spade 30" and Pull - Stamp', "5-6510 FullSet.jpg"],
    ["5-6511", 'Spear 16" and Lift - Cast', "5-6511 FullSet.jpg"],
    ["5-6512", 'Spear 16" and Pull - Cast', "5-6512 FullSet.jpg"],
    ["5-6513", 'Spear 16" Assembly and Lift - Cast', "5-6513 FullSet.jpg"],
    ["5-6514", 'Spear 16" Assembly and Pull - Cast', "5-6514 FullSet.jpg"],
    ["5-6515", 'Fleur-De-Lys 16" and Lift - Cast', "5-6515 FullSet.jpg"],
    ["5-6516", 'Fleur-De-Lys 16" and Pull - Cast', "5-6516 FullSet.jpg"]
];

const INDIVIDUAL_OPTIONS = [
    {
        key: "L_HANDLE",
        label: "L Handle",
        choices: [
            ["324-425", "L-Handles (K/D)", "324-425.jpg"],
            ["324-423", "Spade L-Handle (K/D)", "324-423.jpg"],
            ["324-413", "Fleur-De-Lys (D)", "324-413.jpg"],
            ["324-416", "Long L-Handle (D)", "324-416.jpg"]
        ],
        quantities: ["0", "1", "2"]
    },
    {
        key: "HANDLE",
        label: "Handle",
        choices: [
            ["324-417", "Colonial Lift - Cast", "324-417 Colonial-lift.jpg"],
            ["324-401", "Fleur-De-Lys Lift - Cast", "324-401 FDL-Lift.jpg"],
            ["324-402", "Spade Lift - Stamp", "324-402 Spade-Lift.jpg"],
            ["324-420", "Spear Lift - Cast", "324-420 Spear-Lift.jpg"],
            ["324-418", "Colonial Pull - Cast", "324-418 Colonial-Pull.jpg"],
            ["324-422", "Fleur-De-Lys Pull - Cast", "324-422 FDL-Pull.jpg"],
            ["324-403", "Spade Pull - Stamp", "324-403 Spade-Pull.jpg"],
            ["324-421", "Spear Pull - Cast", "324-421 Spear-Pull.jpg"]
        ],
        quantities: ["0", "1", "2"]
    },
    {
        key: "DOOR_KNOCKER",
        label: "Door Knockers",
        choices: [
            ["324-404", "Lion Kit", "324-404 Lion-Knocker.jpg"],
            ["324-405", "Fleur-De-Lys Kit", "324-405 FDL-Knocker.jpg"]
        ],
        quantities: ["0", "1", "2"]
    },
    {
        key: "STRAPS",
        label: "Straps",
        choices: [
            ["324-419", 'Colonial 16"', "324-419 Colonial-Strap.jpg"],
            ["324-408", 'Spade 16"', "324-408 Spade-Strap.jpg"],
            ["324-415", 'Spade Narrow 16"', "324-415.jpg"],
            ["324-410", 'Spade 24"', "324-410.jpg"],
            ["324-409", 'Spade 30"', "324-409.jpg"],
            ["324-407", 'Spear 16"', "324-407 Spear-Strap.jpg"],
            ["324-406", 'Spear 16" Assembly', "324-406 Spear-Hinge-Strap.jpg"]
        ],
        quantities: ["0", "2", "4", "6", "8"]
    }
];

// Image file for the selected value ([value, label, image] lists)
const getChoiceImage = (choices, value) =>
    choices.find(([optionValue]) => optionValue === value)?.[2] || "";

// First quantity above 0 (Straps start at 2, everything else at 1)
const getFirstQty = (quantities = []) =>
    quantities.find(quantity => Number(quantity) > 0) || "1";


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

// Row of option buttons (Hardware Set / Lift Type / Decorative Hardware)
function OptionButtons({ options, value, onSelect, renderSelectionIndicator, className = "" }) {

    return (
        <div className={`door-model-buttons ${className}`.trim()}>
            {options.map(item => (
                <div
                    key={item.value}
                    role="radio"
                    aria-checked={value === item.value}
                    tabIndex={0}
                    className={
                        value === item.value
                            ? "door-model-button active"
                            : "door-model-button"
                    }
                    onClick={() => onSelect(item.value)}
                    onKeyDown={event => {
                        if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            onSelect(item.value);
                        }
                    }}
                >
                    {item.label}
                    {renderSelectionIndicator(value === item.value)}
                </div>
            ))}
        </div>
    );
}

/* Image tile – same as the Operator accessories
   (grey tile, faded picture icon when nothing is selected) */
function AccessoryImage({ file }) {

    const [failed, setFailed] = useState(false);

    useEffect(() => {
        setFailed(false);
    }, [file]);

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

// Product select (NONE + options)
function ProductSelect({ label, name, value, options, onChange }) {
    return (
        <label className="advanced-select-field" htmlFor={name}>
            <span>{label}</span>
            <select
                id={name}
                name={name}
                value={value || "NONE"}
                onChange={event => onChange(event.target.value)}
            >
                <option value="NONE">NONE</option>
                {options.map(([optionValue, optionLabel]) => (
                    <option value={optionValue} key={optionValue}>
                        {optionLabel}
                    </option>
                ))}
            </select>
        </label>
    );
}

// Qty select (fixed list of quantities)
function QuantitySelect({ name, value, options, disabled, onChange }) {
    return (
        <label className="advanced-select-field" htmlFor={name}>
            <span>Qty</span>
            <select
                id={name}
                name={name}
                value={value || "0"}
                disabled={disabled}
                onChange={event => onChange(event.target.value)}
            >
                {options.map(quantity => (
                    <option value={quantity} key={quantity}>
                        {quantity}
                    </option>
                ))}
            </select>
        </label>
    );
}


/* ---------- Decorative Hardware ---------- */

function DecorativeHardware({
    advancedOptions,
    setAdvancedOptions,
    renderSelectionIndicator
}) {

    const decHardware = advancedOptions.DEC_HARDWARE;

    const updateOption = (name, value) => {
        setAdvancedOptions(previous => ({
            ...previous,
            [name]: value
        }));
    };

    /* Accessory select (same as the Operator accessories):
       - NONE                       -> qty 0
       - NONE -> product (or qty 0) -> first valid qty (1, Straps 2)
       - product -> other product   -> keep the chosen qty */
    const updateAccessory = (key, value, firstQty = "1") => {
        setAdvancedOptions(previous => {

            const qtyKey = `${key}_QTY`;
            const wasNone = (previous[key] || "NONE") === "NONE";
            const currentQty = Number(previous[qtyKey]) || 0;

            let nextQty;

            if (value === "NONE") {
                nextQty = "0";
            } else if (wasNone || currentQty === 0) {
                nextQty = firstQty;
            } else {
                nextQty = previous[qtyKey];
            }

            return {
                ...previous,
                [key]: value,
                [qtyKey]: nextQty
            };
        });
    };

    /* New type -> values of the other types are reset */
    const applyDecorativeHardware = value => {
        setAdvancedOptions(previous => ({
            ...previous,
            DEC_HARDWARE: value,
            FULL_SETS: value === "FS" ? previous.FULL_SETS : "NONE",
            FULL_SETS_QTY: value === "FS" ? previous.FULL_SETS_QTY : "0",
            L_HANDLE: value === "IC" ? previous.L_HANDLE : "NONE",
            L_HANDLE_QTY: value === "IC" ? previous.L_HANDLE_QTY : "0",
            HANDLE: value === "IC" ? previous.HANDLE : "NONE",
            HANDLE_QTY: value === "IC" ? previous.HANDLE_QTY : "0",
            DOOR_KNOCKER: value === "IC" ? previous.DOOR_KNOCKER : "NONE",
            DOOR_KNOCKER_QTY: value === "IC" ? previous.DOOR_KNOCKER_QTY : "0",
            STRAPS: value === "IC" ? previous.STRAPS : "NONE",
            STRAPS_QTY: value === "IC" ? previous.STRAPS_QTY : "0",
            DOOR_STUDS: value === "IC" ? previous.DOOR_STUDS : "N",
            DOOR_STUDS_QTY: value === "IC" ? previous.DOOR_STUDS_QTY : "0",
            GRIPPER_SCREWS: value === "IC" ? previous.GRIPPER_SCREWS : "N",
            MAGNETIC_SET: value === "MS" ? previous.MAGNETIC_SET : "NONE",
            MAGNETIC_SET_QTY: value === "MS" ? previous.MAGNETIC_SET_QTY : "0"
        }));
    };

    // Same as Glazing: clicking the selected type clears it
    const handleSelect = value => {
        toggleValue(decHardware, value, applyDecorativeHardware);
    };

    return (
        <>
            {/* ---------- Type (buttons) ---------- */}

            <div className="landmark-section">
                <div className="landmark-section-header">Decorative Hardware</div>
                <OptionButtons
                    className="hw-lift-grid"
                    options={DEC_HARDWARE_OPTIONS}
                    value={decHardware}
                    onSelect={handleSelect}
                    renderSelectionIndicator={renderSelectionIndicator}
                />
            </div>

            {/* ---------- Full Sets: image + select + qty ---------- */}

            {decHardware === "FS" && (
                <div className="advanced-accessory-card">
                    <div className="advanced-accessory-row advanced-accessory-row--image">
                        <AccessoryImage
                            file={getChoiceImage(FULL_SET_OPTIONS, advancedOptions.FULL_SETS)}
                        />
                        <div className="advanced-accessory-controls">
                            <ProductSelect
                                label="Decorative Full Sets"
                                name="FULL_SETS"
                                value={advancedOptions.FULL_SETS}
                                options={FULL_SET_OPTIONS}
                                onChange={value => updateAccessory("FULL_SETS", value)}
                            />
                            <QuantitySelect
                                name="FULL_SETS_QTY"
                                value={advancedOptions.FULL_SETS_QTY}
                                options={["0", "1", "2"]}
                                disabled={(advancedOptions.FULL_SETS || "NONE") === "NONE"}
                                onChange={value => updateOption("FULL_SETS_QTY", value)}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* ---------- Individual Components ---------- */}

            {decHardware === "IC" && (
                <div className="advanced-accessory-card">

                    {INDIVIDUAL_OPTIONS.map(item => (
                        <div
                            className="advanced-accessory-row advanced-accessory-row--image"
                            key={item.key}
                        >
                            <AccessoryImage
                                file={getChoiceImage(item.choices, advancedOptions[item.key])}
                            />
                            <div className="advanced-accessory-controls">
                                <ProductSelect
                                    label={item.label}
                                    name={item.key}
                                    value={advancedOptions[item.key]}
                                    options={item.choices}
                                    onChange={value =>
                                        updateAccessory(item.key, value, getFirstQty(item.quantities))
                                    }
                                />
                                <QuantitySelect
                                    name={`${item.key}_QTY`}
                                    value={advancedOptions[`${item.key}_QTY`]}
                                    options={item.quantities}
                                    disabled={(advancedOptions[item.key] || "NONE") === "NONE"}
                                    onChange={value => updateOption(`${item.key}_QTY`, value)}
                                />
                            </div>
                        </div>
                    ))}

                    {/* Door Studs: switch + qty */}
                    <div className="hw-row">
                        <div className="landmark-section">
                            <div className="landmark-section-header">Door Studs</div>
                            <SegmentedSwitch
                                options={NO_YES}
                                value={advancedOptions.DOOR_STUDS}
                                onSelect={value => updateOption("DOOR_STUDS", value)}
                                renderSelectionIndicator={renderSelectionIndicator}
                            />
                        </div>
                        <div className="landmark-section">
                            <label className="landmark-section-header" htmlFor="DOOR_STUDS_QTY">
                                Door Studs Qty
                            </label>
                            <QuantityStepper
                                id="DOOR_STUDS_QTY"
                                value={advancedOptions.DOOR_STUDS_QTY}
                                max={100}
                                onChange={value => updateOption("DOOR_STUDS_QTY", String(value))}
                            />
                        </div>
                    </div>

                    {/* Gripper Screws (half width) */}
                    <div className="hw-row">
                        <div className="landmark-section">
                            <div className="landmark-section-header">Gripper Screws</div>
                            <SegmentedSwitch
                                options={NO_YES}
                                value={advancedOptions.GRIPPER_SCREWS}
                                onSelect={value => updateOption("GRIPPER_SCREWS", value)}
                                renderSelectionIndicator={renderSelectionIndicator}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* ---------- Magnetic Sets: image + select + qty ---------- */}

            {decHardware === "MS" && (
                <div className="advanced-accessory-card">
                    <div className="advanced-accessory-row advanced-accessory-row--image">
                        <AccessoryImage
                            file={getChoiceImage(MAGNETIC_SET_OPTIONS, advancedOptions.MAGNETIC_SET)}
                        />
                        <div className="advanced-accessory-controls">
                            <ProductSelect
                                label="Decorative Magnetic Set"
                                name="MAGNETIC_SET"
                                value={advancedOptions.MAGNETIC_SET}
                                options={MAGNETIC_SET_OPTIONS}
                                onChange={value => updateAccessory("MAGNETIC_SET", value)}
                            />
                            <div className="advanced-select-field">
                                <label htmlFor="MAGNETIC_SET_QTY">Qty</label>
                                <QuantityStepper
                                    id="MAGNETIC_SET_QTY"
                                    value={advancedOptions.MAGNETIC_SET_QTY}
                                    max={10}
                                    onChange={value => updateOption("MAGNETIC_SET_QTY", String(value))}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}


/* ---------- Section ---------- */

function HardwareSection({
    hardware,
    onChange,
    advancedOptions = {},
    setAdvancedOptions = () => {},
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
                <OptionButtons
                    options={HARDWARE_SETS}
                    value={hardwareSet}
                    onSelect={handleHardwareSet}
                    renderSelectionIndicator={renderSelectionIndicator}
                />
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
                    <OptionButtons
                        className="hw-lift-grid"
                        options={visibleLiftTypes}
                        value={liftType}
                        onSelect={value => onChange({ liftType: value })}
                        renderSelectionIndicator={renderSelectionIndicator}
                    />
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

            {/* ---------- Decorative Hardware (moved from Advanced) ---------- */}

            <DecorativeHardware
                advancedOptions={advancedOptions}
                setAdvancedOptions={setAdvancedOptions}
                renderSelectionIndicator={renderSelectionIndicator}
            />

        </div>
    );
}

export default HardwareSection;
