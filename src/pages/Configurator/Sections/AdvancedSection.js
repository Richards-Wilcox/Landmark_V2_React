import { useState } from "react";
import AccessoryImageTile from "../../../components/AccessoryImageTile";
import ColorSelector from "../../../components/Dimensions/ColorSelector";
import {
    availableColors,
    optionalColors
} from "../../../Data/colors";

const doorOptions = [
    { value: "DOORFACE", label: "Door Face Only" },
    { value: "HARDWAREONLY", label: "Hardware Only" },
    { value: "COMPLETEDOOR", label: "Complete Door" }
];

const fullSetOptions = [
    ["5-6501", 'Colonial 16" and Lift - Cast'],
    ["5-6502", 'Colonial 16" and Pull - Cast'],
    ["5-6503", 'Spade 16" and Lift - Stamp'],
    ["5-6504", 'Spade 16" and Pull - Stamp'],
    ["5-6505", 'Spade Narrow 16" and Lift - Stamp'],
    ["5-6506", 'Spade Narrow 16" and Pull - Stamp'],
    ["5-6507", 'Spade 24" and Lift - Stamp'],
    ["5-6508", 'Spade 24" and Pull - Stamp'],
    ["5-6509", 'Spade 30" and Lift - Stamp'],
    ["5-6510", 'Spade 30" and Pull - Stamp'],
    ["5-6511", 'Spear 16" and Lift - Cast'],
    ["5-6512", 'Spear 16" and Pull - Cast'],
    ["5-6513", 'Spear 16" Assembly and Lift - Cast'],
    ["5-6514", 'Spear 16" Assembly and Pull - Cast'],
    ["5-6515", 'Fleur-De-Lys 16" and Lift - Cast'],
    ["5-6516", 'Fleur-De-Lys 16" and Pull - Cast']
];

const individualOptions = [
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

function RadioChoices({
    legend,
    name,
    value,
    options,
    onChange,
    layout = "row",
    renderSelectionIndicator,
    compact = false
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
                {options.map(option => (
                    <label
                        className={
                            value === option.value
                                ? "advanced-choice selected"
                                : "advanced-choice"
                        }
                        key={option.value}
                    >
                        <input
                            type="radio"
                            name={name}
                            value={option.value}
                            checked={value === option.value}
                            onChange={() => onChange(option.value)}
                        />
                        <span>{option.label}</span>
                        {renderSelectionIndicator?.(
                            value === option.value
                        )}
                    </label>
                ))}
            </div>
        </fieldset>
    );
}

function SelectField({
    label,
    name,
    value,
    options,
    onChange,
    disabled = false,
    compact = false
}) {
    return (
        <label
            className={[
                "advanced-select-field",
                compact ? "advanced-select-field--compact" : ""
            ].filter(Boolean).join(" ")}
            htmlFor={name}
        >
            <span>{label}</span>
            <select
                id={name}
                name={name}
                value={value}
                disabled={disabled}
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

function QuantityField({
    label,
    name,
    value,
    options,
    onChange,
    disabled = false
}) {
    return (
        <label className="advanced-select-field" htmlFor={name}>
            <span>{label}</span>
            <select
                id={name}
                name={name}
                value={value}
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

function QuantityStepper({
    label,
    name,
    value,
    min,
    max,
    onChange
}) {
    const quantity = Number(value) || 0;

    const setQuantity = nextValue => {
        onChange(String(Math.max(min, Math.min(max, Math.trunc(nextValue)))));
    };

    return (
        <div className="advanced-select-field">
            <label htmlFor={name}>{label}</label>
            <div className="quantity-stepper">
                <button
                    type="button"
                    aria-label={`Decrease ${label}`}
                    disabled={quantity <= min}
                    onClick={() => setQuantity(quantity - 1)}
                >
                    -
                </button>
                <input
                    id={name}
                    name={name}
                    type="number"
                    step="1"
                    min={min}
                    max={max}
                    value={value}
                    onChange={event => {
                        const nextValue = event.target.value;
                        if (nextValue === "") {
                            onChange("");
                            return;
                        }

                        const parsedValue = Number(nextValue);
                        if (Number.isFinite(parsedValue)) {
                            setQuantity(parsedValue);
                        }
                    }}
                    onBlur={() => {
                        if (value === "") {
                            onChange(String(min));
                        }
                    }}
                />
                <button
                    type="button"
                    aria-label={`Increase ${label}`}
                    disabled={quantity >= max}
                    onClick={() => setQuantity(quantity + 1)}
                >
                    +
                </button>
            </div>
        </div>
    );
}

function AdvancedSection({
    advancedOptions,
    setAdvancedOptions,
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

    const selectDecorativeHardware = value => {
        setAdvancedOptions(previous => ({
            ...previous,
            DEC_HARDWARE: value,
            FULL_SETS: value === "FS" ? previous.FULL_SETS : "NONE",
            FULL_SETS_QTY: previous.FULL_SETS_QTY,
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
            MAGNETIC_SET_QTY: previous.MAGNETIC_SET_QTY
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
                <RadioChoices
                    legend="Door Options"
                    name="DOOROPT"
                    value={advancedOptions.DOOROPT}
                    options={doorOptions}
                    onChange={value => updateOption("DOOROPT", value)}
                    renderSelectionIndicator={renderSelectionIndicator}
                />

                <div className="advanced-control-row">
                    <RadioChoices
                        legend="Drill for Hinges?"
                        name="DRILL"
                        value={advancedOptions.DRILL}
                        options={[
                            { value: "Y", label: "Yes" },
                            { value: "N", label: "No" }
                        ]}
                        onChange={value => updateOption("DRILL", value)}
                    />
                    <RadioChoices
                        legend="Double End Caps"
                        name="END_CAPS"
                        value={advancedOptions.END_CAPS}
                        options={[
                            { value: "Y", label: "Yes" },
                            { value: "N", label: "No" }
                        ]}
                        onChange={value => updateOption("END_CAPS", value)}
                    />
                </div>

                <div className="advanced-control-row">
                    <RadioChoices
                        legend="Extra Truss"
                        name="EXTRA_TRUSS"
                        value={advancedOptions.EXTRA_TRUSS}
                        options={[
                            { value: "Y", label: "Yes" },
                            { value: "N", label: "No" }
                        ]}
                        onChange={value => updateOption("EXTRA_TRUSS", value)}
                    />
                    <RadioChoices
                        legend="Shaft Type"
                        name="SHAFT_TYPE"
                        value={advancedOptions.SHAFT_TYPE}
                        options={[
                            { value: "T", label: "Tube Shaft" },
                            { value: "K", label: "Keyed Tube Shaft" }
                        ]}
                        onChange={value => updateOption("SHAFT_TYPE", value)}
                    />
                </div>

                <RadioChoices
                    legend="Window Cut Outs"
                    name="WINDOW_CUTOUTS"
                    value={advancedOptions.WINDOW_CUTOUTS}
                    options={[
                        { value: "N", label: "No" },
                        { value: "Y", label: "Yes" }
                    ]}
                    onChange={value => updateOption("WINDOW_CUTOUTS", value)}
                    compact
                />

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

                <div className="advanced-control-row">
                    <RadioChoices
                        legend="Top Seal"
                        name="TOP_SEAL"
                        value={advancedOptions.TOP_SEAL}
                        options={[
                            { value: "N", label: "No" },
                            { value: "Y", label: "Yes" }
                        ]}
                        onChange={value => updateOption("TOP_SEAL", value)}
                    />
                    <RadioChoices
                        legend="Bottom Seal"
                        name="BOTTOM_SEAL"
                        value={advancedOptions.BOTTOM_SEAL}
                        options={[
                            { value: "N", label: "No" },
                            { value: "Y", label: "Yes" }
                        ]}
                        onChange={value => updateOption("BOTTOM_SEAL", value)}
                    />
                </div>

                <RadioChoices
                    legend="Snap Latch"
                    name="SNAP_LATCH_OPTION"
                    value={advancedOptions.SNAP_LATCH_OPTION}
                    options={[
                        { value: "SnapLatch", label: "Snap Latch" },
                        { value: "OnePointLatch", label: "One Point Latch" }
                    ]}
                    onChange={value =>
                        updateOption("SNAP_LATCH_OPTION", value)
                    }
                    renderSelectionIndicator={renderSelectionIndicator}
                    compact
                />

                <RadioChoices
                    legend="Decorative Hardware"
                    name="DEC_HARDWARE"
                    value={advancedOptions.DEC_HARDWARE}
                    options={[
                        { value: "FS", label: "Full Sets" },
                        { value: "IC", label: "Individual Components" },
                        { value: "MS", label: "Magnetic Sets" }
                    ]}
                    onChange={selectDecorativeHardware}
                    renderSelectionIndicator={renderSelectionIndicator}
                />

                {advancedOptions.DEC_HARDWARE === "FS" && (
                    <div className="advanced-accessory-card advanced-accessory-card--compact">
                        <SelectField
                            label="Decorative Full Sets"
                            name="FULL_SETS"
                            value={advancedOptions.FULL_SETS}
                            options={fullSetOptions}
                            onChange={value => updateOption("FULL_SETS", value)}
                            compact
                        />
                        <QuantityField
                            label="Qty"
                            name="FULL_SETS_QTY"
                            value={advancedOptions.FULL_SETS_QTY}
                            options={["0", "1", "2"]}
                            disabled={advancedOptions.FULL_SETS === "NONE"}
                            onChange={value =>
                                updateOption("FULL_SETS_QTY", value)
                            }
                        />
                    </div>
                )}

                {advancedOptions.DEC_HARDWARE === "IC" && (
                    <div className="advanced-accessory-card">
                        {individualOptions.map(item => {
                            const selectedChoice = item.choices.find(
                                ([value]) =>
                                    value === advancedOptions[item.key]
                            );

                            return (
                                <div
                                    className="advanced-accessory-row"
                                    key={item.key}
                                >
                                    <AccessoryImageTile
                                        accessoryName={selectedChoice?.[1]}
                                        imageFile={selectedChoice?.[2]}
                                    />
                                    <div className="advanced-accessory-controls">
                                        <SelectField
                                            label={item.label}
                                            name={item.key}
                                            value={advancedOptions[item.key]}
                                            options={item.choices}
                                            compact
                                            onChange={value =>
                                                setAdvancedOptions(previous => ({
                                                    ...previous,
                                                    [item.key]: value,
                                                    [`${item.key}_QTY`]:
                                                        value === "NONE"
                                                            ? "0"
                                                            : previous[
                                                                `${item.key}_QTY`
                                                            ]
                                                }))
                                            }
                                        />
                                        <QuantityField
                                            label="Qty"
                                            name={`${item.key}_QTY`}
                                            value={advancedOptions[`${item.key}_QTY`]}
                                            options={item.quantities}
                                            disabled={advancedOptions[item.key] === "NONE"}
                                            onChange={value =>
                                                updateOption(`${item.key}_QTY`, value)
                                            }
                                        />
                                    </div>
                                </div>
                            );
                        })}
                        <div className="advanced-accessory-row">
                            <RadioChoices
                                legend="Door Studs"
                                name="DOOR_STUDS"
                                value={advancedOptions.DOOR_STUDS}
                                options={[
                                    { value: "N", label: "No" },
                                    { value: "Y", label: "Yes" }
                                ]}
                                onChange={value =>
                                    setAdvancedOptions(previous => ({
                                        ...previous,
                                        DOOR_STUDS: value,
                                        DOOR_STUDS_QTY:
                                            previous.DOOR_STUDS_QTY
                                    }))
                                }
                            />
                            <QuantityStepper
                                label="Door Studs Qty"
                                name="DOOR_STUDS_QTY"
                                value={advancedOptions.DOOR_STUDS_QTY}
                                min={0}
                                max={100}
                                onChange={value =>
                                    updateOption("DOOR_STUDS_QTY", value)
                                }
                            />
                        </div>
                        <RadioChoices
                            legend="Gripper Screws"
                            name="GRIPPER_SCREWS"
                            value={advancedOptions.GRIPPER_SCREWS}
                            options={[
                                { value: "N", label: "No" },
                                { value: "Y", label: "Yes" }
                            ]}
                            onChange={value =>
                                updateOption("GRIPPER_SCREWS", value)
                            }
                        />
                    </div>
                )}

                {advancedOptions.DEC_HARDWARE === "MS" && (
                    <div className="advanced-accessory-card advanced-accessory-card--compact">
                        <SelectField
                            label="Decorative Magnetic Set"
                            name="MAGNETIC_SET"
                            value={advancedOptions.MAGNETIC_SET}
                            options={[
                                ["5-6517", "Manor"],
                                ["5-6518", "Mission"]
                            ]}
                            onChange={value =>
                                setAdvancedOptions(previous => ({
                                    ...previous,
                                    MAGNETIC_SET: value
                                }))
                            }
                            compact
                        />
                        <QuantityStepper
                            label="Magnetic Set Qty"
                            name="MAGNETIC_SET_QTY"
                            value={advancedOptions.MAGNETIC_SET_QTY}
                            min={0}
                            max={10}
                            onChange={value =>
                                updateOption("MAGNETIC_SET_QTY", value)
                            }
                        />
                    </div>
                )}
            </div>
        </section>
    );
}

export default AdvancedSection;
