/* eslint-disable react/prop-types */
import { TableCell as MuiTableCell, OutlinedInput, Chip } from "@mui/material";
import MDTypography from "components/MDTypography";
import MDBox from "components/MDBox";
import { truncateString } from "utils/helpers";
import DeleteIcon from "assets/images/icons/deleteIcon.svg";
import EditIcon from "assets/images/icons/editIcon.svg";
import ViewIcon from "assets/images/icons/viewIcon.svg";
import RowAction from "components/RowAction";
import { visibilityOptions } from "../../../../constants";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

export const makeColumns = (handleAction, handleUpdateStatus) => {
  const columns = [
    {
      Header: "Package",
      accessor: "name",
      align: "left",
      Cell: ({ value, row }) => {
        const b = row.original;
        const title = value || `${b.type || ""} · ${b.category || ""} bundle`;
        const subtitle = [b.tier, b.packageType].filter(Boolean).join(" · ") || "Publication bundle";
        return (
          // Capped width (full text on hover) so long names don't push the table past the screen
          <MDBox maxWidth="300px">
            <MDTypography sx={{ fontSize: "14px", fontWeight: "500" }} noWrap title={title}>
              {b.featured ? `★ ${b.featuredRank && b.featuredRank < 999 ? `#${b.featuredRank} ` : ""}` : ""}
              {truncateString(title, 45)}
            </MDTypography>
            <MDTypography sx={{ fontSize: "12px", color: "#7B809A" }} noWrap title={subtitle}>
              {subtitle}
            </MDTypography>
          </MDBox>
        );
      },
    },
    {
      Header: "Media",
      accessor: "media",
      Cell: ({ value, row }) => (
        <MDTypography sx={{ fontSize: "14px", fontWeight: "500" }}>
          {value?.length || row.original.publicationInfo?.length || 0}
        </MDTypography>
      ),
    },
    {
      // Credits on top; vendor price, vendor and vendor package below (admin only).
      // Replaces the separate Vendor + Credits columns so the table fits without sliding.
      Header: "Price",
      accessor: "price",
      align: "left",
      Cell: ({ value, row }) => {
        const b = row.original;
        const vendorLine = [
          b.vendorPriceInr ? `₹${Number(b.vendorPriceInr).toLocaleString("en-IN")}` : null,
          b.vendor,
          b.vendorPackageName,
        ]
          .filter(Boolean)
          .join(" · ");
        return (
          <MDBox data-testid="pkg-price" maxWidth="200px">
            <MDTypography sx={{ fontSize: "14px", fontWeight: "400", whiteSpace: "nowrap" }}>
              <strong>{value}</strong> credits
            </MDTypography>
            <MDTypography sx={{ fontSize: "12px", color: "#7B809A" }} noWrap title={vendorLine}>
              {vendorLine || "No vendor price"}
            </MDTypography>
          </MDBox>
        );
      },
    },
    {
      Header: "Visibility",
      accessor: "visibility",
      Cell: ({ value, row }) => {
        const selectedStatus = value;
        const selected = visibilityOptions.find((el) => selectedStatus === el?.value);

        return (
          <FormControl sx={{ width: "120px" }} size="medium">
            <Select
              input={<OutlinedInput sx={{ color: "white" }} />}
              id={`status-select-${row?.original?.id ?? row?.id}`}
              displayEmpty
              value={selectedStatus}
              sx={{
                boxShadow: "none",
                textAlign: "center",
                borderRadius: "21px",
                height: "32px",
                background: selected?.background,
                textTransform: "uppercase",
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "transparent", // Remove hover border color
                },
                "& .MuiOutlinedInput-input": {
                  color: "#fff",
                  fontSize: "12px",
                  fontWeight: "400",
                  borderRadius: "21px",
                  border: "none",
                  background: selected?.background,
                  "&.Mui-focused, &.Mui-focusVisible": {
                    outline: "none", // Remove the default focus outline
                    boxShadow: "none", // Remove the shadow which causes the blue outline
                  },
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
              {visibilityOptions
                .filter((option) => option.value !== "PRIVATE") // Filter out the selected value
                .map((option) => (
                  <MenuItem key={option.label} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        );
      },
    },
    {
      Header: "Action",
      align: "right",
      sticky: true,
      Cell: ({ value, row }) => {
        return (
          <MDBox
            sx={{
              display: "flex",
            }}
          >
            <>
              <RowAction
                label="View"
                icon={ViewIcon}
                onClick={() => handleAction(row.original.id, "view")}
              />
              <RowAction
                label="Edit"
                icon={EditIcon}
                onClick={() => handleAction(row.original.id, "edit")}
              />
              <RowAction
                label="Delete"
                icon={DeleteIcon}
                onClick={() => handleAction(row.original.id, "delete")}
              />
            </>
          </MDBox>
        );
      },
    },
  ];

  return columns;
};
