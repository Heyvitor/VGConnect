const ReturnErrorApi = (res, error, statusCode = 400) => {
    res.status(statusCode).json({
      status: false,
      error,
    });
  };
  
  module.exports = { ReturnErrorApi };