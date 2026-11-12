import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import MDCircularLoader from "components/MDCircularLoader";
import { useLazyQuery, useMutation } from "@apollo/client";
import { GET_BUNDLES, IGetBundles, IGetBundlesVars } from "graphql/queries/filterBundlesPaginated";
import BundleForm from "./components/BundleForm";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { makeColumns } from "./components/makeColumns";
import DataTable from "../pr-management/components/DataTable";
import DeleteModal from "examples/DeleteModal";
import { DELETE_BUNDLE, IDeleteBundleVars } from "graphql/mutations/deleteBundle";
import {
  UPDATE_BUNDLE_VISIBILITY,
  IUpdateBundleVisVars,
} from "graphql/mutations/updateBundleVisibility";

const PER_PAGE = 10;

const Bundles = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [tableData, setData] = useState<any>({ rows: [], columns: [] });
  const [paginationInfo, setPaginationInfo] = useState<any>({});
  const [loader, setLoader] = useState<boolean>(false);
  const [openForm, setOpenForm] = useState<any>(id || false);
  const [viewOnly, setViewOnly] = useState<boolean>(false);
  const [deleteConf, setDeleteConf] = useState<any>(null);
  const [pageSize, setSize] = useState<number>(10);
  const [deleteBundle, { loading: deleteLoader }] = useMutation<IDeleteBundleVars>(DELETE_BUNDLE);
  const [updateVisibility, { loading: updateLoader }] =
    useMutation<IUpdateBundleVisVars>(UPDATE_BUNDLE_VISIBILITY);

  const [getBundles, { data, loading, refetch }] = useLazyQuery<IGetBundles, IGetBundlesVars>(
    GET_BUNDLES,
    {
      fetchPolicy: "network-only",
    }
  );
  // Derived from the query result (replaces the deprecated onCompleted option)
  useEffect(() => {
    if (!data) return;
    setPaginationInfo(data?.filterBundlesPaginated.paginationInfo);
  }, [data]);

  useEffect(() => {
    setLoader(true);
    getBundles({
      variables: {
        paginationInput: {
          currentPage: 0,
          perPage: pageSize,
        },
      },
    });
    setLoader(false);
  }, [pageSize]);

  const handleAction = (id: string, action: string) => {
    if (action === "edit" || action === "view") {
      setViewOnly(action === "view");
      setOpenForm(id);
    } else if (action === "delete") {
      setDeleteConf(id);
    }
  };

  const handleUpdateStatus = (row: any, visibility: string) => {
    const id = row?.original?.id;
    updateVisibility({
      variables: {
        id,
        visibility,
      },
    })
      .then(() => {
        refetch();
        toast.success("Status Updated successfully");
      })
      .catch((err: any) => {
        toast.error(err?.message);
      });
  };

  useEffect(() => {
    const rows = data?.filterBundlesPaginated?.data || [];
    const columns = makeColumns(handleAction, handleUpdateStatus);
    setData({ rows, columns });
  }, [data]);

  const handlePagination = (page: number) => {
    getBundles({
      variables: {
        paginationInput: {
          perPage: pageSize,
          currentPage: page,
        },
      },
    });
  };

  const handleDelete = (id: string | undefined) => {
    if (!id) return;
    deleteBundle({
      variables: {
        id,
      },
    })
      .then(() => {
        refetch();
        toast.success("Deleted Successfully");
      })
      .catch((err: any) => {
        toast.error(err?.message);
      });
  };

  return (
    <>
      {(deleteLoader || updateLoader) && <MDCircularLoader overlayloader startLoader />}
      <DashboardNavbar
        text="Add Package"
        onsubmit={
          !openForm &&
          (() => {
            setViewOnly(false);
            setOpenForm(true);
          })
        }
      />
      <MDBox px={2}>
        <MDBox pt={openForm ? 3 : 2}>
          {loader ? (
            <Card sx={{ minHeight: "300px" }}>
              <MDCircularLoader overlayloader startLoader />
            </Card>
          ) : openForm ? (
            <Card>
              <BundleForm
                onClose={() => {
                  navigate("/bundles");
                  refetch();
                  setOpenForm(false);
                  setViewOnly(false);
                }}
                refetch={refetch}
                id={openForm}
                disabled={viewOnly}
              />
            </Card>
          ) : loading || !!data?.filterBundlesPaginated?.data?.length ? (
            <DataTable
              loading={loading}
              handlePagination={handlePagination}
              table={tableData}
              showHeader
              paginationInfo={paginationInfo || {}}
              entriesPerPage={{ defaultValue: pageSize }}
              setSize={setSize}
              maxHeight="calc(100vh - 10rem)"
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
};
export default Bundles;
