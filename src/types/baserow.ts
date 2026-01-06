// Baserow-related types

export interface BaserowRecord {
  id: number;
  [key: string]: any;
}

export interface BaserowTable {
  id: string;
  name: string;
  description?: string;
  fields: BaserowField[];
}

export interface BaserowField {
  id: string;
  name: string;
  type: string;
  required?: boolean;
}

export interface Filter {
  field: string;
  operator: 'equal' | 'not_equal' | 'contains' | 'not_contains' | 'greater_than' | 'less_than';
  value: any;
}

export interface BaserowTableConfig {
  tableId: string;
  name: string;
  fields: string[];
  filters?: Filter[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}


