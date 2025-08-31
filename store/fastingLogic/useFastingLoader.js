import { useEffect } from "react";

export default function useFastingLoader(load, dispatch) {
  useEffect(() => {
    let active = true;
    (async () => {
      const res = await load();
      if (active) dispatch({ type: "LOADED", payload: res });
    })();
    return () => {
      active = false;
    };
  }, [load, dispatch]);
}