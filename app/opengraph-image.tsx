import { ImageResponse } from "next/og";

export const alt = "LumenForge — the workspace your clients can see";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Generated at build time so link previews show the brand instead of nothing.
 * There was no OG image at all before, which made every shared link look broken.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#181614",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
            <rect
              x="3"
              y="3"
              width="18"
              height="18"
              rx="4"
              stroke="#e0b972"
              strokeWidth="2.4"
            />
            <path
              d="M12.8 19.8H17a2.8 2.8 0 0 0 2.8-2.8v-4.2L12.8 19.8Z"
              fill="#e0b972"
            />
          </svg>
          <span
            style={{
              fontSize: "26px",
              fontWeight: 600,
              color: "#f5f2ee",
              letterSpacing: "-0.02em",
            }}
          >
            LumenForge
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
          <div
            style={{
              fontSize: "70px",
              lineHeight: 1.05,
              color: "#f5f2ee",
              letterSpacing: "-0.03em",
              maxWidth: "900px",
            }}
          >
            The workspace your clients can see.
          </div>
          <div
            style={{
              fontSize: "26px",
              lineHeight: 1.4,
              color: "#a09a92",
              maxWidth: "820px",
            }}
          >
            Projects, tasks, invoices, and a client portal. Free, with every
            feature included.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              border: "1px solid #4a453d",
              borderRadius: "8px",
              padding: "14px 22px",
              fontSize: "22px",
              color: "#e0b972",
            }}
          >
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "10px",
                background: "#e0b972",
              }}
            />
            INV-2026-004
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              border: "1px solid #4a453d",
              borderRadius: "8px",
              padding: "14px 22px",
              fontSize: "22px",
              color: "#7fbf95",
            }}
          >
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "10px",
                background: "#7fbf95",
              }}
            />
            Paid
          </div>
        </div>
      </div>
    ),
    size
  );
}
