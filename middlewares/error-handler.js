const { CustomApiError } = require("../errors/custom-error");

const errorHandler = (err, req, res, next) => {
  if (err instanceof CustomApiError)
    return res.status(err.statusCode).json({ message: err.message });
  res.status(500).json(err);
};

module.exports = errorHandler;
