/**
 * Error handler middleware
 * @type {import("express").ErrorRequestHandler}
 */
export default (err, _, res) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err,
    });
  }

  // production
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  // unknown error
  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong',
  });
};
