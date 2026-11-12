/* eslint-disable react/prop-types */
import MDTypography from "components/MDTypography";
import MDBox from "components/MDBox";
import NavigateIcon from "assets/images/icons/navigateIcon.svg";
import WalletIcon from "assets/images/wallet.svg";
import ViewIcon from "assets/images/icons/viewIcon.svg";
import RowAction from "components/RowAction";

export const makeColumns = (navigate, setOpen, setViewUser) => {
  const columns = [
    {
      Header: "User Email",
      accessor: "email",
      align: "left",
      width: "25%",
      Cell: ({ value, row }) => (
        <MDBox display="flex" alignItems="center" gap={1}>
          <MDTypography sx={{ fontSize: "14px", fontWeight: "400" }}>{value}</MDTypography>
          {row?.original?.type === "ADMIN" && (
            <MDBox
              data-testid="user-admin-tag"
              title="This is an admin account"
              px={1}
              sx={{
                border: "1px solid #ee5c61",
                borderRadius: "6px",
                color: "#ee5c61",
                fontSize: "12px",
                fontWeight: 700,
                lineHeight: "20px",
              }}
            >
              Admin
            </MDBox>
          )}
        </MDBox>
      ),
    },
    {
      Header: "User Name",
      accessor: "fullName",
      width: "25%",
      Cell: ({ value }) => (
        <MDBox>
          <MDTypography sx={{ fontSize: "14px", fontWeight: "400" }}>{value}</MDTypography>
        </MDBox>
      ),
    },
    {
      Header: "Wallet Balance",
      accessor: "walletInfo.balance",
      width: "25%",
      // No wallet yet = 0 credits (was an empty cell)
      Cell: ({ value }) => (
        <MDBox>
          <MDTypography sx={{ fontSize: "14px", fontWeight: "400" }}>{value ?? 0}</MDTypography>
        </MDBox>
      ),
    },
    // {
    //   Header: "Total PR",
    //   accessor: "totalPR",
    //   width: "20%",
    //   Cell: ({ value }) => (
    //     <MDBox>
    //       <MDTypography sx={{ fontSize: "14px", fontWeight: "400" }}>10</MDTypography>
    //     </MDBox>
    //   ),
    // },
    {
      Header: "Action",
      align: "right",
      sticky: true,
      width: "25%",
      Cell: ({ value, row }) => {
        return (
          <MDBox
            sx={{
              display: "flex",
            }}
          >
            <RowAction
              label="View details"
              icon={ViewIcon}
              onClick={() => setViewUser(row?.original)}
            />
            <RowAction
              label="Update wallet"
              icon={WalletIcon}
              onClick={() => setOpen(row?.original?.id)}
            />
            <RowAction
              label="View user's PRs"
              icon={NavigateIcon}
              onClick={() =>
                navigate(`/pr-management?userID=${row.original.id}&email=${row.original.email}`)
              }
            />
          </MDBox>
        );
      },
    },
  ];

  return columns;
};
