import {
  faBars,
  faBox,
  faCalendarCheck,
  faCartPlus,
  faChartBar,
  faChartLine,
  faClock,
  faFileInvoiceDollar,
  faHistory,
  faMoneyBillWave,
  faShoppingBag,
  faSignOutAlt,
  faTruck,
  faUserCircle,
  faUserFriends,
  faWarehouse
} from "@fortawesome/free-solid-svg-icons";


import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { logoutUser } from "../services/request/userSessionService";

import { Link, useNavigate } from "react-router-dom";
import "./Sidebar.scss";

const UserSidebar = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false); // ⚠️ SHTUAR

 const handleLogout = async () => {
    const userId = localStorage.getItem("userId");
    try {
      await logoutUser(userId);
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      localStorage.removeItem("authToken");
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
            <Link to="/user/order/create">
              <FontAwesomeIcon icon={faCartPlus} />
              {!collapsed && " Krijo Porosi"}
            </Link>
          </li>
          <li>
            <Link to="/user/products">
              <FontAwesomeIcon icon={faBox} />
              {!collapsed && " Manage Products"}
            </Link>
          </li>
           <li>
            <Link to="/user/invoice/create">
              <FontAwesomeIcon icon={faFileInvoiceDollar} />
              {!collapsed && " Regjistro Fature"}
            </Link>
          </li>
          
          <li>
            <Link to="/user/purchase/summary">
             <FontAwesomeIcon icon={faShoppingBag} />
              {!collapsed && " Shiko Blerjet"}
            </Link>
          </li>

          <li>
            <Link to="/user/suppliers">
              <FontAwesomeIcon icon={faTruck} />
              {!collapsed && " Furnizuesit"}
            </Link>
          </li>

          <li>
            <Link to="/user/my-work-times">
              <FontAwesomeIcon icon={faClock} />
              {!collapsed && " Oret e mia"}
            </Link>
          </li>
          <li>
            <Link to="/user/reports">
              <FontAwesomeIcon icon={faChartLine} />
              {!collapsed && " Detajet e Shitjeve"}
            </Link>
          </li>
      
          <li>
            <Link to="/user/debt-managment">
              <FontAwesomeIcon icon={faMoneyBillWave} />
              {!collapsed && " Borgjet"}
            </Link>
          </li>

          <li>
            <Link to="/user/clients">
              <FontAwesomeIcon icon={faUserFriends} />
              {!collapsed && " Klientat"}
            </Link>
          </li>

          <li>
            <Link to="/user/end-day">
              <FontAwesomeIcon icon={faCalendarCheck} />
              {!collapsed && " Përfundo Ditën"}
            </Link>
          </li>

          <li>
            <Link to="/user/product-stats">
              <FontAwesomeIcon icon={faWarehouse} />
              {!collapsed && " Stoqet"}
            </Link>
          </li>

          <li>
            <Link to="/user/product-history">
              <FontAwesomeIcon icon={faHistory} />
              {!collapsed && " Historia e Produkteve"}
            </Link>
          </li>

         <li>
          <Link to="/user/product-sales-history">
            <FontAwesomeIcon icon={faChartBar} />
            {!collapsed && "Shitjet e Produkteve"}
          </Link>
        </li>

        <li>
          <Link to="/user/my-profile">
            <FontAwesomeIcon icon={faUserCircle} />
            {!collapsed && " Profili Im"}
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

export default UserSidebar;
