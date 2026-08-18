import { useEffect, useState } from "react";

const TOAST_LIMIT = 3;
const TOAST_REMOVE_DELAY = 4000;

/**
 * A tiny store (module-level, not React context) that any component can
 * import `toast()` from directly — no <ToastProvider> wrapping needed beyond
 * mounting <Toaster/> once at the app root to render whatever's in the list.
 * This is the same pattern Shadcn's own toast hook uses.
 */
let count = 0;
const genId = () => (count = (count + 1) % Number.MAX_SAFE_INTEGER).toString();

let listeners = [];
let memoryState = { toasts: [] };

const dispatch = (action) => {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => listener(memoryState));
};

function reducer(state, action) {
  switch (action.type) {
    case "ADD_TOAST":
      return { ...state, toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT) };
    case "DISMISS_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toastId || action.toastId === undefined ? { ...t, open: false } : t
        ),
      };
    case "REMOVE_TOAST":
      if (action.toastId === undefined) return { ...state, toasts: [] };
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.toastId) };
    default:
      return state;
  }
}

export const toast = ({ variant = "default", title, description }) => {
  const id = genId();

  const update = (props) => dispatch({ type: "ADD_TOAST", toast: { ...props, id } });
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id });

  dispatch({
    type: "ADD_TOAST",
    toast: {
      id,
      variant,
      title,
      description,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      },
    },
  });

  setTimeout(() => {
    dismiss();
    setTimeout(() => dispatch({ type: "REMOVE_TOAST", toastId: id }), 300);
  }, TOAST_REMOVE_DELAY);

  return { id, update, dismiss };
};

export const useToast = () => {
  const [state, setState] = useState(memoryState);

  useEffect(() => {
    listeners.push(setState);
    return () => {
      listeners = listeners.filter((l) => l !== setState);
    };
  }, []);

  return { ...state, toast };
};
