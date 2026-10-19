export function errorHandler(error, _request, response, _next) {
  const statusCode = error.statusCode
    || (error.name === 'ValidationError' ? 400 : 0)
    || (error.name === 'CastError' ? 400 : 0)
    || (error.code === 11000 ? 409 : 0)
    || 500;

  if (statusCode >= 500) {
    console.error(
      `API request failed (${error.name || 'Error'}): ${error.cause?.code || ''} ${error.cause?.message || error.message}`,
    );
  }

  response.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? 'Internal server error' : error.message,
  });
}
