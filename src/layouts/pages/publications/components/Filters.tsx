import { useState, useMemo } from "react";
import Box from "@mui/material/Box";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "assets/images/icons/searchIcon.svg";
import debounce from "lodash.debounce";
import { visibilityOptions } from "../../../../constants";
import Autocomplete from "@mui/material/Autocomplete";

export const SECTION_OPTIONS = ["General", "Casino", "Crypto", "Health", "Review"];
export const LANGUAGE_OPTIONS = [
  "English",
  "Hindi",
  "Bengali",
  "Gujarati",
  "Kannada",
  "Malayalam",
  "Marathi",
  "Odia",
  "Punjabi",
  "Tamil",
  "Telugu",
];

const inputSx = { "& .MuiOutlinedInput-root": { minHeight: "45px" } };
const EMPTY_TEXT = { search: "", priceMin: "", priceMax: "", importBatch: "" };

// Text filters are applied after a short pause so typing doesn't fire a query per key
const Filters = ({ filters, handleFilters }: { filters: any; handleFilters: any }) => {
  const [text, setText] = useState<Record<string, string>>(EMPTY_TEXT);

  // One debouncer per field: a shared one would drop "min" when "max" is typed right after
  const appliers = useMemo(
    () =>
      Object.fromEntries(
        Object.keys(EMPTY_TEXT).map((key) => [
          key,
          debounce((val: string) => {
            if (key === "priceMin" || key === "priceMax") {
              const n = val.trim() === "" ? undefined : Number(val);
              handleFilters(
                key,
                n !== undefined && Number.isFinite(n) && n >= 0 ? Math.floor(n) : undefined
              );
            } else {
              handleFilters(key, val.trim() || undefined);
            }
          }, 500),
        ])
      ),
    [handleFilters]
  );

  const onText = (key: string) => (evt: any) => {
    const val = evt.target.value || "";
    setText((t) => ({ ...t, [key]: val }));
    appliers[key](val);
  };

  const hasFilters =
    Object.values(text).some((v) => v !== "") ||
    Object.values(filters || {}).some((v: any) =>
      Array.isArray(v) ? v.length : v !== undefined && v !== null && v !== ""
    );

  return (
    <Box
      display="grid"
      gridTemplateColumns={{
        xs: "1fr 1fr",
        md: "repeat(4, minmax(0, 1fr))",
        xl: "2fr 2fr repeat(5, minmax(0, 1fr)) auto",
      }}
      gap={1.5}
      pt={3}
      alignItems="center"
    >
      <Box gridColumn={{ xs: "1 / -1", md: "span 2", xl: "auto" }}>
        <MDInput
          fullWidth
          type="text"
          sx={inputSx}
          onChange={onText("search")}
          value={text.search}
          placeholder="Search title or domain"
          inputProps={{ "aria-label": "Search title or domain" }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <img height={15} width={15} src={SearchIcon} alt="" />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <Box gridColumn={{ xs: "1 / -1", md: "span 2", xl: "auto" }}>
        <Autocomplete
          multiple
          options={visibilityOptions}
          value={filters?.visibility || []}
          filterSelectedOptions
          isOptionEqualToValue={(o: any, v: any) => o?.value === v?.value}
          onChange={(e, newValue) => handleFilters("visibility", newValue)}
          renderInput={(params) => (
            <MDInput
              {...params}
              sx={inputSx}
              placeholder="Visibility"
              inputProps={{ ...params.inputProps, "aria-label": "Visibility" }}
            />
          )}
        />
      </Box>
      <Autocomplete
        freeSolo
        options={SECTION_OPTIONS}
        value={filters?.section || null}
        onChange={(e, v: any) => handleFilters("section", v || undefined)}
        renderInput={(params) => (
          <MDInput
            {...params}
            sx={inputSx}
            placeholder="Section"
            inputProps={{ ...params.inputProps, "aria-label": "Section" }}
          />
        )}
      />
      <Autocomplete
        freeSolo
        options={LANGUAGE_OPTIONS}
        value={filters?.language || null}
        onChange={(e, v: any) => handleFilters("language", v || undefined)}
        renderInput={(params) => (
          <MDInput
            {...params}
            sx={inputSx}
            placeholder="Language"
            inputProps={{ ...params.inputProps, "aria-label": "Language" }}
          />
        )}
      />
      <MDInput
        sx={inputSx}
        value={text.priceMin}
        onChange={onText("priceMin")}
        placeholder="Min credits"
        inputProps={{ inputMode: "numeric", "aria-label": "Minimum price in credits" }}
      />
      <MDInput
        sx={inputSx}
        value={text.priceMax}
        onChange={onText("priceMax")}
        placeholder="Max credits"
        inputProps={{ inputMode: "numeric", "aria-label": "Maximum price in credits" }}
      />
      <MDInput
        sx={inputSx}
        value={text.importBatch}
        onChange={onText("importBatch")}
        placeholder="Import batch"
        inputProps={{ "aria-label": "Import batch" }}
      />
      {hasFilters && (
        <MDButton
          variant="text"
          color="primary"
          size="small"
          onClick={() => {
            Object.values(appliers).forEach((a) => a.cancel());
            setText(EMPTY_TEXT);
            handleFilters(null, null);
          }}
        >
          Clear filters
        </MDButton>
      )}
    </Box>
  );
};
export default Filters;
