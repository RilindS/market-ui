import CreatePurchaseInvoice from "../components/invoice/CreatePurchaseInvoice";
import PurchaseSummary from "../components/invoice/PurchaseSummary";
import CreateOrder from "../components/order/CreateOrder";
import CreateProductPage from "../components/product/CreateProductPage";
import ProductListPage from "../components/product/ProductListPage";
import CreateSupplier from "../components/supplier/CreateSupplier";
import EditSupplier from "../components/supplier/EditSupplier";
import SupplierList from "../components/supplier/SupplierList";
import UserWorkTime from "../components/userSession/MyWorkTime";
import UserWorkOverview from "../components/userSession/UserWorkOverview";
export const AdminRoutes = [
    // { path: "/email", element: <EmailPage /> },
     { path: "products", element: <ProductListPage /> },
     { path: "create-product", element: <CreateProductPage /> },
     { path: "suppliers", element: <SupplierList /> },
     { path: "suppliers/create-supplier", element: <CreateSupplier /> },
     { path: "suppliers/edit-suppliers/:id", element: <EditSupplier /> },
    { path: "order/create", element: <CreateOrder /> },

    { path: "my-work-times", element: <UserWorkTime /> },
   { path: "user-work-overview", element: <UserWorkOverview /> },
      { path: "invoice/create", element: <CreatePurchaseInvoice /> },
    { path: "purchase/summary", element: <PurchaseSummary /> },






];

export const UserRoutes = [
//   { path: "/dashboard", element: <DoctorDashboard /> },
//   { path: "/", element: <DoctorDashboard /> },
{ path: "create-supplier", element: <ProductListPage /> },

];

