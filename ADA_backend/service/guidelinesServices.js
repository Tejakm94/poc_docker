const { pool } = require("../db/connect");
const { configurations } = require("../config/config");
const { logger } = require("../logs/logger");

const getAllGuidelinesService = async () => {
  try {
    const [result] = await pool.execute(
      `SELECT 
        Id AS id,
        Guideline AS guideline
       FROM Guidelines
       `,
    );

    if (result.length === 0) {
      return {
        status: 0,
        message: "No guidelines data found",
        data: [],
      };
    }

    return {
      status: 1,
      message: "Guidelines fetched successfully",
      data: result,
    };
  } catch (error) {
    logger.error(error.stack)
    console.log(error);
  }
};
module.exports = {
  getAllGuidelinesService,
};
