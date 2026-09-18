const { StatusCodes } = require("http-status-codes");
const asyncWrapper = require("../../middleware/async");
const {
  updateRemoteTerminalMaintenanceService,
} = require("../../service/remoteTerminalMaintenanceService");
const { configurations } = require("../../config/config");
const { logger } = require("../../logs/logger");

exports.updateRemoteTerminalMaintenance = asyncWrapper(async (req, res) => {
  logger.info(configurations.logger.updateRemoteTerminalMaintenanceLogger);

  const {
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
  } = req.body;

  const result = await updateRemoteTerminalMaintenanceService(
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
  );

  res.status(StatusCodes.OK).json(result);
});
