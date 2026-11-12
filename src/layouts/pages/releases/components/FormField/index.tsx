import Autocomplete from "@mui/material/Autocomplete";
import Chip from "@mui/material/Chip";
import MDInput from "components/MDInput";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDLabel from "components/MDLabel";
import { Controller } from "react-hook-form";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import MDEditor from "components/MDEditor";
import FileUpload from "./FileUpload";
import InfoIcon from "@mui/icons-material/Info";
import RadioGroup from "@mui/material/RadioGroup";
import Radio from "@mui/material/Radio";
import FormControlLabel from "@mui/material/FormControlLabel";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

interface Option {
  label: string;
  value: string;
}
// Declaring props types for FormField
interface Props {
  label?: string;
  type?: string;
  name?: string;
  subLabel?: string;
  control?: any;
  options?: any;
  defaultValue?: any;
  [key: string]: any;
  opt?: Option[];
}

function FormField({
  label,
  opt,
  subLabel,
  name,
  type,
  options,
  defaultValue,
  control,
  rules = {},
  errors = "",
  disabled = false,
  required = false,
  ...rest
}: Props): JSX.Element {
  // Show "*" whenever the field is validated as required, for every field type
  const isRequired = required || !!rules?.required;
  switch (type) {
    case "dropdown": {
      return (
        <MDBox mb={2}>
          {label && <MDLabel label={label} required={isRequired} />}
          <FormControl fullWidth>
            <Controller
              name={name}
              control={control}
              rules={rules}
              render={({ field: { onChange, value } }) => (
                <Autocomplete
                  id="combo-box-demo"
                  options={options}
                  value={value}
                  onChange={(event, newValue) => {
                    onChange(newValue);
                  }}
                  disabled={disabled}
                  renderInput={(params) => <MDInput {...params} {...rest} variant="outlined" />}
                />
              )}
            />
          </FormControl>
          <FormHelperText error={true}>{errors?.[name]?.message}</FormHelperText>
          {subLabel && (
            <MDTypography fontWeight="regular" fontSize="13px">
              {subLabel}
            </MDTypography>
          )}
        </MDBox>
      );
    }
    case "radio": {
      return (
        <MDBox mb={2}>
          {label && <MDLabel label={label} required={isRequired} />}
          <FormControl>
            <Controller
              name={name}
              control={control}
              rules={rules}
              render={({ field: { onChange, value } }) => (
                <RadioGroup
                  value={value}
                  onChange={(event) => {
                    onChange(event.target.value);
                  }}
                  row
                  sx={{ paddingLeft: "2rem" }}
                >
                  {opt?.map((option) => (
                    <FormControlLabel
                      key={option.value}
                      value={option.value}
                      control={<Radio />}
                      label={option.label}
                      disabled={disabled}
                    />
                  ))}
                </RadioGroup>
              )}
            />
          </FormControl>
          <FormHelperText error={true}>{errors?.[name]?.message}</FormHelperText>
          {subLabel && (
            <MDTypography fontWeight="regular" fontSize="13px">
              {subLabel}
            </MDTypography>
          )}
        </MDBox>
      );
    }
    case "multiSelect": {
      return (
        <MDBox mb={2}>
          {label && <MDLabel label={label} required={isRequired} />}
          <FormControl fullWidth>
            <Controller
              name={name}
              control={control}
              rules={rules}
              render={({ field: { onChange, value } }) => (
                <Autocomplete
                  id="combo-box-demo"
                  multiple
                  options={options}
                  value={value}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        key={index}
                        variant="outlined"
                        label={option.label}
                        size="small"
                        {...getTagProps({ index })}
                      />
                    ))
                  }
                  onChange={(event, newValue) => {
                    onChange(newValue);
                  }}
                  disabled={disabled}
                  renderInput={(params) => <MDInput {...params} variant="outlined" />}
                />
              )}
            />
          </FormControl>
          <FormHelperText error={true}>{errors?.[name]?.message}</FormHelperText>
          {subLabel && (
            <MDTypography fontWeight="regular" fontSize="13px">
              {subLabel}
            </MDTypography>
          )}
        </MDBox>
      );
    }
    case "file": {
      return (
        <MDBox mb={2}>
          {label && <MDLabel label={label} required={isRequired} />}
          <FormControl fullWidth>
            <Controller
              name={name}
              control={control}
              rules={rules}
              defaultValue={defaultValue}
              render={({ field: { onChange, value } }) => (
                <MDBox
                  sx={{
                    minHeight: "150px",
                    background: "#EE5C6114",
                    borderRadius: "8px",
                    border: "1px dashed #F9565C !important",
                    padding: "20px 20px",
                    overflow: "hidden",
                  }}
                >
                  <FileUpload disabled={disabled} value={value} onChange={onChange} />
                </MDBox>
              )}
            />
          </FormControl>
          <FormHelperText error={true}>{errors?.[name]?.message}</FormHelperText>
          {subLabel && (
            <MDBox display="flex" bgColor={"grey-200"} borderRadius="lg" p={1} mt={1}>
              <InfoIcon sx={{ mr: 1 }} color="action" />{" "}
              <MDTypography fontWeight="regular" fontSize="13px">
                {subLabel}
              </MDTypography>
            </MDBox>
          )}
        </MDBox>
      );
    }
    case "editor": {
      return (
        <MDBox mb={2}>
          {label && <MDLabel label={label} required={isRequired} />}
          <FormControl fullWidth>
            <Controller
              name={name}
              control={control}
              rules={rules}
              render={({ field: { onChange, value } }) => (
                <MDEditor disabled={disabled} onChange={onChange} value={value} />
              )}
            />
          </FormControl>
          <FormHelperText error={true}>{errors?.[name]?.message}</FormHelperText>
          {subLabel && (
            <MDTypography fontWeight="regular" fontSize="13px">
              {subLabel}
            </MDTypography>
          )}
        </MDBox>
      );
    }
    case "dateAndTime": {
      return (
        <MDBox mb={2}>
          {label && <MDLabel label={label} required={isRequired} />}
          <FormControl fullWidth>
            <Controller
              name={name}
              control={control}
              rules={rules}
              render={({ field: { onChange, value } }) => (
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DemoContainer components={["DateTimePicker"]}>
                    <DateTimePicker onChange={onChange} value={value} {...rest} />
                  </DemoContainer>
                </LocalizationProvider>
              )}
            />
          </FormControl>
          <FormHelperText error={true}>{errors?.[name]?.message}</FormHelperText>
          {subLabel && (
            <MDTypography fontWeight="regular" fontSize="13px">
              {subLabel}
            </MDTypography>
          )}
        </MDBox>
      );
    }
    case "date": {
      return (
        <MDBox mb={2}>
          {label && <MDLabel label={label} required={isRequired} />}
          <FormControl fullWidth>
            <Controller
              name={name}
              control={control}
              rules={rules}
              render={({ field: { onChange, value } }) => (
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DemoContainer components={["DatePicker"]}>
                    <DatePicker
                      sx={{ width: "100%" }}
                      onChange={onChange}
                      value={value}
                      {...rest}
                    />
                  </DemoContainer>
                </LocalizationProvider>
              )}
            />
          </FormControl>
          <FormHelperText error={true}>{errors?.[name]?.message}</FormHelperText>
          {subLabel && (
            <MDTypography fontWeight="regular" fontSize="13px">
              {subLabel}
            </MDTypography>
          )}
        </MDBox>
      );
    }
    default: {
      return (
        <MDBox mb={2}>
          {label && <MDLabel label={label} required={isRequired} />}
          <FormControl fullWidth>
            <Controller
              name={name}
              control={control}
              rules={rules}
              render={({ field: { onChange, value } }) => (
                <MDInput
                  type={type}
                  disabled={disabled}
                  onChange={
                    type === "number" ? (e: any) => onChange(Number(e?.target?.value)) : onChange
                  }
                  value={value}
                  {...rest}
                />
              )}
            />
          </FormControl>
          <FormHelperText error={true}>{errors?.[name]?.message}</FormHelperText>
          {subLabel && (
            <MDTypography fontWeight="regular" fontSize="13px">
              {subLabel}
            </MDTypography>
          )}
        </MDBox>
      );
    }
  }
}

export default FormField;
