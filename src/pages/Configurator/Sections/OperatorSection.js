import { useState } from "react";
import {
    IoIosArrowBack,
    IoIosArrowForward
} from "react-icons/io";
import AccessoryImageTile from "../../../components/AccessoryImageTile";

const operatorOptions = [
    {
        id: "operator_none",
        name: "None",
        value: "PS",
        image: "Operators_none.png",
        maxDoorHeight: 1000,
        isHiLiftCompatible: true
    },
    {
        id: "operator_jackshaft",
        name: "98022 - Jackshaft",
        value: "951-185",
        image: "EW-LM-8500W.jpg",
        maxDoorHeight: 168,
        isHiLiftCompatible: true
    },
    {
        id: "6580L_Belt",
        name: "6580L - Belt",
        value: "OP_6580L_VALUE",
        image: "6580L-(951-193)_E-Cat.png",
        maxDoorHeight: 120,
        isHiLiftCompatible: false
    },
    {
        id: "6590L_Belt",
        name: "6690L - Belt",
        value: "OP_6590L_VALUE",
        image: "6690L-(951-194)_E-Cat.png",
        maxDoorHeight: 120,
        isHiLiftCompatible: false
    },
    {
        id: "2220L_Chain",
        name: "2220L - Chain",
        value: "OP_2220L_CHAIN_VALUE",
        image: "2220L-(951-190)_E-Cat.png",
        maxDoorHeight: 120,
        isHiLiftCompatible: false
    },
    {
        id: "2420L_Chain",
        name: "2420L - Chain",
        value: "OP_2420L_CHAIN_VALUE",
        image: "2420L-(951-191)_E-Cat.png",
        maxDoorHeight: 120,
        isHiLiftCompatible: false
    }
];

const operatorAccessoryOptions = [
    {
        name: "ADDITIONAL_TRANSMITTER",
        label: "Additional Transmitter",
        quantityOptions: ["1", "2", "3", "4"],
        options: [
            ["952-232", "L993M", "L991S-(952-230)_E-Cat.png"],
            ["952-233", "L993S", "L993S-(952-233)_E-Cat.png"],
            ["952-231", "L992U", "L992U-(952-231)_E-Cat.png"],
            ["952-229", "L932M", "L932M-(952-229)_E-Cat.png"],
            ["952-230", "L991S", "L991S-(952-230)_E-Cat.png"]
        ]
    },
    {
        name: "ADDITIONAL_CONTROL_PANEL",
        label: "Additional Control Panel",
        quantityOptions: ["1", "2"],
        options: [
            ["952-227", "L957W", "L957W (952-227)_E-Cat.png"],
            ["952-228", "L958W", "L958W-(952-228)_E-Cat.png"],
            ["952-225", "L955W", "L955W-(952-225)_E-Cat.png"],
            ["952-226", "L956W", "L956W-(952-226)_E-Cat.png"]
        ]
    },
    {
        name: "ADDITIONAL_KEYLESS_ENTRY",
        label: "Additional Keyless Entry",
        quantityOptions: ["1", "2", "3"],
        options: [
            ["952-234", "L979M", "L979M-(952-234)_E-Cat.png"],
            ["952-235", "L979S", "L979S-(952-235)_E-Cat.png"],
            ["952-236", "L979U", "L979U-(952-236)_E-Cat.png"]
        ]
    }
];

const operatorImageDirectory =
    `${process.env.PUBLIC_URL}/images/operators/`;

function OperatorProductImage({
    operator
}) {
    const [imageUnavailable, setImageUnavailable] =
        useState(false);

    return (
        <div className="operator-carousel-image">
            {imageUnavailable ? (
                <div className="operator-image-unavailable">
                    Operator image unavailable
                </div>
            ) : (
                <img
                    src={`${operatorImageDirectory}${encodeURIComponent(operator.image)}`}
                    alt={operator.name}
                    onError={() => setImageUnavailable(true)}
                />
            )}
        </div>
    );
}

function OperatorSection({
    operatorValue,
    setOperatorValue,
    operatorBracket,
    setOperatorBracket,
    operatorAccessories,
    setOperatorAccessories,
    trussQuantity,
    renderSelectionIndicator
}) {
    const activeIndex = Math.max(
        0,
        operatorOptions.findIndex(
            option => option.value === operatorValue
        )
    );
    const operator = operatorOptions[activeIndex];
    const hasTruss = trussQuantity > 0;

    const selectOperator = index => {
        const wrappedIndex =
            (index + operatorOptions.length) % operatorOptions.length;

        setOperatorValue(operatorOptions[wrappedIndex].value);
    };

    const updateAccessory = (name, value) => {
        setOperatorAccessories(previous => ({
            ...previous,
            [name]: value,
            [`${name}_QTY`]:
                value === "NONE"
                    ? "0"
                    : "1"
        }));
    };

    const updateAccessoryQuantity = (name, value) => {
        setOperatorAccessories(previous => ({
            ...previous,
            [name]: value
        }));
    };

    return (
        <section
            className="operator-section"
            aria-labelledby="operator-heading"
        >
            <div className="operator-card">
                <header className="operator-header">
                    <div className="operator-icon" aria-hidden="true">
                        ⚡
                    </div>
                    <div>
                        <h2 id="operator-heading">Operator</h2>
                        <p>Select and configure your operator system</p>
                    </div>
                </header>

                <input
                    type="hidden"
                    name="OPERATOR"
                    value={operator.value}
                    data-max-door-height={operator.maxDoorHeight}
                    data-is-hi-lift-compatible={operator.isHiLiftCompatible}
                    readOnly
                />

                <div className="operator-carousel-wrapper">
                    <button
                        type="button"
                        className="operator-arrow"
                        aria-label="Previous operator"
                        onClick={() => selectOperator(activeIndex - 1)}
                    >
                        <IoIosArrowBack />
                    </button>
                    <div
                        className="operator-carousel-slide"
                        aria-live="polite"
                    >
                        <OperatorProductImage
                            key={operator.id}
                            operator={operator}
                        />
                        <h3>{operator.name}</h3>
                    </div>
                    <button
                        type="button"
                        className="operator-arrow"
                        aria-label="Next operator"
                        onClick={() => selectOperator(activeIndex + 1)}
                    >
                        <IoIosArrowForward />
                    </button>
                </div>

                <div className="operator-pagination" aria-label="Choose operator">
                    {operatorOptions.map((option, index) => (
                        <button
                            type="button"
                            key={option.id}
                            className={
                                index === activeIndex
                                    ? "operator-dot operator-dot-active"
                                    : "operator-dot"
                            }
                            aria-label={`Select ${option.name}`}
                            aria-pressed={index === activeIndex}
                            onClick={() => selectOperator(index)}
                        />
                    ))}
                </div>
            </div>

            <div className="operator-accessories">
                <div className="operator-accessory-card">
                    <fieldset className="operator-bracket-fieldset">
                        <legend>Operator Bracket Mount</legend>
                        {!hasTruss && (
                            <p className="operator-bracket-hint">
                                This option requires a truss. Select Extra Truss
                                in the Advanced tab to enable it.
                            </p>
                        )}
                        <div className="operator-bracket-options operator-bracket-options--compact">
                            {[
                                ["ADJUSTABLE_BRACKET", "Adjustable Bracket"],
                                ["CLAW_BRACKET", "Claw Bracket"]
                            ].map(([value, label]) => (
                                <label
                                    className={
                                        [
                                            "advanced-choice",
                                            operatorBracket === value
                                                ? "selected"
                                                : "",
                                            !hasTruss
                                                ? "disabled"
                                                : ""
                                        ].filter(Boolean).join(" ")
                                    }
                                    key={value}
                                >
                                    <input
                                        type="radio"
                                        name="OPERATOR_BRACKET"
                                        value={value}
                                        checked={operatorBracket === value}
                                        disabled={!hasTruss}
                                        onChange={() =>
                                            setOperatorBracket(value)
                                        }
                                    />
                                    <span>{label}</span>
                                    {renderSelectionIndicator?.(
                                        operatorBracket === value
                                    )}
                                </label>
                            ))}
                        </div>
                    </fieldset>
                </div>

                {operatorAccessoryOptions.map(item => {
                    const selectedValue =
                        operatorAccessories[item.name];
                    const selectedOption = item.options.find(
                        ([value]) => value === selectedValue
                    );
                    const quantityName = `${item.name}_QTY`;

                    return (
                        <div
                            className="operator-accessory-card"
                            key={item.name}
                        >
                            <AccessoryImageTile
                                accessoryName={selectedOption?.[1]}
                                imageFile={selectedOption?.[2]}
                            />
                            <div className="operator-accessory-controls">
                                <label
                                    className="advanced-select-field advanced-select-field--compact"
                                    htmlFor={item.name}
                                >
                                    <span>{item.label}</span>
                                    <select
                                        id={item.name}
                                        name={item.name}
                                        value={selectedValue}
                                        onChange={event =>
                                            updateAccessory(
                                                item.name,
                                                event.target.value
                                            )
                                        }
                                    >
                                        <option value="NONE">NONE</option>
                                        {item.options.map(
                                            ([value, label]) => (
                                                <option
                                                    value={value}
                                                    key={value}
                                                >
                                                    {label}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </label>
                                <label
                                    className="advanced-select-field"
                                    htmlFor={quantityName}
                                >
                                    <span>Qty</span>
                                    <select
                                        id={quantityName}
                                        name={quantityName}
                                        value={
                                            operatorAccessories[quantityName]
                                        }
                                        disabled={selectedValue === "NONE"}
                                        onChange={event =>
                                            updateAccessoryQuantity(
                                                quantityName,
                                                event.target.value
                                            )
                                        }
                                    >
                                        {selectedValue === "NONE" && (
                                            <option value="0">0</option>
                                        )}
                                        {item.quantityOptions.map(quantity => (
                                            <option
                                                value={quantity}
                                                key={quantity}
                                            >
                                                {quantity}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

export default OperatorSection;
