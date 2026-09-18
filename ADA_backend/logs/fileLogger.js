 
//Requiring the necessary packages
const { createLogger, format, transports, log } = require("winston");
//the required formats from the format module
const { combine, timestamp, label, printf, json } = format;
 
exports.fileLogger = () => {
  // Create and return the logger instance
  return createLogger({
    // level: "debug",
    format: combine(timestamp(), json()),
    defaultMeta: { service: "user-service" },
    // Define the transports for logging
    transports: [
      // new transports.Console(),
      new transports.File({
        filename: "info.log",
        level: "info", // Log only info and warn levels
        format: format.combine(
          format((info) =>
            info.level === "info" || info.level === "warn" ? info : false
          )()
        ),
      }),
 
      // Transport for errors.log (logs only error level)
      new transports.File({
        filename: "errors.log",
        level: "error", // Log only error level
        format: format.combine(
          format((info) => (info.level === "error" ? info : false))()
        ),
      }),
    ],
  });
};
 
 
 