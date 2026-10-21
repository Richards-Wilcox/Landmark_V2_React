export function getScheduledTrussQuantity(
    width,
    height,
    numOfSections
) {
    const widthInInches = Number(width) || 0;
    const heightInInches = Number(height) || 0;
    const sections = Number(numOfSections) || 0;

    if (widthInInches < 147) {
        return 0;
    }

    switch (sections) {
        case 3:
            return widthInInches < 195 ? 1 : 3;
        case 4:
            if (heightInInches <= 84) {
                if (widthInInches < 195) return 1;
                return widthInInches < 219 ? 3 : 4;
            }
            return widthInInches < 219 ? 3 : 4;
        case 5:
            if (heightInInches < 171) return 1;
            return widthInInches < 219 ? 3 : 5;
        case 6:
            if (widthInInches < 171) return 1;
            if (widthInInches < 195) return 3;
            return widthInInches < 219 ? 4 : 6;
        default:
            return 0;
    }
}

export function getTotalTrussQuantity({
    width,
    height,
    numOfSections,
    extraTruss
}) {
    return getScheduledTrussQuantity(
        width,
        height,
        numOfSections
    ) + (extraTruss ? 1 : 0);
}
