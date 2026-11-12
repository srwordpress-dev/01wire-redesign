import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";

export const ActionsCellRenderer = ({ actions = [] }: { actions: any }) => (
  <MDBox display="flex" alignItems="center" justifyContent="space-between">
    {actions?.map((one: any, i: any) => {
      return (
        <MDBox key={i}>
          {one?.custom ? (
            <MDBox mx={1}>{one.custom}</MDBox>
          ) : (
            // `tooltip` labels icon-only actions (tooltip + accessible name)
            <Tooltip title={one?.tooltip || ""}>
              <IconButton aria-label={one?.tooltip} onClick={one?.onClick}>
                {one?.label && (
                  <MDTypography
                    fontSize="16px"
                    fontWeight="medium"
                    fontFamily="Roboto"
                    color="primary"
                    mr={1}
                  >
                    {one.label}
                  </MDTypography>
                )}
                {one?.imgIcon ? (
                  <img src={one.imgIcon} height={one?.height} width={one?.width} alt="" />
                ) : (
                  one?.Icon
                )}
              </IconButton>
            </Tooltip>
          )}
        </MDBox>
      );
    })}
  </MDBox>
);
export const genericValidations = {
  text: {
    required: "Please fill value",
  },
  date: {
    required: "Please fill value",
    validate: (date: any) => {
      if (date === "Invalid Date") {
        return "Please input a valid date";
      }
    },
  },
  password: {
    required: "Please Enter Password",
    validate: (pwd: any) => {
      if (pwd?.length < 8) {
        return "Password should contain at least 8 characters";
      }
    },
  },
  number: {
    required: "Please fill value",
    min: {
      value: 1,
      message: "Value should be atleast 1",
    },
  },
  phone: {
    required: "Phone number is required",
    pattern: {
      value: /^\d+$/,
      message: "Invalid phone number",
    },
  },
  email: {
    required: "Please Enter Email",
    pattern: {
      value: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
      message: "Invalid email address",
    },
  },
  url: {
    required: "Please Enter URL",
    pattern: {
      value: /^(ftp|http|https):\/\/[^ "]+$/,
      message: "Invalid url address",
    },
  },
  link: {
    pattern: {
      value: /^(ftp|http|https):\/\/[^ "]+$/,
      message: "Invalid url address",
    },
  },
  dropdown: {
    required: "Please fill value",
  },
};

export function removeEmptyFields(obj: { [key: string]: any }): { [key: string]: any } {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key) && obj[key] === "") {
      delete obj[key];
    }
  }
  return obj;
}

export const truncateString = (str: string, maxLength: number) => {
  // A missing value would otherwise crash the table cell
  if (!str) return str ?? "";
  if (str.length > maxLength) {
    return str.slice(0, maxLength - 3) + "...";
  }
  return str;
};

// Raw stored values for people: "DO_FOLLOW"/"DO FOLLOW" → "Do-follow", "GENERAL" → "General".
// Mixed-case text is left as it is; arrays are joined with commas.
export const humanize = (v: any): string => {
  if (v === null || v === undefined || v === "") return "";
  if (Array.isArray(v)) return v.map(humanize).filter(Boolean).join(", ");
  const s = String(v).trim();
  const key = s.replace(/[_\s-]+/g, " ").toUpperCase();
  if (key === "DO FOLLOW") return "Do-follow";
  if (key === "NO FOLLOW") return "No-follow";
  if (s === s.toUpperCase() && /[A-Z]{2}/.test(s)) {
    const t = s.replace(/_/g, " ").toLowerCase();
    return t.charAt(0).toUpperCase() + t.slice(1);
  }
  return s;
};
