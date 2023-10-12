import manage from "./manage";
import settings from "./settings";

import { ISidebar, ISidebarMenu } from "@src/types";

export const data: Array<ISidebar> = [...manage].concat(settings);
