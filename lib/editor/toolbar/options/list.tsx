"use client";

import type { ToolbarOptionDef } from "../types";
import { textFormatOptions } from "./text";

/** Lists share the same inline text controls (no list-type switchers in toolbar). */
export const listOptions: ToolbarOptionDef[] = textFormatOptions;
