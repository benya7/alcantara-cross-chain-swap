import { createContext, ReactNode, useContext, useRef } from "react";
import { ApiClient, ApiService } from "../utils/apiClient";

export const ApiServiceContext = createContext<ApiService | undefined>(undefined);

interface Props {
  children: ReactNode;
}
const ApiServiceProvider = ({ children }: Props) => {
  const service = useRef(new ApiClient({
    baseUrl: 'https://api.1inch.io/v5.0',
    debug: false
  }));
  return (
    <ApiServiceContext.Provider value={service.current}
    >
      {children}
    </ApiServiceContext.Provider>
  )
}

const useApiService = () => useContext(ApiServiceContext)!;

export { ApiServiceProvider, useApiService };