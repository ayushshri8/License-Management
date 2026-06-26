import { Routes, Route } from "react-router-dom";
import Login         from "../Pages/Login/Login";
import Dashboard     from "../Pages/Dashboard/Dashboard";
import ClientsPage   from "../Pages/Clients/clients";
import ProfilePage   from "../Pages/Profile/Profile";
import ProductsPage  from "../Pages/Products/Products";
import LicensesPage  from "../Pages/Licenses/Licenses";
import SettingsPage  from "../Pages/Settings/Settings";
import ProtectedRoute from "../Components/ProtectedRoute";
import MainLayout     from "../Layouts/MainLayout";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/clients"   element={<ClientsPage />} />
          <Route path="/products"  element={<ProductsPage />} />
          <Route path="/licenses"  element={<LicensesPage />} />
          <Route path="/profile"   element={<ProfilePage />} />
          <Route path="/settings"  element={<SettingsPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default AppRoutes;
