import { useState, useCallback } from "react";

export const useAsync = (asyncFn) => {
  const [state, setState] = useState({ data: null, loading: false, error: null });

  const execute = useCallback(
    async (...args) => {
      setState({ data: null, loading: true, error: null });
      try {
        const data = await asyncFn(...args);
        setState({ data, loading: false, error: null });
        return data;
      } catch (err) {
        setState({ data: null, loading: false, error: err.message || "Something went wrong" });
        throw err;
      }
    },
    [asyncFn]
  );

  const reset = () => setState({ data: null, loading: false, error: null });

  return { ...state, execute, reset };
};
