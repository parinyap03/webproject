import React, { useEffect, useState } from "react";
import { useAuth } from "../../../contexts/authContext";
import { getDoc, setDoc, doc } from "firebase/firestore";
import { db } from "../../../firebase/firebase";
import { v4 as uuidv4 } from "uuid";

const Teacher = () => {
  const { currentUser } = useAuth();
  const [name, setName] = useState("");
  const [idCheck, setIdCheck] = useState("");
  const [date, setDate] = useState(new Date());

  const [subjectName, setSubjectName] = useState("");
  const [roomNumber, setRoomNumber] = useState("");

  useEffect(() => {
    const fetchName = async () => {
      const teacherRef = doc(db, "teachers", currentUser.email);
      const teacherDoc = await getDoc(teacherRef);
      setName(teacherDoc.data().displayName);
    };
    fetchName();
  }, [currentUser.email]);

  useEffect(() => {
    const timer = setInterval(() => {
      setDate(new Date());
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, []);

  const generateIdCheck = async () => {
    const docData = {
      subject: subjectName,
      room: roomNumber,
      class_date: new Date(),
    };

    const docId = uuidv4().substr(0, 5);
    await setDoc(doc(db, "checkin", docId), docData);
    setIdCheck(docId);
  };

  return (
    <div>
      <div className="text-2xl font-bold pt-14">
        Hello {name ? name : currentUser.email}, You are a teacher.
      </div>
      <br />
      <div>CheckIn ID: {idCheck}</div>
      <div>
        <select
          value={subjectName}
          onChange={(e) => setSubjectName(e.target.value)}
        >
          <option value="">Select a subject</option>
          <option value="software engineering">Software Engineering</option>
          <option value="mobile web">Mobile Web</option>
        </select>
        &nbsp;&nbsp;&nbsp;
        <select
          value={roomNumber}
          onChange={(e) => setRoomNumber(e.target.value)}
        >
          <option value="">Select a room</option>
          <option value="9226">9226</option>
          <option value="9227">9227</option>
          <option value="9228">9228</option>
          <option value="9127">9127</option>
          <option value="9525">9525</option>
        </select>
        &nbsp;&nbsp;&nbsp;
        <button
          style={{
            backgroundColor: "blue",
            color: "white",
            padding: "10px 20px",
            borderRadius: "5px",
          }}
          type="submit"
          value="Submit"
          onClick={generateIdCheck}
          disabled={!subjectName || !roomNumber} // Button will be disabled if either subjectName or roomNumber is null
        >
          Create ID for Check-in
        </button>

        <button
          style={{
            backgroundColor: "red",
            color: "white",
            padding: "10px 20px",
            borderRadius: "5px",
            marginLeft: "10px",
          }}
          type="button"
          onClick={() => {
            setSubjectName("");
            setRoomNumber("");
            setIdCheck("");
          }}
        >
          Reset
        </button>
      </div>
      <br />
      <div>
        Date: {date.toLocaleDateString()} &nbsp; Time:{" "}
        {date.toLocaleTimeString()}
      </div>
    </div>
  );
};

export default Teacher;
