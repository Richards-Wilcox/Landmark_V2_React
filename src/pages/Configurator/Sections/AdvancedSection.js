import { useState } from "react";
import ColorSelector from "../../../components/Dimensions/ColorSelector";
import {
    availableColors,
    optionalColors
} from "../../../Data/colors";
import { toggleValue } from "../../../utils/toggleValue";

/* ==========================================================
   ADVANCED SECTION
   - Two-option settings use the same switch as Hardware
     "Inclined Track" (segmented-toggle hw-segmented)
   - Snap Latch keeps the option buttons
   - Decorative Hardware moved to HardwareSection.js
     (values still live in advancedOptions)
========================================================== */

const YES_NO = [
    { value: "Y", label: "YES" },
    { value: "N", label: "NO" }
];

const NO_YES = [
    { value: "N", label: "NO" },
    { value: "Y", label: "YES" }
];

const SHAFT_TYPES = [
    { value: "T", label: "Tube Shaft" },
    { value: "K", label: "Keyed Tube Shaft" }
];

const SNAP_LATCH_OPTIONS = [
    { value: "SnapLatch", label: "Snap Latch" },
    { value: "OnePointLatch", label: "One Point Latch" }
];

/* ----------------------------------------------------------
   Two-option switch – same markup as Hardware "Inclined Track"
---------------------------------------------------------- */
function SwitchField({
    label,
    name,
    value,
    options,
    onChange
}) {
    const select = (optionValue) => {
        if (optionValue !== value) {
            onChange(optionValue);
        }
    };

    return (
        <div className="landmark-section advanced-switch-field">
            <div className="landmark-section-header" id={`${name}_LABEL`}>
                {label}
            </div>
            <div
                className="segmented-toggle hw-segmented"
                role="radiogroup"
                aria-labelledby={`${name}_LABEL`}
            >
                {options.map(option => {
                    const isSelected = value === option.value;

                    return (
                        <div
                            key={option.value}
                            role="radio"
                            aria-checked={isSelected}
                            tabIndex={0}
                            className={
                                isSelected
                                    ? "segmented-option active"
                                    : "segmented-option"
                            }
                            onClick={() => select(option.value)}
                            onKeyDown={event => {
                                if (event.key === "Enter" || event.key === " ") {
                                    event.preventDefault();
                                    select(option.value);
                                }
                            }}
                        >
                            {option.label}
                            {isSelected && (
                                <span className="segmented-indicator">✓</span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/* ----------------------------------------------------------
   Option buttons (Snap Latch)
   toggleable: clicking the selected button clears it
   (same as the Glazing tab buttons)
---------------------------------------------------------- */
function RadioChoices({
    legend,
    name,
    value,
    options,
    onChange,
    layout = "row",
    renderSelectionIndicator,
    compact = false,
    toggleable = false
}) {
    return (
        <fieldset className="advanced-fieldset">
            <legend>{legend}</legend>
            <div
                className={[
                    "advanced-choices",
                    `advanced-choices--${layout}`,
                    compact ? "advanced-choices--compact" : ""
                ].filter(Boolean).join(" ")}
            >
                {options.map(option => {
                    const isSelected = value === option.value;

                    return (
                        <label
                            className={
                                isSelected
                                    ? "advanced-choice selected"
                                    : "advanced-choice"
                            }
                            key={option.value}
                        >
                            <input
                                type="radio"
                                name={name}
                                value={option.value}
                                checked={isSelected}
                                readOnly
                                // One handler for select + deselect
                                onClick={() =>
                                    toggleable
                                        ? toggleValue(value, option.value, onChange)
                                        : onChange(option.value)
                                }
                            />
                            <span>{option.label}</span>
                            {renderSelectionIndicator?.(isSelected)}
                        </label>
                    );
                })}
            </div>
        </fieldset>
    );
}

function AdvancedSection({
    advancedOptions = {},
    setAdvancedOptions = () => {},
    panelStyle,
    renderSelectionIndicator
}) {
    const [showPopularJambColors, setShowPopularJambColors] =
        useState(true);

    const updateOption = (name, value) => {
        setAdvancedOptions(previous => ({
            ...previous,
            [name]: value
        }));
    };

    return (
        <section
            className="advanced-section"
            aria-labelledby="advanced-heading"
        >
            <h3 id="advanced-heading" className="advanced-heading">
                Advanced
            </h3>

            <div className="advanced-group">

                {/* ---------- Drill / End Caps ---------- */}
                <div className="advanced-control-row">
                    <SwitchField
                        label="Drill for Hinges?"
                        name="DRILL"
                        value={advancedOptions.DRILL}
                        options={YES_NO}
                        onChange={value => updateOption("DRILL", value)}
                    />
                    <SwitchField
                        label="Double End Caps"
                        name="END_CAPS"
                        value={advancedOptions.END_CAPS}
                        options={YES_NO}
                        onChange={value => updateOption("END_CAPS", value)}
                    />
                </div>

                {/* ---------- Extra Truss / Shaft Type ---------- */}
                <div className="advanced-control-row">
                    <SwitchField
                        label="Extra Truss"
                        name="EXTRA_TRUSS"
                        value={advancedOptions.EXTRA_TRUSS}
                        options={YES_NO}
                        onChange={value => updateOption("EXTRA_TRUSS", value)}
                    />
                    <SwitchField
                        label="Shaft Type"
                        name="SHAFT_TYPE"
                        value={advancedOptions.SHAFT_TYPE}
                        options={SHAFT_TYPES}
                        onChange={value => updateOption("SHAFT_TYPE", value)}
                    />
                </div>

                {/* ---------- Window Cut Outs (half width) ---------- */}
                <div className="advanced-control-row">
                    <SwitchField
                        label="Window Cut Outs"
                        name="WINDOW_CUTOUTS"
                        value={advancedOptions.WINDOW_CUTOUTS}
                        options={NO_YES}
                        onChange={value => updateOption("WINDOW_CUTOUTS", value)}
                    />
                </div>

                {/* ---------- Jamb Seal Colour ---------- */}
                <ColorSelector
                    title="Jamb Seal Colour"
                    availableColors={availableColors}
                    optionalColors={optionalColors}
                    panelStyle={panelStyle}
                    selectedColor={advancedOptions.JAMB_SEAL_COLOR}
                    setSelectedColor={value =>
                        setAdvancedOptions(previous => ({
                            ...previous,
                            JAMB_SEAL_COLOR: value,
                            jambSealColorUserOverride: true
                        }))
                    }
                    showPopularColors={showPopularJambColors}
                    setShowPopularColors={setShowPopularJambColors}
                />

                {/* ---------- Top / Bottom Seal ---------- */}
                <div className="advanced-control-row">
                    <SwitchField
                        label="Top Seal"
                        name="TOP_SEAL"
                        value={advancedOptions.TOP_SEAL}
                        options={NO_YES}
                        onChange={value => updateOption("TOP_SEAL", value)}
                    />
                    <SwitchField
                        label="Bottom Seal"
                        name="BOTTOM_SEAL"
                        value={advancedOptions.BOTTOM_SEAL}
                        options={NO_YES}
                        onChange={value => updateOption("BOTTOM_SEAL", value)}
                    />
                </div>

                {/* ---------- Snap Latch (buttons) ---------- */}
                <RadioChoices
                    legend="Snap Latch"
                    name="SNAP_LATCH_OPTION"
                    value={advancedOptions.SNAP_LATCH_OPTION}
                    options={SNAP_LATCH_OPTIONS}
                    onChange={value => updateOption("SNAP_LATCH_OPTION", value)}
                    renderSelectionIndicator={renderSelectionIndicator}
                    compact
                    toggleable
                />

            </div>
        </section>
    );
}

export default AdvancedSection;
