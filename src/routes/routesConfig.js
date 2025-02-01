import CreateProductPage from "../components/product/CreateProductPage";
import ProductListPage from "../components/product/ProductListPage";
import CreateSupplier from "../components/supplier/CreateSupplier";
import EditSupplier from "../components/supplier/EditSupplier";
import SupplierList from "../components/supplier/SupplierList";
export const AdminRoutes = [
    // { path: "/email", element: <EmailPage /> },
     { path: "products", element: <ProductListPage /> },
     { path: "create-product", element: <CreateProductPage /> },
     { path: "suppliers", element: <SupplierList /> },
     //{ path: "create", element: <CreateSupplier /> },
     { path: "suppliers/create-suppliers", element: <CreateSupplier /> },
     { path: "suppliers/edit-suppliers/:id", element: <EditSupplier /> },

];

export const UserRoutes = [
//   { path: "/dashboard", element: <DoctorDashboard /> },
//   { path: "/", element: <DoctorDashboard /> },
{ path: "create-supplier", element: <ProductListPage /> },

];

