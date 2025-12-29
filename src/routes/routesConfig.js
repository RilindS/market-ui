import ClientList from "../components/client/ClientList.jsx";
import CreateClient from "../components/client/CreateClient.jsx";
import DebtManagement from "../components/client/DebtManagement.jsx";
import EditClient from "../components/client/EditClient.jsx";
import CashPage from "../components/dailyCashRecord/CashPage.js";
import CashRecordsPage from "../components/dailyCashRecord/CashRecordsPage.jsx";
import CreatePurchaseInvoice from "../components/invoice/CreatePurchaseInvoice";
import ProductPurchaseHistory from "../components/invoice/ProductPurchaseHistory";
import PurchaseSummary from "../components/invoice/PurchaseSummary";
import CreateOrder from "../components/order/CreateOrder";
import OrderDetailsPage from "../components/order/OrderDetailsPage";
import ReportsPage from "../components/order/ReportsPage";
import CreateProductPage from "../components/product/CreateProductPage";
import ProductListPage from "../components/product/ProductListPage";
import ProductStats from "../components/product/ProductStats.jsx";
import CreateSupplier from "../components/supplier/CreateSupplier";
import EditSupplier from "../components/supplier/EditSupplier";
import SupplierList from "../components/supplier/SupplierList";
import SupplierProducts from "../components/supplier/SupplierProducts";
import UserWorkTime from "../components/userSession/MyWorkTime";
import UserWorkOverview from "../components/userSession/UserWorkOverview";


export const AdminRoutes = [
    // { path: "/email", element: <EmailPage /> },
     { path: "products", element: <ProductListPage /> },
     { path: "create-product", element: <CreateProductPage /> },
     { path: "suppliers", element: <SupplierList /> },
     { path: "suppliers/create-supplier", element: <CreateSupplier /> },
     { path: "suppliers/edit-suppliers/:id", element: <EditSupplier /> },

     { path: "clients", element: <ClientList /> },
     { path: "clients/create-client", element: <CreateClient /> },
     { path: "clients/edit-client/:id", element: <EditClient /> },

     { path: "order/create", element: <CreateOrder /> },

     { path: "my-work-times", element: <UserWorkTime /> },
     { path: "user-work-overview", element: <UserWorkOverview /> },
     { path: "invoice/create", element: <CreatePurchaseInvoice /> },
     { path: "purchase/summary", element: <PurchaseSummary /> },
     { path: "product-history/:id", element: <ProductPurchaseHistory /> },
     { path: "product-history", element: <ProductPurchaseHistory /> },
     { path: "supplier-products", element: <SupplierProducts /> },
     { path: "/reports", element: <ReportsPage /> },
     { path: "/order/:id", element: <OrderDetailsPage /> },
     { path: "/end-day", element: <CashPage /> },
     { path: "/debt-managment", element: <DebtManagement /> },
     { path: "/product-stats", element: <ProductStats /> },
        //{ path: "/product-stats", element: <ProductStats /> },
        { path: "/cash-record", element: <CashRecordsPage /> },




];

export const UserRoutes = [
//   { path: "/dashboard", element: <DoctorDashboard /> },
{ path: "products", element: <ProductListPage /> },
     { path: "create-product", element: <CreateProductPage /> },
     { path: "suppliers", element: <SupplierList /> },
     { path: "suppliers/create-supplier", element: <CreateSupplier /> },
     { path: "suppliers/edit-suppliers/:id", element: <EditSupplier /> },

     { path: "clients", element: <ClientList /> },
     { path: "clients/create-client", element: <CreateClient /> },
     { path: "clients/edit-client/:id", element: <EditClient /> },
     

     { path: "order/create", element: <CreateOrder /> },

     { path: "my-work-times", element: <UserWorkTime /> },
     { path: "user-work-overview", element: <UserWorkOverview /> },
     { path: "invoice/create", element: <CreatePurchaseInvoice /> },
     { path: "purchase/summary", element: <PurchaseSummary /> },
     { path: "product-history/:id", element: <ProductPurchaseHistory /> },
     { path: "product-history", element: <ProductPurchaseHistory /> },
     { path: "supplier-products", element: <SupplierProducts /> },
     { path: "/reports", element: <ReportsPage /> },
     { path: "/order/:id", element: <OrderDetailsPage /> },
     { path: "/end-day", element: <CashPage /> },
     { path: "/debt-managment", element: <DebtManagement /> },
     { path: "/product-stats", element: <ProductStats /> },
        //{ path: "/product-stats", element: <ProductStats /> },
    { path: "/cash-record", element: <CashRecordsPage /> },


];

