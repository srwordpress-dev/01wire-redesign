import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import MDTypography from "components/MDTypography";
import MDBox from "components/MDBox";

const EditorialGuidelines = ({ onClose }: { onClose: any }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <>
      <Dialog
        PaperProps={{
          style: {
            height: "628px",
            width: isMobile ? "100%" : "635px",
            boxShadow: "0px 4px 16px 0px rgba(0, 0, 0, 0.2)",
            border: "0.5px solid rgba(0, 0, 0, 0.2)",
          },
        }}
        open
        onClose={onClose}
      >
        <MDBox
          sx={{ background: "rgba(240, 242, 245, 1)" }}
          display="flex"
          alignItems="center"
          justifyContent="space-between"
        >
          <DialogTitle>
            <MDTypography fontSize="16px" fontWeight="medium">
              Editorial Guidelines
            </MDTypography>
          </DialogTitle>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </MDBox>
        <DialogContent>

          <MDTypography
            fontFamily="Roboto"
            fontSize="18px"
            mt={1}
            sx={{ fontWeight: 600, color: "rgba(0, 0, 0, 1)" }}
          >
            Objective:
          </MDTypography>
          <MDTypography fontFamily="Roboto" fontSize="15px" color="black" mt={1}>
            Ensure all press releases meet high standards of quality, accuracy, and relevance,
            providing valuable information to readers.
          </MDTypography>
          <MDTypography
            fontFamily="Roboto"
            fontSize="18px"
            mt={2}
            sx={{ fontWeight: 600, color: "rgba(0, 0, 0, 1)" }}
          >
            Writing Standards:
          </MDTypography>
          <MDTypography
            fontFamily="Roboto"
            fontSize="16px"
            mt={2}
            ml={2}
            sx={{ fontWeight: 600, color: "rgba(0, 0, 0, 1)" }}
          >
            1. Content Quality:
          </MDTypography>
          <MDTypography
            fontFamily="Roboto"
            fontSize="15px"
            ml={6}
            sx={{ color: "rgba(0, 0, 0, 1)" }}
          >
            <ul style={{ listStyleType: "circle" }}>
              <li>Ensure newsworthiness and relevance to the audience.</li>
              <li>Deliver factual, concise, and clear information.</li>
              <li>Use a neutral, professional tone without promotional language.</li>
            </ul>
          </MDTypography>
          <MDTypography
            fontFamily="Roboto"
            fontSize="16px"
            mt={2}
            ml={2}
            sx={{ fontWeight: 600, color: "rgba(0, 0, 0, 1)" }}
          >
            2. Accuracy:
          </MDTypography>
          <MDTypography
            fontFamily="Roboto"
            fontSize="15px"
            ml={6}
            sx={{ color: "rgba(0, 0, 0, 1)" }}
          >
            <ul style={{ listStyleType: "circle" }}>
              <li>Verify all facts, statistics, and claims.</li>
              <li>Cite sources for data or quotes.</li>
              <li>Ensure correct spelling, grammar, and punctuation.</li>
            </ul>
          </MDTypography>
          <MDTypography
            fontFamily="Roboto"
            fontSize="16px"
            mt={2}
            ml={2}
            sx={{ fontWeight: 600, color: "rgba(0, 0, 0, 1)" }}
          >
            3. Clarity and Readability:
          </MDTypography>
          <MDTypography
            fontFamily="Roboto"
            fontSize="15px"
            ml={6}
            sx={{ color: "rgba(0, 0, 0, 1)" }}
          >
            <ul style={{ listStyleType: "circle" }}>
              <li>Use straightforward language; avoid jargon.</li>
              <li>Keep sentences and paragraphs short.</li>
              <li>Maintain logical flow and coherence.</li>
            </ul>
          </MDTypography>

          <MDTypography
            fontFamily="Roboto"
            fontSize="18px"
            mt={2}
            sx={{ fontWeight: 600, color: "rgba(0, 0, 0, 1)" }}
          >
            Structure and Format:
          </MDTypography>
          <MDTypography
            fontFamily="Roboto"
            fontSize="16px"
            mt={2}
            ml={2}
            sx={{ fontWeight: 600, color: "rgba(0, 0, 0, 1)" }}
          >
            1. Title:
          </MDTypography>
          <MDTypography
            fontFamily="Roboto"
            fontSize="15px"
            ml={6}
            sx={{ color: "rgba(0, 0, 0, 1)" }}
          >
            <ul style={{ listStyleType: "circle" }}>
              <li>
                Create a clear, concise, and compelling title without colons or unnecessary
                punctuation.
              </li>
            </ul>
          </MDTypography>
          <MDTypography
            fontFamily="Roboto"
            fontSize="16px"
            mt={2}
            ml={2}
            sx={{ fontWeight: 600, color: "rgba(0, 0, 0, 1)" }}
          >
            2. Dateline:
          </MDTypography>
          <MDTypography
            fontFamily="Roboto"
            fontSize="15px"
            ml={6}
            sx={{ color: "rgba(0, 0, 0, 1)" }}
          >
            <ul style={{ listStyleType: "circle" }}>
              <li>Include location (city, state/country) and date at the beginning.</li>
            </ul>
          </MDTypography>
          <MDTypography
            fontFamily="Roboto"
            fontSize="16px"
            mt={2}
            ml={2}
            sx={{ fontWeight: 600, color: "rgba(0, 0, 0, 1)" }}
          >
            3. Body:
          </MDTypography>
          <MDTypography
            fontFamily="Roboto"
            fontSize="15px"
            ml={6}
            sx={{ color: "rgba(0, 0, 0, 1)" }}
          >
            <ul style={{ listStyleType: "circle" }}>
              <li>Start with a strong lead paragraph summarizing key points.</li>
              <li>Follow with detailed supporting paragraphs.</li>
              <li>Avoid headings or subheadings within the body.</li>
              <li>Aim for at least 650 words.</li>
            </ul>
          </MDTypography>
          <MDTypography
            fontFamily="Roboto"
            fontSize="16px"
            mt={2}
            ml={2}
            sx={{ fontWeight: 600, color: "rgba(0, 0, 0, 1)" }}
          >
            4. Quotes:
          </MDTypography>
          <MDTypography
            fontFamily="Roboto"
            fontSize="15px"
            ml={6}
            sx={{ color: "rgba(0, 0, 0, 1)" }}
          >
            <ul style={{ listStyleType: "circle" }}>
              <li>Include valuable quotes from relevant sources.</li>
              <li>Ensure quotes are directly related to the main points.</li>
            </ul>
          </MDTypography>
          <MDTypography
            fontFamily="Roboto"
            fontSize="16px"
            mt={2}
            ml={2}
            sx={{ fontWeight: 600, color: "rgba(0, 0, 0, 1)" }}
          >
            5. About Section:
          </MDTypography>
          <MDTypography
            fontFamily="Roboto"
            fontSize="15px"
            ml={6}
            sx={{ color: "rgba(0, 0, 0, 1)" }}
          >
            <ul style={{ listStyleType: "circle" }}>
              <li>
                Conclude with an "About ProtoStarHub" section providing a brief company overview.
              </li>
            </ul>
          </MDTypography>

          <MDTypography
            fontFamily="Roboto"
            fontSize="18px"
            mt={2}
            sx={{ fontWeight: 600, color: "rgba(0, 0, 0, 1)" }}
          >
            Key Considerations:
          </MDTypography>
          <MDTypography
            fontFamily="Roboto"
            fontSize="16px"
            mt={2}
            ml={2}
            sx={{ fontWeight: 600, color: "rgba(0, 0, 0, 1)" }}
          >
            1. Relevance:
          </MDTypography>
          <MDTypography
            fontFamily="Roboto"
            fontSize="15px"
            ml={6}
            sx={{ color: "rgba(0, 0, 0, 1)" }}
          >
            <ul style={{ listStyleType: "circle" }}>
              <li>Focus on financial, economic, or industry-related news.</li>
            </ul>
          </MDTypography>
          <MDTypography
            fontFamily="Roboto"
            fontSize="16px"
            mt={2}
            ml={2}
            sx={{ fontWeight: 600, color: "rgba(0, 0, 0, 1)" }}
          >
            2. Tone and Style:
          </MDTypography>
          <MDTypography
            fontFamily="Roboto"
            fontSize="15px"
            ml={6}
            sx={{ color: "rgba(0, 0, 0, 1)" }}
          >
            <ul style={{ listStyleType: "circle" }}>
              <li>Maintain a neutral, objective tone.</li>
              <li>Avoid exaggerated claims or subjective statements.</li>
            </ul>
          </MDTypography>
          <MDTypography
            fontFamily="Roboto"
            fontSize="16px"
            mt={2}
            ml={2}
            sx={{ fontWeight: 600, color: "rgba(0, 0, 0, 1)" }}
          >
            3. Contact Information:
          </MDTypography>
          <MDTypography
            fontFamily="Roboto"
            fontSize="15px"
            ml={6}
            sx={{ color: "rgba(0, 0, 0, 1)" }}
          >
            <ul style={{ listStyleType: "circle" }}>
              <li>Include a media contact person’s name, phone number, and email address.</li>
            </ul>
          </MDTypography>
          
          <MDTypography
            fontFamily="Roboto"
            fontSize="18px"
            mt={2}
            sx={{ fontWeight: 600, color: "rgba(0, 0, 0, 1)" }}
          >
            Final Checks:
          </MDTypography>
          <MDTypography
            fontFamily="Roboto"
            fontSize="16px"
            mt={2}
            ml={2}
            sx={{ fontWeight: 600, color: "rgba(0, 0, 0, 1)" }}
          >
            1. Proofreading:
          </MDTypography>
          <MDTypography
            fontFamily="Roboto"
            fontSize="15px"
            ml={6}
            sx={{ color: "rgba(0, 0, 0, 1)" }}
          >
            <ul style={{ listStyleType: "circle" }}>
              <li>Proofread to eliminate errors and inconsistencies.</li>
              <li>Have a colleague review the document.</li>
            </ul>
          </MDTypography>
          <MDTypography
            fontFamily="Roboto"
            fontSize="16px"
            mt={2}
            ml={2}
            sx={{ fontWeight: 600, color: "rgba(0, 0, 0, 1)" }}
          >
            2. Compliance:
          </MDTypography>
          <MDTypography
            fontFamily="Roboto"
            fontSize="15px"
            ml={6}
            sx={{ color: "rgba(0, 0, 0, 1)" }}
          >
            <ul style={{ listStyleType: "circle" }}>
              <li>Ensure compliance with relevant laws and regulations.</li>
              <li>Avoid defamatory, libellous, or infringing content.</li>
            </ul>
          </MDTypography>
          <MDTypography fontFamily="Roboto" fontSize="15px" color="black" mt={2}>
            By following these guidelines, your press release will meet standards and effectively
            communicate your news. For questions or assistance, contact our editorial team.
          </MDTypography>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EditorialGuidelines;
