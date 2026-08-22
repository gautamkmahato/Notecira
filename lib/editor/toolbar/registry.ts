"use client";

import type { ToolbarRegistry } from "./types";
import { codeOptions } from "./options/code";
import { headingOptions } from "./options/heading";
import { listOptions } from "./options/list";
import { imageOptions, pdfOptions, videoOptions } from "./options/media";
import { tableOptions } from "./options/table";
import { textFormatOptions } from "./options/text";

/**
 * Single source of truth for which toolbar options each block type gets.
 * To extend a type: edit only that type's array / options module.
 */
export const toolbarRegistry: ToolbarRegistry = {
  paragraph: textFormatOptions,
  heading_1: headingOptions,
  heading_2: headingOptions,
  heading_3: headingOptions,
  heading_4: headingOptions,
  bulleted_list_item: listOptions,
  numbered_list_item: listOptions,
  table: tableOptions,
  code: codeOptions,
  image: imageOptions,
  video: videoOptions,
  pdf: pdfOptions,
  document: [],
};
