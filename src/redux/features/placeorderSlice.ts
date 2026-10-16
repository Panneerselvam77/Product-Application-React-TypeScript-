import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import BaseUrl from "../../api/apiClient"; // Adjust path as needed
import type { CartItem } from "../features/cartSlice.ts";

export type ShippingAddress = {
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
};

export type OrderPayload = {
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  orderItems: CartItem[];
  totalAmount: number;
};

type PlaceOrderState = {
  loading: boolean;
  success: boolean;
  order: any | null;
  error: string | null;
};

const initialState: PlaceOrderState = {
  loading: false,
  success: false,
  order: null,
  error: null,
};

// Async thunk to submit order to the API
export const createOrder = createAsyncThunk(
  "order/createOrder",
  async (orderData: OrderPayload, { rejectWithValue }) => {
    try {
      // Adjust endpoint according to your backend (e.g., DummyJSON or custom API)
      const response = await BaseUrl.post("carts/add", orderData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to place order.");
    }
  },
);

const placeorderSlice = createSlice({
  name: "placeOrder",
  initialState,
  reducers: {
    resetOrderState: (state) => {
      state.loading = false;
      state.success = false;
      state.order = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.success = true;
        state.order = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetOrderState } = placeorderSlice.actions;
export default placeorderSlice.reducer;
