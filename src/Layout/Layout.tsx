import React from "react";
import NavBar from "../component/NavBar";
import { ToastContainer } from "react-toastify";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-continar">
      <NavBar />
      <main>{children}</main>
      <ToastContainer
        position="bottom-right"
        autoClose={2000}
        limit={3}
        newestOnTop
        theme="colored"
      />
    </div>
  );
}
