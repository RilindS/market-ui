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

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setClient((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await createClient(client);
      navigate(".."); // kthehet te ClientList (relative route)
    } catch (error) {
      alert("Gabim gjatë krijimit të klientit!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="client-form-wrapper">
      <h2>➕ Shto Klient të Ri</h2>

      <form onSubmit={handleSubmit} className="client-form-card">
        <div className="form-group">
          <label>Emri dhe Mbiemri *</label>
          <input
            type="text"
            name="name"
            placeholder="p.sh. Rilind Simnica"
            value={client.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Adresa</label>
          <input
            type="text"
            name="address"
            placeholder="Prishtinë, Kosovë"
            value={client.address}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Telefoni</label>
          <input
            type="tel"
            name="phone"
            placeholder="+383 44 123 456"
            value={client.phone}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="email@example.com"
            value={client.email}
            onChange={handleChange}
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={() => navigate("/user/clients")}
          >
            Anulo
          </button>

          <button type="submit" className="btn-save" disabled={loading}>
            {loading ? "Duke ruajtur..." : "Ruaj Klientin"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateClient;
