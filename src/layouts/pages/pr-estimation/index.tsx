import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MDBox from "components/MDBox";
import MDCircularLoader from "components/MDCircularLoader";
import PlanNPayment from "../releases/components/PlanNPayment";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import CreateEstimation from "./components/CreateEstimateModal";

const PREstimation = () => {
  const [loader, setLoader] = useState(false);
  const [open, setOpen] = useState(false);
  const handleChange = (values: any) => {
    setOpen(values);
  };
  const location = useLocation();
  const navigate = useNavigate();
  // Set by the dashboard Marketplace preview: "publications" or "bundles"
  const section = location?.state?.section;
  useEffect(() => {
    if (!section) return;
    // Consume the flag so a refresh doesn't scroll again
    navigate(location.pathname, { replace: true, state: null });
    if (section !== "publications") return; // bundles are at the top of the page
    // The publications list renders after its query resolves
    let tries = 0;
    const timer = setInterval(() => {
      const el = document.getElementById("marketplace-publications");
      if (el || ++tries > 25) {
        clearInterval(timer);
        el?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 200);
    return () => clearInterval(timer);
  }, []);
  return (
    <MDBox>
      <DashboardNavbar text="Marketplace" />
      <MDBox px={2} pt={3}>
        {loader && <MDCircularLoader startLoader overlayloader />}
        <PlanNPayment createEstimate={handleChange} />
      </MDBox>
      {open && <CreateEstimation values={open} onClose={() => setOpen(false)} />}
    </MDBox>
  );
};
export default PREstimation;
