import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  deleteClient,
  getAllClients,
} from "../../services/request/clientService";

import "./Client.scss";

const ClientList = () => {
  const [clients, setClients] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    const data = await getAllClients();
    setClients(data);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this client?")) {
      await deleteClient(id);
      fetchClients();
    }
  };

  return (
    <div className="client-container">
      <h2>Clients List</h2>
      <button onClick={() => navigate("create-client")} className="add-btn">
        + Add Client
      </button>

      <table>
        <thead>
          <tr>
            <th>Emri dhe Mbiemri</th>
            <th>Adresa</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {clients.map((cli) => (
            <tr key={cli.id}>
              <td>{cli.name}</td>
              <td>{cli.address}</td>
              <td>{cli.phone}</td>
              <td>{cli.email}</td>

              <td>
                <button
                  onClick={() => navigate(`edit-client/${cli.id}`)}
                >
                  Edit
                </button>

                <button
                  className="delete-btn"
                  onClick={() => handleDelete(cli.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ClientList;
