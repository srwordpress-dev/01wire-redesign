import { useState, useEffect } from "react";
import DataTable from "layouts/pages/pr-management/components/DataTable";
import MDBox from "components/MDBox";
import MDAvatar from "components/MDAvatar";
import MDTypography from "components/MDTypography";
import { truncateString, humanize } from "utils/helpers";
import MDCircularLoader from "components/MDCircularLoader";
import { getImageUrl } from "utils/apiConfig";

const PublicationsList = ({
  publications,
  updatePage,
  paginationInfo,
  onSelect,
  selectedP,
  loading,
  disabled = false,
  showCreditsColumn = true,
  entriesPerPage,
  setSize,
  maxHeight = "calc(100vh -14.5rem)",
}: {
  publications: any;
  updatePage?: any;
  paginationInfo?: any;
  onSelect?: any;
  selectedP?: any;
  loading?: boolean;
  disabled?: boolean;
  showCreditsColumn?: boolean;
  handlePagination?: any;
  entriesPerPage?: any;
  setSize?: any;
  maxHeight?: any;
}) => {
  const columns = [
    {
      Header: "Title",
      accessor: "logo",
      width: "10%",
      Cell: ({ value }: { value: "string" }) => (
        <MDBox mr={2}>
          <MDAvatar
            src={getImageUrl(value)}
            variant="rounded"
            size="lg"
            sx={{
              borderRadius: "4px",
            }}
          />
        </MDBox>
      ),
    },
    {
      Header: "",
      accessor: "title",
      width: "20%",
      align: "left",
      Cell: ({ value }: { value: any }) => (
        <MDBox>
          <MDTypography fontWeight="regular" sx={{ fontSize: "14px", fontFamily: "Inter" }} title={value || ""}>
            {value && truncateString(value, 15)}
          </MDTypography>
        </MDBox>
      ),
    },
    {
      Header: "Content Type",
      accessor: "categories",
      width: "30%",
      Cell: ({ value }: { value: any }) => {
        return (
          <MDBox>
            <MDTypography fontWeight="regular" sx={{ fontSize: "14px", fontFamily: "Inter" }} title={humanize(value)}>
              {value && truncateString(humanize(value), 15)}
            </MDTypography>
          </MDBox>
        );
      },
    },
    {
      Header: "Traffic",
      accessor: "traffic",
      width: "5%",
      Cell: ({ value }: { value: any }) => {
        return (
          <MDTypography fontWeight="regular" sx={{ fontSize: "14px", fontFamily: "Inter" }}>
            {value}
          </MDTypography>
        );
      },
    },

    {
      Header: "PA",
      width: "5%",
      accessor: "pa",
      Cell: ({ value }: { value: any }) => {
        return (
          <MDTypography fontWeight="regular" sx={{ fontSize: "14px", fontFamily: "Inter" }}>
            {value}
          </MDTypography>
        );
      },
    },
    {
      Header: "DA",
      width: "5%",
      accessor: "da",
      Cell: ({ value }: { value: any }) => {
        return (
          <MDTypography fontWeight="regular" sx={{ fontSize: "14px", fontFamily: "Inter" }}>
            {value}
          </MDTypography>
        );
      },
    },
    {
      Header: "UR",
      width: "5%",
      accessor: "ur",
      Cell: ({ value }: { value: any }) => {
        return (
          <MDTypography fontWeight="regular" sx={{ fontSize: "14px", fontFamily: "Inter" }}>
            {value}
          </MDTypography>
        );
      },
    },
    {
      Header: "DR",
      width: "5%",
      accessor: "dr",
      Cell: ({ value }: { value: any }) => {
        return (
          <MDTypography fontWeight="regular" sx={{ fontSize: "14px", fontFamily: "Inter" }}>
            {value}
          </MDTypography>
        );
      },
    },
    {
      Header: "Link Type",
      width: "10%",
      accessor: "linkType",
      Cell: ({ value }: { value: any }) => {
        return (
          <MDTypography fontWeight="regular" sx={{ fontSize: "14px", fontFamily: "Inter" }}>
            {humanize(value) || "-"}
          </MDTypography>
        );
      },
    },

    ...(showCreditsColumn
      ? [
          {
            Header: "Credits",
            width: "10%",
            accessor: "credits",
            Cell: ({ value }: { value: any }) => (
              <MDTypography fontWeight="regular" sx={{ fontSize: "14px", fontFamily: "Inter" }}>
                {value}
              </MDTypography>
            ),
          },
        ]
      : []),
  ];
  const [tableData, setData] = useState<any>({ rows: [], columns: [] });
  useEffect(() => {
    let rows: any = [];
    if (publications?.length) {
      rows = publications?.map((one: any) => {
        return {
          id: one?.id,
          logo: one?.logo || one?.image,
          title: one?.title,
          categories: one?.categories || one?.categories?.join("/"),
          traffic: one?.traffic || one?.stats?.traffic,
          pa: one?.pa || one?.stats?.pa,
          da: one?.da || one?.stats?.da,
          ur: one?.ur || one?.stats?.ur,
          dr: one?.dr || one?.stats?.dr,
          linkType: one?.linkType?.split("_")?.join(" "),
          credits: one?.credits || one?.price,
        };
      });
      setData({ rows, columns });
    }
  }, [publications]);
  const handlePagination = (page: number) => {
    updatePage(page);
  };

  return (
    <MDBox sx={{ minHeight: "100px" }}>
      {loading ? (
        <MDCircularLoader startLoader />
      ) : publications?.length > 0 ? (
        <DataTable
          canSearch
          table={tableData}
          showHeader
          paginationInfo={!disabled && paginationInfo}
          handlePagination={!disabled && handlePagination}
          onSelectedRowsChange={onSelect}
          defaultSelectedRows={selectedP}
          maxHeight={maxHeight}
          entriesPerPage={entriesPerPage}
          setSize={setSize}
        />
      ) : (
        <MDBox sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <MDTypography variant="h6">No publications found</MDTypography>
        </MDBox>
      )}
    </MDBox>
  );
};
export default PublicationsList;
