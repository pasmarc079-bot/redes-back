import { getDefaultReactSlashMenuItems } from "@blocknote/react";
import { insertOrUpdateBlockForSlashMenu } from "@blocknote/core/extensions";
import { BiColumns } from "react-icons/bi";

export function getMediaWithTextSlashMenuItem(
  editor: any,
) {
  return {
    title: "Media + Text",
    subtext: "Imagen o video con texto al lado",
    aliases: [
      "media",
      "texto",
      "imagen",
      "columnas",
      "two columns",
      "image",
      "video",
      "layout",
    ],
    group: "Media",
    icon: <BiColumns size={18} />,
    onItemClick: () => {
      insertOrUpdateBlockForSlashMenu(editor, {
        type: "mediaWithText",
      } as any);
    },
  };
}

export function getCustomSlashMenuItems(editor: any) {
  const defaults = getDefaultReactSlashMenuItems(editor);
  return [...defaults, getMediaWithTextSlashMenuItem(editor)];
}


