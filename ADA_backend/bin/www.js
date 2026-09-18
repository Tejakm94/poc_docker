/*
 ************************************************************************************************************
 * License Information :Alten Global Technology Solutions Private Limited.                                  *
 *                      #37, Krishna Reddy Colony, Domlur layout,                                           *
 *                      Domlur,Bangalore - 560071, INDIA                                                    *
 *                      Licensed software and All rights reserved.                                          *
 ************************************************************************************************************
 * File             : www.js                                                                                *
 *                                                                                                          *
 * Description      : To set up the main running server with valid port and host.                           *
 *                                                                                                          *
 * Author(s)        : Mamatha H N                                                                           *
 *                                                                                                          *
 * Version History:                                                                                         *
 * <Version Number>                 <Author>              <date>      <defect Number>      <Modification    *
 *                                                                                          made and the    *
 *                                                                                          reason for      *
 *                                                                                          modification >  *
 *  1.0                      Mamatha H N           07.08.2023        --            initial version          *
 *                                                                                                          *
 * References        : None.                                                                                *
 *                                                                                                          *
 * Assumption(s)     : None.                                                                                *
 *                                                                                                          *
 * Constraint(s)     : None.                                                                                *
 *                                                                                                          *
 ************************************************************************************************************
 */

//Requiring the necessary packages
const http = require("http");
const https = require("https");
const cluster = require("cluster");
const numCpu = require("os").cpus().length;
const socket = require("socket.io");

//Requiring the necessary files
const app = require("../app.js");
const config = require("../config/config");
const { initializeDatabase } = require("../db/init");
// const connectDb = require("../db/connect");
let protocol = http;
let protocolName = "http";
let options = {};

//Check for valid port
function normalize(val) {
  let port = parseInt(val);

  if (isNaN("port")) {
    return val;
  }
  if (port > 0) {
    return port;
  }
  return false;
}
const port = normalize(
  process.env.PORT || config.configurations.AltenApplication.port,
);

//Checking for protocol configurations (http/https).
if (config.configurations.httpsEnable === true) {
  protocol = https;
  protocolName = "https";
  options = config.configurations.httpsOptions;
}

protocol.globalAgent.maxSockets = config.configurations.maxSockets;
protocol.globalAgent.keepAlive = true;

// let windowsEventLog = new EventLogger({
//   source: "jch-cmos-production-server",
//   eventLog: "Application",
// });

// Create the server only after SQL Server is connected and the tables are available.
const server = protocol.createServer(options, app);
async function startServer() {
  try {
    await initializeDatabase();
    server.listen(
      port,
      config.configurations.AltenApplication.host,
      function () {
        server.timeout = config.configurations.timeOut;
        console.log(
          "Server running on " +
            protocolName +
            "://" +
            config.configurations.AltenApplication.host +
            ":" +
            port,
        );
      },
    );
    const io = socket(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
      // path: "/api/socket.io",
    });
    exports.io = io;
  } catch (error) {
    console.error("Server did not start:", error.message);
    process.exitCode = 1;
  }
}

startServer();
