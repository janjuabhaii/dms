import { useEffect, useState } from "react";

/**
 * Returns `value`, but only updates after it's stopped changing for `delay`ms.
 * Used on the product search input so typing "surf excel" doesn't fire 10
 * separate API requests — just one, after the person pauses.
 */
export const useDebounce = (value, delay = 300) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
};
