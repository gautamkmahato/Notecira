"use client";

import {
  DEFAULT_FONT_FAMILY,
  FONT_FAMILIES,
} from "@/lib/editor/rich-text/font-family";
import type { InlineFormatApi } from "@/lib/editor/rich-text/active-editor";
import { Select } from "@/components/ui/Select";

type FontFamilySelectProps = {
  inline: InlineFormatApi;
};

const FONT_OPTIONS = FONT_FAMILIES.map((font) => ({
  value: font.value,
  label: font.label,
}));

export function FontFamilySelect({ inline }: FontFamilySelectProps) {
  const currentValue =
    FONT_FAMILIES.find(
      (f) =>
        f.value.replace(/['"]+/g, "") ===
        inline.state.fontFamily?.replace(/['"]+/g, ""),
    )?.value ?? DEFAULT_FONT_FAMILY;

  return (
    <div className="pl-2">
      <Select
        value={currentValue}
        onChange={(fontFamily) => inline.setFontFamily(fontFamily)}
        options={FONT_OPTIONS}
        groupLabel="Font"
        disabled={!inline.available}
        className="min-w-[132px]"
        getOptionStyle={(option) => ({ fontFamily: option.value })}
      />
    </div>
  );
}
