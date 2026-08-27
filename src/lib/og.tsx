import { readFile } from "node:fs/promises";
import path from "node:path";

import { ImageResponse } from "next/og";

import { site } from "@/lib/site";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

// Literal values: Satori reads neither CSS variables nor next/font.
const BOND = "#f5f6f4";
const INK = "#1b1f23";
const GRAPHITE = "#5a6167";
const BAY = "#1f5761";

const fontDir = path.join(process.cwd(), "src/assets/fonts");
let fontsPromise: Promise<{ medium: ArrayBuffer; semibold: ArrayBuffer }> | undefined;

function loadFonts() {
  fontsPromise ??= Promise.all([
    readFile(path.join(fontDir, "archivo-500.ttf")),
    readFile(path.join(fontDir, "archivo-600.ttf")),
  ]).then(([medium, semibold]) => ({
    medium: toArrayBuffer(medium),
    semibold: toArrayBuffer(semibold),
  }));
  return fontsPromise;
}

function toArrayBuffer(buffer: Buffer): ArrayBuffer {
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
}

type Options = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
};

/** The parcel from the homepage hero, drawn without labels so it reads at card size. */
function Plat() {
  const pts = [
    [118, 104],
    [396, 78],
    [512, 174],
    [488, 356],
    [222, 388],
    [100, 268],
  ] as const;
  const d = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x} ${y}`).join(" ") + " Z";
  return (
    <svg viewBox="0 0 600 440" width={420} height={308}>
      <path d={d} fill="none" stroke={INK} strokeWidth={2} strokeLinejoin="miter" />
      <line x1={118} y1={104} x2={46} y2={42} stroke={INK} strokeWidth={1.5} strokeDasharray="6 5" />
      <circle cx={46} cy={42} r={5} fill={INK} />
      {pts.map(([x, y], i) =>
        i % 2 === 0 ? (
          <circle key={i} cx={x} cy={y} r={5.5} fill={INK} />
        ) : (
          <circle key={i} cx={x} cy={y} r={5.5} fill={BOND} stroke={INK} strokeWidth={2} />
        ),
      )}
      <line x1={548} y1={78} x2={548} y2={42} stroke={BAY} strokeWidth={2} />
      <path d="M540 52 L548 38 L556 52" fill="none" stroke={BAY} strokeWidth={2} />
    </svg>
  );
}

/** Shared Open Graph card so every route renders the same way. */
export async function ogImage({ title, subtitle, eyebrow }: Options) {
  const fonts = await loadFonts();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: BOND,
          color: INK,
          fontFamily: "Archivo",
          padding: 64,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: 640,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 20,
              fontWeight: 500,
              letterSpacing: 1.2,
              color: GRAPHITE,
              textTransform: "uppercase",
              lineHeight: 1.5,
            }}
          >
            <span>{eyebrow ?? site.legalName}</span>
            <span>{site.areaServed}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div
              style={{
                display: "flex",
                fontSize: 64,
                fontWeight: 600,
                letterSpacing: -1,
                lineHeight: 1.05,
              }}
            >
              {title}
            </div>
            {subtitle ? (
              <div
                style={{
                  display: "flex",
                  fontSize: 26,
                  fontWeight: 500,
                  color: GRAPHITE,
                  lineHeight: 1.35,
                }}
              >
                {subtitle}
              </div>
            ) : null}
          </div>
          <div style={{ display: "flex", fontSize: 20, fontWeight: 500, color: GRAPHITE }}>
            {site.url.replace("https://", "")}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          <Plat />
        </div>
      </div>
    ),
    {
      ...ogSize,
      fonts: [
        { name: "Archivo", data: fonts.medium, weight: 500, style: "normal" },
        { name: "Archivo", data: fonts.semibold, weight: 600, style: "normal" },
      ],
    },
  );
}
