export type NavPage =
  | 'dashboard'
  | 'remote-terminal'
  | 'message'
  | 'word'
  | 'element'
  | 'lookup'
  | 'pdf-report'
  | 'pdf-import'
  | 'mdb-generation'
  | 'db-generation';

export interface RemoteTerminal {
  Id: number | string;
  LRU_Name: string;
  Equipment: string;
  ManufactureId: string;
  BusId: number | string;
  RtAddress: string;
  IcdVersionId: string;
  SwVersion: string;
  ReleaseVersion: string;
  AmndNo: string;
  RtNote: string;
  RtRemarks: string;
  CreatedAt: string;
  CreatedBy: string;
  UpdatedBy: string;
  UpdatedAt?: string;
  AircraftType?: number;
  SelectAircraftIds?: string;
  GuidelineId?: number;
  SelectedProgrammesId?: string;
  HardwareVersion?: string;
  AmndDate?: string;
  ApprovedAt?: string;
  ApprovedBy?: number;
  IsApproved?: number;
  AdminRemarks?: string;
  FileName?: string;
}

export interface Bus {
  BusId: number;
  BusName: string;
  Description: string;
}

export interface MessageType {
  MessageTypeId: number;
  TypeName: string;
  Description: string;
}

export interface Message {
  Id: number;
  LRU_Name: string;
  IcdVersionId: string;
  AmndNo: string;
  MessageName: string;
  MessageNo: string;
  MessageAliasName: string;
  MessageTypeId: number;
  MuxIdxId: string;
  MsgDescription: string;
  BlockId: string;
  CreatedAt: string;
  CreatedBy: string;
  UpdatedBy: string;
}

export interface Word {
  Id: number;
  WordName: string;
  WordNo: string;
  Description: string;
  MessageId: number;
  BitStart: number;
  BitEnd: number;
  CreatedAt: string;
  CreatedBy: string;
  UpdatedBy: string;
}

export interface Element {
  Id: number;
  ElementName: string;
  ElementNo: string;
  Description: string;
  WordId: number;
  DataType: string;
  Scale: string;
  Units: string;
  CreatedAt: string;
  CreatedBy: string;
  UpdatedBy: string;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  key: string;
  direction: SortDirection;
}
