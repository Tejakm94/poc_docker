const { pool } = require("../db/connect");
const { logger } = require("../logs/logger");

const getAllElementMaintenanceService = async () => {
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
        WordId,
        elementName,
        elementNo,
        startBitPosition,
        endBitPosition,
        elementApplicability,
        aliasName,
        elementLSB,
        elementMSB,
        signalTypeId,
        Units,
        ElementRemarks,
        MessageNo,
        SelectedProgrammesId,       
        CreatedAt,
        CreatedBy,
        updatedAt,
        updatedBy,
        RemoteTableId, 
        MessageTableId,
        WordTableId,
        SelectAircraftIds, 
        ApprovedAt,
        ApprovedBy,
        IsApproved,
        AdminRemarks,
        Description,
        SelectBitPosition
       FROM ElementMaintenance
       ORDER BY CreatedAt DESC`,
    );

    if (rows.length === 0) {
      return {
        status: 0,
        message: "No element maintenance records found",
        data: [],
      };
    }

    return {
      status: 1,
      message: "Element maintenance records fetched successfully",
      data: rows,
    };
  } catch (error) {
   logger.error(error.stack)
    console.log("getAllElementMaintenanceService Error:", error);
  }
};
module.exports = {
  getAllElementMaintenanceService,
};
