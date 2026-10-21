import React, { forwardRef } from "react";
import { MdKeyboardArrowDown } from "react-icons/md";

/**
 * Porsche-style section card.
 * - Open by default, collapsible by clicking the header.
 * - "active" = card currently in view (scroll-spy in Configurator.js).
 */
const ConfigSection = forwardRef(function ConfigSection(
    { id, title, badge = 0, isActive, isCollapsed, onToggle, children },
    ref
) {
    const classes = ["config-card"];

    if (isActive) {
        classes.push("active");
    }

    if (isCollapsed) {
        classes.push("collapsed");
    }

    return (
        <div
            ref={ref}
            id={`CONFIG_SECTION_${id.toUpperCase()}`}
            data-section-id={id}
            className={classes.join(" ")}
        >
            <button
                type="button"
                className="config-card__header"
                aria-expanded={!isCollapsed}
                onClick={() => onToggle(id)}
            >
                <span className="config-card__title">{title}</span>

                <span className="config-card__meta">
                    {badge > 0 && (
                        <span className="config-card__badge">{badge}</span>
                    )}
                    <MdKeyboardArrowDown className="config-card__chevron" />
                </span>
            </button>

            {!isCollapsed && (
                <div className="config-card__body">
                    {children}
                </div>
            )}
        </div>
    );
});

export default ConfigSection;
