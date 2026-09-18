//Requiring the necessary packages
// const log = require("../logs/logger");
 
const asyncWrapper = (fn) => {
  // Execute the provided asynchronous function with the given request, response, and next middleware arguments
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      // log.logger.error(`${error}`);
      // Pass the error to the next middleware
      next(error);
    }
  };
};
 
module.exports = asyncWrapper;
 