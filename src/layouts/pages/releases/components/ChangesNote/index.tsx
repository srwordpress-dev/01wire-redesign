import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// What the 01 Wire team asked the customer to change (ticked list + note)
function ChangesNote({ changes, note, banner = false }: { changes?: string[] | null; note?: string | null; banner?: boolean }): JSX.Element | null {
  const list = (changes || []).filter(Boolean);
  if (!list.length && !note) return null;
  return (
    <MDBox
      data-testid="changes-note"
      sx={banner ? { background: "#fff8e1", borderLeft: "4px solid #f5a623", borderRadius: "6px", p: 2, mb: 2 } : {}}
    >
      {banner && (
        <MDTypography fontSize="15px" fontWeight="bold" sx={{ color: "#8a5a00", mb: 0.5 }}>
          Our team asked for a few changes. Please update your PR and send it again (nothing more to pay).
        </MDTypography>
      )}
      {list.length > 0 && (
        <>
          <MDTypography fontSize="14px" fontWeight="bold" sx={{ color: "#344767" }}>What to change</MDTypography>
          <MDBox component="ul" sx={{ pl: 2.5, my: 0.5 }}>
            {list.map((c) => (
              <MDBox component="li" key={c} sx={{ fontSize: "14px", color: "#344767" }}>{c}</MDBox>
            ))}
          </MDBox>
        </>
      )}
      {note && (
        <>
          {list.length > 0 && <MDTypography fontSize="14px" fontWeight="bold" sx={{ color: "#344767", mt: 1 }}>Note from our team</MDTypography>}
          <MDTypography fontSize="14px" sx={{ color: "#344767", whiteSpace: "pre-wrap" }}>{note}</MDTypography>
        </>
      )}
    </MDBox>
  );
}

export default ChangesNote;
