import { ogContentType, ogImage, ogSize } from "@/lib/og";
import { site } from "@/lib/site";

export const alt = `About · ${site.name}`;
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogImage({
    eyebrow: "About",
    title: "A family company that holds what it buys",
    subtitle: "Who we are, how we work, and who runs it.",
  });
}
