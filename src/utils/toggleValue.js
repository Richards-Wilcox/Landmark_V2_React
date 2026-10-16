export const toggleValue = (
    currentValue,
    newValue,
    setter
) => {

    setter(
        currentValue === newValue
            ? ""
            : newValue
    );

};