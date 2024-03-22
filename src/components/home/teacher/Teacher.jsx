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
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Teacher = () => {
  const { currentUser } = useAuth();
  const [name, setName] = useState("");
  const [idCheck, setIdCheck] = useState("");
  const [date, setDate] = useState(new Date());
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

  const fetchName = async () => {
    const teacherRef = doc(db, "teachers", currentUser.email);
    const teacherDoc = await getDoc(teacherRef);
    if (teacherDoc.exists()) {
      setName(teacherDoc.data().displayName); // Update name state with the fetched name
    }
  };
  
  const generateIdCheck = async () => {

    
    const docData = {
      class_date: new Date(),
      // teacher: name,
    };
  
    const docId = uuidv4().substr(0, 5);
    await setDoc(doc(db, "attendance", docId), docData);
    setIdCheck(docId);
  
    // Swal.fire(
    //   "Generated!",
    //   `Your check-in ID has been generated. The ID is ${docId}.`,
    //   "success"
    // );
    fetchCheckInData();
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
    navigate(`/teacher-infor/${id}`);
  };

  return (
    <div className="mt-10 text-center ">
      <div className="mt-4 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold pt-14"  >
        Manage your class
      </div>
      <br/>
      <div className="mt-5 text-xl sm:text-2xl md:text-3xl lg:text-2xl text-black-600">
        <button
          className="px-5 py-3 border border-solid border-gray-500 text-gray-500 rounded-3xl font-semibold hover:bg-gray-500 hover:text-white"
          type="submit"
          value="Submit"
          onClick={generateIdCheck}
          // disabled={!subjectName || !roomNumber} // Button will be disabled if either subjectName or roomNumber is null
        >
          <FontAwesomeIcon/> Random Code
        </button>  
      </div>
      <br />
      <div className="text-x sm:text-2xl md:text-3xl lg:text-4xl text-black-00">
        Random Code : {idCheck}
      </div>
      <br />
      <div className="mt-4 ">
        Date: {date.toLocaleDateString()} &nbsp; Time:{" "}
        {date.toLocaleTimeString()}
      </div>
      

      <div className="mt-4 pt-10  mr-20 ml-20 text-center text-2xl font-bold border-solid border-t border-slate-200">
        Classes Detailed
      </div>

      <div className="mt-10 overflow-x-auto pl-20 pr-20 mb-20">
        <table className="table-auto w-full border-slate-950">
          <thead>
            <tr>
              <th className="border px-4 py-2 bg-orange-50 border-slate-950">Code</th>
              <th className="border px-4 py-2 bg-orange-50 border-slate-950">Date</th>
              <th className="border px-4 py-2 bg-orange-50 border-slate-950" colSpan={2}>
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {checkInData
              .filter((data) => data.teacher === name)
              .map((data, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? "bg-white-200" : ""}
                >
                  <td className="border px-4 py-2 border-slate-950">{data.id}</td>
                  <td className="border px-4 py-2 border-slate-950">
                    {data.class_date.toDate().toLocaleString()}
                  </td>
                  {/* <td className="border px-4 py-2">{data.teachers}</td> */}
                  
                  <td className="border px-4 py-2 border-slate-950">
                    <button
                      className="w-24 px-5 py-3 border border-solid border-green-500 text-green-500 rounded-3xl  font-semibold hover:bg-green-400 hover:text-white"
                      type="button"
                      onClick={() => viewDetails(data.id)}
                    >
                      <FontAwesomeIcon/> View
                    </button>
                  </td>
                  <td className="border px-4 py-2 border-slate-950">
                    <button
                      className="w-24 px-5 py-3 border border-solid border-red-500 text-red-500 rounded-3xl font-semibold hover:bg-red-400 hover:text-white"
                      type="button"
                      onClick={() => deleteCheckIn(data.id)}
                    >
                      <FontAwesomeIcon/> Delete
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Teacher;
