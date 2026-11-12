import { useNavigate, createSearchParams } from "react-router-dom";
import MDBox from "components/MDBox";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import EditIcon from "@mui/icons-material/Edit";
import ClientProfileBg from "assets/images/ClientProfileBg.png";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DisplayImage from "components/DisplayImage";
import { humanize } from "utils/helpers";
import FactoryIcon from "assets/images/factory.svg";
import EmailIcon from "assets/images/mail.svg";
import WebIcon from "assets/images/web.svg";
import FBIcon from "assets/images/FB.svg";
import InstaIcon from "assets/images/insta.svg";
import TwitterIcon from "assets/images/twitter.svg";
import YtIcon from "assets/images/yt.svg";
import OthersIcon from "assets/images/others.svg";
import LinkedInIcon from "assets/images/LinkedIn.svg";

const ProfileSection = ({ data = {} }: { data: any }) => {
  const { title, logo, type, category, website, email, social = {}, id } = data;
  const { facebook, twitter, youtube, instagram, others, linkedIn } = social;
  const navigate = useNavigate();
  return (
    <Card>
      <MDBox
        borderRadius="12px 12px 0 0"
        height="162px"
        width="100%"
        position="relative"
        sx={{
          background: `url(${ClientProfileBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <IconButton
          sx={{
            position: "absolute",
            bottom: 10,
            right: 10,
            height: "38px",
            width: "38px",
            background: "rgba(249, 86, 92, 1)",
          }}
          onClick={() => {
            navigate(`/clients/${id}`);
          }}
        >
          <EditIcon sx={{ height: "22px", width: "22px", color: "#fff" }} />
        </IconButton>
      </MDBox>
      <MDBox display="flex" px={2}>
        <DisplayImage
          src={logo}
          fallbackText={title}
          height="111px"
          width="109px"
          styles={{ borderRadius: "11.78px", marginTop: "-50px", zIndex: 1 }}
        />
        <MDBox ml={1} mt={1}>
          <MDTypography fontSize="20px" fontWeight="bold" sx={{ lineHeight: "28px" }}>
            {title}
          </MDTypography>
          <MDTypography
            fontSize="14px"
            fontWeight="regular"
            sx={{ lineHeight: "19.6px", color: "rgba(132, 135, 142, 1)" }}
          >
            {humanize(type)}
          </MDTypography>
        </MDBox>
      </MDBox>
      <MDBox mt={4} px={2} display="flex" alignItems="center" justifyContent="space-between">
        <DisplayLabelValue startIcon={FactoryIcon} label={"Industry Type"} value={humanize(category)} />
        <Divider orientation="vertical" sx={{ height: "50px", background: "rgba(0, 0, 0, 0.2)" }} />
        <DisplayLabelValue startIcon={EmailIcon} label={"Email"} value={email} />
        <Divider orientation="vertical" sx={{ height: "50px", background: "rgba(0, 0, 0, 0.2)" }} />
        <DisplayLabelValue startIcon={WebIcon} label={"Website"} value={website} />
      </MDBox>
      <Divider sx={{ my: 3, mx: 1, background: "rgba(0, 0, 0, 0.2)" }} />
      <Grid container px={1} spacing={1}>
        {facebook && (
          <Grid item xs={12} md={2}>
            <Link href={facebook} target="_blank" rel="noopener noreferrer">
              <SocialCard icon={FBIcon} title="Facebook" />
            </Link>
          </Grid>
        )}
        {linkedIn && (
          <Grid item xs={12} md={2}>
            <Link href={linkedIn} target="_blank" rel="noopener noreferrer">
              <SocialCard icon={LinkedInIcon} title="LinkedIn" />
            </Link>
          </Grid>
        )}
        {twitter && (
          <Grid item xs={12} md={2}>
            <Link href={twitter} target="_blank" rel="noopener noreferrer">
              <SocialCard icon={TwitterIcon} title="Twitter" />
            </Link>
          </Grid>
        )}
        {instagram && (
          <Grid item xs={12} md={2}>
            <Link href={instagram} target="_blank" rel="noopener noreferrer">
              <SocialCard icon={InstaIcon} title="Instagram" />
            </Link>
          </Grid>
        )}
        {youtube && (
          <Grid item xs={12} md={2}>
            <Link href={youtube} target="_blank" rel="noopener noreferrer">
              <SocialCard icon={YtIcon} title="YouTube" />
            </Link>
          </Grid>
        )}
        {others && (
          <Grid item xs={12} md={2}>
            <Link href={twitter} target="_blank" rel="noopener noreferrer">
              <SocialCard icon={OthersIcon} title="Others" />
            </Link>
          </Grid>
        )}
      </Grid>
      <MDButton
        onClick={() => {
          navigate(`/clients/${id}`, { replace: true, state: { step: "second" } });
        }}
        sx={{ my: 4, mx: "auto" }}
        color="primary"
      >
        Edit Profile
      </MDButton>
    </Card>
  );
};

export default ProfileSection;

const DisplayLabelValue = ({
  startIcon,
  label,
  value,
}: {
  startIcon: any;
  label: any;
  value: any;
}) => {
  return (
    <MDBox>
      <MDBox display="flex" alignItems="center">
        <img src={startIcon} height="24px" width="24px" />
        <MDTypography
          fontSize="14px"
          fontWeight="regular"
          lineHeight="19.6px"
          color="rgba(132, 135, 142, 1)"
          ml={1}
        >
          {label}
        </MDTypography>
      </MDBox>
      <MDTypography fontSize="16px" fontWeight="medium" lineHeight="22.4px">
        {value}
      </MDTypography>
    </MDBox>
  );
};
const SocialCard = ({ icon, title }: { icon: any; title: any }) => {
  return (
    <Card sx={{ p: 1, pt: 3, boxShadow: "0px 2px 6px 0px rgba(0, 0, 0, 0.25)" }}>
      <img src={icon} height="36px" width="36px" alt="socialIcon" style={{ margin: "auto" }} />
      <MDTypography
        sx={{ marginTop: "20px" }}
        fontSize="14px"
        fontWeight="regular"
        lineHeight="19.6px"
        textAlign="center"
      >
        {title}
      </MDTypography>
    </Card>
  );
};
