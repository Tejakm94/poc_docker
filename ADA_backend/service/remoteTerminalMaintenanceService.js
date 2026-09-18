const { randomUUID } = require("crypto");
const { pool } = require("../db/connect");
const { logger } = require("../logs/logger");

const createRemoteTerminalMaintenanceService = async (
  lruName,
  equipment,
  manufactureId,
  busId,
  rtAddress,
  icdVersionId,
  swVersion,
  releaseVersion,
  amndNo,
  rtNote,
  rtRemarks,
  createdBy,
  aircraftType,
  selectAircraftIds,
  guidelineId,
  selectedProgrammesId,
  hardwareVersion,
  amndDate,
  adminRemarks,
  fileName,
) => {
  try {
    // Basic required field validation
    if (
      !lruName ||
      !busId ||
      !aircraftType ||
      !guidelineId ||
      !createdBy
    ) {
      return {
        status: 0,
        message:
          "LRU Name, Bus ID, Aircraft Type, Guideline ID and Created By are required",
      };
    }

    const trimmedLruName = lruName.trim();
    const trimmedBusId = busId.trim();

    // ---------------------------------------------------
    // Check if BusId exists
    // ---------------------------------------------------
    const [busResult] = await pool.execute(
      `SELECT Id
       FROM BusList
       WHERE BusId = ?
       LIMIT 1`,
      [trimmedBusId],
    );

    if (busResult.length === 0) {
      return {
        status: 0,
        message: "Invalid BusId",
      };
    }

    // ---------------------------------------------------
    // Check if AircraftType exists
    // ---------------------------------------------------
    const [aircraftTypeResult] = await pool.execute(
      `SELECT Id
       FROM RT_AircraftTypeList1
       WHERE Id = ?
       LIMIT 1`,
      [aircraftType],
    );

    if (aircraftTypeResult.length === 0) {
      return {
        status: 0,
        message: "Invalid AircraftType",
      };
    }

    // ---------------------------------------------------
    // Check if GuidelineId exists
    // ---------------------------------------------------
    const [guidelineResult] = await pool.execute(
      `SELECT Id
       FROM Guidelines
       WHERE Id = ?
       LIMIT 1`,
      [guidelineId],
    );

    if (guidelineResult.length === 0) {
      return {
        status: 0,
        message: "Invalid GuidelineId",
      };
    }

    // ---------------------------------------------------
    // Validate Aircraft IDs
    // Example: "1,2,3"
    // ---------------------------------------------------
    if (selectAircraftIds) {
      const aircraftIds = String(selectAircraftIds)
        .split(",")
        .map((id) => Number(id.trim()))
        .filter((id) => Number.isInteger(id) && id > 0);

      if (aircraftIds.length === 0) {
        return {
          status: 0,
          message: "Invalid SelectAircraftIds",
        };
      }

      const uniqueAircraftIds = [...new Set(aircraftIds)];

      const placeholders = uniqueAircraftIds
        .map(() => "?")
        .join(",");

      const [aircraftResult] = await pool.execute(
        `SELECT Id
         FROM AircraftList
         WHERE Id IN (${placeholders})`,
        uniqueAircraftIds,
      );

      if (aircraftResult.length !== uniqueAircraftIds.length) {
        return {
          status: 0,
          message:
            "One or more selected Aircraft IDs are invalid",
        };
      }
    }

    // ---------------------------------------------------
    // Validate Programme IDs
    // Example: "1,2,3"
    // ---------------------------------------------------
    // if (selectedProgrammesId) {
    //   const programmeIds = String(selectedProgrammesId)
    //     .split(",")
    //     .map((id) => Number(id.trim()))
    //     .filter((id) => Number.isInteger(id) && id > 0);

    //   if (programmeIds.length === 0) {
    //     return {
    //       status: 0,
    //       message: "Invalid SelectedProgrammesId",
    //     };
    //   }

    //   const uniqueProgrammeIds = [...new Set(programmeIds)];

    //   const placeholders = uniqueProgrammeIds
    //     .map(() => "?")
    //     .join(",");

    //   const [programmeResult] = await pool.execute(
    //     `SELECT Id
    //      FROM ProgrammeList
    //      WHERE Id IN (${placeholders})`,
    //     uniqueProgrammeIds,
    //   );

    //   if (programmeResult.length !== uniqueProgrammeIds.length) {
    //     return {
    //       status: 0,
    //       message:
    //         "One or more selected Programme IDs are invalid",
    //     };
    //   }
    // }

    // ---------------------------------------------------
    // Check if same Remote Terminal already exists
    // Adjust fields if your duplicate rule is different
    // ---------------------------------------------------
    const [existingRecord] = await pool.execute(
      `SELECT Id
       FROM RemoteTerminalMaintenance
       WHERE LRU_Name = ?
         AND BusId = ?
         AND AircraftType = ?
       LIMIT 1`,
      [
        trimmedLruName,
        trimmedBusId,
        aircraftType,
      ],
    );

    if (existingRecord.length > 0) {
      return {
        status: 0,
        message: "Remote terminal maintenance already exists",
      };
    }

    // ---------------------------------------------------
    // Generate UUID
    // ---------------------------------------------------
   const [lastRecord] = await pool.execute(
  `SELECT Id
   FROM RemoteTerminalMaintenance
   WHERE Id LIKE 'RTM%'
   ORDER BY CAST(SUBSTRING(Id, 4) AS UNSIGNED) DESC
   LIMIT 1`
);

let id = "RTM01";

if (lastRecord.length > 0) {
  const lastId = lastRecord[0].Id;

  // RTM01 -> 01 -> 1
  const lastNumber = parseInt(lastId.substring(3), 10);

  const nextNumber = lastNumber + 1;

  id = `RTM${String(nextNumber).padStart(2, "0")}`;
}

    // ---------------------------------------------------
    // Insert
    // ---------------------------------------------------
const [result] = await pool.execute(
  `INSERT INTO RemoteTerminalMaintenance
  (
    Id,
    LRU_Name,
    Equipment,
    ManufactureId,
    BusId,
    RtAddress,
    IcdVersionId,
    SwVersion,
    ReleaseVersion,
    AmndNo,
    RtNote,
    RtRemarks,
    CreatedAt,
    CreatedBy,
    UpdatedBy,
    UpdatedAt,
    AircraftType,
    SelectAircraftIds,
    GuidelineId,
    SelectedProgrammesId,
    HardwareVersion,
    AmndDate,
    ApprovedAt,
    ApprovedBy,
    IsApproved,
    AdminRemarks,
    FileName
  )
  VALUES
  (
    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
    NOW(), ?, NULL, NULL, ?, ?, ?, ?,
    ?, ?, NULL, NULL, 0, ?, ?
  )`,
  [
    id,
    trimmedLruName,
    equipment ?? null,
    manufactureId ?? null,
    trimmedBusId,
    rtAddress ?? null,
    icdVersionId ?? null,
    swVersion ?? null,
    releaseVersion ?? null,
    amndNo ?? null,
    rtNote ?? null,
    rtRemarks ?? null,
    createdBy,
    aircraftType,
    selectAircraftIds ?? null,
    guidelineId,
    selectedProgrammesId ?? null,
    hardwareVersion ?? null,
    amndDate ?? null,
    adminRemarks ?? null,
    fileName ?? null,
  ],
);

    return {
      status: 1,
      message:
        "Remote terminal maintenance created successfully",
        data: {
    id
  },
    };
  } catch (error) {
    logger.error(error.stack)
    console.log(
      "createRemoteTerminalMaintenanceService Error:",
      error,
    );

    throw error;
  }
};

const updateRemoteTerminalMaintenanceService = async (
  id,
  lruName,
  equipment,
  manufactureId,
  busId,
  rtAddress,
  icdVersionId,
  swVersion,
  releaseVersion,
  amndNo,
  rtNote,
  rtRemarks,
  updatedBy,
  aircraftType,
  selectAircraftIds,
  guidelineId,
  selectedProgrammesId,
  hardwareVersion,
  amndDate,
  adminRemarks,
  fileName,
) => {
  try {
    // ---------------------------------------------------
    // Required fields
    // ---------------------------------------------------
    if (
      !id ||
      !lruName ||
      !busId ||
      !aircraftType ||
      !guidelineId ||
      !updatedBy
    ) {
      return {
        status: 0,
        message:
          "Id, LRU Name, Bus ID, Aircraft Type, Guideline ID and Updated By are required",
      };
    }

    const trimmedId = id.trim();
    const trimmedLruName = lruName.trim();
    const trimmedBusId = busId.trim();

    // ---------------------------------------------------
    // Check Remote Terminal exists
    // ---------------------------------------------------
    const [existingRecord] = await pool.execute(
      `SELECT Id
       FROM RemoteTerminalMaintenance
       WHERE Id = ?
       LIMIT 1`,
      [trimmedId],
    );

    if (existingRecord.length === 0) {
      return {
        status: 0,
        message: "Remote terminal maintenance record not found",
      };
    }

    // ---------------------------------------------------
    // Check BusId
    // ---------------------------------------------------
    const [busResult] = await pool.execute(
      `SELECT Id
       FROM BusList
       WHERE BusId = ?
       LIMIT 1`,
      [trimmedBusId],
    );

    if (busResult.length === 0) {
      return {
        status: 0,
        message: "Invalid BusId",
      };
    }

    // ---------------------------------------------------
    // Check AircraftType
    // ---------------------------------------------------
    const [aircraftTypeResult] = await pool.execute(
      `SELECT Id
       FROM RT_AircraftTypeList1
       WHERE Id = ?
       LIMIT 1`,
      [aircraftType],
    );

    if (aircraftTypeResult.length === 0) {
      return {
        status: 0,
        message: "Invalid AircraftType",
      };
    }

    // ---------------------------------------------------
    // Check Guideline
    // ---------------------------------------------------
    const [guidelineResult] = await pool.execute(
      `SELECT Id
       FROM Guidelines
       WHERE Id = ?
       LIMIT 1`,
      [guidelineId],
    );

    if (guidelineResult.length === 0) {
      return {
        status: 0,
        message: "Invalid GuidelineId",
      };
    }

    // ---------------------------------------------------
    // Validate selected Aircraft IDs
    // Example: "1,2,3"
    // ---------------------------------------------------
    if (selectAircraftIds) {
      const aircraftIds = String(selectAircraftIds)
        .split(",")
        .map((aircraftId) => Number(aircraftId.trim()))
        .filter(
          (aircraftId) =>
            Number.isInteger(aircraftId) && aircraftId > 0
        );

      if (aircraftIds.length === 0) {
        return {
          status: 0,
          message: "Invalid SelectAircraftIds",
        };
      }

      const uniqueAircraftIds = [...new Set(aircraftIds)];

      const placeholders = uniqueAircraftIds
        .map(() => "?")
        .join(",");

      const [aircraftResult] = await pool.execute(
        `SELECT Id
         FROM AircraftList
         WHERE Id IN (${placeholders})`,
        uniqueAircraftIds,
      );

      if (aircraftResult.length !== uniqueAircraftIds.length) {
        return {
          status: 0,
          message:
            "One or more selected Aircraft IDs are invalid",
        };
      }
    }

    // ---------------------------------------------------
    // Check duplicate
    // Ignore current record using Id <> ?
    // ---------------------------------------------------
    const [duplicateRecord] = await pool.execute(
      `SELECT Id
       FROM RemoteTerminalMaintenance
       WHERE LRU_Name = ?
         AND BusId = ?
         AND AircraftType = ?
         AND Id <> ?
       LIMIT 1`,
      [
        trimmedLruName,
        trimmedBusId,
        aircraftType,
        trimmedId,
      ],
    );

    if (duplicateRecord.length > 0) {
      return {
        status: 0,
        message: "Remote terminal maintenance already exists",
      };
    }

    // ---------------------------------------------------
    // Update record
    // ---------------------------------------------------
    const [result] = await pool.execute(
      `UPDATE RemoteTerminalMaintenance
       SET
         LRU_Name = ?,
         Equipment = ?,
         ManufactureId = ?,
         BusId = ?,
         RtAddress = ?,
         IcdVersionId = ?,
         SwVersion = ?,
         ReleaseVersion = ?,
         AmndNo = ?,
         RtNote = ?,
         RtRemarks = ?,
         UpdatedBy = ?,
         UpdatedAt = NOW(),
         AircraftType = ?,
         SelectAircraftIds = ?,
         GuidelineId = ?,
         SelectedProgrammesId = ?,
         HardwareVersion = ?,
         AmndDate = ?,
         AdminRemarks = ?,
         FileName = ?
       WHERE Id = ?`,
      [
        trimmedLruName,
        equipment ?? null,
        manufactureId ?? null,
        trimmedBusId,
        rtAddress ?? null,
        icdVersionId ?? null,
        swVersion ?? null,
        releaseVersion ?? null,
        amndNo ?? null,
        rtNote ?? null,
        rtRemarks ?? null,
        updatedBy,
        aircraftType,
        selectAircraftIds ?? null,
        guidelineId,
        selectedProgrammesId ?? null,
        hardwareVersion ?? null,
        amndDate ?? null,
        adminRemarks ?? null,
        fileName ?? null,
        trimmedId,
      ],
    );

    if (result.affectedRows === 0) {
      return {
        status: 0,
        message: "Remote terminal maintenance record not found",
      };
    }

    return {
      status: 1,
      message: "Remote terminal maintenance updated successfully",
      data: {
        id: trimmedId,
      },
    };
  } catch (error) {
    logger.error(error.stack)
    console.log(
      "updateRemoteTerminalMaintenanceService Error:",
      error,
    );

  }
};

const getAllRemoteTerminalMaintenanceService = async () => {
  try {
    const [rows] = await pool.execute(
      `SELECT
        Id,
        LRU_Name,
        Equipment,
        ManufactureId,
        BusId,
        RtAddress,
        IcdVersionId,
        SwVersion,
        ReleaseVersion,
        AmndNo,
        RtNote,
        RtRemarks,
        CreatedAt,
        CreatedBy,
        UpdatedBy,
        UpdatedAt,
        AircraftType,
        SelectAircraftIds,
        GuidelineId,
        SelectedProgrammesId,
        HardwareVersion,
        AmndDate,
        ApprovedAt,
        ApprovedBy,
        IsApproved,
        AdminRemarks,
        FileName
       FROM RemoteTerminalMaintenance
       ORDER BY CreatedAt DESC`
    );

    if (rows.length === 0) {
      return {
        status: 0,
        message: "No remote terminal maintenance records found",
        data: [],
      };
    }

    return {
      status: 1,
      message: "Remote terminal maintenance records fetched successfully",
      data: rows,
    };
  } catch (error) {
  logger.error(error.stack)
    console.log(
      "getAllRemoteTerminalMaintenanceService Error:",
      error
    );
    
  }
};
module.exports = {
  createRemoteTerminalMaintenanceService,
  updateRemoteTerminalMaintenanceService,
  getAllRemoteTerminalMaintenanceService
};