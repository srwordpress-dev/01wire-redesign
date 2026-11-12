import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDCircularLoader from "components/MDCircularLoader";
import DataTable from "./components/DataTable";
import { useMutation, useLazyQuery } from "@apollo/client";
import {
  GET_ARTICLES,
  IGetArticles,
  IGetArticlesVars,
} from "graphql/queries/filterArticlesPaginated";
import PRDetail from "./components/PRDetail";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { makeColumns } from "./components/makeColumns";
import {
  UPDATE_ARTICLE_STATUS,
  IUpdateArticleStatusVars,
} from "graphql/mutations/updateArticleStatus";
import NoteModal from "./components/NoteModal";
import Filters from "./components/Filters";
import { useLocation, useNavigate } from "react-router-dom";
import ArticleBundleModal from "../releases/components/ArticleBundleModal";
import MessageModal from "../releases/components/MessageModal";
import RejectPR from "./components/RejectPRModal";

const PER_PAGE = 10;

const PRManagement = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const uEmail = queryParams.get("email") || "";
  const uId = queryParams.get("userID") || "";

  const [filters, setFilters] = useState<any>({});
  const [paginationInfo, setPaginationInfo] = useState<any>({});
  const [updateArticleStatus] = useMutation<IUpdateArticleStatusVars>(UPDATE_ARTICLE_STATUS);
  const [getArticles, { data, loading, refetch }] = useLazyQuery<IGetArticles, IGetArticlesVars>(
    GET_ARTICLES,
    {
      fetchPolicy: "network-only",
    }
  );
  // Derived from the query result (replaces the deprecated onCompleted option)
  useEffect(() => {
    if (!data) return;
    setPaginationInfo(data?.filterArticlesPaginated?.paginationInfo);
  }, [data]);

  const [loader, setLoader] = useState<boolean>(false);
  const [initLoading, setInitLoader] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [options, setOptions] = useState<any>([]);
  const [noteModal, setNoteModal] = useState<any>(null);
  const [viewModal, setViewModal] = useState<any>(null);
  const [openForm, setOpenForm] = useState<any>(id || false);
  const [articleStatus, setStatus] = useState<any>(null);
  const [pageSize, setSize] = useState<number>(10);
  const [tableData, setData] = useState<any>({ rows: [], columns: [] });
  const getStatusArr = (arr: any) => {
    if (!arr?.length) return [];
    return arr?.map((one: any) => one?.value);
  };
  const [open, setOpen] = useState<any>(false);

  useEffect(() => {
    if (uId && uEmail) {
      setOptions([
        {
          userId: uId,
          email: uEmail,
        },
      ]);
      setEmail(uEmail);
      setFilters({
        ...filters,
        userId: uId,
      });
    }
  }, [uEmail, uId]);

  useEffect(() => {
    setInitLoader(true);
    const status = getStatusArr(filters?.status);
    const filterInput = { ...filters, status };
    if (!filterInput?.status?.length) {
      delete filterInput.status;
    }
    getArticles({
      variables: {
        paginationInput: {
          perPage: pageSize,
          currentPage: 0,
        },
        filterInput,
      },
    })
      .then(() => setInitLoader(false))
      .catch(() => setInitLoader(false));
  }, [pageSize]);

  useEffect(() => {
    if (filters) {
      const status = getStatusArr(filters?.status);
      const filterInput = { ...filters, status };
      if (!filterInput?.status?.length) {
        delete filterInput.status;
      }
      getArticles({
        variables: {
          paginationInput: {
            perPage: pageSize,
            currentPage: 0,
          },
          filterInput,
        },
      });
    }
  }, [filters]);

  const handleUpdateStatus = (row: any, status: string, notes?: string) => {
    const id = row?.original?.id;
    if (["AWAITING_APPROVAL", "REJECTED"].includes(status) && !notes) {
      setNoteModal({ ...row, status });
      return;
    }
    setLoader(true);
    updateArticleStatus({
      variables: {
        params: {
          id,
          status,
          notes,
        },
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

  const handleFilters = (key: string, val: any) => {
    setFilters({
      ...filters,
      [key]: val,
    });
  };

  const handleAction = (id: string, action: string, row?: any) => {
    if (action === "edit") {
      navigate(`/pr-management/${id}`);
      setOpenForm(id);
      setStatus(row?.status);
    } else if (action === "navigate") {
      window.open(`/download-report/${id}`, "_blank", "noopener,noreferrer");
    } else if (action === "view") {
      setViewModal(id);
    }
  };

  useEffect(() => {
    setLoader(true);
    const articles = data?.filterArticlesPaginated?.data;
    const rows: any = articles || [];
    const columns = makeColumns(
      handleAction,
      handleUpdateStatus,
      handleFilters,
      setEmail,
      setOptions,
      filters,
      setOpen
    );

    setData({ rows, columns });
    setLoader(false);
  }, [data]);

  const handlePagination = (page: number) => {
    const status = getStatusArr(filters?.status);
    const filterInput = { ...filters, status };
    if (!filterInput?.status?.length) {
      delete filterInput.status;
    }
    getArticles({
      variables: {
        paginationInput: {
          perPage: pageSize,
          currentPage: page,
        },
        filterInput,
      },
    });
  };
  useEffect(() => {
    if (location?.pathname === "/pr-management") {
      setOpenForm(false);
    }
  }, [id, location]);
  return (
    <>
      {loader && <MDCircularLoader overlayloader startLoader />}
      <DashboardNavbar />
      <MDBox sx={{ display: "flex", flexDirection: "column" }}>
        {!openForm && (
          <>
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

        <MDBox px={2} pt={openForm ? 3 : 2} sx={{ flex: 1 }}>
          {initLoading ? (
            <Card sx={{ minHeight: "300px" }}>
              <MDCircularLoader overlayloader startLoader />
            </Card>
          ) : openForm ? (
            <Card sx={{ minHeight: "300px" }}>
              <PRDetail
                onClose={() => {
                  setOpenForm(false);
                  refetch();
                }}
                refetch={refetch}
                id={openForm}
                articleStatus={articleStatus}
              />
            </Card>
          ) : loading || !!data?.filterArticlesPaginated?.data?.length ? (
            <Box
              sx={{
                flex: 1,
                // height: "70vh",
              }}
            >
              <DataTable
                handlePagination={handlePagination}
                canSearch
                table={tableData}
                showHeader
                loading={loading}
                setSize={setSize}
                paginationInfo={paginationInfo || {}}
                entriesPerPage={{ defaultValue: pageSize }}
                maxHeight="calc(100vh - 15rem)"
              />
            </Box>
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
          onClose={() => setNoteModal(null)}
          handleSubmit={(note: string) => {
            handleUpdateStatus(noteModal, noteModal.status, note);
            setNoteModal(null);
          }}
        />
      )}
      {viewModal && <ArticleBundleModal onClose={() => setViewModal(null)} articleId={viewModal} />}
      {open && <MessageModal message={open} onClose={() => setOpen(false)} />}
    </>
  );
};
export default PRManagement;
