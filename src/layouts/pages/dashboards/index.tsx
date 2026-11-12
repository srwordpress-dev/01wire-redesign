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
import TiltArrowIcon from "assets/images/TiltArrow.svg";
import EastIcon from "@mui/icons-material/East";
import { palette, eyebrow, fonts, transition } from "assets/theme/tokens";

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

// Status ledger: label, API status, and the DESIGN.md status colour for its dot.
const statusCards = [
  { label: "Draft", status: "DRAFT", dot: palette.textDisabled },
  { label: "Submitted", status: "SUBMITTED", dot: palette.info },
  { label: "Review", status: "REVIEW", dot: palette.warning },
  { label: "Awaiting Approval", status: "AWAITING_APPROVAL", dot: palette.warning },
  { label: "Scheduled", status: "SCHEDULED", dot: palette.info },
  { label: "Rejected", status: "REJECTED", dot: palette.error },
  { label: "Published", status: "PUBLISHED", dot: palette.success },
];

const sectionLabel = { ...eyebrow, display: "block", mt: 4, mb: 1.5 };

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
  const countFor = (status: string) =>
    data?.getArticleStats?.find((one: any) => one?.status === status)?.count || 0;
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
        <MDTypography component="h2" sx={sectionLabel}>
          Quick actions
        </MDTypography>
        <Grid container spacing={2}>
          {quickActions.map(({ title, subtitle, route, Icon }) => (
            <Grid item xs={12} md={6} key={route}>
              <Card sx={{ transition: transition("border-color"), "&:hover": { borderColor: palette.outline } }}>
                <CardActionArea
                  onClick={() => navigate(route, { state: { openForm: true } })}
                  sx={{ p: 2, display: "flex", justifyContent: "flex-start", alignItems: "center", gap: 2 }}
                >
                  <MDBox
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    width="44px"
                    height="44px"
                    flexShrink={0}
                    sx={{ backgroundColor: palette.surfaceElevated, borderRadius: "4px" }}
                  >
                    <Icon sx={{ color: palette.ink, fontSize: "22px !important" }} />
                  </MDBox>
                  <MDBox flexGrow={1}>
                    <MDTypography fontSize="16px" fontWeight="medium" sx={{ color: palette.ink }}>
                      {title}
                    </MDTypography>
                    <MDTypography fontSize="14px" color="text">
                      {subtitle}
                    </MDTypography>
                  </MDBox>
                  <EastIcon sx={{ color: palette.textMuted, fontSize: "18px !important" }} />
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
          <MDTypography component="h2" sx={sectionLabel}>
            Current status
          </MDTypography>
          <Grid container spacing={2}>
            {statusCards.map(({ label, status, dot }) => (
              <Grid item xs={6} md={3} key={status}>
                <Card
                  sx={{
                    height: "100%",
                    transition: transition("border-color"),
                    "&:hover": { borderColor: palette.outline },
                  }}
                >
                  <CardActionArea
                    onClick={() => handleNavigation(status)}
                    sx={{ p: 2, height: "100%", display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "space-between" }}
                  >
                    <MDBox display="flex" alignItems="center" gap={1}>
                      <MDBox
                        component="span"
                        sx={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: dot, flexShrink: 0 }}
                      />
                      <MDTypography component="span" sx={{ ...eyebrow, lineHeight: 1.2 }}>
                        {label}
                      </MDTypography>
                    </MDBox>
                    <MDTypography
                      sx={{
                        mt: 2,
                        fontSize: "36px",
                        fontWeight: 400,
                        lineHeight: 1,
                        letterSpacing: "-0.02em",
                        color: palette.ink,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {countFor(status)}
                    </MDTypography>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
          <MarketplacePreview />
          <MDTypography component="h2" sx={sectionLabel}>
            History
          </MDTypography>
          <Grid container spacing={2} sx={{ minHeight: "280px", mb: 3 }}>
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
                        styles={{ borderRadius: "2px", outline: "1px solid rgba(0, 0, 0, 0.1)", outlineOffset: "-1px" }}
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
                          <MDTypography fontSize="16px" fontWeight="regular" width="250px" sx={{ color: palette.ink }}>
                            {one?.title}
                          </MDTypography>
                          <MDTypography
                            variant="body2"
                            sx={{ mt: 1, fontFamily: fonts.mono, fontSize: "12px", color: palette.textMuted }}
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
                <MDTypography variant="body2" color="text">No published releases yet</MDTypography>
              </MDBox>
            )}
          </Grid>
        </MDBox>
      )}
    </>
  );
}

export default Overview;
