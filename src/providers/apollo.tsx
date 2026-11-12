import React from "react";
import { ApolloProvider } from "@apollo/client";
import { client } from "./apollo-client";

const Provider = ({ children }: any) => {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

export default Provider;
