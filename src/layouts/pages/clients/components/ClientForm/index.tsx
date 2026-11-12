import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLazyQuery } from "@apollo/client";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import ClientInfo from "../ClientInfo";
import {
  GET_CLIENT_BY_ID,
  IGetClientByIdVars,
  IGetClientById,
} from "graphql/queries/getClientById";
import MDCircularLoader from "components/MDCircularLoader";
interface Props {
  id?: any;
  onClose?: () => void;
  refetchList?: () => void;
  // Embedded in another page (popup): Back only closes, Save returns the client
  embedded?: boolean;
  onSaved?: (client: any) => void;
}

function ClientForm({ id, refetchList, onClose, embedded = false, onSaved }: Props): JSX.Element {
  const navigate = useNavigate();
  const [saveData, setSaveData] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [client, setClient] = useState<any>();
  const clientId = id && id !== true && id;
  const [getClientById] = useLazyQuery<IGetClientById, IGetClientByIdVars>(GET_CLIENT_BY_ID, {
    fetchPolicy: "network-only",
  });

  const fetchData = (resId?: any) => {
    setLoading(true);
    getClientById({
      variables: {
        id: clientId || resId,
      },
    })
      .then((res: any) => {
        setClient(res?.data?.getClientById);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        console.info("err while fetching client detail", err);
      });
  };
  useEffect(() => {
    if (clientId) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [clientId]);
  const handleCloseForm = () => {
    if (onClose) onClose();
    if (!embedded) navigate(`/clients`);
  };
  return (
    <>
      <MDBox p={2}>
        <MDBox>
          {loading ? (
            <MDCircularLoader startLoader />
          ) : (
            <ClientInfo
              saveData={saveData}
              data={client}
              refetch={refetchList}
              onClose={onClose}
              setSaveData={setSaveData}
              onSaved={onSaved}
            />
          )}
        </MDBox>
      </MDBox>
      {!loading && (
        <MDBox
          mt={3}
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
          <MDTypography
            fontSize="16px"
            fontWeight="regular"
            sx={{
              fontFamily: "Roboto",
              boxShadow:
                "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px",
              borderRadius: "5px",
              padding: "0.5rem 1rem",
              cursor: "pointer",
            }}
            onClick={handleCloseForm}
          >
            {"Back"}
          </MDTypography>
          <MDButton color="primary" onClick={() => setSaveData(true)}>
            Save
          </MDButton>
        </MDBox>
      )}
    </>
  );
}

export default ClientForm;
