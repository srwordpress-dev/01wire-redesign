// @mui material components
import Link from "@mui/material/Link";

// Material Dashboard 2 PRO React TS components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 PRO React TS Base Styles
import typography from "assets/theme/base/typography";

// Declaring props types for Footer
interface Props {
  company?: {
    href: string;
    name: string;
  };
  links?: {
    href: string;
    name: string;
  }[];
  [key: string]: any;
}

function Footer({ company, links }: Props): JSX.Element {
  const { href, name } = company;
  const { size } = typography;

  const renderLinks = () =>
    links.map((link) => (
      <MDBox key={link.name} component="li" px={2} lineHeight={1}>
        <Link href={link.href} target="_blank">
          <MDTypography variant="button" fontWeight="regular" color="text">
            {link.name}
          </MDTypography>
        </Link>
      </MDBox>
    ));

  return (
    <MDBox
      width="100%"
      display="flex"
      flexDirection={{ xs: "column", lg: "row" }}
      justifyContent="space-between"
      alignItems="center"
    >
      <MDBox
        display="flex"
        justifyContent="center"
        alignItems="center"
        flexWrap="wrap"
        color="text"
        fontSize={size.sm}
      >
        &copy; {new Date().getFullYear()}, 01wire
      </MDBox>
      <MDBox
        component="ul"
        sx={({ breakpoints }: { breakpoints: any }) => ({
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center",
          listStyle: "none",
          mt: 3,
          mb: 0,
          p: 0,

          [breakpoints.up("lg")]: {
            mt: 0,
          },
        })}
      >
        {renderLinks()}
      </MDBox>
    </MDBox>
  );
}

// Declaring default props for Footer
Footer.defaultProps = {
  company: { href: "https://www.creative-tim.com/", name: "01wire" },
  links: [
    { href: "https://www.creative-tim.com/presentation", name: "About Us" },
    { href: "https://www.creative-tim.com/license", name: "Contact Us" },
  ],
};

export default Footer;
