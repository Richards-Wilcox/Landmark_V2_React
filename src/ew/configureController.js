/* ==========================================================
   CONFIGURE (React version of FINAL_VALIDATION.js)

   Original flow on Configure click:
     1. block double clicks         (configureInProgress)
     2. show loader + let it paint
     3. initializeDriversOnDemand() (section bundle, glazing code,
                                     scheduling, hardware, track, operator)
     4. finalvalidation()
     5. nextPage()

   React flow (ONE place for the whole order):
     1. block double clicks
     2. let the loader paint
     3. React drivers, IN ORDER (each gets the values so far):
          section bundle -> glazing code -> scheduling
     4. write all React values into the EW inputs
     5. EW controllers (shared global files in EW, no addLogic):
          hardware carton -> track bundle + springs
        They run LAST, so nothing written after them can
        overwrite their values.
     6. nextPage()

   Configurator.js only builds the context (getConfigureContext)
   and saves INPUT_JSON – it does NOT call the EW controllers.
========================================================== */

import { getSectionBundleValues } from "./sectionBundle";
import { getGlazingCodeLogicValues } from "./glazing";
import { getSchedulingValues } from "./schedulingCode";
import { writeEwValues } from "./ewSync";

// Set to false to switch off the configure logs
const CONFIGURE_DEBUG = true;

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

export async function buildConfigureValues(ctx) {

    // Live values (glazing codes, door face / glazing price ...) go first
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
   EW CONTROLLERS (shared global files in EW)
   HARDWARE_CARTON_CONTROLLER.js / TRACK_BUNDLE_CONTROLLER.js

   ctx.hardwareCarton / ctx.trackBundle:
     object -> run with that input
     null   -> clear (Assembled / Raw panel / no hardware set)
---------------------------------------------------------- */

async function runEwControllers(ctx) {

    // Hardware carton
    if (typeof window.runHardwareCarton !== "function") {
        console.warn("Configure: HARDWARE_CARTON_CONTROLLER.js is not loaded in EW.");
    } else if (ctx.hardwareCarton) {
        window.runHardwareCarton(ctx.hardwareCarton);
    } else {
        window.clearHardwareCarton?.();
    }

    // Track bundle + springs (spring API call -> async)
    if (typeof window.runTrackBundle !== "function") {
        console.warn("Configure: TRACK_BUNDLE_CONTROLLER.js is not loaded in EW.");
    } else if (ctx.trackBundle) {
        await window.runTrackBundle(ctx.trackBundle);
    } else {
        window.clearTrackBundle?.();
    }
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

        // Built ONCE – drivers and controllers use the same snapshot
        const ctx = getContext();

        // 3. React drivers
        const values = await buildConfigureValues(ctx);

        // 4. React values -> EW
        const missing = writeEwValues(values);

        window.EW_VALUES = values;

        if (CONFIGURE_DEBUG && missing.length) {
            console.info("Configure: React-only ids (no EW input):", missing);
        }

        // 5. EW controllers last
        await runEwControllers(ctx);

        // 6. Next page
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
