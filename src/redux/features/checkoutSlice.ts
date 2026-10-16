import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import BaseUrl from "../../api/apiClient"; // Adjust path as needed

export type ShippingAddress = {
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
};

export type CheckoutState = {
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  isSubmitting: boolean;
  error: string | null;
  orderSuccess: boolean;
  orderId: string | null;
};

const initialState: CheckoutState = {
  shippingAddress: {
    fullName: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
  },
  paymentMethod: "Credit Card",
  isSubmitting: false,
  error: null,
  orderSuccess: false,
  orderId: null,
};

// Simulate placing an order via an API call
export const placeOrder = createAsyncThunk(
  "checkout/placeOrder",
  async (
    orderData: {
      shippingAddress: ShippingAddress;
      paymentMethod: string;
      items: any[];
      totalAmount: number;
    },
    { rejectWithValue },
  ) => {
    try {
      // Replace with your actual backend endpoint, e.g., BaseUrl.post("orders", orderData)
      const response = await BaseUrl.post("orders/add", orderData);
      return response; // Returns created order details
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to process order.");
    }
  },
);

const checkoutSlice = createSlice({
  name: "checkout",
  initialState,
  reducers: {
    saveShippingAddress(state, action: PayloadAction<ShippingAddress>) {
      state.shippingAddress = action.payload;
    },
    savePaymentMethod(state, action: PayloadAction<string>) {
      state.paymentMethod = action.payload;
    },
    resetCheckout(state) {
      state.isSubmitting = false;
      state.error = null;
      state.orderSuccess = false;
      state.orderId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(placeOrder.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.orderSuccess = true;
        state.orderId =
          action.payload?.data?.id ||
          Math.floor(Math.random() * 1000000).toString();
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      });
  },
});

export const { saveShippingAddress, savePaymentMethod, resetCheckout } =
  checkoutSlice.actions;
export default checkoutSlice.reducer;
