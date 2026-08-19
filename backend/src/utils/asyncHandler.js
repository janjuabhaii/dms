/**
 * Wraps an async Express route handler so rejected promises are
 * automatically forwarded to next(err) -> global error middleware,
 * instead of requiring a try/catch in every single controller.
 *
 * Usage:
 *   router.get("/", asyncHandler(async (req, res) => { ... }));
 */
const asyncHandler = (requestHandler) => (req, res, next) => {
  Promise.resolve(requestHandler(req, res, next)).catch(next);
};

export { asyncHandler };
