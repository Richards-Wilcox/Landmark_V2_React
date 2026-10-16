import { MdEdit, MdClose } from "react-icons/md";

/* ==========================================
   SLIM SECTION EDITOR (original addSlimUi)
   - Pencil button beside each section
   - Configure menu: Shape -> Lites -> Spacing
========================================== */

const SHAPE_OPTIONS = [
    { value: "slim_single", label: "Slim Single" },
    { value: "slim_double", label: "Slim Double" }
];

const LITE_OPTIONS = [
    { value: "one", label: "One Lite" },
    { value: "more", label: "More than One" }
];

const SPACING_OPTIONS = [
    { value: "even", label: "Evenly Spaced" },
    { value: "fixed", label: "Fixed End" }
];



function SlimSectionEditor({
    sections,

    scale,
    doorX,
    doorY,
    doorWidth,
    doorHeight,

    canvasWidth,
    canvasHeight,

    selectedSection,
    onSelectSection,
    onSectionChange
}) {

    /* Canvas px -> % so it follows the canvas when it is resized */

    const toLeft = (x) => `${(x / canvasWidth) * 100}%`;
    const toTop = (y) => `${(y / canvasHeight) * 100}%`;

    const doorRight = doorX + doorWidth;
    const doorMiddleY = doorY + doorHeight / 2;

    const active =
        selectedSection !== null &&
            selectedSection !== undefined
            ? sections[selectedSection]
            : null;

    const currentShape = active?.shape || "";
    const currentLite = active?.slim_one ? "one" : "more";
    const currentSpacing = active?.slim_spacing || "even";

    const renderOption = (option, isActive, onClick) => (
        <div
            key={option.value}
            className={
                isActive
                    ? "slim-option active"
                    : "slim-option"
            }
            onClick={onClick}
        >
            {option.label}
        </div>
    );

    return (
        <>
            {/* Pencil buttons */}
            {sections.map((section, index) => {

                const centerY =
                    doorY +
                    (section.ypos + section.height / 2) * scale;

                const isActive =
                    selectedSection !== null &&
                    selectedSection !== undefined &&
                    Number(selectedSection) === index;

                return (
                    <div
                        key={index}
                        className={
                            isActive
                                ? "slim-pencil-button selected"
                                : "slim-pencil-button"
                        }
                        style={{
                            left: toLeft(doorRight),
                            top: toTop(centerY)
                        }}
                        onClick={(event) => {
                            event.stopPropagation();

                            // Click the active pencil again to close (toggle)
                            onSelectSection(isActive ? null : index);
                        }}
                    >
                        <MdEdit />
                    </div>
                );
            })}

            {/* Configure menu */}

            {active && (

                <div
                    className="slim-options-container show"
                    style={{
                        left: `calc(${toLeft(doorRight)} + 60px)`,
                        top: toTop(doorMiddleY)
                    }}
                    onClick={(event) => event.stopPropagation()}
                >

                    <div className="slim-header">

                        <span>Configure</span>

                        <button
                            type="button"
                            className="slim-close"
                            aria-label="Close"
                            onClick={() => onSelectSection(null)}
                        >
                            <MdClose />
                        </button>

                    </div>

                    {/* Step 1: Shape */}

                    <div className="slim-step-title">
                        Select Shape
                    </div>

                    {SHAPE_OPTIONS.map(option =>
                        renderOption(
                            option,
                            currentShape === option.value,
                            () => onSectionChange(
                                selectedSection,
                                { shape: option.value }
                            )
                        )
                    )}

                    {/* Step 2: Lites */}

                    <div className="slim-step-title">
                        Select Lites
                    </div>

                    {LITE_OPTIONS.map(option =>
                        renderOption(
                            option,
                            currentLite === option.value,
                            () => onSectionChange(
                                selectedSection,
                                { slimOne: option.value === "one" }
                            )
                        )
                    )}

                    {/* Step 3: Spacing (only for More than One) */}

                    {currentLite === "more" && (
                        <>
                            <div className="slim-step-title">
                                Select Spacing
                            </div>

                            {SPACING_OPTIONS.map(option =>
                                renderOption(
                                    option,
                                    currentSpacing === option.value,
                                    () => onSectionChange(
                                        selectedSection,
                                        { spacing: option.value }
                                    )
                                )
                            )}
                        </>
                    )}

                </div>
            )}
        </>
    );
}

export default SlimSectionEditor;
