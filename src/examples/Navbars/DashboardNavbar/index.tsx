import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { IGetUserWallet, GET_USER_WALLET } from "graphql/queries/getUserWallet";
import useRecordCrumb from "examples/Navbars/DashboardNavbar/useRecordCrumb";
// react-router components
import { useLocation, useNavigate } from "react-router-dom";
// @material-ui core components
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import Icon from "@mui/material/Icon";
// Material Dashboard 2 PRO React TS components
import MDBox from "components/MDBox";
import colors from "assets/theme/base/colors";
import borders from "assets/theme/base/borders";
// Material Dashboard 2 PRO React TS examples components
import Breadcrumbs from "examples/Breadcrumbs";
import NotificationItem from "examples/Items/NotificationItem";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import MDButton from "components/MDButton";
import { adminRoutes } from "adminRoutes";
import userRoutes from "routes";

// Custom styles for DashboardNavbar
import {
  navbar,
  navbarContainer,
  navbarRow,
  navbarIconButton,
} from "examples/Navbars/DashboardNavbar/styles";
// Material Dashboard 2 PRO React context
import {
  useMaterialUIController,
  setTransparentNavbar,
  setMiniSidenav,
  setOpenConfigurator,
} from "context";
import MDTypography from "components/MDTypography";
import { Theme } from "@mui/material/styles";

// Declaring prop types for DashboardNavbar
interface Props {
  absolute?: boolean;
  light?: boolean;
  isMini?: boolean;
  onsubmit?: any;
  text?: string;
}

function DashboardNavbar({ absolute, light, isMini, onsubmit, text }: Props): JSX.Element {
  const { white, grey } = colors;
  const role: any = localStorage.getItem("role");
  const { borderWidth } = borders;
  const [navbarType, setNavbarType] = useState<
    "fixed" | "absolute" | "relative" | "static" | "sticky"
  >();
  const navigate = useNavigate();
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, transparentNavbar, fixedNavbar, openConfigurator, darkMode } = controller;
  const [openMenu, setOpenMenu] = useState<any>(false);
  const route = useLocation().pathname.split("/").slice(1);
  const { data, loading: walletLoading } = useQuery<IGetUserWallet>(GET_USER_WALLET, {
    fetchPolicy: "network-only",
    skip: role === "ADMIN",
    // Picks up balance changes made elsewhere (e.g. an admin top-up)
    pollInterval: 30000,
  });
  // Placeholder only until the first response; a missing wallet shows 0
  const balance = data?.getUserWallet?.balance ?? (walletLoading && !data ? undefined : 0);
  // useEffect(() => {
  //   let url;
  //   const eventSource = new EventSource(url);

  //   eventSource.onmessage = (event) => {
  //     console.log("Message received:", event.data);
  //     // Handle the received data as needed
  //   };

  //   eventSource.onerror = (error) => {
  //     console.error("Error occurred:", error);
  //     // Handle errors
  //   };

  //   return () => {
  //     eventSource.close();
  //   };
  // }, []);

  useEffect(() => {
    // Setting the navbar type
    if (fixedNavbar) {
      setNavbarType("sticky");
    } else {
      setNavbarType("static");
    }

    // A function that sets the transparent state of the navbar.
    function handleTransparentNavbar() {
      setTransparentNavbar(dispatch, (fixedNavbar && window.scrollY === 0) || !fixedNavbar);
    }

    /** 
     The event listener that's calling the handleTransparentNavbar function when 
     scrolling the window.
    */
    window.addEventListener("scroll", handleTransparentNavbar);

    // Call the handleTransparentNavbar function to set the state with the initial value.
    handleTransparentNavbar();

    // Remove event listener on cleanup
    return () => window.removeEventListener("scroll", handleTransparentNavbar);
  }, [dispatch, fixedNavbar]);

  const handleMiniSidenav = () => setMiniSidenav(dispatch, !miniSidenav);
  const handleConfiguratorOpen = () => setOpenConfigurator(dispatch, !openConfigurator);
  const handleOpenMenu = (event: any) => setOpenMenu(event.currentTarget);
  const handleCloseMenu = () => setOpenMenu(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/sign-in");
    handleCloseMenu();
  };
  const handleProfileClick = () => {
    navigate("/profile");
    handleCloseMenu();
  };
  // Render the notifications menu
  const renderMenu = () => (
    <Menu
      anchorEl={openMenu}
      anchorReference={null}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      open={Boolean(openMenu)}
      onClose={handleCloseMenu}
      sx={{ mt: 2 }}
    >
      {role === "ADMIN" && (
        <MDBox px={2} pt={0.5} pb={1} data-testid="admin-menu-label">
          <MDTypography fontSize="0.8rem" color="text">
            Signed in as <strong style={{ color: "#ee5c61" }}>Admin</strong>
          </MDTypography>
        </MDBox>
      )}
      <NotificationItem
        onClick={handleProfileClick}
        icon={<Icon>account_circle</Icon>}
        title="Profile"
      />
      <NotificationItem onClick={handleLogout} icon={<Icon>logout</Icon>} title="Logout" />
    </Menu>
  );

  // Styles for the navbar icons
  const iconsStyle = ({
    palette: { dark, white, text },
    functions: { rgba },
  }: {
    palette: any;
    functions: any;
  }) => ({
    color: () => {
      let colorValue = light || darkMode ? white.main : dark.main;

      if (transparentNavbar && !light) {
        colorValue = darkMode ? rgba(text.main, 0.6) : text.main;
      }

      return colorValue;
    },
  });

  // Breadcrumb names: the sidebar name for each page; a record id becomes a friendly label
  const names: Record<string, string> = { payment: "Payment" };
  [...adminRoutes, ...(userRoutes as any[])].forEach((el: any) => {
    if (el?.key && el?.name && !names[el.key]) names[el.key] = el.name;
  });
  const recordCrumb = useRecordCrumb(route);
  const title = names[route[route.length - 1]] || route[route.length - 1];
  return (
    <AppBar
      position={absolute ? "absolute" : navbarType}
      color="inherit"
      sx={(theme) => navbar(theme, { transparentNavbar, absolute, light, darkMode })}
    >
      <Toolbar sx={navbarContainer}>
        <MDBox
          color="inherit"
          mb={{ xs: 1, md: 0 }}
          sx={(theme: Theme) => navbarRow(theme, { isMini })}
        >
          {/* Below xl the sidenav is a hidden drawer; this is the only way to open it */}
          <IconButton
            size="small"
            color="inherit"
            aria-label="open navigation menu"
            sx={[navbarIconButton, { display: { xs: "inline-flex", xl: "none" }, mr: 1 }]}
            onClick={handleMiniSidenav}
          >
            <Icon sx={iconsStyle}>{miniSidenav ? "menu" : "menu_open"}</Icon>
          </IconButton>
          <Breadcrumbs icon="home" title={title} route={route} light={light} names={names} recordCrumb={recordCrumb} />
        </MDBox>

        {isMini ? null : (
          <MDBox sx={(theme: Theme) => navbarRow(theme, { isMini })}>
            {onsubmit && (
              <MDBox
                py={1}
                px={2}
                mr={2}
                sx={{
                  borderRadius: "8px",
                  backgroundColor: "#ee5c61",
                  border: `${borderWidth[1]} solid ${grey[400]}`,
                  cursor: "pointer",
                }}
                onClick={onsubmit}
              >
                <MDTypography fontSize="0.8rem" color="white" sx={{ display: "flex" }}>
                  {text}
                  <AddCircleOutlineRoundedIcon sx={{ ml: 0.5, mt: 0.4 }} />
                </MDTypography>
              </MDBox>
            )}
            {role === "USER" && (
              <MDBox
                py={1}
                px={2}
                sx={{
                  borderRadius: "8px",
                  backgroundColor: white.main,
                  border: `${borderWidth[1]} solid ${grey[400]}`,
                }}
              >
                <MDTypography fontWeight="bold" fontSize="1rem" color="primary">
                  {balance === undefined ? "… Credits" : `${balance} Credits`}
                </MDTypography>
              </MDBox>
            )}
            <MDBox color={light ? "white" : "inherit"} display="flex" alignItems="center">
              {/* Badge and account icon stay together, also when the navbar wraps on phones */}
              {role === "ADMIN" && (
                <MDBox
                  data-testid="admin-badge"
                  title="You are signed in with an admin account"
                  py={{ xs: 0.5, sm: 1 }}
                  px={{ xs: 1.25, sm: 2 }}
                  display="flex"
                  alignItems="center"
                  sx={{
                    borderRadius: "8px",
                    backgroundColor: white.main,
                    border: "1px solid #ee5c61",
                  }}
                >
                  <Icon sx={{ color: "#ee5c61", fontSize: "1.1rem !important" }}>admin_panel_settings</Icon>
                  <MDTypography fontWeight="bold" fontSize={{ xs: "0.875rem", sm: "1rem" }} sx={{ color: "#ee5c61", ml: 0.75 }}>
                    Admin
                  </MDTypography>
                </MDBox>
              )}
              <IconButton
                aria-label={role === "ADMIN" ? "Account menu (admin)" : "Account menu"}
                size="small"
                color="inherit"
                sx={navbarIconButton}
                onClick={handleOpenMenu}
              >
                <Icon sx={iconsStyle}>account_circle</Icon>
              </IconButton>
              {renderMenu()}
            </MDBox>
          </MDBox>
        )}
      </Toolbar>
    </AppBar>
  );
}

// Declaring default props for DashboardNavbar
DashboardNavbar.defaultProps = {
  absolute: false,
  light: false,
  isMini: false,
};

export default DashboardNavbar;
