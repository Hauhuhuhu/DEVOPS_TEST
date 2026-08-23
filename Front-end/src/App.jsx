import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Dashboard from "./pages/Dashboard";
import Explore from "./pages/Explore/Explore";
import ManageItems from "./pages/ManageItems";
import ManageCategory from "./pages/ManageCategory";
import ManageUsers from "./pages/ManageUsers";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import Login from "./pages/Login";
import AppLayout from "./ui/AppLayout";
import ProtectedRoute from "./features/Auth/ProtectedRoute";
import OrderHistory from "./pages/OrderHistory";
import NotFound from "./ui/NotFound";
import AdminRoute from "./features/Auth/AdminRoute";
import { queryClient } from "./utils/queryClient";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster />

        <Routes>
          <Route path="/login" element={<Login />} />
          {/* <Route path="/register" element={<Register />} />  */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/explore" element={<Explore />} />
              <Route element={<AdminRoute />}>
                <Route path="/items" element={<ManageItems />} />
                <Route path="/categories" element={<ManageCategory />} />
                <Route path="/users" element={<ManageUsers />} />
              </Route>
                <Route path="/orders" element={<OrderHistory />} />
              <Route path="/" element={<Dashboard />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
export default App;
