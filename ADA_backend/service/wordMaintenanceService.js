const { pool } = require("../db/connect");
const { logger } = require("../logs/logger");
const getAllWordMaintenanceService = async () => {
  try {
    const [rows] = await pool.execute(
      `SELECT
        Id,
       LRU_Name,
        IcdVersionId,
        AmndNo,
        MessageName,
        BlockId,
        WordName,
       No_of_elements, 
       Description, 
       WordRemarks, 
       WordNo,
       WordId,
       CreatedAt,
      CreatedBy,
      updatedAt,
      updatedBy,
      RemoteTableId, 
     MessageTableId,
     WordCount, 
     ApprovedAt,
    ApprovedBy,
    IsApproved,
    MessageNo,
   AdminRemarks,
    WordApplicability,
    WordAliasName
       FROM WordMaintenance
       ORDER BY CreatedAt DESC`,
    );

    if (rows.length === 0) {
      return {
        status: 0,
        message: "No message maintenance records found",
        data: [],
      };
    }

    return {
      status: 1,
      message: "Word maintenance records fetched successfully",
      data: rows,
    };
  } catch (error) {
    logger.error(error)
    console.log("getAllWordMaintenanceService Error:", error);
  }
};
module.exports = {
  getAllWordMaintenanceService,
};
