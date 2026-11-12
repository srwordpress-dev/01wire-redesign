import Tooltip from '@mui/material/Tooltip';
import MDTypography from '../MDTypography';
import InfoIcon from '@mui/icons-material/Info';

interface Props  {
  inputId?: string;
  label: string;
  subLabel?: string;
  tooltip?: string;
  required?: boolean | string;
}

const MDLabel = ({
  inputId,
  label,
  subLabel,
  tooltip,
  required,
}: Props): JSX.Element => {
  return (
    <MDTypography
      component="label"
      sx={{ mb: "0.5rem" }}
    fontSize="1rem"
    fontWeight="medium"
    color="textSecondary"
      htmlFor={inputId}
    >
      {label}{' '}
      {subLabel && (
        <MDTypography variant="caption" component="span">
          {subLabel}
        </MDTypography>
      )}
      {required && !!(label || subLabel) && (
        <MDTypography
          component="span"
          style={{ color: 'var(--secondary-color)' }}
          sx={{ lineHeight: 0 }}
        >
          *
        </MDTypography>
      )}
      {tooltip && (
        <>
          &nbsp;
          <Tooltip title={tooltip} placement="top"  sx={{ marginBottom: '4px',
    fontSize: '1rem' }}>
            <InfoIcon color="action" />
          </Tooltip>
        </>
      )}
    </MDTypography>
  );
};

export default MDLabel;
