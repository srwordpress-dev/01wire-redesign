import { Key, ReactNode } from "react";
import Card from "@mui/material/Card";
import { Theme } from "@mui/material/styles";
import Divider from "@mui/material/Divider";
// Material Dashboard 2 PRO React TS components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDAvatar from "components/MDAvatar";
import TrendingUpIcon from "assets/images/icons/trendingIcon.png";
import { getImageUrl } from "utils/apiConfig";

// Declaring prop types for the ComplexProjectCard
interface Props {
  color?: "primary" | "secondary" | "info" | "success" | "warning" | "error" | "dark" | "light";
  image: string;
  title: string;
  dateTime?: string;
  description: ReactNode;
  members?: string[];
  dropdown?: {
    action?: (...arg: any) => void;
    menu?: ReactNode;
  };
  [key: string]: any;
}

// Custom styles for ComplexProjectCard
function ComplexProjectCard({
  color,
  image,
  title,
  dateTime,
  description,
  members,
  dropdown,
  stats,
  traffic,
  linkType,
  timeLine,
  credits,
  categories,
  onClick,
  selected,
  id,
}: Props): JSX.Element {
  const renderMembers = members.map((member, key) => {
    const memberKey = `member-${key}`;

    return (
      <MDAvatar
        key={memberKey}
        src={member}
        alt="member profile"
        size="xs"
        sx={({ borders: { borderWidth }, palette: { white } }: Theme) => ({
          border: `${borderWidth[2]} solid ${white.main}`,
          cursor: "pointer",
          position: "relative",

          "&:not(:first-of-type)": {
            ml: -1.25,
          },

          "&:hover, &:focus": {
            zIndex: "10",
          },
        })}
      />
    );
  });

  return (
    <Card
      onClick={() => onClick(id)}
      sx={{
        boxShadow: "0px 2px 4px 0px rgba(0, 0, 0, 0.25) !important",
        border: selected && "1px solid rgba(238, 92, 97, 1) !important",
        cursor: onClick && "pointer",
      }}
    >
      <MDBox p={2}>
        <MDBox display="flex" alignItems="start">
          <MDAvatar
            src={getImageUrl(image)}
            alt={title}
            variant="rounded"
            bgColor={color}
            sx={{
              height: "80px",
              width: "110px",
              borderRadius: "3.47px",
            }}
          />
          <MDBox ml={2}>
            <MDTypography variant="h6" textTransform="capitalize" fontWeight="medium">
              {title}
            </MDTypography>
            <MDTypography fontSize="14px" color="rgba(123, 128, 154, 1) !important">
              Press Release / Blockchain & Crypto
            </MDTypography>
            <MDBox mt={1} display="flex" alignItems="center">
              <MDBox
                display="flex"
                alignItems="center"
                justifyContent="center"
                borderRadius="section"
                height="25px"
                p="5px"
                bgColor="light"
                mr="5px"
              >
                <img src={TrendingUpIcon} height="16px" width="16px" />
                <MDTypography ml="3px" fontWeight={400} fontSize="14px">
                  {`${stats?.traffic}`}
                </MDTypography>
              </MDBox>
              {stats.map((one: any, i: Key) => {
                return (
                  <MDBox
                    key={i}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    borderRadius="section"
                    height="25px"
                    p="5px"
                    bgColor="light"
                    mr="5px"
                  >
                    <MDTypography mr={1} fontWeight={"medium"} fontSize="14px">
                      {one?.title}
                    </MDTypography>
                    <MDTypography fontWeight={400} fontSize="14px">
                      {one?.value}
                    </MDTypography>
                  </MDBox>
                );
              })}
            </MDBox>
          </MDBox>
        </MDBox>
        <Divider sx={{ borderWidth: "1px", background: "rgba(0, 0, 0, 0.2)" }} />
        <MDBox display="flex" justifyContent="space-between" alignItems="center">
          <MDBox display="flex" alignItems="center">
            <DisplayLabelValue label={"Categories"} value={categories} />
            <Divider
              orientation="vertical"
              sx={{ background: "rgba(0, 0, 0, 0.2)", borderWidth: "1px", height: "36px" }}
            />
            <DisplayLabelValue label={"Link Type"} value={linkType} />
            <Divider
              orientation="vertical"
              sx={{ background: "rgba(0, 0, 0, 0.2)", borderWidth: "1px", height: "36px" }}
            />
            <DisplayLabelValue label={"Timeline"} value={timeLine} />
          </MDBox>
          <DisplayLabelValue label="Credit" value={credits} size="18px" color="primary" />
        </MDBox>
      </MDBox>
    </Card>
  );
}
const DisplayLabelValue = ({
  label,
  value,
  size,
  weight,
  color,
}: {
  label: any;
  value: any;
  size?: any;
  weight?: any;
  color?: any;
}) => {
  return (
    <MDBox>
      <MDTypography variant="caption">{label}</MDTypography>
      <MDTypography
        mt={"2px"}
        fontSize={size || "14px"}
        fontWeight={weight || "medium"}
        color={color}
      >
        {value}
      </MDTypography>
    </MDBox>
  );
};

// Declaring default props for ComplexProjectCard
ComplexProjectCard.defaultProps = {
  color: "dark",
  dateTime: "",
  members: [],
  dropdown: false,
};

export default ComplexProjectCard;
