import { createContext, useContext } from "react";
import { AdminContextType } from "../types/common";

export const AdminContext = createContext<AdminContextType | undefined | null>(
  null
);

export const useAdmin = (): AdminContextType | null => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within AdminProvider");
  }
  return context;
};
