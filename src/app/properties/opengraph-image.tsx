import { ogContentType, ogImage, ogSize } from "@/lib/og";
import { site } from "@/lib/site";

export const alt = `Properties · ${site.name}`;
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogImage({
    eyebrow: "Properties",
    title: "What we hold in Ocean County",
    subtitle: "Small residential buildings, held for the long term.",
  });
}
