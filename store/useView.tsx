// TODO: this use for cahnge view

import { create } from "zustand";

enum View {
  GRID,
  LIST,
}

const useView = create((set) => ({
  view: View.GRID,
  setView: (view: View) => set({ view }),
}));

export default useView;
