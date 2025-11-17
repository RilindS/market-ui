import { useEffect, useState } from "react";
import { fetchUsers } from "../../services/auth/auth";
import { getUserSessions, getUserWorkTime } from "../../services/request/userSessionService";

const UserWorkOverview = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [startDate, setStartDate] = useState(formatDate(new Date()));
  const [endDate, setEndDate] = useState(formatDate(new Date()));
  const [sessions, setSessions] = useState([]);
  const [workTime, setWorkTime] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔹 Merr listën e userave (vetëm 1 herë)
  const loadUsers = async () => {
    try {
      const usersData = await fetchUsers();
      setUsers(usersData);
    } catch (err) {
      console.error("Gabim gjatë marrjes së userave:", err);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // 🔹 Merr sesionet dhe orët e punës për userin e zgjedhur
  const fetchData = async () => {
    if (!selectedUser) return;
    setLoading(true);
    try {
      const sessionsData = await getUserSessions(selectedUser, toIsoDate(startDate), toIsoDate(endDate));
      const formattedSessions = sessionsData.map((s) => ({
        ...s,
        loginTime: formatDateTime(s.loginTime),
        logoutTime: formatDateTime(s.logoutTime),
      }));
      setSessions(formattedSessions);

      const today = new Date().toISOString().slice(0, 10);
      const workTimeToday = await getUserWorkTime(selectedUser, today);
      setWorkTime(formatDuration(workTimeToday));
    } catch (err) {
      console.error("Gabim gjatë marrjes së të dhënave:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Employee Work Overview</h2>

      <div style={styles.section}>
        <label style={styles.label}>Select Employee:</label>
        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          style={styles.select}
        >
          <option value="">-- Select User --</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.firstName} {user.lastName} ({user.email})
            </option>
          ))}
        </select>
      </div>

      {selectedUser && (
        <>
          <div style={styles.dateContainer}>
            <div>
              <label style={styles.label}>Start Date:</label>
              <input
                type="text"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="dd/mm/yyyy"
                style={styles.input}
              />
            </div>
            <div>
              <label style={styles.label}>End Date:</label>
              <input
                type="text"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="dd/mm/yyyy"
                style={styles.input}
              />
            </div>
            <button onClick={fetchData} style={styles.button} disabled={loading}>
              {loading ? "Loading..." : "Show Work Time"}
            </button>
          </div>

          {workTime && (
            <div style={styles.summaryBox}>
              <h3>
                Total work for this day: <span style={styles.highlight}>{workTime}</span>
              </h3>
            </div>
          )}

          {sessions.length > 0 && (
            <div style={{ marginTop: "20px" }}>
              <h3 style={styles.subtitle}>Session History</h3>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>Login Time</th>
                    <th>Logout Time</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s, index) => (
                    <tr key={index}>
                      <td>{s.loginTime}</td>
                      <td>{s.logoutTime}</td>
                      <td>{formatDuration(s.duration)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UserWorkOverview;

//
// 🔧 Funksione ndihmëse për formatim
//
function formatDate(date) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function toIsoDate(ddmmyyyy) {
  const [day, month, year] = ddmmyyyy.split("/");
  return `${year}-${month}-${day}`;
}

// Shfaq datën në formatin “dd/mm/yyyy hh:mm” (pa sekonda)
// Shfaq datën në formatin “dd/mm/yyyy hh:mm” (pa sekonda)
function formatDateTime(dateTime) {
  if (!dateTime) return "";
  const d = new Date(dateTime);

  // Nëse data nuk është e vlefshme, kthe bosh
  if (isNaN(d.getTime())) return "active";

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}


function formatDuration(duration) {
  if (!duration) return "";
  return duration.replace(/:\d{2}$/, ""); // heq sekondat nëse ekzistojnë
}

//
// 💅 Stilet inline për pamje moderne
//
const styles = {
  container: {
    maxWidth: "800px",
    margin: "40px auto",
    padding: "20px",
    borderRadius: "16px",
    backgroundColor: "#f9fafb",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  title: {
    textAlign: "center",
    color: "#2c3e50",
    marginBottom: "20px",
  },
  section: {
    marginBottom: "20px",
  },
  label: {
    marginRight: "10px",
    fontWeight: "bold",
    color: "#34495e",
  },
  select: {
    padding: "8px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    minWidth: "250px",
  },
  dateContainer: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    marginTop: "10px",
  },
  input: {
    padding: "6px 8px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    width: "130px",
  },
  button: {
    backgroundColor: "#3498db",
    color: "#fff",
    padding: "8px 16px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  summaryBox: {
    marginTop: "20px",
    padding: "15px",
    backgroundColor: "#eaf7ff",
    borderRadius: "10px",
    textAlign: "center",
  },
  highlight: {
    color: "#2980b9",
    fontWeight: "bold",
  },
  subtitle: {
    color: "#2c3e50",
    marginBottom: "10px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    border: "1px solid #ccc",
  },
  th: {
    backgroundColor: "#ecf0f1",
    padding: "8px",
  },
  td: {
    padding: "8px",
    textAlign: "center",
  },
};
