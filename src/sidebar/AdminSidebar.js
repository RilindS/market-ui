import {
  faBars,
  faBox,
  faCalendarCheck,
  faCartPlus,
  faChartLine,
  faClock,
  faFileInvoiceDollar,
  faHistory,
  faMoneyBillWave,
  faShoppingBag,
  faSignOutAlt,
  faTruck,
  faUserFriends,
  faUsers,
  faWarehouse
} from "@fortawesome/free-solid-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logoutUser } from "../services/request/userSessionService";
import "./Sidebar.scss";

const AdminSidebar = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    const userId = localStorage.getItem("userId");
    try {
      await logoutUser(userId);
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      navigate("/login");
    }
  };

  return (
    <>
      {/* --- Hamburger Button --- */}
      <button className="sidebar-toggle-btn" onClick={() => setCollapsed(!collapsed)}>
        <FontAwesomeIcon icon={faBars} />
      </button>

      {/* --- Sidebar --- */}
      <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
        <ul>
          <li>
            <Link to="/admin/order/create">
              <FontAwesomeIcon icon={faCartPlus} />
              {!collapsed && " Krijo Porosi"}
            </Link>
          </li>
          <li>
            <Link to="/admin/invoice/create">
              <FontAwesomeIcon icon={faFileInvoiceDollar} />
              {!collapsed && " Regjistro Fature"}
            </Link>
          </li>
          <li>
            <Link to="/admin/products">
              <FontAwesomeIcon icon={faBox} />
              {!collapsed && "Menagjo Produktet"}
            </Link>
          </li>

          <li>
            <Link to="/admin/suppliers">
              <FontAwesomeIcon icon={faTruck} />
              {!collapsed && " Furnizuesit"}
            </Link>
          </li>


          <li>
            <Link to="/admin/purchase/summary">
              <FontAwesomeIcon icon={faShoppingBag} />
              {!collapsed && " Shiko Blerjet"}
            </Link>
          </li>

          <li>
            <Link to="/admin/reports">
              <FontAwesomeIcon icon={faChartLine} />
              {!collapsed && " Detajet e Shitjeve"}
            </Link>
          </li>

          <li>
            <Link to="/admin/debt-managment">
              <FontAwesomeIcon icon={faMoneyBillWave} />
              {!collapsed && " Borgjet"}
            </Link>
          </li>

          <li>
            <Link to="/admin/clients">
              <FontAwesomeIcon icon={faUserFriends} />
              {!collapsed && " Klientat"}
            </Link>
          </li>

          <li>
            <Link to="/admin/product-stats">
              <FontAwesomeIcon icon={faWarehouse} />
              {!collapsed && " Stoqet"}
            </Link>
          </li>

          <li>
            <Link to="/admin/product-history">
              <FontAwesomeIcon icon={faHistory} />
              {!collapsed && " Historia e Produkteve"}
            </Link>
          </li>
          <li>
            <Link to="/admin/my-work-times">
              <FontAwesomeIcon icon={faClock} />
              {!collapsed && " Oret e mia"}
            </Link>
          </li>

          <li>
            <Link to="/admin/user-work-overview">
              <FontAwesomeIcon icon={faUsers} />
              {!collapsed && " Oret e userave tjere"}
            </Link>
          </li>
       
          <li>
            <Link to="/admin/cash-record">
              <FontAwesomeIcon icon={faChartLine} />
              {!collapsed && "Hyrjet / Dalje"}
            </Link>
          </li>
           <li>
            <Link to="/admin/end-day">
              <FontAwesomeIcon icon={faCalendarCheck} />
              {!collapsed && " Përfundo Ditën"}
            </Link>
          </li>
             <li>
            <Link to="#" onClick={handleLogout}>
              <FontAwesomeIcon icon={faSignOutAlt} />
              {!collapsed && " Log Out"}
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
};

export default AdminSidebar;
