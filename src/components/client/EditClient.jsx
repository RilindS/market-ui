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

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        setLoading(true);
        const data = await getClientById(id);
        setClient({
          name: data.name || "",
          address: data.address || "",
          phone: data.phone || "",
          email: data.email || "",
        });
      } catch (error) {
        alert("Gabim gjatë ngarkimit të klientit!");
        navigate("..");
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setClient((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateClient(id, client);
    navigate("../..", { relative: "path" });
    } catch (error) {
      alert("Gabim gjatë përditësimit të klientit!");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p style={{ padding: "20px" }}>Duke ngarkuar të dhënat...</p>;
  }

  return (
    <div className="client-form-wrapper">
      <h2>✏️ Edito Klientin</h2>

      <form onSubmit={handleSubmit} className="client-form-card">
        <div className="form-group">
          <label>Emri dhe Mbiemri *</label>
          <input
            type="text"
            name="name"
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
            value={client.address}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Telefoni</label>
          <input
            type="tel"
            name="phone"
            value={client.phone}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={client.email}
            onChange={handleChange}
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={() => navigate("../..", { relative: "path" })}
          >
            Anulo
          </button>

          <button type="submit" className="btn-save" disabled={saving}>
            {saving ? "Duke ruajtur..." : "Ruaj Ndryshimet"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditClient;
