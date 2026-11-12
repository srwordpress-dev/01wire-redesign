/* eslint-disable react/prop-types */
import { TableCell as MuiTableCell, Chip } from "@mui/material";
import MDTypography from "components/MDTypography";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import MDBox from "components/MDBox";
import Box from "@mui/material/Box";
import dayjs from "dayjs";
import FormControl from "@mui/material/FormControl";
import DownloadIcon from "assets/images/icons/downloadIcon.svg";
import ViewIcon from "assets/images/icons/viewIcon.svg";
import NavigateIcon from "assets/images/icons/navigateIcon.svg";
import FilterListOutlinedIcon from "@mui/icons-material/FilterListOutlined";
import { truncateString } from "utils/helpers";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import MessageIcon from "@mui/icons-material/Message";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RowAction from "components/RowAction";

export const statusOptions = [
  {
    value: "DRAFT",
    label: "Draft",
    background: `#000000`,
  },
  {
    value: "SUBMITTED",
    label: "Submitted",
    background: "#01B7F3",
  },
  {
    value: "REVIEW",
    label: "Review",
    background: "#747474",
  },
  {
    value: "AWAITING_APPROVAL",
    label: "Awaiting Approval",
    background: "#439DEE",
  },
  {
    value: "SCHEDULED",
    label: "Scheduled",
    background: "#FF9900",
  },
  {
    value: "REJECTED",
    label: "Rejected",
    background: "#FF4D53",
  },
  {
    value: "PUBLISHED",
    label: "Published",
    background: "#47BC4C",
  },
  {
    value: "PENDING",
    label: "Pending",
    background: "#747474",
  },
];

export const makeColumns = (
  handleAction,
  handleUpdateStatus,
  handleFilters,
  setEmail,
  setOptions,
  filters,
  setOpen
) => {
  async function handleNextTab(row) {
    try {
      const url = `${window?.location?.origin}/share-release/${row?.original?.id}`;
      window.open(url, "_blank");
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  }

  const columns = [
    {
      Header: "PR ID",
      accessor: "prId",
      width: "10%",
      Cell: ({ value }) => (
        <MDBox>
          <MDTypography sx={{ fontSize: "14px", fontWeight: "400" }}>{value}</MDTypography>
        </MDBox>
      ),
    },
    {
      Header: "Title",
      accessor: "title",
      width: "15%",
      align: "left",
      Cell: ({ value }) => (
        <MDBox>
          <MDTypography sx={{ fontSize: "14px", fontWeight: "400" }} title={value || ""}>
            {truncateString(value, 15)}
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
              {truncateString(value, 17)}
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
                    setOptions([{ userId: row.original.userId, email: value }]);
                    handleFilters("userId", row.original.userId);
                  }}
                >
                  <FilterListOutlinedIcon fontSize="small" />
                </RowAction>
              </MDBox>
            )}
          </Box>
        );
      },
    },
    {
      Header: "Publication /Bundles",
      accessor: "bundleInfo",
      width: "5%",
      Cell: ({ value, row }) => {
        // const info = `${row.original.publicationIds.length}/${row.original.bundleInfo.length}`;
        return (
          <MDBox>
            <MDTypography sx={{ fontSize: "14px", fontWeight: "400" }}>
              <strong>{row.original.publicationIds.length}</strong>/{row.original.bundleInfo.length}
            </MDTypography>
          </MDBox>
        );
      },
    },
    {
      Header: "Created At",
      width: "10%",
      accessor: "createdAt",
      Cell: ({ value }) => {
        return (
          <MDBox>
            <MDTypography sx={{ fontSize: "14px", fontWeight: "400" }}>
              {dayjs(value).format("DD MMM YYYY")}
            </MDTypography>
          </MDBox>
        );
      },
    },
    // {
    //   Header: "Updated At",
    //   width: "10%",
    //   accessor: "updatedAt",
    //   Cell: ({ value }) => {
    //     return (
    //       <MDBox>
    //         <MDTypography sx={{ fontSize: "14px", fontWeight: "400" }}>
    //           {dayjs(value).format("DD MMM YYYY")}
    //         </MDTypography>
    //       </MDBox>
    //     );
    //   },
    // },
    {
      Header: "Status",
      width: "10%",
      accessor: "status",
      Cell: ({ value, row }) => {
        const selectedStatus = value;
        const selected = statusOptions.find((el) => selectedStatus === el?.value);

        const menuOptions =
          selectedStatus === "SCHEDULED"
            ? [
                { label: "REJECTED", value: "REJECTED" },
                { label: "PUBLISHED", value: "PUBLISHED" },
              ]
            : [
                { label: "AWAITING APPROVAL", value: "AWAITING_APPROVAL" },
                { label: "SCHEDULED", value: "SCHEDULED" },
                { label: "REJECTED", value: "REJECTED" },
                { label: "PUBLISHED", value: "PUBLISHED" },
              ];
        return (
          <MDBox>
            {["DRAFT", "AWAITING_APPROVAL", "PUBLISHED", "REJECTED"].includes(selectedStatus) ? (
              <Chip
                label={selected?.label}
                sx={{
                  backgroundImage: selected?.background,
                  backgroundBlendMode: "overlay",
                  backgroundColor: selected?.background,
                  color: "#fff",
                  minWidth: "140px",
                  textTransform: "uppercase",
                }}
              />
            ) : (
              <FormControl sx={{ width: "140px" }} size="medium">
                <Select
                  id={`status-select-${row?.original?.id ?? row?.id}`}
                  displayEmpty
                  value={selectedStatus}
                  IconComponent={KeyboardArrowDownIcon}
                  sx={{
                    textAlign: "center",
                    borderRadius: "21px",
                    height: "35px",
                    background: selected?.background,
                    "& .MuiOutlinedInput-input": {
                      color: "#fff",
                      fontSize: "13px",
                      fontWeight: "400",
                      borderRadius: "21px",
                      border: "none",
                      background: selected?.background,
                      textTransform: "uppercase",
                    },
                  }}
                  renderValue={(selected) => {
                    if (selectedStatus === "") {
                      return <em>Select an option</em>;
                    }
                    return selectedStatus ? selectedStatus : "";
                  }}
                  onChange={(e) => handleUpdateStatus(row, e.target.value)}
                >
                  {menuOptions
                    .filter((option) => option?.value !== selectedStatus) // Filter out the selected value
                    .map((option) => (
                      <MenuItem key={option?.label} value={option?.value}>
                        {option?.label}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            )}
          </MDBox>
        );
      },
    },
    {
      Header: "Action",
      width: "20%",
      align: "right",
      sticky: true,
      Cell: ({ value, row }) => {
        return (
          <MDBox
            sx={{
              display: "flex",
            }}
          >
            {row.original.status === "PUBLISHED" && (
              <RowAction
                label="Download report"
                icon={DownloadIcon}
                onClick={() => handleAction(row.original.id, "navigate")}
              />
            )}
            {["PUBLISHED", "SCHEDULED"].includes(row.original.status) && (
              <RowAction
                label="Publication status"
                icon={ViewIcon}
                onClick={() => handleAction(row.original.id, "view")}
              />
            )}
            {["AWAITING_APPROVAL", "REJECTED"].includes(row.original.status) && (
              <RowAction
                label="Comments"
                color="primary"
                onClick={() => {
                  if (row?.original?.notes) {
                    setOpen(row.original.notes);
                  }
                }}
                sx={{
                  width: "35px",
                  height: "35px",
                  margin: "9px ",
                  backgroundColor: "#f8f8fc",
                  border: "1px solid #e0e0e4",
                  paddingTop: "10px",
                }}
              >
                <MessageIcon sx={{ fontSize: "10px" }} />
              </RowAction>
            )}
            <RowAction
              label="Preview"
              color="black"
              onClick={() => handleNextTab(row)}
              sx={{
                width: "35px",
                height: "35px",
                margin: "9px ",
                backgroundColor: "#f8f8fc",
                border: "1px solid #e0e0e4",
                paddingTop: "8px",
              }}
            >
              <VisibilityIcon fontSize="small" />
            </RowAction>
            <RowAction
              label="View / update status"
              icon={NavigateIcon}
              onClick={() => handleAction(row.original.id, "edit", row?.original)}
            />
          </MDBox>
        );
      },
    },
  ];
  return columns;
};
