import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "antd/dist/reset.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ConfigProvider } from "antd";
import "./index.css"
import { ConfirmProvider } from "./components/common/confirm/ConfirmProvider";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#2f55d4",
          colorBgBase: "#f5f7fc",
          colorTextBase: "#233456",
          borderRadius: 8,
        },
        components: {
          Button: { primaryShadow: "none" },
          Card: { boxShadow: "none" },
          Input: { activeShadow: "none" },
          Select: { activeOutlineColor: "transparent" },
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <ConfirmProvider>
          <BrowserRouter>
              <App />
           </BrowserRouter>
        </ConfirmProvider>
      </QueryClientProvider>
    </ConfigProvider>
  </React.StrictMode>
);
