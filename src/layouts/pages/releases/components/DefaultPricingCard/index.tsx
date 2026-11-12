// react-router-dom components

// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import Link from "@mui/material/Link";
import Radio from "@mui/material/Radio";

// Material Dashboard 2 PRO React TS components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DisplayImage from "components/DisplayImage";

import Guaranteed from "assets/images/icons/guaranteeIcon.png";
import TrendingUpIcon from "assets/images/icons/trendingIcon.png";
import BundleSample from "assets/images/bundlesSample.svg";

// Declaring props types for DefaultPricingCard
interface Props {
  color?:
    | "primary"
    | "secondary"
    | "info"
    | "success"
    | "warning"
    | "error"
    | "light"
    | "dark"
    | "white";
  badge: {
    color:
      | "primary"
      | "secondary"
      | "info"
      | "success"
      | "warning"
      | "error"
      | "light"
      | "dark"
      | "rgba(222, 226, 232, 1)";
    label: string;
  };
  price: {
    currency: string;
    value: string;
    type: string;
  };
  specifications: {
    label: string;
    includes?: boolean;
  }[];
  action: {
    type: "external" | "internal";
    route: string;
    label: string;
    color: "primary" | "secondary" | "info" | "success" | "warning" | "error" | "light" | "dark";
  };
  shadow?: boolean;
  [key: string]: any;
  totalPublications?: number;
  reach: string;
  onclick?: any;
}

function DefaultPricingCard({
  color,
  badge,
  price,
  specifications,
  action,
  shadow,
  totalPublications,
  reach,
  handleChange,
  id,
  selected,
  pIds,
  disabled = false,
  category,
  showCatgeory = false,
  bundle,
  onclick,
}: Props): JSX.Element {
  const renderSpecifications = specifications.map(({ label, includes }) => (
    <MDBox key={label} display="flex" alignItems="center" p={1}>
      <MDBox
        display="flex"
        justifyContent="center"
        alignItems="center"
        width="1.5rem"
        height="1.5rem"
        mr={2}
        mt={-0.125}
      >
        <MDTypography
          variant="body1"
          color={color === "white" ? "text" : "white"}
          sx={{ lineHeight: 0 }}
        >
          <Icon>{includes ? "done" : "remove"}</Icon>
        </MDTypography>
      </MDBox>
      <MDTypography
        // variant="body2"
        fontSize="12px"
        color={color === "white" ? "text" : "white"}
        fontWeight="regular"
      >
        {label}
      </MDTypography>
    </MDBox>
  ));
  const handleClick = () => {
    if (handleChange) {
      handleChange(category, bundle);
    }
  };
  const checked = selected?.some((b: any) => b.id === id);
  return (
    <Card
      sx={{
        boxShadow: ({ boxShadows: { lg } }) => (shadow ? lg : "none"),
        border: checked && "1px solid #EE5C61",
      }}
    >
      <MDBox bgColor={color} variant="gradient" borderRadius="xl">
        <MDBox mt={-1.375} display="flex" alignItems="center" justifyContent={"center"}>
          <MDBox
            bgColor={badge.color}
            width="122px"
            textAlign="center"
            height="25px"
            borderRadius="section"
            lineHeight={1}
          >
            <MDTypography
              variant="caption"
              textTransform="uppercase"
              fontWeight="medium"
              color={badge.color === "rgba(222, 226, 232, 1)" ? "dark" : "white"}
            >
              {badge.label}
            </MDTypography>
          </MDBox>
          {category && (
            <MDBox
              height="25px"
              lineHeight={1}
              px="12px"
              sx={{ background: "#4579DE", ml: "-10px", borderRadius: "0px 20px 20px 0" }}
            >
              <MDTypography variant="caption" fontWeight="regular" sx={{ color: "#fff" }}>
                {category}
              </MDTypography>
            </MDBox>
          )}
        </MDBox>
        <MDBox pt={3} pb={2} px={2} textAlign="center">
          <MDBox my={1}>
            <MDTypography variant="h1" color={color === "white" ? "primary" : "white"}>
              {price.value}
              <MDTypography display="inline" fontSize="18px" fontWeight="regular" color="dark">
                Credits
              </MDTypography>
            </MDTypography>
          </MDBox>
        </MDBox>
        <MDBox mb={2} px={2}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <MDBox
                display="flex"
                flexDirection="column"
                justifyContent="space-between"
                alignItems="center"
                bgColor={"grey-200"}
                borderRadius="lg"
                p={1}
                height="63px"
              >
                <img src={Guaranteed} height="16px" width="16px" />
                <MDTypography
                  textAlign="center"
                  fontSize="14px"
                  lineHeight="1rem"
                  fontWeight="regular"
                >
                  {`${totalPublications || "-"} Guaranteed Publications`}
                </MDTypography>
              </MDBox>
            </Grid>
            <Grid item xs={6}>
              <MDBox
                display="flex"
                flexDirection="column"
                justifyContent="space-between"
                alignItems="center"
                bgColor="grey-200"
                borderRadius="lg"
                p={1}
                height="63px"
              >
                <img src={TrendingUpIcon} height="16px" width="16px" />
                <MDTypography fontSize="14px" fontWeight="regular" color="inherit">
                  {`${reach} Reach`}
                </MDTypography>
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>
        <MDBox pb={3} px={3}>
          {renderSpecifications}
        </MDBox>
        <MDBox
          bgColor="grey-100"
          m={"auto"}
          py={1}
          sx={{ height: "115px", width: "90%", borderRadius: "8px" }}
        >
          <DisplayImage src={bundle?.image} alt="bundleImage" height="100%" width="100%" />
        </MDBox>
        <MDBox
          pb={3}
          px={3}
          display="flex"
          alignItems="center"
          justifyContent={disabled ? "center" : "space-between"}
        >
          <MDBox mt={3}>
            <Link
              component="button"
              variant="body2"
              color="#4579DE"
              underline="always"
              onClick={onclick && onclick}
            >
              Read More
            </Link>
          </MDBox>
          {!disabled && (
            <MDBox mt={3}>
              <MDBox
                px={1}
                width="115px"
                bgColor="grey-200"
                borderRadius="lg"
                display="flex"
                justifyContent="space-around"
                alignItems="center"
              >
                <Radio
                  color="primary"
                  checked={checked}
                  onClick={handleClick}
                  disabled={disabled}
                  value={id}
                />
                <MDTypography
                  fontSize="14px"
                  fontWeight="regular"
                  sx={{ color: checked ? "#EE5C61" : "#84878E" }}
                >
                  Select
                </MDTypography>
              </MDBox>
            </MDBox>
          )}
        </MDBox>
      </MDBox>
    </Card>
  );
}

// Declaring default props for DefaultPricingCard
DefaultPricingCard.defaultProps = {
  color: "white",
  shadow: true,
};

export default DefaultPricingCard;
