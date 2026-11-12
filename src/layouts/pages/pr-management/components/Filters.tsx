import { useState, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { useLazyQuery } from "@apollo/client";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import FormControl from "@mui/material/FormControl";
import { statusOptions } from "./makeColumns";
import MDInput from "components/MDInput";
import InputAdornment from "@mui/material/InputAdornment";
import debounce from "lodash.debounce";
import Autocomplete from "@mui/material/Autocomplete";
import CircularProgress from "@mui/material/CircularProgress";
import SearchIcon from "assets/images/icons/searchIcon.svg";
import DownArrow from "assets/images/down-arrow.svg";
import { IGetUsers, IGetUsersVars, GET_USERS } from "graphql/queries/filterUsersPaginated";
import EastIcon from "@mui/icons-material/East";
import dayjs, { Dayjs } from "dayjs";
import Chip from "@mui/material/Chip";
import CloseIcon from "@mui/icons-material/Close";

const Filters = ({
  filters,
  setFilters,
  handleFilters,
  email,
  setEmail,
  setOptions,
  options,
}: {
  filters: any;
  handleFilters: any;
  email: string;
  setEmail: any;
  setOptions: any;
  options: any;
  setFilters: any;
}) => {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState<string>("");
  const [from, setFrom] = useState<Dayjs | null>(filters?.startTime || null);
  const [to, setTo] = useState<Dayjs | null>(filters?.endTime || null);

  const [getUsers, { data, loading, refetch }] = useLazyQuery<IGetUsers, IGetUsersVars>(GET_USERS, {
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (to && from) {
      setFilters({
        ...filters,
        startTime: from,
        endTime: to,
      });
    }
  }, [to, from]);

  useEffect(() => {
    if (email) {
      getUsers({
        variables: {
          filterInput: {
            email: email,
          },
          paginationInput: {
            currentPage: 0,
            perPage: 6,
          },
        },
      });
    }
  }, [email]);

  useEffect(() => {
    const users = data?.filterUsersPaginated?.data;
    let options: any = [];
    if (users?.length) {
      options = users?.map((one) => {
        return {
          userId: one?.id,
          email: one?.email,
        };
      });
    }
    setOptions(options);
  }, [data]);

  useEffect(() => {
    if (!open) {
      setOptions([]);
    }
  }, [open]);

  const checkPrIdAvail = useCallback(
    debounce((val: string) => {
      handleFilters("prId", Number(val));
    }, 500),
    []
  );
  const handleInputChange = (evt: any) => {
    const searchTerm = evt.target.value || "";
    setQ(searchTerm);
    checkPrIdAvail(searchTerm);
  };

  const checkEmailAvail = useCallback(
    debounce((val: string) => {
      // handleFilters("prId", val);
    }, 500),
    []
  );
  const handleEmailChange = (evt: any) => {
    const searchTerm = evt.target.value || "";
    setEmail(searchTerm);
    checkEmailAvail(searchTerm);
  };

  const selectEmail = (event: any, values: any) => {
    handleFilters("userId", values?.userId);
  };

  return (
    <>
      <Box
        p={2}
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
            open={open}
            onOpen={() => {
              setOpen(true);
            }}
            onClose={() => {
              setOpen(false);
            }}
            onChange={selectEmail}
            isOptionEqualToValue={(option, value) => option?.email === value?.email}
            getOptionLabel={(option: any) => option?.email}
            options={options}
            loading={loading}
            noOptionsText="No user found with this email"
            loadingText="Searching…"
            value={
              filters?.userId ? options?.find((el: any) => el.userId === filters?.userId) : null
            }
            renderInput={(params) => (
              <MDInput
                {...params}
                onChange={handleEmailChange}
                label=""
                value={filters?.userId ? filters?.userId : ""}
                sx={{
                  height: "42px",
                  "& .MuiInputBase-root": {
                    height: "42px",
                  },
                }}
                placeholder="Search By Email"
                // value={filters?.prId}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment sx={{ ml: "6px" }} position="start">
                      <img height={15} width={15} src={SearchIcon} alt="Search" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <>
                      {loading ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
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
                options={
                  filters?.status?.length > 0
                    ? statusOptions?.filter(
                        (one) => !JSON.stringify(filters?.status)?.includes(one?.value)
                      )
                    : statusOptions
                }
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
              p: 1.5,
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
