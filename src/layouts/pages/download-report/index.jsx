import { useRef, useState } from "react";
import { useParams } from "react-router-dom";
import "./download.css";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import OneWireLogo from "assets/images/01wire-logo.png";
import DownloadBg from "assets/images/download-report/downloadBg.png";
import XIcon from "@mui/icons-material/X";
import FacebookIcon from "@mui/icons-material/Facebook";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InstagramIcon from "@mui/icons-material/Instagram";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useQuery } from "@apollo/client";
import { GET_ARTICLE_BY_ID } from "graphql/queries/getArticleById";
import { useLocation } from "react-router-dom";
import { GET_ORDERS } from "graphql/queries/filterOrdersPaginated";
import Link from "@mui/material/Link";
import DisplayImage from "components/DisplayImage";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDEditor from "components/MDEditor";
import DownloadIcon from "@mui/icons-material/Download";

const SocialMediaLink = ({ IconComponent, platform, bgColor, to }) => (
  <Link
    sx={{
      cursor: "pointer",
    }}
    href={to}
    target="_blank"
    rel="noopener noreferrer"
  >
    <Box className="social-media-link" sx={{ background: bgColor, cursor: "pointer" }}>
      <IconComponent sx={{ fontSize: 40 }} />
      <Box className="platform-name" sx={{ pl: "2" }}>
        {platform}
      </Box>
    </Box>
  </Link>
);

const CompanyInfoItem = ({ label, value }) => (
  <>
    <Box className="info-label">{label}</Box>
    <Box className="info-value">{value}</Box>
  </>
);

const PickupSection = ({ platform, logo, buttonText }) => (
  <section className="pickup-section">
    <h3 className="pickup-title">{platform} Pickup</h3>
    <img loading="lazy" src={logo} alt={`${platform} logo`} className="platform-logo" />
    <Box className="view-release-button">
      <span className="button-text">{buttonText}</span>
      <img
        loading="lazy"
        src="https://cdn.builder.io/api/v1/image/assets/TEMP/2ebc27a61073d501c465349a712468f26af54b99226b48048cfc1b3d4cf1ab0a?apiKey=a76d01df06f64f7f8c0e5d6a100e4150&"
        alt="Arrow icon"
        className="arrow-icon"
      />
    </Box>
  </section>
);

const DistributionItem = ({ logo, name, link, type, industry, countries, audience }) => (
  <Box className="distribution-item">
    <DisplayImage
      src={logo}
      height="50px"
      width="50px"
      alt={name}
      styles={{ borderRadius: "8.99px" }}
    />
    <a href={link} className="distribution-link">
      View Release
    </a>
    <span className="distribution-type">{type}</span>
    {industry && <span className="distribution-industry">{industry}</span>}
    {countries && <span className="distribution-countries">{countries}</span>}
    {audience && <span className="distribution-audience">{audience} {Number(audience) === 1 ? "visit" : "visits"}/month</span>}
  </Box>
);

const getId = () => {
  return new URLSearchParams(useLocation().search);
};
const Footer = ({ style }) => {
  return (
    <footer className="content-footer" style={style}>
      <img
        loading="lazy"
        src="https://cdn.builder.io/api/v1/image/assets/TEMP/6b9fb197a1a148e5e92cf368ee7149d3b74867abbcb5f6ddc39b189c80e5c060?apiKey=a76d01df06f64f7f8c0e5d6a100e4150&"
        alt="Decorative line"
        className="decorative-line"
      />
      <Box className="footer-content">
        <Box className="footer-title">01 Wire</Box>
        <Box className="footer-website">www.01wire.com</Box>
      </Box>
    </footer>
  );
};
function PressReleaseReport() {
  // const query = getId();
  // const id = query.get("id");
  const { id } = useParams();
  const componentRef = useRef();
  const [loader, setLoader] = useState(false);
  const handleDownloadPDF = async () => {
    setLoader(true);
    const element = componentRef.current;

    // Step 1: Convert the component to a canvas with a lower scale to reduce size
    const canvas = await html2canvas(element, {
      scale: 1.5, // Lower scale factor to reduce size, you can adjust as needed
      useCORS: true, // Handle CORS for external resources
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.75); // Lower the quality to 75%

    // Step 2: Prepare PDF options
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const ratio = pdfWidth / canvasWidth;
    const scaledHeight = canvasHeight * ratio;

    // Step 3: Split content into multiple pages
    let position = 0;
    while (position < scaledHeight) {
      if (position > 0) {
        pdf.addPage();
      }
      pdf.addImage(imgData, "JPEG", 0, -position, pdfWidth, scaledHeight);

      position += pdfHeight;
    }
    // Step 4: Download the PDF
    pdf.save("download.pdf");
    setLoader(false);
  };
  const { data } = useQuery(GET_ARTICLE_BY_ID, {
    fetchPolicy: "network-only",
    variables: {
      id,
    },
  });

  const { data: orderData } = useQuery(GET_ORDERS, {
    fetchPolicy: "network-only",
    variables: {
      paginationInput: {
        perPage: 500,
        currentPage: 0,
      },
      filterInput: {
        articleId: id,
      },
    },
  });
  const filteredOrders = orderData?.filterOrdersPaginated?.data?.filter(
    (one) => one?.status !== "REJECTED"
  );
  const { email, phone, website, name, address, country } =
    data?.getArticleById?.mediaContact || {};
  const { linkedIn, facebook, instagram, twitter } = data?.getArticleById?.clientInfo?.social || {};
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box sx={{ position: "relative" }}>
      <Box sx={{ position: "fixed", right: "20px", top: "10px" }}>
        <Button
          variant="contained"
          sx={{
            color: "#000",
            background: "#fff",
            "&:hover": {
              background: "#fff",
            },
          }}
          onClick={handleDownloadPDF}
          startIcon={<DownloadIcon fontSize="medium" />}
        >
          {loader ? "Downloading..." : "Download"}
        </Button>
      </Box>
      <Box
        margin="auto"
        ref={componentRef}
        style={{ padding: 20, width: isMobile ? "100%" : "210mm" /* A4 width */ }}
      >
        <header
          style={{
            backgroundColor: " #fff",
            // margin: "0 145px",
          }}
        >
          <Box className="logo-container">
            <img loading="lazy" src={DownloadBg} alt="Company logo" className="company-logo" />
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                position: "absolute",
              }}
            >
              <img loading="lazy" src={OneWireLogo} alt="01 Wire" height={63} width={168} />
            </Box>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              px: "48px",
            }}
          >
            <Box height={95} width={5} backgroundColor={"#FF4D53"} mr={1}></Box>
            <Typography
              sx={{
                fontSize: isMobile ? "24px" : "48px",
                fontWeight: "700",
                lineHeight: "59.34px",
              }}
            >
              Press Release <br /> Distribution Report
            </Typography>
          </Box>
          <Box mx="48px">
            <Typography sx={{ mt: 1 }} className="section-title">
              COMPANY ADDRESS
            </Typography>
            <Box
              sx={{
                borderRadius: "6px",
                border: "1px solid rgba(0, 0, 0, 0.1)",
                backgroundColor: "#f9f9fd",
                padding: "17px 27px",
                marginBottom: "28px",
              }}
            >
              <Box className="info-grid">
                <Box className="info-column">
                  <CompanyInfoItem label="Company Name" value={name || "-"} />
                  {phone && <CompanyInfoItem label="Phone" value={phone} />}
                  <CompanyInfoItem label="Email" value={email || "-"} />
                </Box>
                <Box className="info-column">
                  <CompanyInfoItem label="Country" value={country || "-"} />
                  {website && <CompanyInfoItem label="Website" value={website} />}
                </Box>
                <Box className="info-column">
                  {address && <CompanyInfoItem label="Address 1" value={address} />}
                </Box>
              </Box>
            </Box>
          </Box>
          {(facebook || twitter || linkedIn || instagram) && (
            <Box mx="48px" mb="30px">
              <h3 className="section-title">Follow Us</h3>
              <Box
                sx={{
                  justifyContent: "center",
                  display: "flex",
                  borderRadius: "6px",
                  border: "1px solid rgba(0, 0, 0, 0.1)",
                  backgroundColor: "#f9f9fd",
                  padding: "17px 27px",
                  marginBottom: "28px",
                  gap: "10px",
                }}
              >
                {facebook && (
                  <SocialMediaLink
                    IconComponent={FacebookIcon}
                    platform="Facebook"
                    bgColor={"#0766FF"}
                    to={facebook}
                  />
                )}
                {twitter && (
                  <SocialMediaLink
                    IconComponent={XIcon}
                    platform="x.com"
                    bgColor={"#0B66C2"}
                    to={twitter}
                  />
                )}
                {instagram && (
                  <SocialMediaLink
                    IconComponent={InstagramIcon}
                    platform="Instagram"
                    bgColor={`linear-gradient(0deg, #D9D9D9, #D9D9D9),linear-gradient(0deg, #0766FF, #0766FF),linear-gradient(49.12deg, #FFDD55 6.62%, #FF543E 50.06%, #C837AB 93.5%)`}
                    to={instagram}
                  />
                )}
                {linkedIn && (
                  <SocialMediaLink
                    IconComponent={LinkedInIcon}
                    platform="Linkedin"
                    bgColor={"#0B66C2"}
                    to={linkedIn}
                  />
                )}
              </Box>
            </Box>
          )}

          <Footer style={{ margin: "20px" }} />
        </header>
        {/* <main className="report-content" style={{ breakBefore: "page" }}>
          <section className="press-release-summary">
            <Typography
              sx={{
                fontSize: "26px",
                fontWeight: "700",
                lineHeight: "20px",
                mt: 1,
              }}
            >
              Your Submitted Press Release
            </Typography>
            <Typography
              sx={{
                fontSize: "16px",
                fontWeight: "500",
                lineHeight: "20px",
                my: 2,
              }}
            >
              Avensure H&S & HR Outsourcing Services Rolls Out Care <br /> Compliance Bureau
            </Typography>
            <Typography
              sx={{
                color: "rgba(0, 0, 0, 0.6)",
                font: "400 10px 'PP Neue Montreal', sans-serif",
              }}
            >
              Date Submitted: 2024-5-02
            </Typography>
            <Box className="metrics-container">
              <Box className="metric-item">
                <h4 className="metric-title">Recorded Full Page Placements*</h4>
                <p className="metric-value">12B</p>
              </Box>
              <Box className="metric-item">
                <h4 className="metric-title">Potential Audience Reach</h4>
                <p className="metric-value">3B</p>
              </Box>
            </Box>
          </section>
          <section className="pickup-sections">
            <Box className="pickup-row">
              <PickupSection
                platform="Onewire"
                logo="https://cdn.builder.io/api/v1/image/assets/TEMP/e7f21ac09c13d8881a4922c5357da66bc19fd7dc246f65ea59d19ee8d3ce7bae?apiKey=a76d01df06f64f7f8c0e5d6a100e4150&"
                buttonText="See your Release"
              />
              <PickupSection
                platform="Google"
                logo="https://cdn.builder.io/api/v1/image/assets/TEMP/5569583e18ff30a7239602306f9d64d163c05c639adc273adf8ed814d6ef64f4?apiKey=a76d01df06f64f7f8c0e5d6a100e4150&"
                buttonText="See your Release"
              />
            </Box>
            <Box className="pickup-row">
              <PickupSection
                platform="Yahoo"
                logo="https://cdn.builder.io/api/v1/image/assets/TEMP/e96085034d55e68776e0b9eadab871f1f28af86c7a1c53c84cd718879e69efcc?apiKey=a76d01df06f64f7f8c0e5d6a100e4150&"
                buttonText="See your Release"
              />
              <PickupSection
                platform="Bing"
                logo="https://cdn.builder.io/api/v1/image/assets/TEMP/f9b479ab979a16077b98bfddff3a67d1af968c7b0d2c380d98182bca585752c7?apiKey=a76d01df06f64f7f8c0e5d6a100e4150&"
                buttonText="See your Release"
              />
            </Box>
          </section>
          <Footer style={{ marginTop: "20px" }} />
        </main> */}
        <section className="press-release-content">
          <h2 className="section-title">{data?.getArticleById?.title}</h2>
          <MDBox sx={{ marginTop: "30px" }}>
            <DisplayImage
              src={data?.getArticleById?.featureImage}
              height="auto"
              width="100%"
              alt={"img"}
              styles={{ borderRadius: "10px" }}
            />
          </MDBox>
          <MDTypography sx={{ my: "20px", textAlign: "justify" }} fontSize="20px">
            {data?.getArticleById?.summary}
          </MDTypography>
          {data?.getArticleById?.content && (
            <MDEditor noBorder disabled onChange={() => {}} value={data?.getArticleById?.content} />
          )}

          {/* <div
            className="press-release-text"
            dangerouslySetInnerHTML={{ __html: data?.getArticleById?.content }}
          ></div> */}
          <Footer />
        </section>
        {filteredOrders?.length > 0 && (
          <section className="distribution-list">
            {filteredOrders?.map((item, index) => {
              return (
                <DistributionItem
                  key={index}
                  logo={item?.publicationInfo?.image}
                  name="logo"
                  link={item?.url}
                  type={item?.publicationInfo?.title}
                  // industry="Finance"
                  // countries="Global"
                  audience={item?.publicationInfo?.stats?.traffic}
                />
              );
            })}
            <Footer style={{ margin: "20px" }} />
          </section>
        )}
      </Box>
    </Box>
  );
}

export default PressReleaseReport;
