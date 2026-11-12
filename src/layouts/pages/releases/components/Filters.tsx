import { useState, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import FormControl from "@mui/material/FormControl";
import { statusOptions } from "../../pr-management/components/makeColumns";

import MDInput from "components/MDInput";
import InputAdornment from "@mui/material/InputAdornment";
import debounce from "lodash.debounce";
import Autocomplete from "@mui/material/Autocomplete";
import Chip from "@mui/material/Chip";
import SearchIcon from "assets/images/icons/searchIcon.svg";
import CloseIcon from "@mui/icons-material/Close";

import EastIcon from "@mui/icons-material/East";
import dayjs, { Dayjs } from "dayjs";

const Filters = ({
  filters,
  setFilters,
  handleFilters,
  clientsOptions,
}: {
  filters: any;
  handleFilters: any;
  clientsOptions: any;
  setFilters: any;
}) => {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState<string>("");
  const [from, setFrom] = useState<Dayjs | null>(filters?.startTime || null);
  const [to, setTo] = useState<Dayjs | null>(filters?.endTime || null);

  useEffect(() => {
    if (to && from) {
      setFilters({
        ...filters,
        startTime: from,
        endTime: to,
      });
    }
  }, [to, from]);

  const checkPrIdAvail = useCallback(
    debounce((val: string) => {
      handleFilters("prId", val ? Number(val) : undefined);
    }, 500),
    []
  );
  const handleInputChange = (evt: any) => {
    const searchTerm = evt.target.value || "";
    setQ(searchTerm);
    checkPrIdAvail(searchTerm);
  };

  const handleClientChange = (event: any, values: any) => {
    handleFilters("clientId", values?.value || undefined);
  };
  console.log("userId", filters);

  return (
    <>
      <Box
        pt={2}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        flexWrap="wrap"
        gap={2}
      >
        <Box display="flex" alignItems="center" flexWrap="wrap" gap={2}>
          <Autocomplete
            id="asynchronous-demo"
            size="small"
            sx={{ width: { xs: "100%", sm: 252 }, height: 42 }}
            onChange={handleClientChange}
            options={clientsOptions}
            value={
              filters?.clientId &&
              clientsOptions?.find((one: any) => one?.value === filters?.clientId)
            }
            renderInput={(params) => (
              <MDInput
                {...params}
                // onChange={handleClientChange}
                label=""
                // value={filters?.clientId ? filters?.clientId : ""}
                sx={{
                  height: "42px",
                  "& .MuiInputBase-root": {
                    height: "42px",
                  },
                }}
                placeholder="Search By Client"
                // value={filters?.prId}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment sx={{ ml: "6px" }} position="start">
                      <img height={15} width={15} src={SearchIcon} alt="Search" />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
          <MDInput
            sx={{ width: { xs: "100%", sm: 130 } }}
            fullWidth
            type="text"
            onChange={handleInputChange}
            value={q}
            placeholder="Search ID"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <img height={15} width={15} src={SearchIcon} alt="Search" />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        <Box display="flex" alignItems="center" justifyContent="flex-end" flexWrap="wrap" gap={2}>
          <Box>
            <FormControl
              sx={{
                maxWidth: "455px",
                height: "42px",
                mr: 2,
                border: "1px solid lightgray",
                borderRadius: "7px",
              }}
            >
              <Autocomplete
                multiple
                id="tags-outlined"
                options={statusOptions}
                getOptionLabel={(option) => option?.label}
                value={filters?.status || []}
                disableClearable
                onChange={(event, newValue) => {
                  handleFilters("status", newValue);
                }}
                filterSelectedOptions
                renderInput={(params) => (
                  <MDInput
                    {...params}
                    sx={{
                      height: "40px",
                      border: "none",
                      "& .MuiInputBase-root": {
                        height: "40px",
                        overflowX: "auto",
                        overflowY: "hidden",
                        flexWrap: "nowrap",
                        border: "none",
                        "& .MuiOutlinedInput-notchedOutline": {
                          border: "none",
                        },
                        "&::-webkit-scrollbar": {
                          height: "4px",
                          width: "0px",
                        },
                        "&::-webkit-scrollbar-thumb": {
                          backgroundColor: "lightgray",
                          borderRadius: "7px",
                        },
                      },
                    }}
                    placeholder="Select Status"
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      key={index}
                      variant="outlined"
                      size="small"
                      label={option?.label}
                      {...getTagProps({ index })}
                      deleteIcon={<CloseIcon />}
                    />
                  ))
                }
                sx={{
                  minWidth: 200,
                  maxWidth: 400,
                }}
              />
            </FormControl>
          </Box>
          <MDBox
            borderRadius={"5px"}
            bgColor="white"
            sx={{
              height: "42px",
              width: { xs: "100%", sm: "300px" },
              p: 1.6,
              display: "flex",
              alignItems: "center",
              justifyContent: "space=between",
              border: "1px solid lightgray",
            }}
          >
            <Box>
              <MDTypography
                sx={{ fontWeight: "400", mt: "13px" }}
                fontSize="10px"
                color="textSecondary"
              >
                Start Date
              </MDTypography>
              <DatePicker
                format="DD/MM/YYYY"
                value={from ? dayjs(from) : null}
                onChange={(newValue) => setFrom(newValue)}
                slotProps={{
                  textField: {
                    size: "small",
                    variant: "standard",
                    sx: {
                      "& .MuiInput-underline:before": {
                        borderBottom: "none", // Remove bottom border when not focused
                      },
                      "& .MuiInput-underline:after": {
                        borderBottom: "none", // Remove bottom border when focused
                      },
                      "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
                        borderBottom: "none", // Remove bottom border on hover (when not disabled)
                      },
                      "& .MuiInputBase-input": {
                        fontSize: "12px", // Change font size
                      },
                    },
                  },
                }}
                label=""
              />
            </Box>
            <Box mx={1}>
              <EastIcon fontSize="small" />
            </Box>
            <Box>
              <MDTypography
                sx={{ fontWeight: "400", mt: "13px" }}
                fontSize="10px"
                color="textSecondary"
              >
                To
              </MDTypography>
              <DatePicker
                format="DD/MM/YYYY"
                value={to ? dayjs(to) : null}
                onChange={(newValue) => setTo(newValue)}
                slotProps={{
                  textField: {
                    size: "small",
                    variant: "standard",
                    sx: {
                      "& .MuiInput-underline:before": {
                        borderBottom: "none", // Remove bottom border when not focused
                      },
                      "& .MuiInput-underline:after": {
                        borderBottom: "none", // Remove bottom border when focused
                      },
                      "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
                        borderBottom: "none", // Remove bottom border on hover (when not disabled)
                      },
                      "& .MuiInputBase-input": {
                        fontSize: "12px", // Change font size
                      },
                    },
                  },
                }}
                label=""
              />
            </Box>
          </MDBox>
        </Box>
      </Box>
    </>
  );
};
export default Filters;
