/** 
  For adding a new route you can follow the existing routes in the routes array.
  1. The `type` key with the `collapse` value is used for a route.
  2. The `type` key with the `title` value is used for a title inside the Sidenav. 
  3. The `type` key with the `divider` value is used for a divider between Sidenav items.
  4. The `name` key is used for the name of the route on the Sidenav.
  5. The `key` key is used for the key of the route (It will help you with the key prop inside a loop).
  6. The `icon` key is used for the icon of the route on the Sidenav, you have to add a node.
  7. The `collapse` key is used for making a collapsible item on the Sidenav that contains other routes
  inside (nested routes), you need to pass the nested routes inside an array as a value for the `collapse` key.
  8. The `route` key is used to store the route location which is used for the react router.
  9. The `href` key is used to store the external links location.
  10. The `title` key is only for the item with the type of `title` and its used for the title text on the Sidenav.
  10. The `component` key is used to store the component of its route.
*/
// Material Dashboard 2 PRO React layouts
import UserManagement from "layouts/pages/user-management";
import Publications from "layouts/pages/publications";
import Bundles from "layouts/pages/bundles";
import PublishedOrders from "layouts/pages/publishedOrder";
import PRManagement from "layouts/pages/pr-management";
import OrderManagement from "layouts/pages/orders";
import PrOrders from "layouts/pages/pr-orders";
import AdminOverview from "layouts/pages/admin-overview";
import OfflineOrders from "layouts/pages/offline-orders";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import SpaceDashboardOutlinedIcon from "@mui/icons-material/SpaceDashboardOutlined";
// Material Dashboard 2 PRO React TS components
import OrdersIcon from "assets/images/icons/ordersIcon.svg";
import UserIcon from "assets/images/account_box.svg";
import PublicationIcon from "assets/images/publicationIcon.svg";
import BundleIcon from "assets/images/bundle.svg";
import PublishedOrder from "assets/images/published.svg";

export const adminRoutes = [
  // Admin landing page: work waiting + last 7 days
  {
    type: "collapse",
    name: "Overview",
    icon: <SpaceDashboardOutlinedIcon sx={{ color: "#fff", fontSize: "24px !important" }} />,
    key: "overview",
    noCollapse: true,
    route: "/overview",
    component: <AdminOverview />,
  },
  // One place for every purchase: replaces "Manage Orders" + "Manage Articles"
  // (those pages still open at /orders and /pr-management, see App.tsx)
  {
    type: "collapse",
    name: "PR Orders",
    icon: <img src={OrdersIcon} width="24px" height="24px" />,
    key: "pr-orders",
    noCollapse: true,
    route: "/pr-orders",
    component: <PrOrders />,
  },
  // Orders taken outside the dashboard (monthly sheet import); admin only
  {
    type: "collapse",
    name: "Offline Orders",
    icon: <ReceiptLongOutlinedIcon sx={{ color: "#fff", fontSize: "24px !important" }} />,
    key: "offline-orders",
    noCollapse: true,
    route: "/offline-orders",
    component: <OfflineOrders />,
  },
  {
    type: "collapse",
    name: "Manage Users",
    icon: <img src={UserIcon} width="24px" height="24px" />,
    key: "user-management",
    noCollapse: true,
    route: "/user-management",
    component: <UserManagement />,
  },
  {
    type: "collapse",
    name: "Publications",
    icon: <img src={PublicationIcon} width="24px" height="24px" />,
    key: "publications",
    noCollapse: true,
    route: "/publications",
    component: <Publications />,
  },
  {
    type: "collapse",
    name: "Packages",
    icon: <img src={BundleIcon} width="24px" height="24px" />,
    key: "bundles",
    noCollapse: true,
    route: "/bundles",
    component: <Bundles />,
  },
  // {
  //   type: "collapse",
  //   name: "Published Order",
  //   icon: <img src={PublishedOrder} width="24px" height="24px" />,
  //   key: "published-order",
  //   noCollapse: true,
  //   route: "/published-order",
  //   component: <PublishedOrders />,
  // },
];

// Old admin pages, reachable by address only (not in the sidebar)
export const legacyAdminRoutes = [
  { key: "orders", route: "/orders", component: <OrderManagement /> },
  { key: "pr-management", route: "/pr-management", component: <PRManagement /> },
];

export default adminRoutes;
