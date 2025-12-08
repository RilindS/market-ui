import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getClientById,
  updateClient,
} from "../../services/request/clientService";
import "./Client.scss";

const EditClient = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [client, setClient] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    async function fetchClient() {
      const data = await getClientById(id);
      setClient(data);
    }
    fetchClient();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setClient((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateClient(id, client);
    navigate("/admin/clients");
  };

  return (
    <div className="client-container">
      <h2>Edit Client</h2>
      <form onSubmit={handleSubmit} className="client-form">
        <input type="text" name="name" value={client.name}
               onChange={handleChange} required />

        <input type="text" name="address" value={client.address}
               onChange={handleChange} />

        <input type="text" name="phone" value={client.phone}
               onChange={handleChange} />

        <input type="email" name="email" value={client.email}
               onChange={handleChange} />

        <button type="submit">Update</button>
      </form>
    </div>
  );
};

export default EditClient;
