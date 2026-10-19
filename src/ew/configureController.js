/* ==========================================================
   CONFIGURE (React version of FINAL_VALIDATION.js)

   Original flow on Configure click:
     1. block double clicks         (configureInProgress)
     2. show loader + let it paint
     3. initializeDriversOnDemand() (section bundle, glazing code,
                                     scheduling, hardware, track, operator)
     4. finalvalidation()
     5. nextPage()

   React flow:
     3a. React drivers, IN ORDER (each gets the values so far):
         section bundle -> glazing code -> scheduling
     3b. write all values into the EW inputs
     3c. call the global (non-React) drivers:
         addHardwareDrivers, addTrackDrivers, addOperatorEvents
     5.  nextPage()
========================================================== */

import { getSectionBundleValues } from "./sectionBundle";
import { getGlazingCodeLogicValues } from "./glazingCodeLogic";
import { getSchedulingValues } from "./schedulingCode";
import { writeEwValues } from "./ewSync";

/* ----------------------------------------------------------
   REACT DRIVERS
   run(ctx, valuesSoFar) -> { EW_ID: value } (can be async)
---------------------------------------------------------- */

const CONFIGURE_DRIVERS = [
    {
        name: "sectionBundle",
        run: ctx => getSectionBundleValues(ctx.sectionBundleInput).values
    },
    {
        name: "glazingCode",
        run: (ctx, values) => getGlazingCodeLogicValues(ctx.glazingInput, values)
    },
    {
        name: "scheduling",
        run: (ctx, values) => getSchedulingValues(ctx.glazingInput, values)
    }
];

/* ----------------------------------------------------------
   GLOBAL DRIVERS (global product code, not React)
   Called by name on window, after React values are written.
---------------------------------------------------------- */

const GLOBAL_DRIVERS = [
    "addHardwareDrivers",
    "addTrackDrivers",
    "addOperatorEvents"
];

async function runGlobalDrivers() {

    for (const name of GLOBAL_DRIVERS) {

        const fn = window[name];

        if (typeof fn !== "function") {
            console.warn(`Configure: global driver ${name}() not found.`);
            continue;
        }

        try {
            await fn();
        } catch (err) {
            throw new Error(`Global driver "${name}" failed: ${err.message}`);
        }
    }
}

export async function buildConfigureValues(ctx) {

    // Live values (glazing codes, door face / glazing price) go first
    let values = { ...ctx.liveValues };

    for (const driver of CONFIGURE_DRIVERS) {

        try {

            const result = await driver.run(ctx, values);

            values = { ...values, ...result };

        } catch (err) {

            throw new Error(`Driver "${driver.name}" failed: ${err.message}`);
        }
    }

    return values;
}

/* ----------------------------------------------------------
   RUN
---------------------------------------------------------- */

let configureInProgress = false;

export async function runConfigure(getContext) {

    if (configureInProgress) {
        return false;
    }

    configureInProgress = true;

    // Give the browser a chance to paint the loader
    await new Promise(resolve => {
        requestAnimationFrame(() => setTimeout(resolve, 0));
    });

    try {

        const values = await buildConfigureValues(getContext());

        const missing = writeEwValues(values);

        if (missing.length) {
            console.warn("Configure: EW inputs not found:", missing);
        }

        window.EW_VALUES = values;

        // await runGlobalDrivers();

        if (typeof window.nextPage === "function") {
            window.nextPage();
        } else {
            console.warn("Configure: window.nextPage() not found.");
        }

        return true;

    } catch (err) {

        console.error("Configure error:", err);
        return false;

    } finally {

        configureInProgress = false;
    }
}
