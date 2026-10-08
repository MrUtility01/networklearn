import { COMMAND_CATALOG_A } from './commandCatalogA';
import { COMMAND_CATALOG_B } from './commandCatalogB';

export const COMMAND_CATALOG = [...COMMAND_CATALOG_A, ...COMMAND_CATALOG_B];
export const COMMAND_COUNT = COMMAND_CATALOG.reduce((n, c) => n + c.cmds.length, 0);
