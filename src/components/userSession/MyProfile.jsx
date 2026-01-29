import { useContext } from "react";
import { AuthContext } from "../../services/auth/AuthContext";

const MyProfile = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div style={styles.center}>Duke u ngarkuar profili...</div>;
  if (!user) return <div style={styles.center}>Nuk ka user të loguar.</div>;

  const getRoleDisplay = (role) => {
    if (!role) return "Pa rol";

    
    if (Array.isArray(role)) {
      return role.map((r) => r.name).join(", ");
    }

    if (typeof role === "object") {
      return role.name;
    }

    return role; 
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Profili Im</h2>

      <div style={styles.card}>
        <ProfileRow label="Emri" value={user.firstName} />
        <ProfileRow label="Mbiemri" value={user.lastName} />
        <ProfileRow label="Email" value={user.email} />
        <ProfileRow label="Telefoni" value={user.phoneNumber} />
        <ProfileRow label="Roli" value={getRoleDisplay(user.role)} />
      </div>
    </div>
  );
};

const ProfileRow = ({ label, value }) => (
  <div style={styles.row}>
    <span style={styles.label}>{label}:</span>
    <span style={styles.value}>{value}</span>
  </div>
);

const styles = {
  container: {
    padding: "40px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  title: {
    marginBottom: "20px",
  },
  card: {
    width: "100%",
    maxWidth: "500px",
    background: "#fff",
    padding: "20px 30px",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 0",
    borderBottom: "1px solid #eee",
  },
  label: {
    fontWeight: "bold",
  },
  value: {
    color: "#333",
  },
  center: {
    padding: "40px",
    textAlign: "center",
  },
};

export default MyProfile;
