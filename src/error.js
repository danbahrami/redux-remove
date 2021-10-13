export class MissingManagerError extends Error {
  constructor(name) {
    const message = `No ${name} manager found in context. This is probably because the component is not wrapped in the correct state provider.`;
    super(message);
  }
}
