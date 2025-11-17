import {
  faEnvelope,
  faSignOutAlt,
  faTachometerAlt
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useNavigate } from "react-router-dom";
import { logoutUser } from "../services/request/userSessionService";
import "./Sidebar.scss";

const AdminSidebar = () => {
  const navigate = useNavigate();

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
    <div className="sidebar">
      <ul>
        <li>
          <Link to="/admin/dashboard">
            <FontAwesomeIcon icon={faTachometerAlt} /> Dashboard
          </Link>
        </li>
        <li>
          <Link to="/admin/products">
            <FontAwesomeIcon icon={faEnvelope} /> Manage Products
          </Link>
        </li>
        <li>
          <Link to="/admin/suppliers">
            <FontAwesomeIcon icon={faTachometerAlt} /> Furnizuesit
          </Link>
        </li>
        <li>
          <Link to="/admin/order/create">
            <FontAwesomeIcon icon={faTachometerAlt} /> Orderi
          </Link>
        </li>

         <li>
          <Link to="/admin/my-work-times">
            <FontAwesomeIcon icon={faEnvelope} /> Oret e mia
          </Link>
        </li>
       
        <li>
          <Link to="/admin/user-work-overview">
            <FontAwesomeIcon icon={faTachometerAlt} /> Oret e userave tjere
          </Link>
        </li>
         <li>
          <Link to="/admin/invoice/create">
            <FontAwesomeIcon icon={faTachometerAlt} /> Regjistro fature
          </Link>
        </li>

         <li>
          <Link to="/admin/purchase/summary">
            <FontAwesomeIcon icon={faTachometerAlt} /> shiko blerjet
          </Link>
        </li>
        <li>
          <Link to="#" onClick={handleLogout}>
            <FontAwesomeIcon icon={faSignOutAlt} /> Log Out
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default AdminSidebar;
