import dayjs from "dayjs";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import Transaction from "../Transaction";
import { useQuery } from "@apollo/client";
import { IGetTransactions, GET_TRANSACTIONS } from "graphql/queries/filterTransactionsPaginated";
import WalletIcon from "assets/images/account_balance_wallet.svg";

function BillingInformation({ data }: { data: any }): JSX.Element {
  const { data: transactionsData } = useQuery<IGetTransactions>(GET_TRANSACTIONS, {
    variables: {
      filterInput: {},
      paginationInput: {
        currentPage: 0,
        perPage: 200,
      },
    },
    fetchPolicy: "network-only",
  });
  console.log("transactionsData", transactionsData);

  return (
    <Card id="delete-account">
      <MDBox pt={3} px={2}>
        <MDTypography variant="h6" fontWeight="medium">
          Wallet
        </MDTypography>
      </MDBox>
      <MDBox pt={1} pb={2} px={2}>
        <MDBox component="ul" display="flex" flexDirection="column" p={0} m={0}>
          <MDBox
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
            alignItems="flex-start"
            bgColor={"grey-100"}
            borderRadius="lg"
            p={3}
            mb={1}
            mt={2}
          >
            <MDBox display="flex" alignItems="center" justifyContent="space-between" width={"100%"}>
              <MDBox display="flex" alignItems="center">
                <MDBox
                  bgColor={"primary"}
                  color="white"
                  width="4rem"
                  height="4rem"
                  borderRadius="md"
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  shadow="md"
                  mr={2}
                >
                  <img src={WalletIcon} height={"24px"} width={"20.7"} />
                </MDBox>
                <MDTypography fontSize="16px" fontWeight="medium">
                  My Credits
                </MDTypography>
              </MDBox>
              <MDBox display="flex" alignItems="center">
                <MDTypography fontSize="24px" fontWeight="medium" color="primary">
                  {data?.getUserWallet?.balance}
                </MDTypography>
              </MDBox>
            </MDBox>
          </MDBox>
          <MDBox
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
            alignItems="flex-start"
            bgColor={"grey-100"}
            borderRadius="lg"
            p={3}
            mb={1}
            mt={2}
          >
            <MDBox mt={1} mb={2}>
              <MDTypography
                variant="caption"
                color="text"
                fontWeight="bold"
                textTransform="uppercase"
              >
                Credit history
              </MDTypography>
            </MDBox>
            <MDBox
              component="ul"
              display="flex"
              width="100%"
              maxHeight="300px"
              overflow="auto"
              flexDirection="column"
              p={0}
              m={0}
              sx={{ listStyle: "none" }}
            >
              {transactionsData?.filterTransactionsPaginated?.data?.length > 0 ? (
                transactionsData?.filterTransactionsPaginated?.data?.map((one: any, i: any) => {
                  const transactionDate = dayjs(one?.updatedAt).format(
                    "DD MMMM YYYY, [at] hh:mm A"
                  );
                  return (
                    <Transaction
                      key={i}
                      // Debits in red with a minus, credits in green with a plus
                      color={one?.status !== "SUCCESS" || one?.type === "DEBIT" ? "error" : "success"}
                      icon="add"
                      name={one?.type === "DEBIT" ? "Debit" : "Credit"}
                      description={transactionDate}
                      value={
                        one?.status === "SUCCESS"
                          ? `${one?.type === "DEBIT" ? "−" : "+"}${one?.amount}`
                          : "Failed"
                      }
                      kind={one?.kind === "ADMIN_UPDATE" ? "Admin Update" : "Wallet"}
                      note={one?.notes}
                    />
                  );
                })
              ) : (
                <MDBox m={"auto"}>
                  <MDTypography variant="h6">No data found</MDTypography>
                </MDBox>
              )}
              {/* <Transaction
                color="success"
                icon="add"
                name="Credit Recharge"
                description="26 March 2020, at 13:45 PM"
                value="750"
              /> */}
            </MDBox>
          </MDBox>
        </MDBox>
      </MDBox>
    </Card>
  );
}

export default BillingInformation;
