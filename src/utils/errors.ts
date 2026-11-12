const GENERIC_ERROR = "Something went wrong. Please try again.";

// Turns any error (Apollo, Axios or plain) into text that is safe to show in a
// toast: the server's own message when there is one, never Axios's generic
// "Request failed with status code 400".
export const getErrorMessage = (error: any, fallback: string = GENERIC_ERROR): string => {
  const graphQLMessage = error?.graphQLErrors?.[0]?.message;
  if (graphQLMessage) return graphQLMessage;

  const serverMessage = error?.response?.data?.message;
  if (typeof serverMessage === "string" && serverMessage) return serverMessage;
  if (Array.isArray(serverMessage) && serverMessage[0]) return String(serverMessage[0]);

  if (error?.response?.status === 413) return "File is too large.";
  if (error?.networkError?.statusCode === 413) {
    return "Your press release is too large to save. Remove large pasted images or shorten it.";
  }
  if (error?.isAxiosError) {
    return error?.response ? fallback : "Could not reach the server. Please try again.";
  }
  return error?.message || fallback;
};

// Axios calls made with responseType "blob" get their error body as a Blob;
// read it so getErrorMessage can find the server's message.
export const getBlobErrorMessage = async (error: any, fallback?: string): Promise<string> => {
  const data = error?.response?.data;
  if (data instanceof Blob) {
    try {
      const parsed = JSON.parse(await data.text());
      return getErrorMessage({ ...error, response: { ...error.response, data: parsed } }, fallback);
    } catch {
      // not JSON: fall through to the generic message
    }
  }
  return getErrorMessage(error, fallback);
};
