import { useEffect } from "react";
import { toast } from "react-toastify";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Card from "@mui/material/Card";
// Material Dashboard 2 PRO React TS components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDCircularLoader from "components/MDCircularLoader";
// Material Dashboard 2 PRO React TS examples components
import ReleaseForm from "./components/ReleaseForm";
// Data
import { useState } from "react";
import { useQuery, useMutation, useLazyQuery } from "@apollo/client";
import {
  GET_ARTICLES,
  IGetArticles,
  IGetArticlesVars,
} from "graphql/queries/filterArticlesPaginated";
import { GET_CLIENTS, IGetClientsVars, IGetClients } from "graphql/queries/filterClientsPaginated";
import { DELETE_ARTICLE, IDeleteArticleVars } from "graphql/mutations/deleteArticle";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { CRUMB_ARTICLE } from "examples/Navbars/DashboardNavbar/useRecordCrumb";
import MDButton from "components/MDButton";
import DataTable from "../pr-management/components/DataTable";
import NoteModal from "../pr-management/components/NoteModal";
import { makeColumns } from "./components/makeColumns";
import Filters from "./components/Filters";
import {
  UPDATE_ARTICLE_STATUS,
  IUpdateArticleStatusVars,
} from "graphql/mutations/updateArticleStatus";
import ArticleBundleModal from "./components/ArticleBundleModal";
import MessageModal from "./components/MessageModal";
import DeleteModal from "examples/DeleteModal";
import { statusOptions } from "constants/index";

const PER_PAGE = 10;
function Releases(): JSX.Element {
  const { id } = useParams();
  // Is the PR in the URL real? (same small query as the breadcrumb, so one request)
  const articleCheck = useQuery(CRUMB_ARTICLE, { variables: { id }, skip: !id });
  const navigate = useNavigate();
  const location = useLocation();
  const estimation = location?.state?.estimation;
  const PRStatus = location?.state?.status;
  // Set by the dashboard "Add PR" quick action
  const openAdd = location?.state?.openForm;
  const selectedStatus = statusOptions?.filter((one) => one?.value === PRStatus);
  const [loader, setLoader] = useState<boolean>(false);
  const [openForm, setOpenForm] = useState<any>((estimation && true) || openAdd || id || false);
  const [tableData, setData] = useState<any>({ rows: [], columns: [] });
  const [filters, setFilters] = useState<any>(PRStatus ? { status: selectedStatus } : {});
  const [paginationInfo, setPaginationInfo] = useState<any>({});
  const [initLoading, setInitLoader] = useState<boolean>(false);
  const [noteModal, setNoteModal] = useState<any>(null);
  const [viewModal, setViewModal] = useState<any>(null);
  const [open, setOpen] = useState<any>(false);
  const [deleteConf, setDeleteConf] = useState<any>(false);
  const [pageSize, setSize] = useState<number>(10);
  const [updateArticleStatus] = useMutation<IUpdateArticleStatusVars>(UPDATE_ARTICLE_STATUS);
  const [deleteArticle] = useMutation<IDeleteArticleVars>(DELETE_ARTICLE);

  const [getArticles, { data: articlesData, loading, refetch }] = useLazyQuery<
    IGetArticles,
    IGetArticlesVars
  >(GET_ARTICLES, {
    // skip: !!id,
    fetchPolicy: "network-only",
  });
  // Derived from the query result (replaces the deprecated onCompleted option)
  useEffect(() => {
    if (!articlesData) return;
    setPaginationInfo(articlesData?.filterArticlesPaginated?.paginationInfo);
  }, [articlesData]);
  const { data: clientsData } = useQuery<IGetClients, IGetClientsVars>(GET_CLIENTS, {
    variables: {
      filterInput: {},
      paginationInput: {
        currentPage: 0,
        perPage: 200,
      },
    },
  });
  const clientsOptions: any = clientsData?.filterClientsPaginated?.data?.map((el) => ({
    label: el?.title,
    value: el?.id,
  }));
  if (clientsOptions?.length) {
    clientsOptions.push({
      label: "None",
      value: "",
    });
  }
  const getStatusArr = (arr: any) => {
    if (!arr?.length) return [];
    return arr?.map((one: any) => one?.value);
  };
  const buildFilterInput = () => {
    const status = getStatusArr(filters?.status);
    const filterInput = { ...filters, status };
    if (!filterInput?.status?.length) {
      delete filterInput.status;
    }
    return filterInput;
  };
  // Single fetch for filter and page-size changes so a page-size change keeps the active filters
  useEffect(() => {
    setInitLoader(true);
    getArticles({
      variables: {
        paginationInput: {
          perPage: pageSize,
          currentPage: 0,
        },
        filterInput: buildFilterInput(),
      },
    })
      .then(() => setInitLoader(false))
      .catch(() => setInitLoader(false));
  }, [filters, pageSize]);

  const handleUpdateStatus = (row: any, status: string, notes?: string) => {
    const id = row?.original?.id;
    if (status === "AWAITING_APPROVAL" && !notes) {
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
      .catch((err: any) => {
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
  const handleDelete = (id: string) => {
    if (!id) return;
    setLoader(true);
    deleteArticle({
      variables: {
        id,
      },
    })
      .then((res) => {
        setLoader(false);
        refetch();
        toast.success("Deleted Successfully.");
      })
      .catch((err) => {
        toast.error(err?.message);
        setLoader(false);
      });
  };
  const handleAction = (id: string, action: string, row: string) => {
    if (action === "edit") {
      navigate(`/releases/${id}`);
      setOpenForm(id);
    } else if (action === "view") {
      setViewModal(id);
    } else if (action === "navigate") {
      navigate(`/download-report/${id}`);
    } else if (action === "delete") {
      setDeleteConf(id);
    }
  };
  useEffect(() => {
    const rows = articlesData?.filterArticlesPaginated?.data || [];
    const columns = makeColumns(handleAction, handleUpdateStatus, setOpen);
    setData({ rows, columns });
  }, [articlesData]);

  useEffect(() => {
    if (location?.pathname === "/releases" && !estimation && !openAdd) {
      setOpenForm(false);
    }
  }, [id]);

  // Consume the quick-action flag so a refresh or Back doesn't reopen the form
  useEffect(() => {
    if (openAdd) navigate(location.pathname, { replace: true, state: null });
  }, []);

  const handlePagination = (page: number) => {
    getArticles({
      variables: {
        paginationInput: {
          perPage: pageSize,
          currentPage: page,
        },
        filterInput: buildFilterInput(),
      },
    });
  };

  return (
    <>
      {loader && <MDCircularLoader overlayloader startLoader />}

      <DashboardNavbar text="Add PR" onsubmit={!openForm && (() => setOpenForm(true))} />
      <MDBox px={2}>
        {!openForm && (
          <>
            <Filters
              setFilters={setFilters}
              handleFilters={handleFilters}
              filters={filters}
              clientsOptions={clientsOptions}
            />
          </>
        )}
        <MDBox pt={openForm ? 6 : 2} sx={{ minHeight: "520px" }}>
          {initLoading || loading ? (
            <Card sx={{ minHeight: "300px" }}>
              <MDCircularLoader overlayloader startLoader />
            </Card>
          ) : id && articleCheck.called && !articleCheck.loading && !articleCheck.data?.getArticleById ? (
            // A wrong or old link: say so instead of showing an empty PR form
            <Card sx={{ minHeight: "300px" }} data-testid="pr-not-found">
              <MDBox m="auto" textAlign="center" p={4}>
                <MDTypography variant="h5">This press release wasn't found</MDTypography>
                <MDTypography fontSize="14px" color="text" mt={1} mb={3}>
                  The link may be wrong, or the press release was deleted.
                </MDTypography>
                <MDButton color="primary" onClick={() => { setOpenForm(false); navigate("/releases"); }}>
                  Back to Press Releases
                </MDButton>
              </MDBox>
            </Card>
          ) : openForm ? (
            <Card sx={{ minHeight: "300px" }}>
              <ReleaseForm
                idVal={openForm}
                onClose={() => {
                  setOpenForm(false);
                  navigate("/releases");
                }}
                refetch={refetch}
              />
            </Card>
          ) : tableData?.rows?.length ? (
            <MDBox>
              <DataTable
                handlePagination={handlePagination}
                canSearch
                table={tableData}
                showHeader
                loading={loading}
                paginationInfo={paginationInfo || {}}
                entriesPerPage={{ defaultValue: pageSize }}
                setSize={setSize}
                maxHeight="calc(100vh - 14rem)"
              />
            </MDBox>
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
      {deleteConf && (
        <DeleteModal
          onClose={() => setDeleteConf(null)}
          handleSubmit={() => {
            handleDelete(deleteConf);
            setDeleteConf(null);
          }}
        />
      )}
    </>
  );
}

export default Releases;
