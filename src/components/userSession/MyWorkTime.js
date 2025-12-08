import { useState } from "react";
import { getUserWorkTime } from "../../services/request/userSessionService";

const UserWorkTime = () => {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [workTime, setWorkTime] = useState("");

 const fetchWorkTime = async () => {
  const userId = localStorage.getItem("userId");
  const workTime = await getUserWorkTime(userId, date);
  setWorkTime(workTime);
};

  return (
    <div>
      <h2>Your Work Time</h2>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <button onClick={fetchWorkTime}>Check</button>
      <p>{workTime}</p>
    </div>
  );
};

export default UserWorkTime;
