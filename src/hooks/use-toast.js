import { useEffect, useState } from "react";

let count = 0;
const listeners = [];
let memoryState = { toasts: [] };

function genId() {
  count += 1;
  return String(count);
}

function dispatch(action) {
  if (action.type === "ADD_TOAST") {
    memoryState = { toasts: [action.toast, ...memoryState.toasts].slice(0, 1) };
  }

  if (action.type === "DISMISS_TOAST") {
    memoryState = {
      toasts: memoryState.toasts.map((toast) =>
        toast.id === action.toastId || action.toastId === undefined ? { ...toast, open: false } : toast,
      ),
    };
  }

  if (action.type === "REMOVE_TOAST") {
    memoryState = action.toastId
      ? { toasts: memoryState.toasts.filter((toast) => toast.id !== action.toastId) }
      : { toasts: [] };
  }

  listeners.forEach((listener) => listener(memoryState));
}

export function toast({ title, description, variant = "default" } = {}) {
  const id = genId();

  dispatch({
    type: "ADD_TOAST",
    toast: { id, title, description, variant, open: true },
  });

  setTimeout(() => dispatch({ type: "REMOVE_TOAST", toastId: id }), 3000);

  return {
    id,
    dismiss: () => dispatch({ type: "DISMISS_TOAST", toastId: id }),
  };
}

export function useToast() {
  const [state, setState] = useState(memoryState);

  useEffect(() => {
    listeners.push(setState);

    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  return {
    ...state,
    toast,
    dismiss: (toastId) => dispatch({ type: "DISMISS_TOAST", toastId }),
  };
}
