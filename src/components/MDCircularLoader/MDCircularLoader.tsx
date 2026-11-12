import React from "react";
import clsx from "clsx";
import makeStyles from "@mui/styles/makeStyles";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

// genrate style if overlay required
const withStyle = makeStyles({
  overlay: {
    top: 0,
    left: 0,
    position: "absolute",
    background: "rgba(255,255,255, 0.4)",
    zIndex: 9,
  },
});

interface CircularLoaderProps {
  startLoader?: boolean;
  overlayloader?: boolean;
  className?: string;
  wrapperStyle?: any;
}

const MDCircularLoader: React.FC<CircularLoaderProps> = ({
  startLoader,
  className,
  overlayloader,
  wrapperStyle,
}) => {
  const classes = withStyle();
  return startLoader ? (
    <Box
      width="100%"
      height="100%"
      display="flex"
      justifyContent="center"
      alignItems="center"
      sx={wrapperStyle}
      className={clsx(className, overlayloader && classes.overlay)}
    >
      <CircularProgress />
    </Box>
  ) : (
    <></>
  );
};

export default MDCircularLoader;
