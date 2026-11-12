import Link from "@mui/material/Link";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DisplayImage from "components/DisplayImage";
import MDEditor from "components/MDEditor";

// Press release as it is published and printed (share page / PDF). Also used for
// the in-wizard Preview, so the preview cannot drift from the real output.
function ReleasePreview({ article }: { article: any }): JSX.Element {
  const {
    title = "-",
    featureImage = "",
    mediaContact = {},
    content = "",
    summary,
  } = article || {};
  const { facebook, instagram, twitter, linkedIn, youtube } = mediaContact || {};
  const place = [mediaContact?.city, mediaContact?.country].filter(Boolean).join(", ");
  // Optional contact fields (e.g. phone, website) are left out when empty
  const contactLine = (label: string, value?: string) =>
    value ? (
      <MDTypography fontSize="17px" sx={{ lineHeight: 1.3 }}>
        {label}: {value}
      </MDTypography>
    ) : null;
  return (
    <>
      <MDTypography color="black" variant="h2">
        {title}
      </MDTypography>
      <MDBox sx={{ marginTop: "30px" }}>
        <DisplayImage
          src={featureImage}
          height="auto"
          width="100%"
          alt={"img"}
          styles={{ borderRadius: "10px" }}
        />
      </MDBox>
      {/* Sub-heading is optional */}
      {summary && (
        <MDTypography sx={{ marginTop: "40px", textAlign: "justify" }} fontSize="20px">
          {summary}
        </MDTypography>
      )}
      {place && (
        <MDTypography
          fontSize="18px"
          fontWeight="medium"
          sx={{ marginTop: "24px", color: "#344767" }}
        >
          {place}
        </MDTypography>
      )}
      {content && <MDEditor noBorder disabled onChange={() => {}} value={content} />}
      {/* <MDTypography sx={{ marginTop: "20px", textAlign: "justify" }} fontSize="20px">
      <div className="press-release-text" dangerouslySetInnerHTML={{ __html: content }} />
    </MDTypography> */}
      {/* Contact box sits at the bottom-left, under the release */}
      <MDBox
        sx={{
          marginTop: "50px",
          width: { xs: "100%", md: "50%" },
          border: "1px solid rgba(0, 0, 0, 0.12)",
          borderRadius: "10px",
          textAlign: "left",
          padding: "20px 24px",
        }}
        bgColor="white"
      >
        <MDTypography
          fontSize="20px"
          color="black"
          fontWeight="bold"
          sx={{ paddingBottom: "10px" }}
        >
          Media Contact
        </MDTypography>
        {contactLine("Name", mediaContact?.name)}
        {contactLine("Email", mediaContact?.email)}
        {contactLine("Phone", mediaContact?.phone)}
        {contactLine("Website", mediaContact?.website)}
        {contactLine("Address", mediaContact?.address)}
        {(facebook || instagram || twitter || youtube || linkedIn) && (
          <>
            <MDTypography
              fontSize="20px"
              color="black"
              fontWeight="bold"
              sx={{ padding: "30px 0px 10px 0px" }}
            >
              Social Media
            </MDTypography>

            {facebook && (
              <MDTypography fontSize="17px" sx={{ lineHeight: 1.3 }}>
                Facebook:{" "}
                <Link
                  sx={{
                    cursor: "pointer",
                  }}
                  href={facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {facebook}
                </Link>
              </MDTypography>
            )}
            {instagram && (
              <MDTypography fontSize="17px" sx={{ lineHeight: 1.3 }}>
                Instagram:{" "}
                <Link
                  sx={{
                    cursor: "pointer",
                  }}
                  href={instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {instagram}
                </Link>
              </MDTypography>
            )}
            {linkedIn && (
              <MDTypography fontSize="17px" sx={{ lineHeight: 1.3 }}>
                LinkedIn:{" "}
                <Link
                  sx={{
                    cursor: "pointer",
                  }}
                  href={linkedIn}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {linkedIn}
                </Link>
              </MDTypography>
            )}
            {twitter && (
              <MDTypography fontSize="17px" sx={{ lineHeight: 1.3 }}>
                Twitter:{" "}
                <Link
                  sx={{
                    cursor: "pointer",
                  }}
                  href={twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {twitter}
                </Link>
              </MDTypography>
            )}
            {youtube && (
              <MDTypography fontSize="17px" sx={{ lineHeight: 1.3 }}>
                Youtube:{" "}
                <Link
                  sx={{
                    cursor: "pointer",
                  }}
                  href={youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {youtube}
                </Link>
              </MDTypography>
            )}
          </>
        )}
      </MDBox>
    </>
  );
}

export default ReleasePreview;
