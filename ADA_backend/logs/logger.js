//Requiring the necessary packages
const config = require("../config/config");
const errorLogger = require("./fileLogger");
 
// Check the configurat ion value
if (config.configurations.errorLogId === "file") {
  exports.logger = errorLogger.fileLogger();
}