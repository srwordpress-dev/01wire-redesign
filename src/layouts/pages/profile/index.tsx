import { useState } from "react";
import { useQuery } from "@apollo/client";
import MDTypography from "components/MDTypography";
import MDCircularLoader from "components/MDCircularLoader";
import MDButton from "components/MDButton";
import MDBox from "components/MDBox";
import Card from "@mui/material/Card";
import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";
import ProfileBg from "assets/images/profileBg.png";
import { GET_ME, IGetMe } from "graphql/queries/getMe";
import ChangePassword from "./components/ChangePassword";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

const Profile = () => {
  const [open, setOpen] = useState<boolean>(false);
  const { data, loading } = useQuery<IGetMe>(GET_ME, {
    fetchPolicy: "network-only",
  });
  return (
    <>
    <DashboardNavbar />
    <MDBox p={2}>
      {open && <ChangePassword onClose={() => setOpen(false)} />}
      <Card sx={{ height: "374px", borderRadius: "12px" }}>
        <img
          style={{
            borderRadius: "12px 12px 0 0",
          }}
          src={ProfileBg}
          height="162px"
          width="100%"
          alt="profileBg"
        />

        <MDBox>
          {loading ? (
            <MDCircularLoader overlayloader startLoader />
          ) : (
            <MDBox mt={4} px={2} display="flex" alignItems="center" justifyContent="space-between">
              <MDBox display="flex" alignItems="center">
                <PersonIcon sx={{ height: "112px", width: "109px", color: "#000" }} />
                <MDBox>
                  <MDTypography fontSize="20px" fontWeight="medium">
                    {data?.getMe?.fullName}
                  </MDTypography>
                  <MDTypography fontSize="14px" fontWeight="regular" sx={{ color: "#84878E" }}>
                    {data?.getMe?.email}
                  </MDTypography>
                </MDBox>
              </MDBox>
              <MDButton
                onClick={() => setOpen(true)}
                size="small"
                color="primary"
                sx={{ display: "flex", alignItems: "end" }}
              >
                <MDTypography
                  fontSize="16px"
                  fontWeight="regular"
                  sx={{ color: "#fff", fontFamily: "Roboto", marginRight: "5px" }}
                >
                  Change Password
                </MDTypography>
                <MDBox color="#fff">
                  <LockIcon sx={{ height: "18px", width: "18px" }} />
                </MDBox>
              </MDButton>
            </MDBox>
          )}
        </MDBox>
      </Card>
    </MDBox>
    </>
  );
};
export default Profile;
