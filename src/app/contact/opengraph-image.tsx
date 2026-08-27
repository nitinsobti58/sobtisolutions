import { ogContentType, ogImage, ogSize } from "@/lib/og";
import { site } from "@/lib/site";

export const alt = `Contact · ${site.name}`;
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogImage({
    eyebrow: "Contact",
    title: "Write to us",
    subtitle: `One of the three of us reads every message. ${site.email}`,
  });
}
