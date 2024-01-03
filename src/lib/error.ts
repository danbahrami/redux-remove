export class MissingManagerError extends Error {
    public readonly name = "MissingManagerError";

    constructor() {
        super(
            "No state manager found in context. This is probably because the component is not wrapped in the correct state provider.",
        );
    }
}
