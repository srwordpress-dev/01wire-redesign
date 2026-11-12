/* eslint-disable react/prop-types */
import { TableCell as MuiTableCell } from "@mui/material";
import MDTypography from "components/MDTypography";
import MDBox from "components/MDBox";
import { truncateString } from "utils/helpers";
import DeleteIcon from "assets/images/icons/deleteIcon.svg";
import EditIcon from "assets/images/icons/editIcon.svg";
import ViewIcon from "assets/images/icons/viewIcon.svg";
import RowAction from "components/RowAction";
import FBIcon from "assets/images/FB.svg";
import InstaIcon from "assets/images/insta.svg";
import TwitterIcon from "assets/images/twitter.svg";
import YtIcon from "assets/images/yt.svg";
import LinkedInIcon from "assets/images/LinkedIn.svg";
import MDAvatar from "components/MDAvatar";
import Link from "@mui/material/Link";
import { getImageUrl } from "utils/apiConfig";

const SocialMediaLink = ({ url, Icon }) => {
  return (
    <Link
      sx={{
        cursor: "pointer",
        "& img": {
          filter: !url ? "grayscale(100%)" : "none",
        },
      }}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
    >
      <img src={Icon} height="36px" width="36px" alt="facebookIcon" />
    </Link>
  );
};

export const makeColumns = (handleAction) => {
  const columns = [
    {
      Header: "Title",
      accessor: "logo",
      width: "10%",
      Cell: ({ value }) => {
        return (
          <MDBox mr={2}>
            <MDAvatar
              src={value && getImageUrl(value)}
              variant="rounded"
              size="xl"
              sx={{
                width: "127px",
                height: "53px",
                borderRadius: "4px",
              }}
            />
          </MDBox>
        );
      },
    },
    {
      Header: "",
      accessor: "title",
      width: "30%",
      align: "left",
      Cell: ({ value }) => {
        return (
          <MDBox>
            <MDTypography sx={{ fontSize: "14px", fontWeight: "400" }}>
              {truncateString(value, 25)}
            </MDTypography>
          </MDBox>
        );
      },
    },
    {
      Header: "Social Media",
      accessor: "social",
      width: "50%",
      Cell: ({ value = {} }) => {
        console.log("value", value);
        const { facebook, instagram, twitter, youtube, linkedIn } = value || {};
        return (
          <MDBox display="flex" alignItems="center" justifyContent="space-between" width={"250px"}>
            <SocialMediaLink url={facebook} Icon={FBIcon} />
            <SocialMediaLink url={linkedIn} Icon={LinkedInIcon} />
            <SocialMediaLink url={twitter} Icon={TwitterIcon} />
            <SocialMediaLink url={instagram} Icon={InstaIcon} />
            <SocialMediaLink url={youtube} Icon={YtIcon} />
          </MDBox>
        );
      },
    },
    {
      Header: "Action",
      accessor: "actions",
      width: "10%",
      align: "right",
      sticky: true,
      Cell: ({ value, row }) => (
        <MDBox
          sx={{
            display: "flex",
          }}
        >
          <>
            <RowAction
              label="View"
              icon={ViewIcon}
              onClick={() => handleAction(row?.original?.id, "view")}
            />
            <RowAction
              label="Edit"
              icon={EditIcon}
              onClick={() => handleAction(row?.original?.id, "edit")}
            />
            <RowAction
              label="Delete"
              icon={DeleteIcon}
              onClick={() => handleAction(row?.original?.id, "delete")}
            />
          </>
        </MDBox>
      ),
    },
  ];

  return columns;
};
