import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { IGetArticleStats, GET_ARTICLE_STATS } from "graphql/queries/getArticleStats";
import {
  GET_ARTICLES,
  IGetArticles,
  IGetArticlesVars,
} from "graphql/queries/filterArticlesPaginated";
// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import IconButton from "@mui/material/IconButton";
import CardActionArea from "@mui/material/CardActionArea";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import PostAddIcon from "@mui/icons-material/PostAdd";
// Material Dashboard 2 PRO React TS components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDCircularLoader from "components/MDCircularLoader";
import DisplayImage from "components/DisplayImage";
// Material Dashboard 2 PRO React TS examples components
// Images
import RejectedIcon from "assets/images/Rejected.svg";
import TiltArrowIcon from "assets/images/TiltArrow.svg";
import Draft from "assets/images/draft.svg";
import Submitted from "assets/images/submitted.svg";
import Review from "assets/images/review.svg";
import Publish from "assets/images/publish.svg";
import Appro from "assets/images/appro.svg";
import Schedule from "assets/images/schedule.svg";

import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MarketplacePreview from "./components/MarketplacePreview";

// `openForm` router state makes the target page open its add form on arrival
const quickActions = [
  {
    title: "Add Client",
    subtitle: "Create a new client profile",
    route: "/clients",
    Icon: PersonAddAlt1Icon,
  },
  {
    title: "Add PR",
    subtitle: "Write and submit a press release",
    route: "/releases",
    Icon: PostAddIcon,
  },
];

function Overview(): JSX.Element {
  const navigate = useNavigate();
  const { data: hArticlesData, loading: hLoading } = useQuery<IGetArticles, IGetArticlesVars>(
    GET_ARTICLES,
    {
      variables: {
        filterInput: {
          status: "PUBLISHED",
        },
        paginationInput: {
          currentPage: 0,
          perPage: 3,
        },
      },
      fetchPolicy: "network-only",
    }
  );
  const { data, loading } = useQuery<IGetArticleStats>(GET_ARTICLE_STATS, {
    fetchPolicy: "network-only",
  });
  const editorialReview = data?.getArticleStats?.find(
    (one: any) => one?.status === "REVIEW"
  )?.count;
  const awaitingApproval = data?.getArticleStats?.find(
    (one: any) => one?.status === "AWAITING_APPROVAL"
  )?.count;
  const scheduled = data?.getArticleStats?.find((one: any) => one?.status === "SCHEDULED")?.count;
  const rejected = data?.getArticleStats?.find((one: any) => one?.status === "REJECTED")?.count;
  const draft = data?.getArticleStats?.find((one: any) => one?.status === "DRAFT")?.count;
  const published = data?.getArticleStats?.find((one: any) => one?.status === "PUBLISHED")?.count;
  const submitted = data?.getArticleStats?.find((one: any) => one?.status === "SUBMITTED")?.count;
  const handleNavigation = (status: string) => {
    navigate("/releases", {
      state: {
        status,
      },
    });
  };
  return (
    <>
      <DashboardNavbar />
      <MDBox px={2}>
        <MDTypography mt={3} variant="h6" fontWeight="medium">
          Quick Actions
        </MDTypography>
        <Grid mt={1} container spacing={2}>
          {quickActions.map(({ title, subtitle, route, Icon }) => (
            <Grid item xs={12} md={6} key={route}>
              <Card sx={{ borderRadius: "12px", border: "1px solid #ee5c61" }}>
                <CardActionArea
                  onClick={() => navigate(route, { state: { openForm: true } })}
                  sx={{ p: 2, display: "flex", justifyContent: "flex-start", gap: 2 }}
                >
                  <MDBox
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    width="56px"
                    height="56px"
                    borderRadius="12px"
                    flexShrink={0}
                    sx={{ backgroundColor: "#ee5c61" }}
                  >
                    <Icon sx={{ color: "#fff", fontSize: "28px !important" }} />
                  </MDBox>
                  <MDBox>
                    <MDTypography fontSize="18px" fontWeight="bold">
                      {title}
                    </MDTypography>
                    <MDTypography fontSize="14px" fontWeight="light" color="text">
                      {subtitle}
                    </MDTypography>
                  </MDBox>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </MDBox>
      {loading || hLoading ? (
        <MDCircularLoader startLoader />
      ) : (
        <MDBox px={2}>
          <MDTypography mt={3} variant="h6" fontWeight="medium">
            Current Status
          </MDTypography>
          <Grid mt={1} container spacing={2}>
            <Grid item xs={12} md={3}>
              <Card
                onClick={() => handleNavigation("DRAFT")}
                sx={{ p: 2, borderRadius: "12px", height: "124px", cursor: "pointer" }}
              >
                <MDBox display="flex" alignItems="center" justifyContent="space-between">
                  <img src={Draft} height="64px" width="64px" alt="Draft" />
                  <MDBox>
                    <MDTypography fontSize="16px" fontWeight="light" color="text">
                      Draft
                    </MDTypography>
                    <MDTypography fontSize="32px" fontWeight="bold" textAlign="right">
                      {draft || 0}
                    </MDTypography>
                  </MDBox>
                </MDBox>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card
                onClick={() => handleNavigation("SUBMITTED")}
                sx={{ p: 2, borderRadius: "12px", height: "124px", cursor: "pointer" }}
              >
                <MDBox display="flex" alignItems="center" justifyContent="space-between">
                  <img src={Submitted} height="64px" width="64px" alt="Submitted" />
                  <MDBox>
                    <MDTypography fontSize="16px" fontWeight="light" color="text">
                      Submitted
                    </MDTypography>
                    <MDTypography fontSize="32px" fontWeight="bold" textAlign="right">
                      {submitted || 0}
                    </MDTypography>
                  </MDBox>
                </MDBox>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card
                onClick={() => handleNavigation("REVIEW")}
                sx={{ p: 2, borderRadius: "12px", height: "124px", cursor: "pointer" }}
              >
                <MDBox display="flex" alignItems="center" justifyContent="space-between">
                  <img src={Review} height="64px" width="64px" alt="Review" />
                  <MDBox>
                    <MDTypography fontSize="16px" fontWeight="light" color="text">
                      Review
                    </MDTypography>
                    <MDTypography fontSize="32px" fontWeight="bold" textAlign="right">
                      {editorialReview || 0}
                    </MDTypography>
                  </MDBox>
                </MDBox>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card
                onClick={() => handleNavigation("AWAITING_APPROVAL")}
                sx={{ p: 2, borderRadius: "12px", height: "124px", cursor: "pointer" }}
              >
                <MDBox display="flex" alignItems="center" justifyContent="space-between">
                  <img src={Appro} height="64px" width="64px" alt="Appro" />
                  <MDBox>
                    <MDTypography fontSize="16px" fontWeight="light" color="text">
                      Awaiting Approval
                    </MDTypography>
                    <MDTypography fontSize="32px" fontWeight="bold" textAlign="right">
                      {awaitingApproval || 0}
                    </MDTypography>
                  </MDBox>
                </MDBox>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card
                onClick={() => handleNavigation("SCHEDULED")}
                sx={{ p: 2, borderRadius: "12px", height: "124px", cursor: "pointer" }}
              >
                <MDBox display="flex" alignItems="center" justifyContent="space-between">
                  <img src={Schedule} height="64px" width="64px" alt="Schedule" />
                  <MDBox>
                    <MDTypography fontSize="16px" fontWeight="light" color="text">
                      Scheduled
                    </MDTypography>
                    <MDTypography fontSize="32px" fontWeight="bold" textAlign="right">
                      {scheduled || 0}
                    </MDTypography>
                  </MDBox>
                </MDBox>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card
                onClick={() => handleNavigation("REJECTED")}
                sx={{ p: 2, borderRadius: "12px", height: "124px", cursor: "pointer" }}
              >
                <MDBox display="flex" alignItems="center" justifyContent="space-between">
                  <img src={RejectedIcon} height="64px" width="64px" alt="ER" />
                  <MDBox>
                    <MDTypography fontSize="16px" fontWeight="light" color="text">
                      Rejected
                    </MDTypography>
                    <MDTypography fontSize="32px" fontWeight="bold" textAlign="right">
                      {rejected || 0}
                    </MDTypography>
                  </MDBox>
                </MDBox>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card
                onClick={() => handleNavigation("PUBLISHED")}
                sx={{ p: 2, borderRadius: "12px", height: "124px", cursor: "pointer" }}
              >
                <MDBox display="flex" alignItems="center" justifyContent="space-between">
                  <img src={Publish} height="64px" width="64px" alt="Publish" />
                  <MDBox>
                    <MDTypography fontSize="16px" fontWeight="light" color="text">
                      Published
                    </MDTypography>
                    <MDTypography fontSize="32px" fontWeight="bold" textAlign="right">
                      {published || 0}
                    </MDTypography>
                  </MDBox>
                </MDBox>
              </Card>
            </Grid>
          </Grid>
          <MarketplacePreview />
          <MDBox mt={3} display="flex" alignItems="center" justifyContent="space-between">
            <MDTypography variant="h6" fontWeight="medium">
              History
            </MDTypography>
          </MDBox>
          <Grid mt={1} container spacing={2} sx={{ minHeight: "280px" }}>
            {hArticlesData?.filterArticlesPaginated?.data?.length > 0 ? (
              hArticlesData?.filterArticlesPaginated?.data?.map((one: any, i: any) => {
                return (
                  <Grid item xs={12} md={4} key={one + i}>
                    <Card
                      sx={{
                        p: 1,
                        height: "307px",
                      }}
                    >
                      <DisplayImage
                        src={one?.featureImage}
                        height="212px"
                        width="100%"
                        alt="History PR Image"
                        styles={{ borderRadius: "8.99px" }}
                      />
                      <CardContent
                        sx={{
                          m: 1,
                          p: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <MDBox>
                          <MDTypography fontSize="16px" fontWeight="regular" width="250px">
                            {one?.title}
                          </MDTypography>
                          <MDTypography
                            variant="body2"
                            sx={{ mt: 1, color: "rgba(123, 128, 154, 1)" }}
                          >
                            {dayjs(one?.createdAt).format("DD MMM YYYY, h:mm A")}
                          </MDTypography>
                        </MDBox>
                        <IconButton
                          size="small"
                          color="inherit"
                          sx={{ mt: 1 }}
                          onClick={() => {
                            navigate(`/releases/${one?.id}`);
                          }}
                        >
                          <img
                            src={TiltArrowIcon}
                            height="36px"
                            width="36px"
                            alt="Tilt Arrow Icon"
                          />
                        </IconButton>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })
            ) : (
              <MDBox m="auto">
                <MDTypography variant="h6">No History Found</MDTypography>
              </MDBox>
            )}
          </Grid>
        </MDBox>
      )}
    </>
  );
}

export default Overview;
