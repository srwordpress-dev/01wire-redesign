/* eslint-disable react/prop-types */
import { TableCell as MuiTableCell } from "@mui/material";
import MDTypography from "components/MDTypography";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import MDBox from "components/MDBox";
import Box from "@mui/material/Box";
import dayjs from "dayjs";
import FormControl from "@mui/material/FormControl";
import DownloadIcon from "assets/images/icons/downloadIcon.svg";
import ViewIcon from "assets/images/icons/viewIcon.svg";
import StatusIcon from "assets/images/icons/statusIcon.svg";
import NavigateIcon from "assets/images/icons/navigateIcon.svg";
import FilterListOutlinedIcon from "@mui/icons-material/FilterListOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { truncateString } from "utils/helpers";
import RowAction from "components/RowAction";

export const makeColumns = (handleAction, handleFilters, setEmail, setOptions, filters) => {
  const columns = [
    {
      Header: () => <span style={{ whiteSpace: "nowrap" }}>PR ID</span>,
      accessor: "prId",
      width: "7%",
      Cell: ({ value }) => (
        <MDBox>
          <MDTypography sx={{ fontSize: "14px", fontWeight: "400" }}>{value}</MDTypography>
        </MDBox>
      ),
    },
    {
      Header: "Title",
      accessor: "articleInfo.title",
      align: "left",
      width: "28%",
      Cell: ({ value }) => (
        <MDBox>
          <MDTypography sx={{ fontSize: "14px", fontWeight: "400" }} title={value || ""}>
            {truncateString(value, 35)}
          </MDTypography>
        </MDBox>
      ),
    },
    {
      Header: "Email",
      accessor: "user.email",
      width: "20%",
      Cell: ({ value, row }) => {
        return (
          <Box
            sx={{
              display: "flex",
              width: "150px",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <MDTypography sx={{ fontSize: "14px", fontWeight: "400" }} title={value || ""}>
              {truncateString(value, 20)}
            </MDTypography>
            {!filters?.userId && (
              <MDBox
                alignItems="center"
                ml={0.3}
                justifyContent="center"
                sx={{ height: "24px", width: "22px", display: "flex" }}
                bgColor="#FFDBDD"
                borderRadius={4}
              >
                {" "}
                <RowAction
                  label="Filter by this user"
                  onClick={() => {
                    setEmail(value);
                    setOptions([{ userId: row.original.articleInfo.userId, email: value }]);
                    handleFilters("userId", row.original.articleInfo.userId);
                  }}
                >
                  <FilterListOutlinedIcon />
                </RowAction>
              </MDBox>
            )}
          </Box>
        );
      },
    },
    {
      Header: "Publication /Bundles",
      accessor: "publicationInfo.title",
      width: "20%",
      Cell: ({ value, row }) => {
        // Package orders have no publication: show the package instead
        const pkg = !value && row?.original?.bundleInfo;
        return (
          <MDBox>
            <MDTypography sx={{ fontSize: "14px", fontWeight: "400" }}>
              {value || (pkg ? pkg.name || `${pkg.type || ""} ${pkg.category || ""} bundle` : "-")}
            </MDTypography>
            {pkg && (
              <MDTypography sx={{ fontSize: "12px", color: "#7B809A" }}>
                Package{pkg.tier ? ` · ${pkg.tier}` : ""}
              </MDTypography>
            )}
          </MDBox>
        );
      },
    },

    {
      Header: "Publish By",
      width: "10%",
      accessor: "publishBy",
      Cell: ({ value }) => {
        return (
          <MDBox>
            <MDTypography sx={{ fontSize: "14px", fontWeight: "400" }}>
              {value ? dayjs(value).format("DD MMM YYYY") : "-"}
            </MDTypography>
          </MDBox>
        );
      },
    },
    {
      Header: "Action",
      align: "right",
      sticky: true,
      width: "15%",
      accessor: "status",
      Cell: ({ value, row }) => {
        return (
          <MDBox
            sx={{
              display: "flex",
            }}
          >
            {/* <IconButton
              onClick={() => handleAction(row.original.articleId, "navigate")}
              sx={{ visibility: row.original.status !== "PUBLISHED" ? "collapse" : "" }}
            >
              <img width={36} height={36} alt="navigate" src={DownloadIcon} />
            </IconButton> */}
            <RowAction
              label="Order details"
              color="black"
              onClick={() => handleAction(row.original.id, "details", row.original)}
              sx={{
                width: "35px",
                height: "35px",
                margin: "9px ",
                backgroundColor: "#f8f8fc",
                border: "1px solid #e0e0e4",
              }}
            >
              <InfoOutlinedIcon fontSize="small" />
            </RowAction>
            <RowAction
              label="Release status"
              icon={ViewIcon}
              onClick={() => handleAction(row.original.articleId, "view")}
            />
            <RowAction
              label="Update status"
              icon={StatusIcon}
              onClick={() => handleAction(row.original.id, "note")}
            />
            <RowAction
              label="Open article"
              icon={NavigateIcon}
              onClick={() => handleAction(row.original.articleId, "view-article")}
            />
          </MDBox>
        );
      },
    },
  ];

  return columns;
};
