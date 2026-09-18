const { pool } = require("../db/connect");
const { configurations } = require("../config/config");
const { logger } = require("../logs/logger");

const addBusListService = async (busId, createdBy) => {
  try {
    busId = typeof busId === "string" ? busId.trim() : "";
    createdBy = Number(createdBy);

    if (!busId || !Number.isInteger(createdBy)) {
      return {
        status: 0,
        message: configurations.Messages.busList.provideDetails,
      };
    }

    const [result] = await pool.execute(
      "INSERT INTO BusList (BusId, CreatedBy) VALUES (?, ?)",
      [busId, createdBy],
    );

    return {
      status: 1,
      message: configurations.Messages.busList.addBusList,
      data: {
        id: result.insertId,
        busId,
        createdBy,
      },
    };
  } catch (error) {
    logger.error(error.stack)
    return {
      status: 0,
      message: configurations.Messages.busList.busListAlreadyExists,
    };

    console.log(error);
    throw error;
  }
};

// const updateBusListService = async (
//   id,
//   busId,
//   updatedBy,
// ) => {
//   try {
//     const busListId = Number(id);
//     const trimmedBusId =
//       typeof busId === "string" ? busId.trim() : "";
//     const updatedById = Number(updatedBy);

//     if (
//       !Number.isInteger(busListId) ||
//       busListId <= 0 ||
//       !trimmedBusId ||
//       !Number.isInteger(updatedById)
//     ) {
//       return {
//         status: 0,
//         message: "A valid id, busId, and integer updatedBy are required",
//       };
//     }

//     const [result] = await pool.execute(
//       `UPDATE BusList
//        SET BusId = ?, UpdatedBy = ?, UpdatedAt = NOW()
//        WHERE Id = ?`,
//       [trimmedBusId, updatedById, busListId],
//     );

//     if (result.affectedRows === 0) {
//       return {
//         status: 0,
//         message: "Bus record not found",
//       };
//     }

//     return {
//       status: 1,
//       message: "Bus details updated successfully",
//       data: {
//         id: busListId,
//         busId: trimmedBusId,
//         updatedBy: updatedById,
//       },
//     };
//   } catch (error) {
//     console.log(error);

//   }
// };
const updateBusListService = async (id, busId, updatedBy) => {
  try {
    const busListId = Number(id);
    const trimmedBusId = typeof busId === "string" ? busId.trim() : "";
    const updatedById = Number(updatedBy);

    if (
      !Number.isInteger(busListId) ||
      busListId <= 0 ||
      !trimmedBusId ||
      !Number.isInteger(updatedById)
    ) {
      return {
        status: 0,
        message: "A valid id, busId, and integer updatedBy are required",
      };
    }

    // Check whether busId already exists for another record
    const [existingBus] = await pool.execute(
      `SELECT Id
       FROM BusList
       WHERE BusId = ?
       AND Id != ?`,
      [trimmedBusId, busListId],
    );

    if (existingBus.length > 0) {
      return {
        status: 0,
        message: "This busId already exists",
      };
    }

    // Update bus details
    const [result] = await pool.execute(
      `UPDATE BusList
       SET BusId = ?, UpdatedBy = ?, UpdatedAt = NOW()
       WHERE Id = ?`,
      [trimmedBusId, updatedById, busListId],
    );

    if (result.affectedRows === 0) {
      return {
        status: 0,
        message: "Bus record not found",
      };
    }

    return {
      status: 1,
      message: "Bus details updated successfully",
      data: {
        id: busListId,
        busId: trimmedBusId,
        updatedBy: updatedById,
      },
    };
  } catch (error) {
    logger.error(error)
    // Still keep this because two requests could pass
    // the SELECT check at the same time.
    if (error.number === 2601 || error.number === 2627) {
      return {
        status: 0,
        message: "This busId already exists",
      };
    }

    console.log(error);

    return {
      status: 0,
      message: "Something went wrong while updating bus details",
    };
  }
};

const getAllBusListService = async () => {
  try {
    const [result] = await pool.execute(
      `SELECT 
        Id AS id,
        BusId AS busId,
        CreatedBy AS createdBy,
        CreatedAt AS createdAt,
        UpdatedBy AS updatedBy,
        UpdatedAt AS updatedAt
       FROM BusList
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
      message: "Bus list fetched successfully",
      data: result,
    };
  } catch (error) {
    logger.error(error)
    console.log(error);
  }
};

module.exports = {
  addBusListService,
  updateBusListService,
  getAllBusListService,
};
