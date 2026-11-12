import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
// @mui material components
import Chip from "@mui/material/Chip";
import InputAdornment from "@mui/material/InputAdornment";
// Material Dashboard 2 PRO React TS components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
// import MDInput from "components/MDInput";
import MDCircularLoader from "components/MDCircularLoader";
import MDInput from "components/MDInput";
import { useMutation, useQuery } from "@apollo/client";
import { GET_BUNDLES, IGetBundles, IGetBundlesVars } from "graphql/queries/filterBundlesPaginated";
import {
  GET_PUBLICATIONS,
  IGetPublications,
  IGetPublicationsVars,
} from "graphql/queries/filterPublicationsPaginated";
import { UPDATE_ARTICLE, IUpdateArticleVars } from "graphql/mutations/updateArticle";
import DisplayBundles from "../DisplayBundles";
import PublicationsList from "../PublicationsList";
import SearchIcon from "assets/images/icons/searchIcon.svg";
import BundlePublicationModal from "../BundlePublicationModal";
import OrderSummary, { creditsText } from "../OrderSummary";
import { getCart, saveCart } from "utils/mediaCart";
import debounce from "lodash.debounce";

const perPage = 10;
interface Props {
  cb?: any;
  saveData?: boolean;
  data?: any;
  refetch?: () => void;
  disabled?: any;
  setSaveData?: any;
  createEstimate?: any;
  setPayable?: any;
  // Number of selected media, so the wizard can block payment with none
  setMediaCount?: (count: number) => void;
}
function PlanNPayment({
  data,
  cb,
  saveData,
  refetch,
  disabled = false,
  setSaveData,
  createEstimate = false,
  setPayable,
  setMediaCount,
}: Props): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const estimation = location?.state?.estimation || {};
  const estimatePIds = estimation?.selectedPublications?.map((p: any) => p?.id);
  // Marketplace opened from a PR's "Change media": its button leads back to that PR
  const forPr = location?.state?.forPr;
  // The Marketplace page and a PR without a saved plan start from the media cart;
  // so does a PR coming back from "Change media" (the cart then replaces its plan)
  const hasSavedPlan = data?.bundleIds?.length > 0 || data?.publicationIds?.length > 0;
  const cart =
    !disabled &&
    (location?.state?.useCart ||
      (!hasSavedPlan && !estimation?.selectedBundles && !estimation?.selectedPublications))
      ? getCart()
      : null;
  const initialBundles = estimation?.selectedBundles || cart?.bundles || data?.bundleInfo || [];
  const savedBundlePids = [
    ...new Set(initialBundles.flatMap((bundle: any) => bundle?.publicationIds || [])),
  ];
  const [updateArticle] = useMutation<IUpdateArticleVars>(UPDATE_ARTICLE);
  const [loading, setLoading] = useState<boolean>(false);
  const [publicationIds, setPublicationIds] = useState<any>(
    estimatePIds ||
      cart?.publications?.map((p: any) => p?.id) ||
      (data?.publicationIds ? data?.publicationIds : [])
  );
  const [totalCredits, setCredits] = useState<number>(0);
  const [selectedP, setSelectedP] = useState<any>(
    estimation?.selectedPublications || cart?.publications || data?.publicationInfo || []
  );
  const [selected, setSelected] = useState<any>(initialBundles);
  const [bundlePids, setBundlePids] = useState<any>(savedBundlePids);
  const [selectedCategory, setCategory] = useState<string | null>();
  const [currentPage, setPage] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState<any>(false);
  const [pageSize, setSize] = useState<number>(50);
  const [filter, setFilter] = useState<any>({});

  const { data: bundlesData } = useQuery<IGetBundles, IGetBundlesVars>(GET_BUNDLES, {
    variables: {
      paginationInput: {
        currentPage: 0,
        perPage: 200,
      },
    },
    fetchPolicy: "network-only",
    skip: disabled || !createEstimate,
  });
  const {
    data: publicationsData,
    refetch: refetchPublications,
    loading: pLoading,
  } = useQuery<IGetPublications, IGetPublicationsVars>(GET_PUBLICATIONS, {
    variables: {
      filterInput: {
        filterIds: bundlePids,
        ...filter,
      },
      paginationInput: {
        currentPage: currentPage,
        perPage: pageSize,
      },
    },
    skip: disabled || !createEstimate,
  });
  const currentPublications: any =
    (disabled && data?.publicationInfo) ||
    publicationsData?.filterPublicationsPaginated?.data ||
    [];
  const handleChange = (category: any, bundle: any) => {
    const { id, publicationIds } = bundle;
    setSelected((prevBundles: any) => {
      // Filter out bundles of the same category
      const updatedBundles = prevBundles.filter((b: any) => b.category !== category);
      // If bundle is already selected, remove it
      if (prevBundles?.some((b: any) => b.id === id)) {
        return updatedBundles;
      }
      // Add the new bundle for the category
      return [...updatedBundles, { ...bundle, category }];
    });
    setBundlePids((prevPublications: any) => {
      // If bundle is already selected, remove its publication IDs
      if (selected?.some((b: any) => b.id === id)) {
        return prevPublications.filter((pubId: any) => !publicationIds.includes(pubId));
      }
      // Add the new publication IDs
      return [...prevPublications, ...publicationIds];
    });
  };
  const handleSelectedRowsChange = (newSelectedRows: any[]) => {
    setSelectedP(newSelectedRows);
    const ids = newSelectedRows?.length > 0 ? newSelectedRows.map((item: any) => item.id) : [];
    setPublicationIds(ids);
  };
  const onSubmit = () => {
    // Plan is locked once the PR leaves DRAFT; just move to the next step
    if (disabled) {
      cb();
      return;
    }
    const selectedBundleIds = selected?.map((bundle: any) => bundle.id);
    // A draft can't move on to Review & Publish with an empty, 0-credit plan
    if (!selectedBundleIds?.length && !publicationIds?.length) {
      toast.error("Choose media in the Marketplace first.");
      setSaveData(false);
      return;
    }
    if (
      JSON.stringify(selectedBundleIds) !== JSON.stringify(data?.bundleIds) ||
      JSON.stringify(publicationIds) !== JSON.stringify(data?.publicationIds)
    ) {
      setLoading(true);
      updateArticle({
        variables: {
          params: {
            id: data?.id,
            bundleIds: selectedBundleIds || [],
            publicationIds: publicationIds || [],
          },
        },
      })
        .then((res: any) => {
          setLoading(false);
          toast.success("Saved Successfully");
          if (refetch) refetch();
          const resId = res?.data?.updateArticle?.id;
          cb(resId);
        })
        .catch((err: any) => {
          setLoading(false);
          toast.error(err?.message);
          setSaveData(false);
        });
    } else {
      cb();
    }
  };
  useEffect(() => {
    if (saveData) {
      onSubmit();
    }
  }, [saveData]);
  useEffect(() => {
    refetchPublications();
  }, [currentPage, refetchPublications]);
  const groupedData: any = bundlesData?.filterBundlesPaginated?.data?.reduce(
    (acc: any, obj: any) => {
      const { category, ...rest } = obj;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(rest);
      return acc;
    },
    {}
  );
  const handleCategorySelection = (value: string) => {
    setCategory(value);
  };
  const checkTitleAvail = useCallback(
    debounce((val: string) => {
      setFilter({ title: val });
    }, 500),
    []
  );
  const handleSearchChange = (event: any) => {
    const searchVal = event.target.value || "";
    setSearchTerm(searchVal);
    checkTitleAvail(searchVal);
  };
  useEffect(() => {
    if (!selectedCategory && bundlesData?.filterBundlesPaginated?.data?.length) {
      setCategory(bundlesData?.filterBundlesPaginated?.data?.[0]?.category);
    }
  }, [bundlesData]);

  function calculateTotalPrice(arr: any[]): number {
    return arr.reduce((total, one) => total + (one?.price || one?.credits || 0), 0);
  }
  useEffect(() => {
    const bCredits = calculateTotalPrice(selected);
    const pCredits = calculateTotalPrice(selectedP);
    setCredits(bCredits + pCredits);
  }, [selectedP, selected]);
  useEffect(() => {
    if (setPayable) {
      setPayable(totalCredits);
    }
  }, [totalCredits]);
  useEffect(() => {
    if (setMediaCount) setMediaCount((selected?.length || 0) + (selectedP?.length || 0));
  }, [selected, selectedP]);
  // Take this PR's media to the Marketplace to change it, then come back to it
  const openMarketplace = () => {
    saveCart(selected || [], selectedP || []);
    navigate("/marketplace", { state: { forPr: { id: data?.id, prId: data?.prId } } });
  };
  // Marketplace picks stay in the cart until they are paid for
  useEffect(() => {
    if (createEstimate) saveCart(selected, selectedP);
  }, [selected, selectedP]);

  return (
    <MDBox>
      {loading && <MDCircularLoader overlayloader startLoader />}
      {!createEstimate && (
        <MDBox mb={3}>
          <OrderSummary
            bundles={selected}
            publications={selectedP}
            total={disabled ? data?.totalCredits : undefined}
          />
          {!disabled && (
            <MDBox mt={2} display="flex" justifyContent="flex-end">
              <MDButton variant="outlined" color="primary" onClick={openMarketplace}>
                {selected?.length || selectedP?.length
                  ? "Change media"
                  : "Choose media in Marketplace"}
              </MDButton>
            </MDBox>
          )}
        </MDBox>
      )}
      {createEstimate && !disabled && groupedData && (
        <MDBox
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 3,
          }}
        >
          {Object.keys(groupedData)?.map((category: any, i: number) => {
            return (
              <Chip
                key={i}
                label={category}
                color={selectedCategory === category ? "primary" : "default"}
                variant={selectedCategory === category ? "filled" : "outlined"}
                onClick={() => handleCategorySelection(category)}
              />
            );
          })}
        </MDBox>
      )}
      {createEstimate && (groupedData || (disabled && data?.bundleInfo?.length > 0)) && (
        <MDBox mt={3}>
          <MDTypography variant="h6">
            {disabled ? "Selected Bundle" : "Select Bundles"}
          </MDTypography>
          <DisplayBundles
            bundles={disabled ? data.bundleInfo : groupedData[selectedCategory]}
            handleChange={handleChange}
            selected={selected}
            disabled={disabled}
            category={selectedCategory}
          />
        </MDBox>
      )}
      {createEstimate && ((disabled && currentPublications?.length > 0) || !disabled) && (
        <MDBox id="marketplace-publications" sx={{ scrollMarginTop: "100px" }}>
          <MDBox py={2} display="flex" justifyContent="space-between">
            <MDBox display="flex" alignItems="center">
              <MDTypography variant="h6">
                {disabled ? "Selected Publications" : "Select Publications"}
              </MDTypography>
              <Chip
                sx={{ ml: 2 }}
                color="primary"
                variant="outlined"
                label={`${publicationIds?.length} Selected`}
                onClick={() => {
                  if (!disabled) setOpen(true);
                }}
              />
            </MDBox>
            {!disabled && (
              <MDInput
                sx={{ width: 268 }}
                fullWidth
                type="text"
                size="small"
                onChange={handleSearchChange}
                value={searchTerm}
                placeholder="Search Publications"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <img height={15} width={15} src={SearchIcon} alt="Search" />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          </MDBox>
          <MDBox mt={3}>
            <PublicationsList
              publications={currentPublications}
              updatePage={setPage}
              paginationInfo={publicationsData?.filterPublicationsPaginated?.paginationInfo}
              onSelect={!disabled && handleSelectedRowsChange}
              selectedP={selectedP}
              loading={pLoading}
              disabled={disabled}
              entriesPerPage={
                disabled ? false : { defaultValue: pageSize, entries: [5, 10, 20, 40, 50] }
              }
              setSize={setSize}
              maxHeight
            />
          </MDBox>
        </MDBox>
      )}
      {createEstimate && (
        <MDBox
          width="102.47%"
          display="flex"
          justifyContent="space-between"
          bgColor="white"
          sx={{
            position: "sticky",
            bottom: 0,
            marginLeft: "-1.2%",
            padding: "2rem 1rem",
            boxShadow:
              "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px",
          }}
        >
          <MDBox>
            <MDTypography variant="h6">
              {(selected?.length || 0) + (selectedP?.length || 0)} media selected
            </MDTypography>
            <MDTypography fontWeight="bold" fontSize="20px" color="primary">
              Total {creditsText(totalCredits > 0 ? totalCredits : 0)}
            </MDTypography>
          </MDBox>
          <MDBox>
            <MDButton
              variant="outlined"
              color="primary"
              sx={{ mr: 3 }}
              disabled={!selected?.length && !publicationIds?.length}
              onClick={() => {
                const selectedBundleIds = selected?.map((bundle: any) => bundle.id);
                createEstimate({
                  bundleIds: selectedBundleIds || [],
                  publicationIds: publicationIds || [],
                });
              }}
            >
              Save Estimate
            </MDButton>
            <MDButton
              color="primary"
              disabled={!selected?.length && !publicationIds?.length}
              onClick={() => {
                if (forPr?.id) {
                  navigate(`/releases/${forPr.id}`, { state: { step: 2, useCart: true } });
                  return;
                }
                navigate("/releases", {
                  state: {
                    estimation: {
                      selectedBundles: selected,
                      selectedPublications: selectedP,
                    },
                  },
                });
              }}
            >
              {forPr?.id
                ? `Back to PR${forPr.prId ? ` #${forPr.prId}` : ""}`
                : "Continue to Add PR"}
            </MDButton>
          </MDBox>
        </MDBox>
      )}
      {open && (
        <BundlePublicationModal onClose={() => setOpen(false)} currentPublications={selectedP} />
      )}
    </MDBox>
  );
}

export default PlanNPayment;
