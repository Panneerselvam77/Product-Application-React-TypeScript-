import { useDispatch, useSelector } from "react-redux";
import type { Rootstate, AppDispatch } from "../redux/store";

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <TSelected>(
  selector: (state: Rootstate) => TSelected,
) => useSelector(selector);
