import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Card from "@mui/material/Card";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import RadioGroup from "@mui/material/RadioGroup";
import Radio from "@mui/material/Radio";
import FormControlLabel from "@mui/material/FormControlLabel";
import SettingsIcon from "@mui/icons-material/Settings";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { toast } from "react-toastify";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";
import MDCircularLoader from "components/MDCircularLoader";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import {
  FILTER_PUBLICATIONS_ADMIN,
  IFilterPublicationsAdmin,
  IFilterPublicationsAdminVars,
  AdminPublication,
} from "graphql/queries/filterPublicationsAdmin";
import {
  GET_PUBLICATION_SETTINGS,
  IGetPublicationSettings,
} from "graphql/queries/getPublicationSettings";
import PublicationForm from "./components/PublicationForm";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { makeColumns } from "./components/makeColumns";
import DataTable from "../pr-management/components/DataTable";
import Filters from "./components/Filters";
import ConfirmDialog from "./components/ConfirmDialog";
import PricingSettingsDialog from "./components/PricingSettingsDialog";
import ImportDialog from "./components/ImportDialog";
import { DELETE_PUBLICATION, IDeletePublicationVars } from "graphql/mutations/deletePublication";
import {
  UPDATE_PUBLICATION_VISIBILITY,
  IUpdatePublicationVisVars,
} from "graphql/mutations/updatePublicationVisibility";
import {
  BULK_UPDATE_PUBLICATIONS,
  IBulkUpdatePublications,
  IBulkUpdatePublicationsVars,
  PublicationBulkAction,
} from "graphql/mutations/bulkUpdatePublications";
import { toNumberOrNull } from "./components/pricing";

const PER_PAGE = 25;
const BULK_DONE: Record<PublicationBulkAction, string> = {
  PUBLISH: "published",
  SUPPRESS: "hidden",
  DELETE: "deleted",
  SET_MARKUP: "re-priced",
};

const Publications = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [openForm, setOpenForm] = useState<any>(id || false);
  const [viewOnly, setViewOnly] = useState<boolean>(false);
  const [filters, setFilters] = useState<any>({});
  const [pageSize, setSize] = useState<number>(PER_PAGE);
  const [selected, setSelected] = useState<AdminPublication[]>([]);
  const [deleteConf, setDeleteConf] = useState<string | null>(null);
  const [bulkConfirm, setBulkConfirm] = useState<PublicationBulkAction | null>(null);
  const [markupDialog, setMarkupDialog] = useState<boolean>(false);
  const [markupMode, setMarkupMode] = useState<"value" | "default">("value");
  const [markupValue, setMarkupValue] = useState<string>("");
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showImport, setShowImport] = useState<boolean>(false);

  const { data: settingsData, refetch: refetchSettings } =
    useQuery<IGetPublicationSettings>(GET_PUBLICATION_SETTINGS);
  const settings = settingsData?.getPublicationSettings;

  const [updateVisibility, { loading: updateLoader }] = useMutation<any, IUpdatePublicationVisVars>(
    UPDATE_PUBLICATION_VISIBILITY
  );
  const [deletePublication, { loading: deleteLoader }] = useMutation<any, IDeletePublicationVars>(
    DELETE_PUBLICATION
  );
  const [bulkUpdate, { loading: bulkLoader }] = useMutation<
    IBulkUpdatePublications,
    IBulkUpdatePublicationsVars
  >(BULK_UPDATE_PUBLICATIONS);

  const [getPublications, { data, loading, refetch }] = useLazyQuery<
    IFilterPublicationsAdmin,
    IFilterPublicationsAdminVars
  >(FILTER_PUBLICATIONS_ADMIN, { fetchPolicy: "network-only" });

  const filterInput = useMemo(() => {
    const { visibility, ...rest } = filters || {};
    const out: any = { ...rest, visibility: (visibility || []).map((one: any) => one?.value) };
    Object.keys(out).forEach((k) => (out[k] === undefined || out[k] === "") && delete out[k]);
    return out;
  }, [filters]);

  const load = (page: number) =>
    getPublications({
      variables: { paginationInput: { currentPage: page, perPage: pageSize }, filterInput },
    }).catch((): undefined => undefined);

  useEffect(() => {
    load(0);
  }, [filterInput, pageSize]);

  // A new page / filter result starts with nothing selected
  useEffect(() => setSelected([]), [data]);

  useEffect(() => {
    if (id) {
      setOpenForm(id);
      setViewOnly(false);
    } else {
      setOpenForm(false);
      setViewOnly(false);
    }
  }, [id]);

  const reload = () => {
    if (refetch) refetch().catch((): undefined => undefined);
    else load(0);
  };

  const handleAction = (rowId: string, action: string) => {
    if (action === "edit") {
      navigate(`/publications/${rowId}`);
    } else if (action === "view") {
      setViewOnly(true);
      setOpenForm(rowId);
    } else if (action === "delete") {
      setDeleteConf(rowId);
    }
  };

  const handleUpdateStatus = (row: any, visibility: string) => {
    updateVisibility({ variables: { id: row?.original?.id, visibility } })
      .then(() => {
        reload();
        toast.success("Visibility updated");
      })
      .catch((err: any) => toast.error(err?.message));
  };

  const rows = data?.filterPublicationsPaginated?.data || [];
  const paginationInfo = data?.filterPublicationsPaginated?.paginationInfo;
  const tableData = useMemo(
    () => ({ rows, columns: makeColumns(handleAction, handleUpdateStatus, settings) }),
    [data, settings]
  );

  const handleFilters = useCallback((key: string | null, val: any) => {
    setFilters((f: any) => (key === null ? {} : { ...f, [key]: val }));
  }, []);

  const handleDelete = (rowId: string) => {
    deletePublication({ variables: { id: rowId } })
      .then(() => {
        reload();
        toast.success("Deleted");
      })
      .catch((err: any) => toast.error(err?.message));
  };

  const runBulk = (action: PublicationBulkAction, markupPercent?: number | null) => {
    const ids = selected.map((p) => p.id);
    if (!ids.length) return;
    bulkUpdate({
      variables: {
        params: { ids, action, ...(action === "SET_MARKUP" ? { markupPercent } : {}) },
      },
    })
      .then(({ data: res }) => {
        const r = res?.bulkUpdatePublications;
        toast.success(`${r?.changed ?? 0} of ${ids.length} ${BULK_DONE[action]}`);
        setBulkConfirm(null);
        setMarkupDialog(false);
        setSelected([]);
        reload();
      })
      .catch((err: any) => toast.error(err?.message));
  };

  const markupNum = toNumberOrNull(markupValue);
  const markupError =
    markupMode === "value" &&
    (markupNum == null || !Number.isFinite(markupNum) || markupNum < 0 || markupNum > 1000)
      ? "Enter a markup between 0 and 1000"
      : "";

  const closeForm = () => {
    setOpenForm(false);
    setViewOnly(false);
    if (id) navigate("/publications");
    reload();
  };

  return (
    <>
      {(deleteLoader || updateLoader || bulkLoader) && (
        <MDCircularLoader overlayloader startLoader />
      )}
      <DashboardNavbar
        text="Add Publication"
        onsubmit={
          !openForm &&
          (() => {
            setViewOnly(false);
            setOpenForm(true);
          })
        }
      />
      <MDBox px={2}>
        {!openForm && (
          <>
            <MDBox
              display="flex"
              flexWrap="wrap"
              alignItems="center"
              justifyContent="space-between"
              gap={1.5}
              pt={2}
            >
              <MDTypography fontSize="13px" color="text">
                {settings
                  ? `Default pricing: markup ${settings.markupPercent}% · GST ${settings.gstPercent}% · $1 = ₹${settings.usdInrRate}`
                  : "Loading pricing settings…"}
              </MDTypography>
              <MDBox display="flex" gap={1} flexWrap="wrap">
                <MDButton
                  variant="outlined"
                  color="primary"
                  size="small"
                  onClick={() => setShowSettings(true)}
                >
                  <SettingsIcon sx={{ mr: 0.5 }} />
                  Pricing settings
                </MDButton>
                <MDButton
                  variant="outlined"
                  color="primary"
                  size="small"
                  onClick={() => setShowImport(true)}
                >
                  <UploadFileIcon sx={{ mr: 0.5 }} />
                  Import
                </MDButton>
              </MDBox>
            </MDBox>
            <Filters handleFilters={handleFilters} filters={filters} />
          </>
        )}

        {!openForm && !!selected.length && (
          <Card
            sx={{
              mt: 2,
              p: 1.5,
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 1,
              position: "sticky",
              top: 8,
              zIndex: 1100,
              border: "1px solid #F9565C55",
            }}
            data-testid="bulk-bar"
          >
            <MDTypography fontSize="14px" fontWeight="medium" mr={1}>
              {selected.length} selected
            </MDTypography>
            <MDButton
              size="small"
              variant="contained"
              color="success"
              onClick={() => setBulkConfirm("PUBLISH")}
            >
              Publish
            </MDButton>
            <MDButton
              size="small"
              variant="contained"
              color="dark"
              onClick={() => runBulk("SUPPRESS")}
            >
              Hide
            </MDButton>
            <MDButton
              size="small"
              variant="outlined"
              color="primary"
              onClick={() => {
                setMarkupMode("value");
                setMarkupValue("");
                setMarkupDialog(true);
              }}
            >
              Set markup…
            </MDButton>
            <MDButton
              size="small"
              variant="contained"
              color="error"
              onClick={() => setBulkConfirm("DELETE")}
            >
              Delete
            </MDButton>
            <MDButton size="small" variant="text" color="secondary" onClick={() => setSelected([])}>
              Clear
            </MDButton>
          </Card>
        )}

        <MDBox pt={openForm ? 3 : 2} pb={2}>
          {openForm ? (
            <Card sx={{ minHeight: "300px" }}>
              <PublicationForm
                key={String(openForm)}
                onClose={closeForm}
                refetch={reload}
                id={openForm}
                disabled={viewOnly}
              />
            </Card>
          ) : loading || rows.length ? (
            <DataTable
              loading={loading}
              handlePagination={load}
              table={tableData}
              showHeader
              paginationInfo={paginationInfo || {}}
              entriesPerPage={{ defaultValue: pageSize, entries: ["25", "50", "100"] as any }}
              setSize={setSize}
              onSelectedRowsChange={setSelected}
              defaultSelectedRows={selected}
              maxHeight="calc(100vh - 14.5rem)"
            />
          ) : (
            <Card sx={{ minHeight: "300px" }}>
              <MDBox m={"auto"} textAlign="center">
                <MDTypography variant="h6">No publications found</MDTypography>
                {!!Object.keys(filterInput).filter(
                  (k) => k !== "visibility" || filterInput.visibility.length
                ).length && (
                  <MDTypography fontSize="13px" color="text">
                    Try clearing the filters.
                  </MDTypography>
                )}
              </MDBox>
            </Card>
          )}
          {!openForm && paginationInfo && (
            <MDTypography fontSize="12px" color="text" mt={1}>
              {paginationInfo.itemCount} publications
            </MDTypography>
          )}
        </MDBox>
      </MDBox>

      {deleteConf && (
        <ConfirmDialog
          title="Delete publication"
          message="Delete this publication? It disappears from the catalog and the marketplace."
          confirmText="Delete"
          onClose={() => setDeleteConf(null)}
          onConfirm={() => {
            handleDelete(deleteConf);
            setDeleteConf(null);
          }}
        />
      )}
      {bulkConfirm && (
        <ConfirmDialog
          title={bulkConfirm === "DELETE" ? "Delete publications" : "Publish publications"}
          message={
            bulkConfirm === "DELETE"
              ? `Delete ${selected.length} publication(s)? They disappear from the catalog and the marketplace.`
              : `Publish ${selected.length} publication(s)? Customers will see them on the marketplace straight away.`
          }
          confirmText={bulkConfirm === "DELETE" ? "Delete" : "Publish"}
          loading={bulkLoader}
          onClose={() => setBulkConfirm(null)}
          onConfirm={() => runBulk(bulkConfirm)}
        />
      )}
      {markupDialog && (
        <Dialog open onClose={() => setMarkupDialog(false)} fullWidth maxWidth="xs">
          <DialogTitle>
            <MDTypography fontSize="16px" fontWeight="medium">
              Set markup for {selected.length} publication(s)
            </MDTypography>
          </DialogTitle>
          <DialogContent>
            <RadioGroup value={markupMode} onChange={(e) => setMarkupMode(e.target.value as any)}>
              <FormControlLabel value="value" control={<Radio />} label="Markup override (%)" />
              {markupMode === "value" && (
                <MDBox pl={4} mb={1}>
                  <MDInput
                    autoFocus
                    fullWidth
                    value={markupValue}
                    placeholder="e.g. 60"
                    error={!!markupValue && !!markupError}
                    inputProps={{ inputMode: "decimal", "aria-label": "Markup percent" }}
                    onChange={(e: any) => setMarkupValue(e.target.value)}
                  />
                  {!!markupValue && markupError && (
                    <MDTypography fontSize="12px" color="error">
                      {markupError}
                    </MDTypography>
                  )}
                </MDBox>
              )}
              <FormControlLabel
                value="default"
                control={<Radio />}
                label={`Use default${settings ? ` (${settings.markupPercent}%)` : ""}`}
              />
            </RadioGroup>
            <MDTypography fontSize="12px" color="text" mt={1}>
              Prices of the selected vendor-priced publications are recalculated right away.
              Publications priced directly in credits are not changed.
            </MDTypography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
            <MDButton variant="outlined" color="primary" onClick={() => setMarkupDialog(false)}>
              Cancel
            </MDButton>
            <MDButton
              variant="contained"
              color="primary"
              disabled={!!markupError || bulkLoader}
              onClick={() => runBulk("SET_MARKUP", markupMode === "default" ? null : markupNum)}
            >
              Apply
            </MDButton>
          </DialogActions>
        </Dialog>
      )}
      {showSettings && (
        <PricingSettingsDialog
          onClose={() => setShowSettings(false)}
          onSaved={() => {
            refetchSettings();
            reload();
          }}
        />
      )}
      {showImport && <ImportDialog onClose={() => setShowImport(false)} onImported={reload} />}
    </>
  );
};
export default Publications;
