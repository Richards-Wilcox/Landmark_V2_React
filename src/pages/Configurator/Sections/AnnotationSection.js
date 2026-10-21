const annotationFields = [
    {
        id: "TAG",
        label: "Tag"
    },
    {
        id: "CONTRACTOR",
        label: "Contractor"
    },
    {
        id: "ARCHITECT",
        label: "Architect"
    },
    {
        id: "REFERENCE",
        label: "Reference / Project #"
    },
    {
        id: "CLIENT",
        label: "Client"
    }
];

function AnnotationSection({
    annotations,
    setAnnotations
}) {
    return (
        <section
            className="annotations-section"
            aria-labelledby="annotations-heading"
        >
            <h3 id="annotations-heading">
                Annotations
            </h3>

            <div className="annotation-fields">
                {annotationFields.map(field => (
                    <div
                        className="annotation-field"
                        key={field.id}
                    >
                        <label htmlFor={field.id}>
                            {field.label}
                        </label>
                        <input
                            id={field.id}
                            name={field.id}
                            type="text"
                            value={annotations[field.id]}
                            onChange={event =>
                                setAnnotations(previous => ({
                                    ...previous,
                                    [field.id]: event.target.value
                                }))
                            }
                        />
                    </div>
                ))}
            </div>
        </section>
    );
}

export default AnnotationSection;