// TODO: this use for cahnge view

import { create } from "zustand";

export type View = "list" | "grid";

interface ViewState {
  view: View;
  setView: (view: View) => void;
}

const useView = create<ViewState>((set) => ({
  view: "list",
  setView: (view) => set({ view }),
}));

export default useView;
