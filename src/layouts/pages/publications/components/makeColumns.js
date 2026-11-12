/* eslint-disable react/prop-types */
import MDTypography from "components/MDTypography";
import MDBox from "components/MDBox";
import Tooltip from "@mui/material/Tooltip";
import DeleteIcon from "assets/images/icons/deleteIcon.svg";
import EditIcon from "assets/images/icons/editIcon.svg";
import ViewIcon from "assets/images/icons/viewIcon.svg";
import RowAction from "components/RowAction";
import DisplayImage from "components/DisplayImage";
import { visibilityOptions } from "../../../../constants";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { formatInr } from "./pricing";

const text = { fontSize: "14px", fontWeight: "400" };
const sub = { fontSize: "12px", color: "#606F7B" };
const dash = (v) => (v === null || v === undefined || v === "" ? "-" : v);
const LINK = { DO_FOLLOW: "Do-follow", NO_FOLLOW: "No-follow" };

// Logo, or the site's initials when it has none (imported sites usually don't)
const Logo = ({ src, name }) => {
  const initials = String(name || "?")
    .replace(/^www\./, "")
    .slice(0, 2)
    .toUpperCase();
  return src ? (
    <DisplayImage
      src={src}
      height="36px"
      width="36px"
      alt=""
      styles={{ objectFit: "contain", borderRadius: 6, background: "#fff" }}
    />
  ) : (
    <MDBox
      width="36px"
      height="36px"
      borderRadius="6px"
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{ background: "#EE5C6114", color: "#F9565C", fontSize: "12px", fontWeight: 600 }}
    >
      {initials}
    </MDBox>
  );
};

export const makeColumns = (handleAction, handleUpdateStatus, settings) => {
  const columns = [
    {
      // Logo sits in the website cell so the table fits next to the sticky actions
      Header: "Website / offering",
      accessor: "domain",
      align: "left",
      Cell: ({ value, row }) => {
        const p = row.original;
        return (
          <MDBox display="flex" alignItems="center" gap={1.25}>
            <MDBox flexShrink={0}>
              <Logo src={p.image} name={value || p.title} />
            </MDBox>
            <MDBox minWidth="130px" maxWidth="200px">
              <Tooltip title={p.title || ""} placement="top-start">
                <MDTypography sx={{ fontSize: "14px", fontWeight: "600" }} noWrap>
                  {value || p.title}
                </MDTypography>
              </Tooltip>
              <MDTypography sx={sub} noWrap>
                {(() => {
                  const label = p.variantLabel || (value ? "Standard article" : "Legacy (no domain)");
                  // The separate Link column is gone: add the link type when the label lacks it
                  const link = LINK[p.linkType];
                  return link && !/follow/i.test(label) ? `${label} · ${link}` : label;
                })()}
              </MDTypography>
            </MDBox>
          </MDBox>
        );
      },
    },
    {
      // Language, TAT and DA in one cell (link type is in the website cell)
      Header: "Details",
      accessor: "language",
      align: "left",
      hideBelow: "md",
      Cell: ({ value, row }) => {
        const p = row.original;
        return (
          <MDBox data-testid="pub-details">
            <MDTypography sx={{ ...text, whiteSpace: "nowrap" }}>
              {dash(value)} · {p.tat ? p.tat : "TAT -"}
            </MDTypography>
            <MDTypography sx={{ ...sub, whiteSpace: "nowrap" }}>DA {p.stats?.da ? p.stats.da : "-"}</MDTypography>
          </MDBox>
        );
      },
    },
    {
      // Credits on top; vendor price and markup below (admin only)
      Header: "Price",
      accessor: "price",
      align: "left",
      Cell: ({ value, row }) => {
        const p = row.original;
        const vendorPriced = p.vendorPriceInr != null;
        return (
          <MDBox data-testid="pub-price">
            <MDTypography sx={{ ...text, whiteSpace: "nowrap" }}>
              <strong>{value}</strong> credits
            </MDTypography>
            <MDTypography sx={{ ...sub, whiteSpace: "nowrap" }}>
              {vendorPriced ? formatInr(p.vendorPriceInr) : "No vendor ₹"}
              {p.markupPercent != null ? (
                <>
                  {" · "}
                  <strong style={{ color: "#344767" }}>{p.markupPercent}%</strong>
                </>
              ) : vendorPriced ? (
                ` · ${settings ? `${settings.markupPercent}% ` : ""}default`
              ) : (
                ""
              )}
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
          <FormControl sx={{ width: "112px" }} size="medium">
            <Select
              id={`status-select-${row?.original?.id ?? row?.id}`}
              inputProps={{
                "aria-label": `Visibility of ${row.original.domain || row.original.title}`,
              }}
              displayEmpty
              value={selectedStatus}
              sx={{
                boxShadow: "none",
                textAlign: "center",
                borderRadius: "21px",
                height: "35px",
                color: "#fff",
                background: selected?.background,
                textTransform: "uppercase",
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "transparent",
                },
                "& .MuiOutlinedInput-input": {
                  padding: "10px",
                  color: "#fff",
                  fontSize: "12px",
                  fontWeight: "400",
                  borderRadius: "21px",
                  border: "none",
                  boxShadow: "none",
                  "&.Mui-focused, &.Mui-focusVisible": {
                    outline: "none",
                    boxShadow: "none",
                  },
                },
              }}
              renderValue={() => (selectedStatus ? selectedStatus : <em>Select an option</em>)}
              onChange={(e) => handleUpdateStatus(row, e.target.value)}
            >
              {/* every option stays in the list: MUI warns when the value has no option */}
              {visibilityOptions.map((option) => (
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
      Cell: ({ row }) => (
        <MDBox sx={{ display: "flex" }}>
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
        </MDBox>
      ),
    },
  ];

  return columns;
};
