import React, { useEffect, useState } from "react";
import { useAuth } from "../../../contexts/authContext/AuthContext";
import {
  getDoc,
  setDoc,
  doc,
  collection,
  query,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../../firebase/firebase";
import { v4 as uuidv4 } from "uuid";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

const Teacher = () => {
  const { currentUser } = useAuth();
  const [name, setName] = useState("");
  const [idCheck, setIdCheck] = useState("");
  const [date, setDate] = useState(new Date());
  const [subjectName, setSubjectName] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [checkInData, setCheckInData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchName = async () => {
      const teacherRef = doc(db, "teachers", currentUser.email);
      const teacherDoc = await getDoc(teacherRef);
      if (teacherDoc.exists()) {
        setName(teacherDoc.data().displayName); // Update name state with the fetched name
      }
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
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You are about to generate a new check-in ID.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, generate it!",
    });

    if (result.isConfirmed) {
      const docData = {
        // subject: subjectName,
        // room: roomNumber,
        class_date: new Date(),
        teachers: name,
      };

      const docId = uuidv4().substr(0, 5);
      await setDoc(doc(db, "attendance", docId), docData);
      setIdCheck(docId);

      Swal.fire(
        "Generated!",
        `Your check-in ID has been generated. The ID is ${docId}.`,
        "success"
      );
      fetchCheckInData();
    }
  };

  const fetchCheckInData = async () => {
    const q = query(collection(db, "attendance"));
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setCheckInData(data);
  };

  useEffect(() => {
    fetchCheckInData();
  }, []);

  const deleteCheckIn = async (id) => {
    const docRef = doc(db, "attendance", id);
    await deleteDoc(docRef);
    fetchCheckInData();
  };

  const viewDetails = (id) => {
    navigate(`/teacher-detail/${id}`);
  };

  return (
    <div className="p-8 sm:p-12 md:p-16 lg:p-24 xl:p-32">
      <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold pt-14">
        Hello {name ? name : currentUser.displayName}, You are a teacher.
      </div>
      <br />
      <div className="mt-4 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-blue-600">
        Random Code : {idCheck}
      </div>
      <div className="mt-4 flex flex-col sm:flex-row items-center">
        {/* <select
          value={subjectName}
          onChange={(e) => setSubjectName(e.target.value)}
          className="mr-4 p-2 border rounded"
        >
          <option value="">Select a subject</option>
          <option value="Mobile and Web Application Development">Mobile and Web Application Development</option>
          <option value="Artificial Intelligence">Artificial Intelligence</option>
          <option value="Software Engineering">Software Engineering</option>
          <option value="Research Methodology">Research Methodology</option>
        </select> */}
        {/* <select
          value={roomNumber}
          onChange={(e) => setRoomNumber(e.target.value)}
          className="mr-4 p-2 border rounded"
        >
          <option value="">Select a room</option>
          <option value="SC9127">SC9127</option>
          <option value="SC9226">SC9226</option>
          <option value="SC9227">SC9227</option>
          <option value="SC9228">SC9228</option>
          <option value="SC9525">SC9525</option>
          <option value="SC6601A">SC6601A</option>
          <option value="SC6601B">SC6601B</option>
          <option value="SC6601B">SC6601C</option>
        </select> */}
        <button
          className="mr-4 p-2 bg-blue-500 text-white rounded"
          type="submit"
          value="Submit"
          onClick={generateIdCheck}
          // disabled={!subjectName || !roomNumber} // Button will be disabled if either subjectName or roomNumber is null
        >
          <FontAwesomeIcon/> Random Code
        </button>

        <button
          className="p-2 bg-red-500 text-white rounded"
          type="button"
          onClick={() => {
            setIdCheck("");
            // setSubjectName("");
            // setRoomNumber("");
          }}
        >
          <FontAwesomeIcon /> Reset
        </button>
      </div>
      <br />
      <div className="mt-4">
        Date: {date.toLocaleDateString()} &nbsp; Time:{" "}
        {date.toLocaleTimeString()}
      </div>

      <div className="mt-4 text-center text-2xl font-bold">
        All Classes Detailed
      </div>

      <div className="mt-10 overflow-x-auto">
        <table className="table-auto ml-auto mr-auto">
          <thead>
            <tr>
              <th className="px-4 py-2">Code</th>
              {/* <th className="px-4 py-2">Subject</th>
              <th className="px-4 py-2">Room</th> */}
              <th className="px-4 py-2">Date</th>
              {/* <th className="px-4 py-2">Teacher</th> */}
              <th className="px-4 py-2" colSpan={2}>
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {checkInData
              .filter((data) => data.teachers === name)
              .map((data, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? "bg-gray-200" : ""}
                >
                  <td className="border px-4 py-2">{data.id}</td>
                  {/* <td className="border px-4 py-2">{data.subject}</td> */}
                  {/* <td className="border px-4 py-2">{data.room}</td> */}
                  <td className="border px-4 py-2">
                    {data.class_date.toDate().toLocaleString()}
                  </td>
                  <td className="border px-4 py-2">{data.teachers}</td>
                  <td className="border px-4 py-2">
                    <button
                      className="p-2 bg-red-500 text-white rounded"
                      type="button"
                      onClick={() => deleteCheckIn(data.id)}
                    >
                      <FontAwesomeIcon icon={faTrash} /> Delete
                    </button>
                  </td>
                  {/* <td className="border px-4 py-2">
                    <button
                      className="p-2 bg-green-500 text-white rounded"
                      type="button"
                      onClick={() => viewDetails(data.id)}
                    >
                      <FontAwesomeIcon icon={faEye} /> View
                    </button>
                  </td> */}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Teacher;
