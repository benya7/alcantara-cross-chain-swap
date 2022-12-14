import { useState } from "react";

export default function useLoading() {
  const [isLoading, setIsLoading] = useState(false);

  const startLoad = () => setIsLoading(true);
  const stopLoad = () => setIsLoading(false);
  return { isLoading, startLoad, stopLoad };
}
