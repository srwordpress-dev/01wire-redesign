import { useEffect, useState } from "react";
import { getImageUrl } from "utils/apiConfig";
import { palette } from "assets/theme/tokens";

// An image that never shows the browser's broken-image icon: if the file is missing it
// shows the initials of `fallbackText` (or a plain tinted tile) in the same size and shape.
const DisplayImage = ({
  src,
  height,
  width,
  styles,
  fallbackText,
  ...rest
}: {
  src: string;
  height: string;
  width: string;
  styles?: object;
  fallbackText?: string;
  [key: string]: any;
}) => {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);

  if (!src || failed) {
    const initials = String(fallbackText || "")
      .replace(/\[[^\]]*\]\s*/g, "")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();
    return (
      <div
        role="img"
        aria-label={fallbackText || "No image"}
        data-testid="image-fallback"
        style={{
          height,
          width,
          minWidth: width,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: palette.surfaceElevated,
          color: palette.textMuted,
          fontWeight: 500,
          fontSize: `calc(${height} * 0.32)`,
          ...styles,
        }}
      >
        {initials}
      </div>
    );
  }
  return (
    <img
      src={getImageUrl(src)}
      height={height}
      width={width}
      style={{ ...styles }}
      onError={() => setFailed(true)}
      {...rest}
    />
  );
};
export default DisplayImage;
