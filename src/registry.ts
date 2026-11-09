export const INDEX_PATH = "/dashboards/index.json";
export const PAGE_CACHE = "public, max-age=60, s-maxage=300";
export const ASSET_CACHE = "public, max-age=31536000, immutable";

export interface Dashboard {
  id: string;
  name: string;
  file: string;
  protocol_version: string;
  version: string;
  sha256: string;
  description?: string;
  category?: string;
  docs?: string;
  icon?: string;
  license?: string;
  homepage?: string;
  author?: string;
  source?: string;
  [key: string]: unknown;
}

export interface Registry {
  $schema: string;
  schema_version: number;
  id: string;
  name: string;
  dashboards: Dashboard[];
}

export interface Asset {
  url: string;
  sha256: string;
  contentType: string;
}

export interface Manifest {
  registryURL: string;
  registry: Registry;
  indexETag: string;
  assets: Record<string, Asset>;
}
