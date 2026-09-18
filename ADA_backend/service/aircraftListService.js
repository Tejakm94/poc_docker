const { pool } = require("../db/connect");
const { configurations } = require("../config/config");
const { logger } = require("../logs/logger");

const getAllAircraftListService = async () => {
  try {
    const [result] = await pool.execute(
      `SELECT 
        Id AS id,
        AircraftName AS aircraftName,
        ProgrammeId AS programmeId,
        CreatedBy AS createdBy,
        CreatedAt AS createdAt,
        UpdatedBy AS updatedBy,
        UpdatedAt AS updatedAt
       FROM AircraftList
       ORDER BY Id DESC`,
    );

    if (result.length === 0) {
      return {
        status: 0,
        message: "No bus data found",
        data: [],
      };
    }

    return {
      status: 1,
      message: "Aircraft List fetched successfully",
      data: result,
    };
  } catch (error) {
    logger.error(error.stack)
    console.log(error);
  }
};

module.exports = {
  getAllAircraftListService,
};
