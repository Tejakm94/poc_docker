const { pool } = require("./connect");

const statements = [
  `IF OBJECT_ID('BusList', 'U') IS NULL
   CREATE TABLE BusList (
     Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
     BusId NVARCHAR(255) NOT NULL UNIQUE,
     CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(), CreatedBy INT NULL,
     UpdatedBy INT NULL, UpdatedAt DATETIME2 NULL
   )`,
  `IF OBJECT_ID('RT_AircraftTypeList1', 'U') IS NULL
   CREATE TABLE RT_AircraftTypeList1 (
     Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
     AircraftType NVARCHAR(255) NOT NULL,
     CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(), CreatedBy INT NULL,
     UpdatedBy INT NULL, UpdatedAt DATETIME2 NULL
   )`,
  `IF OBJECT_ID('FramesList', 'U') IS NULL
   CREATE TABLE FramesList (
     Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
     FrameName NVARCHAR(255) NOT NULL,
     CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(), CreatedBy INT NULL,
     UpdatedBy INT NULL, UpdatedAt DATETIME2 NULL
   )`,
  `IF OBJECT_ID('Guidelines', 'U') IS NULL
   CREATE TABLE Guidelines (
     Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
     Guideline NVARCHAR(255) NOT NULL
   )`,
  `IF OBJECT_ID('AircraftList', 'U') IS NULL
   CREATE TABLE AircraftList (
     Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
     AircraftName NVARCHAR(255) NOT NULL, ProgrammeId INT NULL,
     CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(), CreatedBy INT NULL,
     UpdatedBy INT NULL, UpdatedAt DATETIME2 NULL
   )`,
  `IF OBJECT_ID('SignalList', 'U') IS NULL
   CREATE TABLE SignalList (
     Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
     SignalId NVARCHAR(255) NOT NULL,
     CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(), CreatedBy INT NULL,
     UpdatedBy INT NULL, UpdatedAt DATETIME2 NULL
   )`,
  `IF OBJECT_ID('RemoteTerminalMaintenance', 'U') IS NULL
   CREATE TABLE RemoteTerminalMaintenance (
     Id NVARCHAR(36) NOT NULL PRIMARY KEY, LRU_Name NVARCHAR(255), Equipment INT,
     ManufactureId INT, BusId NVARCHAR(255), RtAddress NVARCHAR(255), IcdVersionId NVARCHAR(255),
     SwVersion NVARCHAR(255), ReleaseVersion NVARCHAR(255), AmndNo NVARCHAR(255), RtNote NVARCHAR(255),
     RtRemarks NVARCHAR(255), CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(), CreatedBy INT NULL,
     UpdatedBy INT NULL, UpdatedAt DATETIME2 NULL, AircraftType INT NULL, SelectAircraftIds NVARCHAR(255),
     GuidelineId INT NULL, SelectedProgrammesId NVARCHAR(255), HardwareVersion NVARCHAR(255),
     AmndDate DATETIME2 NULL, ApprovedAt DATETIME2 NULL, ApprovedBy INT NULL, IsApproved INT NOT NULL DEFAULT 0,
     AdminRemarks NVARCHAR(255), FileName NVARCHAR(255),
     FOREIGN KEY (BusId) REFERENCES BusList(BusId),
     FOREIGN KEY (AircraftType) REFERENCES RT_AircraftTypeList1(Id),
     FOREIGN KEY (GuidelineId) REFERENCES Guidelines(Id)
   )`,
  `IF OBJECT_ID('MessageMaintenance', 'U') IS NULL
   CREATE TABLE MessageMaintenance (
     Id NVARCHAR(36) NOT NULL PRIMARY KEY, LRU_Name NVARCHAR(255), IcdVersionId NVARCHAR(255),
     AmndNo NVARCHAR(255), MessageName NVARCHAR(255), MessageNo INT, MessageAliasName NVARCHAR(255),
     MessageTypeId INT, MuxIdxId NVARCHAR(255), MsgDescription NVARCHAR(255), BlockId NVARCHAR(255),
     BusId INT NULL, Frequency NVARCHAR(255), Source NVARCHAR(255), Destination NVARCHAR(255), RtAddress INT,
     WordCount INT, RxSubAddress INT, TxSubAddress INT, CmdWord NVARCHAR(255), FramesId INT NULL,
     MsgRemarks NVARCHAR(255), CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(), CreatedBy INT NULL,
     UpdatedBy INT NULL, UpdatedAt DATETIME2 NULL, RemoteTableId NVARCHAR(36) NULL, Status NVARCHAR(255),
     AliasDescription NVARCHAR(255), ApprovedAt DATETIME2 NULL, ApprovedBy INT NULL, IsApproved INT NOT NULL DEFAULT 0,
     AdminRemarks NVARCHAR(255), MessageId NVARCHAR(255), MuxPos INT, MuxStartBit INT, MuxEndBit INT,
     FOREIGN KEY (RemoteTableId) REFERENCES RemoteTerminalMaintenance(Id),
     FOREIGN KEY (BusId) REFERENCES BusList(Id), FOREIGN KEY (FramesId) REFERENCES FramesList(Id)
   )`,
  `IF OBJECT_ID('WordMaintenance', 'U') IS NULL
   CREATE TABLE WordMaintenance (
     Id NVARCHAR(36) NOT NULL PRIMARY KEY, LRU_Name NVARCHAR(255), IcdVersionId NVARCHAR(255), AmndNo NVARCHAR(255),
     MessageName NVARCHAR(255), BlockId NVARCHAR(255), WordName NVARCHAR(255), No_of_elements INT,
     Description NVARCHAR(255), WordRemarks NVARCHAR(255), WordNo INT, WordId NVARCHAR(255),
     CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(), CreatedBy INT NULL, UpdatedBy INT NULL, UpdatedAt DATETIME2 NULL,
     MessageNo INT, RemoteTableId NVARCHAR(36) NULL, MessageTableId NVARCHAR(36) NULL, WordCount INT,
     ApprovedAt DATETIME2 NULL, ApprovedBy INT NULL, IsApproved INT NOT NULL DEFAULT 0, AdminRemarks NVARCHAR(255),
     WordApplicability INT, WordAliasName NVARCHAR(255), FOREIGN KEY (RemoteTableId) REFERENCES RemoteTerminalMaintenance(Id),
     FOREIGN KEY (MessageTableId) REFERENCES MessageMaintenance(Id)
   )`,
  `IF OBJECT_ID('ElementMaintenance', 'U') IS NULL
   CREATE TABLE ElementMaintenance (
     Id NVARCHAR(36) NOT NULL PRIMARY KEY, LRU_Name NVARCHAR(255), IcdVersionId NVARCHAR(255), AmndNo NVARCHAR(255),
     MessageName NVARCHAR(255), BlockId NVARCHAR(255), WordName NVARCHAR(255), WordId NVARCHAR(255),
     ElementName NVARCHAR(255), ElementNo INT, StartBitPosition INT, EndBitPosition INT, ElementApplicability INT,
     AliasName NVARCHAR(255), ElementLSB NVARCHAR(255), ElementMSB NVARCHAR(255), SignalTypeId INT NULL,
     Units NVARCHAR(255), ElementRemarks NVARCHAR(255), MessageNo INT, SelectedProgrammesId NVARCHAR(255),
     CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(), CreatedBy INT NULL, UpdatedBy INT NULL, UpdatedAt DATETIME2 NULL,
     RemoteTableId NVARCHAR(36) NULL, MessageTableId NVARCHAR(36) NULL, WordTableId NVARCHAR(36) NULL,
     SelectAircraftIds NVARCHAR(255), ApprovedAt DATETIME2 NULL, ApprovedBy INT NULL, IsApproved INT NOT NULL DEFAULT 0,
     AdminRemarks NVARCHAR(255), Description NVARCHAR(255), SelectBitPosition NVARCHAR(255),
     FOREIGN KEY (WordTableId) REFERENCES WordMaintenance(Id), FOREIGN KEY (MessageTableId) REFERENCES MessageMaintenance(Id),
     FOREIGN KEY (RemoteTableId) REFERENCES RemoteTerminalMaintenance(Id), FOREIGN KEY (SignalTypeId) REFERENCES SignalList(Id)
   )`,
];

async function createSchema() {
  for (const statement of statements) await pool.execute(statement);
}

module.exports = { createSchema };
