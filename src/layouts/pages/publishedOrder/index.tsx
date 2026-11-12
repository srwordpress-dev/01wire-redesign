import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { useNavigate, useParams } from "react-router-dom";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDAvatar from "components/MDAvatar";
import MDCircularLoader from "components/MDCircularLoader";
import DataTable from "examples/Tables/DataTable";
import { useQuery } from "@apollo/client";
import {
  GET_ARTICLES,
  IGetArticles,
  IGetArticlesVars,
} from "graphql/queries/filterArticlesPaginated";
import TiltArrowIcon from "assets/images/TiltArrow.svg";
import { ActionsCellRenderer } from "utils/helpers";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { getImageUrl } from "utils/apiConfig";

const columns = [
  {
    Header: "Title",
    accessor: "image",
    width: "15%",
    Cell: ({ value }: { value: any }) => (
      <MDBox>
        <MDAvatar
          src={value && getImageUrl(value)}
          variant="rounded"
          size="xxl"
          sx={{
            borderRadius: "4px",
          }}
        />
      </MDBox>
    ),
  },
  {
    accessor: "title",
    width: "20%",
    Cell: ({ value }: { value: string }) => <MDTypography fontSize="16px">{value}</MDTypography>,
  },
  {
    Header: "Username",
    accessor: "username",
    width: "10%",
    Cell: ({ value }: { value: string }) => <MDTypography fontSize="16px">{value}</MDTypography>,
  },
  {
    Header: "Bundle Type",
    accessor: "bundleType",
    width: "15%",
    Cell: ({ value }: { value: string }) => <MDTypography fontSize="16px">{value}</MDTypography>,
  },
  {
    Header: "Submit Date",
    accessor: "submitDate",
    width: "15%",
    Cell: ({ value }: { value: string }) => (
      <MDTypography fontSize="16px">{dayjs(value).format("DD MMM YYYY")}</MDTypography>
    ),
  },
  {
    Header: "Last Date",
    accessor: "lastDate",
    width: "10%",
    Cell: ({ value }: { value: string }) => (
      <MDTypography fontSize="16px">{dayjs(value).format("DD MMM YYYY")}</MDTypography>
    ),
  },
  {
    Header: "Check",
    accessor: "actions",
    width: "15%",
    Cell: ({ value }: { value: any }) => <ActionsCellRenderer actions={value} />,
  },
];

const PublishedOrders = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data, loading, refetch } = useQuery<IGetArticles, IGetArticlesVars>(GET_ARTICLES, {
    variables: {
      filterInput: {
        status: "PUBLISHED",
      },
      paginationInput: {
        currentPage: 0,
        perPage: 200,
      },
    },
    fetchPolicy: "network-only",
  });
  const [tableData, setData] = useState<any>({ rows: [], columns });
  const [loader, setLoader] = useState<boolean>(false);
  const [openForm, setOpenForm] = useState<any>(id || false);
  useEffect(() => {
    setLoader(true);
    const articles = data?.filterArticlesPaginated?.data;
    let rows: any = [];
    if (articles?.length) {
      rows = articles?.map((one) => {
        return {
          image: one?.featureImage,
          title: one?.title,
          username: "test",
          bundleType: one?.bundleInfo?.[0]?.type,
          submitDate: one?.publishAt,
          lastDate: one?.updatedAt,
          actions: [
            {
              imgIcon: TiltArrowIcon,
              height: "16px",
              width: "16px",
              label: "Edit",
              //   onClick: () => {
              //     navigate(`/publications/${one?.id}`);
              //     setOpenForm(one?.id);
              //   },
            },
          ],
        };
      });
    }
    setData({ rows, columns });
    setLoader(false);
  }, [data]);
  return (
    <>
      <DashboardNavbar />
      <MDBox px={2}>
        {!openForm && (
          <MDBox pt={2} display="flex" alignItems="center" justifyContent="space-between">
            <MDTypography fontWeight="bold" fontSize="20px">
              Published Order
            </MDTypography>
          </MDBox>
        )}
        <MDBox pt={openForm ? 3 : 2} pb={3}>
          <Card sx={{ minHeight: "300px" }}>
            {loading || loader ? (
              <MDCircularLoader overlayloader startLoader />
            ) : tableData?.rows?.length ? (
              <DataTable canSearch table={tableData} />
            ) : (
              <MDBox m={"auto"}>
                <MDTypography variant="h6">No data found</MDTypography>
              </MDBox>
            )}
          </Card>
        </MDBox>
      </MDBox>
    </>
  );
};
export default PublishedOrders;
