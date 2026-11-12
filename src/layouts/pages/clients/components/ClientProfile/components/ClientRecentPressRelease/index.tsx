import dayjs from "dayjs";
import MDBox from "components/MDBox";
import DisplayImage from "components/DisplayImage";
import MDTypography from "components/MDTypography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import IconButton from "@mui/material/IconButton";
import Grid from "@mui/material/Grid";
import TiltArrowIcon from "assets/images/TiltArrow.svg";
import { useNavigate } from "react-router-dom";

const ClientRecentPR = ({ data = [] }: { data: any }) => {
  const navigate = useNavigate();

  return (
    <Card sx={{ p: 1, minHeight: "565px" }}>
      <MDBox>
        <MDTypography mt={3} variant="h6" fontWeight="medium">
          Recent Press Release
        </MDTypography>
        {data?.length > 0 ? (
          <Grid mt={1} container spacing={2}>
            {data?.map((one: any, i: any) => {
              return (
                <Grid item xs={12} key={one + i}>
                  <Card
                    sx={{
                      p: 1,
                      display: "flex",
                      flexDirection: "row",
                      height: "137px",
                      alignItems: "center",
                      boxShadow: "0px 2px 4px 0px rgba(0, 0, 0, 0.12)",
                      background: "rgba(240, 242, 245, 1)",
                    }}
                  >
                    <DisplayImage
                      src={one?.featureImage}
                      height="121px"
                      width="160px"
                      alt="Paella dish"
                      styles={{ borderRadius: "8.99px" }}
                    />
                    <CardContent sx={{ ml: 1, mt: 2, p: 0 }}>
                      <MDTypography fontSize="16px" fontWeight="regular" width="150px">
                        {one?.title}
                      </MDTypography>
                      <MDTypography variant="body2" sx={{ mt: 1, color: "rgba(123, 128, 154, 1)" }}>
                        {dayjs(one?.createdAt).format("DD MMM YYYY, h:mm A")}
                      </MDTypography>
                      <IconButton
                        onClick={() => {
                          navigate(`/releases/${one?.id}`);
                        }}
                        size="small"
                        color="inherit"
                        sx={{ mt: 1 }}
                      >
                        <img src={TiltArrowIcon} height="36px" width="36px" alt="Tilt Arrow Icon" />
                      </IconButton>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        ) : (
          <MDBox
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "500px",
            }}
          >
            <MDTypography variant="h6"> No Recent PR found</MDTypography>
          </MDBox>
        )}
      </MDBox>
    </Card>
  );
};

export default ClientRecentPR;
