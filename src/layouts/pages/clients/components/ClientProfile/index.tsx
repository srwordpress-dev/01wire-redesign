import React from "react";
import { useQuery } from "@apollo/client";
import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
import ProfileSection from "./components/ProfileSection";
import ClientRecentPR from "./components/ClientRecentPressRelease";
import {
  IGetClientById,
  IGetClientByIdVars,
  GET_CLIENT_BY_ID,
} from "graphql/queries/getClientById";
import {
  GET_ARTICLES,
  IGetArticles,
  IGetArticlesVars,
} from "graphql/queries/filterArticlesPaginated";
import MDCircularLoader from "components/MDCircularLoader";

const ClientProfile = ({ id }: { id: any }) => {
  const { data: clientData, loading } = useQuery<IGetClientById, IGetClientByIdVars>(
    GET_CLIENT_BY_ID,
    {
      variables: { id },
      fetchPolicy: "network-only",
    }
  );
  const { data: articlesData, loading: aLoading } = useQuery<IGetArticles, IGetArticlesVars>(
    GET_ARTICLES,
    {
      variables: {
        filterInput: {
          clientId: id,
        },
        paginationInput: {
          currentPage: 0,
          perPage: 3,
        },
      },
      fetchPolicy: "network-only",
    }
  );
  console.log("cData", clientData, "aData", articlesData);
  return (
    <MDBox minHeight={"400px"}>
      {loading || aLoading ? (
        <MDCircularLoader overlayloader startLoader />
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={12} md={7}>
            <ProfileSection data={clientData?.getClientById} />
          </Grid>
          <Grid item xs={12} md={5}>
            <ClientRecentPR data={articlesData?.filterArticlesPaginated?.data} />
          </Grid>
        </Grid>
      )}
    </MDBox>
  );
};

export default ClientProfile;
