import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { useNavigate, useParams } from "react-router-dom";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDCircularLoader from "components/MDCircularLoader";
import { useLazyQuery, useMutation } from "@apollo/client";
import { GET_ORDERS, IGetOrders, IGetOrdersVars } from "graphql/queries/filterOrdersPaginated";
import OrderDetail from "./components/orderDetail";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import DataTable from "../pr-management/components/DataTable";
import Filters from "./components/Filters";
import PaymentsReview from "./components/PaymentsReview";
import { makeColumns } from "./components/makeColumns";
import ArticleBundleModal from "../releases/components/ArticleBundleModal";
import NoteModal from "../pr-management/components/NoteModal";
import { UPDATE_ORDER_STATUS, IUpdateOrderStatusVars } from "graphql/mutations/updateOrderStatus";
import { toast } from "react-toastify";
import DetailsModal from "examples/DetailsModal";
import { statusOptions } from "../pr-management/components/makeColumns";

const PER_PAGE = 10;
const OrderManagement = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [tableData, setData] = useState<any>({ rows: [], columns: [] });
  const [loader, setLoader] = useState<boolean>(false);
  const [openForm, setOpenForm] = useState<any>(id || false);
  const [initLoading, setInitLoader] = useState<boolean>(false);
  const [paginationInfo, setPaginationInfo] = useState<any>({});
  const [filters, setFilters] = useState<any>({
    status: "PENDING",
  });
  const [email, setEmail] = useState<string>("");
  const [options, setOptions] = useState<any>([]);
  const [noteModal, setNoteModal] = useState<any>(null);
  const [viewModal, setViewModal] = useState<any>(null);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [pageSize, setSize] = useState<number>(10);

  const [getOrders, { data, loading, refetch }] = useLazyQuery<IGetOrders, IGetOrdersVars>(
    GET_ORDERS,
    {
      fetchPolicy: "network-only",
    }
  );
  // Derived from the query result (replaces the deprecated onCompleted option)
  useEffect(() => {
    if (!data) return;
    setPaginationInfo(data?.filterOrdersPaginated?.paginationInfo);
  }, [data]);
  const [updateArticleStatus] = useMutation<IUpdateOrderStatusVars>(UPDATE_ORDER_STATUS);

  useEffect(() => {
    setInitLoader(true);
    getOrders({
      variables: {
        paginationInput: {
          perPage: pageSize,
          currentPage: 0,
        },
        filterInput: {
          ...filters,
        },
      },
    })
      .then(() => setInitLoader(false))
      .catch(() => setInitLoader(false));
  }, [pageSize]);

  useEffect(() => {
    if (filters) {
      getOrders({
        variables: {
          paginationInput: {
            perPage: pageSize,
            currentPage: 0,
          },
          filterInput: {
            ...filters,
          },
        },
      });
    }
  }, [filters]);

  useEffect(() => {
    const rows = data?.filterOrdersPaginated?.data || [];
    const columns = makeColumns(handleAction, handleFilters, setEmail, setOptions, filters);
    setData({ rows, columns });
  }, [data]);

  const handleFilters = (key: string, val: any) => {
    let updatedFilters = { ...filters };
    if (val) {
      updatedFilters = {
        ...updatedFilters,
        [key]: val,
      };
    } else {
      delete updatedFilters?.[key];
    }
    setFilters(updatedFilters);
  };

  const handleAction = (id: string, action: string, row?: any) => {
    if (action === "details") {
      setOrderDetails(row);
    } else if (action === "edit") {
      setOpenForm(id);
    } else if (action === "view") {
      setViewModal(id);
    } else if (action === "navigate") {
      navigate(`/download-report/${id}`);
    } else if (action === "note") {
      setNoteModal({ id });
    } else if (action === "view-article") {
      navigate(`/pr-management/${id}`);
    }
  };

  const handleUpdateStatus = (row: any, status: string, notes?: string) => {
    const id = row?.id;
    let params: any = {
      id,
      status,
    };
    if (status === "PUBLISHED") {
      params = { ...params, url: notes };
    } else {
      params = { ...params, notes };
    }
    setLoader(true);
    updateArticleStatus({
      variables: {
        params,
      },
    })
      .then(() => {
        setLoader(false);
        refetch();
        toast.success("Status Updated successfully");
      })
      .catch((err) => {
        toast.error(err?.message);
        setLoader(false);
      });
  };

  const handlePagination = (page: number) => {
    getOrders({
      variables: {
        paginationInput: {
          perPage: pageSize,
          currentPage: page,
        },
        filterInput: {
          ...filters,
        },
      },
    });
  };
  return (
    <>
      <DashboardNavbar />
      <MDBox px={2}>
        {!openForm && (
          <>
            <PaymentsReview />
            <Filters
              setFilters={setFilters}
              email={email}
              setEmail={setEmail}
              handleFilters={handleFilters}
              filters={filters}
              options={options}
              setOptions={setOptions}
            />
          </>
        )}
        <MDBox pt={openForm ? 3 : 2} pb={3}>
          {initLoading ? (
            <Card sx={{ minHeight: "300px" }}>
              <MDCircularLoader overlayloader startLoader />
            </Card>
          ) : openForm ? (
            <Card sx={{ minHeight: "300px" }}>
              <OrderDetail onClose={() => setOpenForm(false)} refetch={refetch} id={openForm} />
            </Card>
          ) : loading || !!data?.filterOrdersPaginated?.data?.length ? (
            <DataTable
              handlePagination={handlePagination}
              table={tableData}
              showHeader
              loading={loading}
              paginationInfo={paginationInfo || {}}
              entriesPerPage={{ defaultValue: pageSize }}
              setSize={setSize}
              maxHeight="calc(100vh - 14rem)"
            />
          ) : (
            <Card sx={{ minHeight: "300px" }}>
              <MDBox m={"auto"}>
                <MDTypography variant="h6">No data found</MDTypography>
              </MDBox>
            </Card>
          )}
        </MDBox>
      </MDBox>
      {noteModal && (
        <NoteModal
          orderPage
          onClose={(note?: string) => {
            if (note && typeof note === "string") {
              handleUpdateStatus(noteModal, "REJECTED", note);
            }
            setNoteModal(null);
          }}
          handleSubmit={(note: string) => {
            handleUpdateStatus(noteModal, "PUBLISHED", note);
            setNoteModal(null);
          }}
        />
      )}
      {viewModal && <ArticleBundleModal onClose={() => setViewModal(null)} articleId={viewModal} />}
      {orderDetails && (
        <DetailsModal
          title="Order Details"
          onClose={() => setOrderDetails(null)}
          rows={[
            { label: "PR ID", value: orderDetails?.prId },
            { label: "Release", value: orderDetails?.articleInfo?.title },
            { label: "User", value: orderDetails?.user?.email },
            {
              label: "Publication / Bundle",
              value: orderDetails?.publicationInfo?.title ||
                orderDetails?.bundleInfo?.name ||
                orderDetails?.bundleInfo?.type,
            },
            ...(orderDetails?.bundleInfo?.name && !orderDetails?.publicationInfo
              ? [
                  {
                    label: "Package media",
                    value:
                      (orderDetails.bundleInfo.media || []).map((m: any) => m.name).join(", ") +
                      (orderDetails.bundleInfo.coverage ? ` (+ ${orderDetails.bundleInfo.coverage})` : ""),
                  },
                  {
                    label: "Vendor",
                    value: [orderDetails.bundleInfo.vendor, orderDetails.bundleInfo.vendorPackageName]
                      .filter(Boolean)
                      .join(" · ") || "-",
                  },
                ]
              : []),
            {
              label: "Status",
              value:
                statusOptions.find((el: any) => el?.value === orderDetails?.status)?.label ||
                orderDetails?.status,
            },
            {
              label: "Publish by",
              value: orderDetails?.publishBy && dayjs(orderDetails.publishBy).format("DD MMM YYYY"),
            },
            {
              label: "Published URL",
              value: orderDetails?.url && (
                <a href={orderDetails.url} target="_blank" rel="noopener noreferrer">
                  {orderDetails.url}
                </a>
              ),
            },
            { label: "Notes", value: orderDetails?.notes },
            {
              label: "Ordered on",
              value: orderDetails?.createdAt && dayjs(orderDetails.createdAt).format("DD MMM YYYY"),
            },
          ]}
        />
      )}
    </>
  );
};
export default OrderManagement;
