import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createClient } from "../../services/request/clientService";
import "./Client.scss";

const CreateClient = () => {
  const [client, setClient] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setClient((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createClient(client);
      navigate("/admin/clients");
    } catch (error) {}
  };

  return (
    <form onSubmit={handleSubmit} className="client-form">
      <input type="text" name="name" placeholder="Emri dhe Mbiemri"
             value={client.name} onChange={handleChange} required />

      <input type="text" name="address" placeholder="Adresa"
             value={client.address} onChange={handleChange} />

      <input type="tel" name="phone" placeholder="Phone"
             value={client.phone} onChange={handleChange} />

      <input type="email" name="email" placeholder="Email"
             value={client.email} onChange={handleChange} />

      <button type="submit">Create Client</button>
    </form>
  );
};

export default CreateClient;
