const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let error = {
    message: 'Internal Server Error',
    status: 500
  };

  // MongoDB errors
  if (err.code === 11000) {
    error = {
      message: 'Duplicate entry. This record already exists.',
      status: 400
    };
  } else if (err.name === 'MongoError' && err.code === 11000) {
    error = {
      message: 'Duplicate entry. This record already exists.',
      status: 400
    };
  } else if (err.name === 'ValidationError') {
    error = {
      message: Object.values(err.errors).map(val => val.message).join(', '),
      status: 400
    };
  } else if (err.name === 'CastError' || err.name === 'BSONTypeError') {
    error = {
      message: 'Invalid ID format',
      status: 400
    };
  } else if (err.name === 'JsonWebTokenError') {
    error = {
      message: 'Invalid token',
      status: 401
    };
  } else if (err.name === 'TokenExpiredError') {
    error = {
      message: 'Token expired',
      status: 401
    };
  } else if (err.status && err.message) {
    error = {
      message: err.message,
      status: err.status
    };
  }

  res.status(error.status).json({
    message: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  asyncHandler
};
