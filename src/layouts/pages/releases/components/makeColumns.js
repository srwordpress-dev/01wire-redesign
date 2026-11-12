/* eslint-disable react/prop-types */
import { TableCell as MuiTableCell, Chip } from "@mui/material";
import MDTypography from "components/MDTypography";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import MDBox from "components/MDBox";
import dayjs from "dayjs";
import FormControl from "@mui/material/FormControl";
import DownloadIcon from "assets/images/icons/downloadIcon.svg";
import ViewIcon from "assets/images/icons/viewIcon.svg";
import EditIcon from "assets/images/icons/editIcon.svg";
import NavigateIcon from "assets/images/icons/navigateIcon.svg";
import DeleteIcon from "assets/images/icons/deleteIcon.svg";
import { truncateString } from "utils/helpers";
import { statusOptions } from "../../pr-management/components/makeColumns";
import MessageIcon from "@mui/icons-material/Message";
import RowAction from "components/RowAction";
import ChangesNote from "./ChangesNote";
// import ShareIcon from "assets/images/icons/shareIcon.svg";
// import { toast } from "react-toastify";

export const makeColumns = (handleAction, handleUpdateStatus, setOpen) => {
  const role = localStorage.getItem("role");
  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
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
      width: "30%",
      align: "left",
      Cell: ({ value }) => (
        <MDBox>
          <MDTypography sx={{ fontSize: "14px", fontWeight: "400" }}>
            {truncateString(value, 35)}
          </MDTypography>
        </MDBox>
      ),
    },

    {
      Header: "Created At",
      width: "15%",
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
    {
      Header: "Updated At",
      width: "15%",
      accessor: "updatedAt",
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
    {
      Header: "Status",
      width: "15%",
      accessor: "status",
      Cell: ({ value, row }) => {
        const selectedStatus = value;
        const selected = statusOptions.find((el) => selectedStatus === el?.value);

        const menuOptions =
          selectedStatus === "SCHEDULED"
            ? ["SCHEDULED", "REJECTED", "PUBLISHED"]
            : selectedStatus === "SUBMITTED"
            ? ["SUBMITTED", "AWAITING_APPROVAL", "SCHEDULED"]
            : ["REVIEW", "AWAITING_APPROVAL", "SCHEDULED"];
        return (
          <MDBox>
            {role === "USER" ||
            ["DRAFT", "AWAITING_APPROVAL", "PUBLISHED", "REJECTED"].includes(selectedStatus) ? (
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
                  sx={{
                    textAlign: "center",
                    borderRadius: "21px",
                    background: selected?.background,
                    height: "35px",
                    "& .MuiOutlinedInput-input": {
                      color: "#fff",
                      fontSize: "12px",
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
                    .filter((option) => option !== selectedStatus) // Filter out the selected value
                    .map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
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
      align: "right",
      sticky: true,
      width: "15%",
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

            {["DRAFT", "AWAITING_APPROVAL"].includes(row.original.status) && (
              <RowAction
                label="Edit"
                icon={EditIcon}
                onClick={() => handleAction(row.original.id, "edit")}
              />
            )}

            {["PUBLISHED", "SCHEDULED"].includes(row.original.status) && (
              <RowAction
                label="Publication status"
                icon={ViewIcon}
                onClick={() => handleAction(row.original.id, "view")}
              />
            )}
            {/* ReleaseForm opens read-only for every status that can't be edited */}
            {["PUBLISHED", "REVIEW", "SCHEDULED", "SUBMITTED", "REJECTED"].includes(
              row.original.status
            ) && (
              <RowAction
                label="View"
                icon={NavigateIcon}
                onClick={() => handleAction(row.original.id, "edit")}
              />
            )}
            {["AWAITING_APPROVAL", "REJECTED"].includes(row.original.status) && (
              <RowAction
                label="Comments"
                color="primary"
                onClick={() =>
                  setOpen(
                    row.original.status === "AWAITING_APPROVAL" && (row.original.changesRequested || []).length ? (
                      <ChangesNote changes={row.original.changesRequested} note={row.original.notes} />
                    ) : (
                      row?.original?.notes || "No comments provided"
                    )
                  )
                }
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
            {["DRAFT", "REJECTED"].includes(row.original.status) && (
              <RowAction
                label="Delete"
                icon={DeleteIcon}
                onClick={() => handleAction(row.original.id, "delete")}
              />
            )}
          </MDBox>
        );
      },
    },
  ];

  return columns;
};
