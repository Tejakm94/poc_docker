import type { RemoteTerminal, Bus, MessageType, Message, Word, Element } from './types';

export const busList: Bus[] = [
  { BusId: 1, BusName: 'BUS-A', Description: 'Primary MIL-STD-1553 Bus A' },
  { BusId: 2, BusName: 'BUS-B', Description: 'Primary MIL-STD-1553 Bus B' },
  { BusId: 3, BusName: 'BUS-C', Description: 'Secondary MIL-STD-1553 Bus C' },
  { BusId: 4, BusName: 'ARINC-429-1', Description: 'ARINC 429 Bus 1' },
  { BusId: 5, BusName: 'ARINC-429-2', Description: 'ARINC 429 Bus 2' },
  { BusId: 6, BusName: 'CAN-001', Description: 'CAN Bus Primary' },
];

export const messageTypes: MessageType[] = [
  { MessageTypeId: 1, TypeName: 'BC-RT', Description: 'Bus Controller to Remote Terminal' },
  { MessageTypeId: 2, TypeName: 'RT-BC', Description: 'Remote Terminal to Bus Controller' },
  { MessageTypeId: 3, TypeName: 'RT-RT', Description: 'Remote Terminal to Remote Terminal' },
  { MessageTypeId: 4, TypeName: 'MODE', Description: 'Mode Command' },
  { MessageTypeId: 5, TypeName: 'BROADCAST', Description: 'Broadcast Message' },
];

export const remoteTerminals: RemoteTerminal[] = [
  {
    Id: 1, LRU_Name: 'FCC-1', Equipment: 'Flight Control Computer', ManufactureId: 'MFR-001',
    BusId: 1, RtAddress: '01', IcdVersionId: 'ICD-FCC-3.2', SwVersion: '4.1.2',
    ReleaseVersion: 'R4.1', AmndNo: 'A03', RtNote: 'Primary FCC unit', RtRemarks: 'Qualified for DO-178C DAL-A',
    CreatedAt: '2024-01-15T08:30:00Z', CreatedBy: 'jsmith', UpdatedBy: 'jdoe',
  },
  {
    Id: 2, LRU_Name: 'FCC-2', Equipment: 'Flight Control Computer', ManufactureId: 'MFR-001',
    BusId: 1, RtAddress: '02', IcdVersionId: 'ICD-FCC-3.2', SwVersion: '4.1.2',
    ReleaseVersion: 'R4.1', AmndNo: 'A03', RtNote: 'Redundant FCC unit', RtRemarks: 'Hot standby configuration',
    CreatedAt: '2024-01-15T08:45:00Z', CreatedBy: 'jsmith', UpdatedBy: 'jdoe',
  },
  {
    Id: 3, LRU_Name: 'NAV-1', Equipment: 'Navigation Management Unit', ManufactureId: 'MFR-002',
    BusId: 2, RtAddress: '05', IcdVersionId: 'ICD-NAV-2.0', SwVersion: '3.0.1',
    ReleaseVersion: 'R3.0', AmndNo: 'A01', RtNote: 'Primary navigation', RtRemarks: 'GPS/INS integrated',
    CreatedAt: '2024-01-16T09:00:00Z', CreatedBy: 'mwilson', UpdatedBy: 'mwilson',
  },
  {
    Id: 4, LRU_Name: 'ADC-1', Equipment: 'Air Data Computer', ManufactureId: 'MFR-003',
    BusId: 1, RtAddress: '07', IcdVersionId: 'ICD-ADC-1.5', SwVersion: '2.3.0',
    ReleaseVersion: 'R2.3', AmndNo: 'A02', RtNote: 'Primary ADC', RtRemarks: 'Pitot-static inputs A/B/C',
    CreatedAt: '2024-01-16T10:15:00Z', CreatedBy: 'rjohnson', UpdatedBy: 'jsmith',
  },
  {
    Id: 5, LRU_Name: 'EEC-L', Equipment: 'Electronic Engine Control (Left)', ManufactureId: 'MFR-004',
    BusId: 3, RtAddress: '11', IcdVersionId: 'ICD-EEC-4.0', SwVersion: '5.2.1',
    ReleaseVersion: 'R5.2', AmndNo: 'A05', RtNote: 'Left engine FADEC', RtRemarks: 'Channel A active',
    CreatedAt: '2024-02-01T07:30:00Z', CreatedBy: 'ptaylor', UpdatedBy: 'ptaylor',
  },
  {
    Id: 6, LRU_Name: 'EEC-R', Equipment: 'Electronic Engine Control (Right)', ManufactureId: 'MFR-004',
    BusId: 3, RtAddress: '12', IcdVersionId: 'ICD-EEC-4.0', SwVersion: '5.2.1',
    ReleaseVersion: 'R5.2', AmndNo: 'A05', RtNote: 'Right engine FADEC', RtRemarks: 'Channel A active',
    CreatedAt: '2024-02-01T07:45:00Z', CreatedBy: 'ptaylor', UpdatedBy: 'ptaylor',
  },
  {
    Id: 7, LRU_Name: 'HYD-1', Equipment: 'Hydraulic Control Unit', ManufactureId: 'MFR-005',
    BusId: 2, RtAddress: '15', IcdVersionId: 'ICD-HYD-1.2', SwVersion: '1.4.0',
    ReleaseVersion: 'R1.4', AmndNo: 'A01', RtNote: 'Primary hydraulic', RtRemarks: 'System 1 pressure monitor',
    CreatedAt: '2024-02-10T11:00:00Z', CreatedBy: 'kbrown', UpdatedBy: 'kbrown',
  },
  {
    Id: 8, LRU_Name: 'AHRS-1', Equipment: 'Attitude Heading Reference System', ManufactureId: 'MFR-006',
    BusId: 4, RtAddress: '18', IcdVersionId: 'ICD-AHRS-2.1', SwVersion: '3.1.0',
    ReleaseVersion: 'R3.1', AmndNo: 'A02', RtNote: 'Primary AHRS', RtRemarks: 'MEMS gyro configuration',
    CreatedAt: '2024-02-12T13:30:00Z', CreatedBy: 'jsmith', UpdatedBy: 'rjohnson',
  },
  {
    Id: 9, LRU_Name: 'VHF-1', Equipment: 'VHF Communication Radio', ManufactureId: 'MFR-007',
    BusId: 1, RtAddress: '20', IcdVersionId: 'ICD-COM-1.0', SwVersion: '2.0.3',
    ReleaseVersion: 'R2.0', AmndNo: 'A01', RtNote: 'Primary VHF radio', RtRemarks: 'ACARS capable',
    CreatedAt: '2024-02-15T09:00:00Z', CreatedBy: 'ldavis', UpdatedBy: 'ldavis',
  },
  {
    Id: 10, LRU_Name: 'TCAS-1', Equipment: 'Traffic Collision Avoidance', ManufactureId: 'MFR-008',
    BusId: 2, RtAddress: '23', IcdVersionId: 'ICD-TCAS-3.0', SwVersion: '7.1.0',
    ReleaseVersion: 'R7.1', AmndNo: 'A04', RtNote: 'TCAS II unit', RtRemarks: 'ACAS X upgrade pending',
    CreatedAt: '2024-03-01T08:00:00Z', CreatedBy: 'mwilson', UpdatedBy: 'jsmith',
  },
  {
    Id: 11, LRU_Name: 'WXR-1', Equipment: 'Weather Radar Processor', ManufactureId: 'MFR-009',
    BusId: 1, RtAddress: '25', IcdVersionId: 'ICD-WXR-2.5', SwVersion: '4.0.1',
    ReleaseVersion: 'R4.0', AmndNo: 'A02', RtNote: 'Primary weather radar', RtRemarks: 'Predictive windshear',
    CreatedAt: '2024-03-05T10:30:00Z', CreatedBy: 'rjohnson', UpdatedBy: 'rjohnson',
  },
  {
    Id: 12, LRU_Name: 'EGPWS-1', Equipment: 'Enhanced Ground Proximity Warning', ManufactureId: 'MFR-010',
    BusId: 2, RtAddress: '28', IcdVersionId: 'ICD-EGPWS-1.8', SwVersion: '3.5.2',
    ReleaseVersion: 'R3.5', AmndNo: 'A03', RtNote: 'EGPWS unit', RtRemarks: 'Terrain database v2024.1',
    CreatedAt: '2024-03-10T14:00:00Z', CreatedBy: 'ptaylor', UpdatedBy: 'ptaylor',
  },
];

export const messages: Message[] = [
  {
    Id: 1, LRU_Name: 'FCC-1', IcdVersionId: 'ICD-FCC-3.2', AmndNo: 'A03',
    MessageName: 'FLIGHT_CTRL_CMD', MessageNo: 'M0001', MessageAliasName: 'FCC_CMD_1',
    MessageTypeId: 1, MuxIdxId: '00', MsgDescription: 'Flight control surface commands from BC to FCC', BlockId: 'BLK-001',
    CreatedAt: '2024-01-20T08:00:00Z', CreatedBy: 'jsmith', UpdatedBy: 'jsmith',
  },
  {
    Id: 2, LRU_Name: 'FCC-1', IcdVersionId: 'ICD-FCC-3.2', AmndNo: 'A03',
    MessageName: 'FLIGHT_CTRL_STATUS', MessageNo: 'M0002', MessageAliasName: 'FCC_STS_1',
    MessageTypeId: 2, MuxIdxId: '00', MsgDescription: 'Flight control status from FCC to BC', BlockId: 'BLK-002',
    CreatedAt: '2024-01-20T08:15:00Z', CreatedBy: 'jsmith', UpdatedBy: 'jdoe',
  },
  {
    Id: 3, LRU_Name: 'NAV-1', IcdVersionId: 'ICD-NAV-2.0', AmndNo: 'A01',
    MessageName: 'NAV_POSITION', MessageNo: 'M0010', MessageAliasName: 'NAV_POS',
    MessageTypeId: 2, MuxIdxId: '01', MsgDescription: 'GPS/INS position data output', BlockId: 'BLK-010',
    CreatedAt: '2024-01-22T09:00:00Z', CreatedBy: 'mwilson', UpdatedBy: 'mwilson',
  },
  {
    Id: 4, LRU_Name: 'ADC-1', IcdVersionId: 'ICD-ADC-1.5', AmndNo: 'A02',
    MessageName: 'AIR_DATA_PARAMS', MessageNo: 'M0020', MessageAliasName: 'ADC_DATA',
    MessageTypeId: 2, MuxIdxId: '00', MsgDescription: 'Air data parameters - pressure, temperature, speed', BlockId: 'BLK-020',
    CreatedAt: '2024-01-25T10:00:00Z', CreatedBy: 'rjohnson', UpdatedBy: 'jsmith',
  },
];

export const words: Word[] = [
  {
    Id: 1, WordName: 'AILERON_CMD', WordNo: 'W001', Description: 'Aileron surface command position',
    MessageId: 1, BitStart: 1, BitEnd: 16,
    CreatedAt: '2024-01-21T08:00:00Z', CreatedBy: 'jsmith', UpdatedBy: 'jsmith',
  },
  {
    Id: 2, WordName: 'ELEVATOR_CMD', WordNo: 'W002', Description: 'Elevator surface command position',
    MessageId: 1, BitStart: 17, BitEnd: 32,
    CreatedAt: '2024-01-21T08:10:00Z', CreatedBy: 'jsmith', UpdatedBy: 'jsmith',
  },
  {
    Id: 3, WordName: 'FCC_MODE', WordNo: 'W010', Description: 'FCC operating mode status word',
    MessageId: 2, BitStart: 1, BitEnd: 16,
    CreatedAt: '2024-01-21T09:00:00Z', CreatedBy: 'jsmith', UpdatedBy: 'jdoe',
  },
];

export const elements: Element[] = [
  {
    Id: 1, ElementName: 'AILERON_ANGLE', ElementNo: 'E001', Description: 'Aileron deflection angle',
    WordId: 1, DataType: 'BNR', Scale: '180/2^15', Units: 'degrees',
    CreatedAt: '2024-01-22T08:00:00Z', CreatedBy: 'jsmith', UpdatedBy: 'jsmith',
  },
  {
    Id: 2, ElementName: 'AILERON_VALID', ElementNo: 'E002', Description: 'Aileron data validity flag',
    WordId: 1, DataType: 'BCD', Scale: '1', Units: 'discrete',
    CreatedAt: '2024-01-22T08:05:00Z', CreatedBy: 'jsmith', UpdatedBy: 'jsmith',
  },
  {
    Id: 3, ElementName: 'ELEV_ANGLE', ElementNo: 'E010', Description: 'Elevator deflection angle',
    WordId: 2, DataType: 'BNR', Scale: '90/2^14', Units: 'degrees',
    CreatedAt: '2024-01-22T09:00:00Z', CreatedBy: 'jsmith', UpdatedBy: 'jdoe',
  },
];

export const recentActivity = [
  { id: 1, action: 'Added', entity: 'Remote Terminal', name: 'TCAS-1', user: 'mwilson', timestamp: '2024-03-01 08:12' },
  { id: 2, action: 'Modified', entity: 'Message', name: 'FLIGHT_CTRL_CMD', user: 'jsmith', timestamp: '2024-02-28 15:45' },
  { id: 3, action: 'Added', entity: 'Word', name: 'AILERON_CMD', user: 'jsmith', timestamp: '2024-02-28 14:30' },
  { id: 4, action: 'Generated', entity: 'MDB', name: 'ADA_v4.1_R4.1.mdb', user: 'rjohnson', timestamp: '2024-02-27 11:00' },
  { id: 5, action: 'Imported', entity: 'PDF', name: 'ICD-FCC-3.2_Rev3.pdf', user: 'jdoe', timestamp: '2024-02-26 16:20' },
  { id: 6, action: 'Deleted', entity: 'Remote Terminal', name: 'VHF-3 (obsolete)', user: 'ptaylor', timestamp: '2024-02-25 09:15' },
  { id: 7, action: 'Added', entity: 'Element', name: 'AILERON_VALID', user: 'jsmith', timestamp: '2024-02-24 10:00' },
  { id: 8, action: 'Modified', entity: 'Lookup', name: 'BUS-C description', user: 'kbrown', timestamp: '2024-02-23 13:45' },
];
