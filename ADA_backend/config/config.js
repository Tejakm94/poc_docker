//Requiring the necessary packages
require("dotenv").config(); //comment it in production enviroment

exports.configurations = {
  //Email details
  Email: {},

  //Application host and port
  AltenApplication: {
    host: "0.0.0.0",
    port: 5000,
  },

  //Error Log
  errorLogId: "file",

  //Jsonwebtokens
  jwtSecret: process.env.JWT_SECRET,
  jwtLifetime: "1d",
  userSession: [],
  urlMap: {},
  sessionTimeout: 3600000, //session timeout time  1 hour

  socketIoClientURL: "http://<server-ip/domain-name>:<Production-PORT>",
  //Database details
  dbPoolSize: 100,
  Database: {
    // development and testing pupose
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 1433),
    databaseName: process.env.DB_NAME || "test",

    dialect: "mssql",
  },

  //user path access details
  PublicRoutes: [],

  // timeout maximum sockets
  timeOut: 120000,
  maxSockets: 1000000,

  Messages: {
    common: {
      provideDetails: `Please provide proper details`,
      noData: "No data available",
      error: "An error occurred.Please try again later",
    },
    busList: {
      provideDetails: `busId and an integer createdBy are required`,
      addBusList: `Bus details added successfully`,
      busListAlreadyExists: `This busId already exists`,
    },
  },
  logger: {
    //busList
    addBusListLogger: "ADD BUS LIST API HAS BEEN HIT",
    getAllBusListLogger: "GET ALL BUS LIST API HAS BEEN HIT",
    updateBusListLogger: "UPDATE BUSLIST API HAS BEEN HIT",
    //messageMaintenance
    createMessageMaintenanceLogger:
      "CREATE MESSAGE MAINTENANCE API HAS BEEN HIT",
    getAllMessageMaintenanceLogger:
      "GET ALL MESSAGE MAINTENANCE API HAS BEEN HIT",
    importMessageMaintenanceLogger:
      "IMPORT MESSAGE MAINTENANCE API HAS BEEN HIT",
    //RemoteTerminalMaintenance
    createRemoteTerminalMaintenanceLogger:
      "CREATE REMOTE TERMINAL MAINTENANCE API HAS BEEN HIT",
    getAllRemoteTerminalMaintenanceLogger:
      "GET ALL REMOTE TERMINAL LIST API HAS BEEN HIT",
    updateRemoteTerminalMaintenanceLogger:
      "UPDATE REMOTE TERMINAL MAINTENANCE API HAS BEEN HIT",
  },
};
