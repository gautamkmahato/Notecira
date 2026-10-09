/** Notion-style primitives as Tailwind class strings (tokens live in globals @theme). */

export const notionBtn =
  "inline-flex items-center justify-center gap-1 h-7 border-0 bg-transparent px-2 text-[var(--font-size-sm)] font-medium leading-[var(--line-height-loose)] text-[var(--color-dark-gray)] cursor-pointer transition-[background] duration-[var(--duration-fast)] ease-out hover:bg-[var(--notion-hover)]";

export const notionBtnPrimary =
  "inline-flex items-center justify-center gap-1 h-7 border-0 px-2 text-[var(--font-size-sm)] font-medium leading-[var(--line-height-loose)] cursor-pointer transition-[background] duration-[var(--duration-fast)] ease-out bg-[var(--color-dark-gray-2)] text-[var(--color-white)] hover:bg-[var(--color-dark-gray-3)]";

export const notionIconBtn =
  "inline-flex size-6 items-center justify-center rounded-[var(--radius-xl)] border-0 bg-transparent text-[var(--color-mid-gray)] cursor-pointer transition-[background,color] duration-[var(--duration-fast)] ease-out hover:bg-[var(--notion-hover)] hover:text-[var(--color-dark-gray-2)]";

export const notionMenu =
  "z-[var(--z-14)] rounded-[var(--radius-xl)] bg-[var(--color-white)] py-1 shadow-[var(--shadow-md)]";

export const notionMenuItem =
  "block w-full cursor-pointer border-0 bg-transparent px-3 py-1.5 text-left text-[var(--font-size-sm)] text-[var(--color-dark-gray-2)] hover:bg-[var(--notion-hover)]";

export const notionMenuItemDanger =
  "block w-full cursor-pointer border-0 bg-transparent px-3 py-1.5 text-left text-[var(--font-size-sm)] text-[var(--notion-danger)] hover:bg-[var(--notion-danger-bg)]";

export const canvasScrollBtn =
  "flex size-10 items-center justify-center rounded-full border border-transparent bg-[color-mix(in_srgb,var(--color-white)_60%,transparent)] text-[var(--color-mid-gray)] opacity-35 backdrop-blur-sm transition-[opacity,background-color,box-shadow,border-color,color] duration-[var(--duration-fast)] ease-out hover:enabled:border-[var(--color-mid-gray-6)] hover:enabled:bg-[var(--color-white)] hover:enabled:text-[var(--color-dark-gray-2)] hover:enabled:opacity-100 hover:enabled:shadow-[var(--shadow-md)] disabled:pointer-events-none disabled:cursor-default disabled:opacity-15";

export const scrollbarCustom =
  "[scrollbar-width:thin] [scrollbar-color:transparent_transparent] transition-[scrollbar-color] duration-300 ease-out hover:[scrollbar-color:#d1d5db_transparent] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-transparent [&::-webkit-scrollbar-track]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-[#d1d5db] [&::-webkit-scrollbar-thumb:hover]:bg-[#9ca3af]";

export const scrollbarDocument =
  "[scrollbar-gutter:stable] [scrollbar-width:thin] [scrollbar-color:#d1d5db_#f3f4f6] [&::-webkit-scrollbar]:h-2.5 [&::-webkit-scrollbar]:w-2.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-[#f3f4f6] [&::-webkit-scrollbar-thumb]:bg-[#d1d5db] [&::-webkit-scrollbar-thumb:hover]:bg-[#9ca3af] [&::-webkit-scrollbar-track]:bg-[#f3f4f6]";

export const headingSerif =
  "font-[family-name:var(--font-family-base)]";
