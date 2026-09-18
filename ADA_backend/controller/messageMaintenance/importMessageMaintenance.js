const { StatusCodes } = require("http-status-codes");
const asyncWrapper = require("../../middleware/async");
const {
  importMessageMaintenanceService,
} = require("../../service/messageMaintenanceService");
const { configurations } = require("../../config/config");
const { logger } = require("../../logs/logger");

exports.importMessageMaintenance = asyncWrapper(async (req, res) => {
  logger.info(configurations.logger.importMessageMaintenanceLogger);
  const { headers, rows } = req.body;
  const expectedHeaders = [
"SlNo",
"Block",
"BusId",
"Source",
"Destn",
"NoOfWords",
"Freq",
"TxSub",
"RxSub",
"Remarks",
];
if (!headers || !Array.isArray(headers)) {
return res.status(StatusCodes.BAD_REQUEST).json({
status: 0,
message: "Headers are missing",
});

}

const missingHeaders = expectedHeaders.filter(
h => !headers.includes(h)
);

const extraHeaders = headers.filter(
h => !expectedHeaders.includes(h)
);


if (missingHeaders.length || extraHeaders.length) {
return res.status(StatusCodes.BAD_REQUEST).json({
status: 0,
message: "Header mismatch",
missingHeaders,
extraHeaders,

});

}


  // if (!headers || !rows || rows.length === 0) {
  //   return res.status(StatusCodes.BAD_REQUEST).json({
  //     status: 0,
  //     message: "Invalid import data",
  //   });
  // }

  const results = [];

  for (const row of rows) {
    const data = {
      LRU_Name: row.LRU_Name || "DefaultLRU",
      IcdVersionId: row.IcdVersionId || "ICD01",
      AmndNo: row.AmndNo || "A1",
      MessageName: row.MessageName || row.BlockId,
      BlockId: row.BlockId || "BLOCK00",
      BusId: row.BusId || 0,
      FramesId: row.FramesId || "FRM01",
      RemoteTableId: row.RemoteTableId || "RT01",
      CreatedBy: row.CreatedBy || 1,
      MsgDescription: row.MsgDescription || "",
      Source: row.Source || "",
      Destination: row.Destination || "",
      WordCount: row.WordCount || 0,
      Frequency: row.Frequency || "0Hz",
      TxSubAddress: row.TxSubAddress || 0,
      RxSubAddress: row.RxSubAddress || 0,
      MsgRemarks: row.MsgRemarks || "",
    };
    const result = await importMessageMaintenanceService(data);
    results.push(result);
  }

  res.status(StatusCodes.OK).json({
    status: 1,
    message: "Import completed",
    results,
  });
});
