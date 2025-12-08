import { useState } from "react";
import { getUserWorkTime } from "../../services/request/userSessionService";
import "./UserWorkTime.scss";

const UserWorkTime = () => {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [workTime, setWorkTime] = useState("");

  const fetchWorkTime = async () => {
    const userId = localStorage.getItem("userId");
    const wt = await getUserWorkTime(userId, date);
    setWorkTime(wt);
  };

  return (
    <div className="worktime-container">
      <h2 className="title">Oret e tua të punës</h2>

      <div className="input-group">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <button onClick={fetchWorkTime}>Shiko</button>
      </div>

      {workTime && <p className="result">{workTime}</p>}
    </div>
  );
};

export default UserWorkTime;
