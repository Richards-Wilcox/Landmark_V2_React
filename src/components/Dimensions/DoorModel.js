function DoorModel({
    doorModel,
    setDoorModel,
    models,
    renderSelectionIndicator
}) {

    return (

        <div className="configurator-section landmark-section">

            <div className="landmark-section-header">
                Door Model
            </div>

            <div className="door-model-buttons">

                {models.map(model => (

                    <div
                        key={model.id}
                        className={
                            doorModel === model.value
                                ? "door-model-button active"
                                : "door-model-button"
                        }
                        onClick={() =>
                            setDoorModel(model.value)
                        }
                    >

                        {model.label}

                        {renderSelectionIndicator(
                            doorModel === model.value
                        )}

                    </div>

                ))}

            </div>

        </div>

    );

}

export default DoorModel;