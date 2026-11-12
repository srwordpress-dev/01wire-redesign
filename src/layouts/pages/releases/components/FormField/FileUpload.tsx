import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import MDBox from "components/MDBox";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { IconButton } from "@mui/material";
import MDTypography from "components/MDTypography";
import MDCircularLoader from "components/MDCircularLoader";
import axiosInstance from "utils/axiosInstance";
import MDAvatar from "components/MDAvatar";
import DisplayImage from "components/DisplayImage";
import CloseIcon from "@mui/icons-material/Close";
import { MAX_IMAGE_SIZE, MAX_IMAGE_SIZE_MB } from "constants/index";
import { getErrorMessage } from "utils/errors";
import { toast } from "react-toastify";

const FileUpload = ({
  onChange,
  value,
  disabled = false,
}: {
  onChange: any;
  value: any;
  disabled?: any;
}): JSX.Element => {
  const [selectedFile, setSelectedFile] = useState<any>(value);
  const [loading, setLoading] = useState<boolean>(false);
  const onDrop = useCallback(async (acceptedFiles: any) => {
    const file = acceptedFiles?.[0];
    if (!file) {
      toast.error("Please choose a JPG, PNG or SVG image.");
    } else if (file.size > MAX_IMAGE_SIZE) {
      toast.error(`Image is too large. Maximum size is ${MAX_IMAGE_SIZE_MB}MB.`);
    } else {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", file);
      try {
        const response = await axiosInstance.post("/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        setLoading(false);
        onChange(response?.data?.fileName);
        setSelectedFile(response?.data?.fileName);
      } catch (error: any) {
        setLoading(false);
        console.error("Error uploading file:", error);
        toast.error(getErrorMessage(error, "Could not upload the image. Please try again."));
      }
    }
  }, []);

  const handleRemoveFile = () => {
    setSelectedFile("");
    onChange();
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    disabled,
    accept: {
      "image/jpeg": [],
      "image/png": [],
      "image/svg+xml": [".svg"],
    },
  });
  useEffect(() => {
    setSelectedFile(value);
  }, [value]);
  return (
    <MDBox height="100%" width="100%" display="flex" alignItems="center" justifyContent="center">
      {loading ? (
        <MDCircularLoader overlayloader startLoader />
      ) : selectedFile ? (
        <MDBox
          position="relative"
          display="flex"
          alignItems="center"
          justifyContent="center"
          width="100%"
          maxWidth="400px"
          minWidth={0}
        >
          {/* Fit the preview inside the zone at any width without distorting the image */}
          <DisplayImage
            src={selectedFile}
            height="140px"
            width="100%"
            alt="logo"
            styles={{
              borderRadius: "3.47px",
              display: "block",
              maxWidth: "100%",
              objectFit: "contain",
            }}
          />
          {!disabled && (
            <IconButton
              sx={{
                position: "absolute",
                right: -10,
                top: -5,
                background: "#fff",
                height: "20px",
                width: "20px",
                "&:hover": {
                  background: "#fff",
                },
              }}
              onClick={handleRemoveFile}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </MDBox>
      ) : (
        <MDBox
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          {...getRootProps()}
        >
          <input {...getInputProps()} />
          <IconButton>
            <UploadFileIcon />
          </IconButton>
          <MDTypography> Click to upload or drag and drop</MDTypography>
        </MDBox>
      )}
    </MDBox>
  );
};

export default FileUpload;
