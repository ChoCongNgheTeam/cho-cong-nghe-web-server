export interface SeedSpecInput {
  key: string;
  name: string;
  unit?: string | null;
  icon?: string | null;
  isFilterable?: boolean;
  isRequired?: boolean;
  sortOrder?: number;
}

export interface SeedSpecificationGroupInput {
  key: string;
  name: string;
  icon?: string | null;
  sortOrder?: number;
  specifications: SeedSpecInput[];
}
