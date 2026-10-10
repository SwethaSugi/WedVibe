"use client";

import { createContext, useContext } from "react";

// Lets the photo/song upload fields inside an invitation editor upload on behalf of a customer
// details link (no login): the page sets the link's token, and every upload carries it.
const UploadAuthContext = createContext<{ detailsToken?: string }>({});

export const UploadAuthProvider = UploadAuthContext.Provider;

export function useUploadAuth() {
  return useContext(UploadAuthContext);
}
