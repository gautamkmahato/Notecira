"use client";

import type { ToolbarOptionDef } from "../types";
import { textFormatOptions } from "./text";

/** Headings: same text formats; size defaults differ visually via type styles. */
export const headingOptions: ToolbarOptionDef[] = [...textFormatOptions];
