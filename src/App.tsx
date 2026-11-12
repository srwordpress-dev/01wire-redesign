import { useState, useEffect, JSXElementConstructor, Key, ReactElement } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
// Material Dashboard 2 PRO React TS exampless
import Sidenav from "examples/Sidenav";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
// Material Dashboard 2 PRO React TS themes
import theme from "assets/theme";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import routes from "routes";
import adminRoutes, { legacyAdminRoutes } from "adminRoutes";
import PrOrders from "layouts/pages/pr-orders";
import { useMaterialUIController, setMiniSidenav } from "context";
// Images
import brandLogo from "assets/images/01wire-logo.png";
import SignIn from "layouts/authentication/sign-in";
import PaymentSuccess from "layouts/pages/myCredits/components/PaymentSuccess";
import PaymentFailed from "layouts/pages/myCredits/components/PaymentFailed";
import Releases from "layouts/pages/releases";
import Clients from "layouts/pages/clients";
import Profile from "layouts/pages/profile";
import Publications from "layouts/pages/publications";
import Bundles from "layouts/pages/bundles";
import PRManagement from "layouts/pages/pr-management";
import DownloadReport from "layouts/pages/download-report";
import ShareEstimation from "layouts/pages/share-estimation";
import ShareReleases from "layouts/pages/releases/components/share-release";
import ReleasePayment from "layouts/pages/releases/payment";
import "../src/layouts/pages/download-report/download.css";

export default function App() {
  const token = localStorage.getItem("token");
  const role: any = localStorage.getItem("role");

  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, direction, layout, sidenavColor, darkMode } = controller;
  const [onMouseEnter, setOnMouseEnter] = useState(false);
  const { pathname } = useLocation();
  // Open sidenav when mouse enter on mini sidenav
  const handleOnMouseEnter = () => {
    if (miniSidenav && !onMouseEnter) {
      setMiniSidenav(dispatch, false);
      setOnMouseEnter(true);
    }
  };
  // Close sidenav when mouse leave mini sidenav
  const handleOnMouseLeave = () => {
    if (onMouseEnter) {
      setMiniSidenav(dispatch, true);
      setOnMouseEnter(false);
    }
  };
  // Setting the dir attribute for the body element
  useEffect(() => {
    document.body.setAttribute("dir", direction);
  }, [direction]);

  // Setting page scroll to 0 when changing the route
  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, [pathname]);

  const getRoutes = (allRoutes: any[]): any =>
    allRoutes.map(
      (route: {
        collapse: any;
        route: string;
        component: ReactElement<any, string | JSXElementConstructor<any>>;
        key: Key;
      }) => {
        if (route.collapse) {
          return getRoutes(route.collapse);
        }

        if (route.route) {
          return <Route path={route.route} element={route.component} key={route.key} />;
        }

        return null;
      }
    );
  const isSharePath =
    pathname.startsWith("/share-estimation") ||
    pathname.startsWith("/share-release") ||
    pathname.startsWith("/download-report");
  console.info("path", pathname, "isSharePath", isSharePath);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {isSharePath ? (
        <Routes>
          <Route path="/share-estimation/:id" element={<ShareEstimation />} />
          <Route path="/share-release/:id" element={<ShareReleases />} />
          <Route path="/download-report/:id" element={<DownloadReport />} />
        </Routes>
      ) : !token ? (
        <SignIn />
      ) : (
        <>
          {layout === "dashboard" && pathname !== "/download-report" && (
            <>
              <Sidenav
                color={sidenavColor}
                brand={brandLogo}
                brandName="Dashboard"
                routes={role === "ADMIN" ? adminRoutes : routes}
                onMouseEnter={handleOnMouseEnter}
                onMouseLeave={handleOnMouseLeave}
              />
            </>
          )}
          <DashboardLayout>
            <Routes>
              {getRoutes(role === "ADMIN" ? adminRoutes : routes)}
              <Route path="/profile" element={<Profile />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/payment-failed" element={<PaymentFailed />} />
              <Route path="/clients/:id" element={<Clients />} />
              <Route path="/releases/:id" element={<Releases />} />
              <Route path="/releases/:id/payment" element={<ReleasePayment />} />
              <Route path="/publications/:id" element={<Publications />} />
              <Route path="/pr-management/:id" element={<PRManagement />} />
              {role === "ADMIN" && <Route path="/pr-orders/:id" element={<PrOrders />} />}
              {role === "ADMIN" && legacyAdminRoutes.map((r) => <Route key={r.key} path={r.route} element={r.component} />)}
              <Route path="/bundles/:id" element={<Bundles />} />
              {/* Marketplace used to live at /pr-estimation */}
              <Route path="/pr-estimation" element={<Navigate to="/marketplace" replace />} />
              {role === "ADMIN" ? (
                <Route path="*" element={<Navigate to="/overview" />} />
              ) : (
                <Route path="*" element={<Navigate to="/dashboards" />} />
              )}
            </Routes>
          </DashboardLayout>
        </>
      )}
    </ThemeProvider>
  );
}
