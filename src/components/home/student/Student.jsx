import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../../../contexts/authContext/AuthContext";
import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  serverTimestamp,
  query,
  collection,
  onSnapshot,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../../../firebase/firebase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faSave,
  faPaperPlane,
} from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";

const Student = () => {
  const { currentUser } = useAuth();
  const [name, setName] = useState("");
  const [id, setId] = useState("");
  const [section, setSection] = useState("");
  const answerRef = useRef();

  useEffect(() => {
    const fetchName = async () => {
      const studentRef = doc(db, "students", currentUser.email);
      const studentDoc = await getDoc(studentRef);

      setName(studentDoc.data().displayName);
      setId(studentDoc.data().id);
      setSection(studentDoc.data().section);
    };
    fetchName();
  }, [currentUser.email]);

  const [editMode, setEditMode] = useState(false);
  const [newId, setNewId] = useState("");
  const [newName, setNewName] = useState("");
  const [newSection, setNewSection] = useState("");

  const [checkInId, setCheckInId] = useState("");
  const [questionsData, setQuestionsData] = useState([]);

  const handleEdit = () => {
    setNewId(id);
    setNewName(name);
    setNewSection(section);
    setEditMode(true);
  };

  const handleSave = async () => {
    const studentRef = doc(db, "students", currentUser.email);
    await updateDoc(studentRef, {
      id: newId,
      displayName: newName,
      section: newSection,
    });
    setId(newId);
    setName(newName);
    setSection(newSection);
    setEditMode(false);
  };

  const handleCheckIn = async (e) => {
    e.preventDefault();

    const checkID = document.getElementById("id").value;
    setCheckInId(checkID);

    const checkinDocRef = doc(db, "attendance", checkID);
    const checkSubcollectionRef = doc(
      checkinDocRef,
      "check",
      currentUser.email
    );

    const checkinSnapshot = await getDoc(checkinDocRef);
    const checkSnapshot = await getDoc(checkSubcollectionRef);

    if (!checkinSnapshot.exists()) {
      alert("Error Code!");
    } else if (checkSnapshot.exists()) {
      alert("Already checked!");
      window.location.reload();
      localStorage.setItem("checkInId", checkID);
    } else {
      await setDoc(checkSubcollectionRef, {
        datetime_check: serverTimestamp(),
        displayName: doc(db, "students", currentUser.email),
        id: doc(db, "students", currentUser.email),
        section: doc(db, "students", currentUser.email),
      });

      alert("Success");
      window.location.reload();

      localStorage.setItem("checkInId", checkID);
      document.getElementById("id").value = "";
    }
  };

  useEffect(() => {
    const checkInId = localStorage.getItem("checkInId");
    if (!checkInId) {
      return;
    }
    const q = query(collection(doc(db, "attendance", checkInId), "questions"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newQuestions = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setQuestionsData(newQuestions);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const id = localStorage.getItem("checkInId");
    setCheckInId(id);
  }, []);

  const handleSubmitAns = (questionId) => async (e) => {
    e.preventDefault();
    const processSubmission = async () => {
      try {
        const checkInId = localStorage.getItem("checkInId");

        await updateDoc(
          doc(db, "attendance", checkInId, "questions", questionId),
          {
            ans: arrayUnion(answerRef.current.value),
          }
        );

        answerRef.current.value = "";

        await Swal.fire({
          icon: "success",
          title: "Your answer has been saved",
          showConfirmButton: false,
          timer: 1500,
        });
      } catch (error) {
        await Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Something went wrong!",
        });
      }
    };

    processSubmission();
  };

  return (
    <div>
      <div className="p-10">
        <div className="mt-4 text-xl font-bold pt-14">
          {/* ID :{" "}
          {editMode ? (
            <input
              type="text"
              className="border p-1 mb-3"
              value={newId}
              onChange={(e) => setNewId(e.target.value)}
            />
          ) : (
            id
          )}{" "}
          <br /> */}
          Name :{" "}
          {editMode ? (
            <input
              type="text"
              className="border p-1 mb-3"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          ) : (
            name
          )}{" "}
          <br />
          {/* Section :{" "} */}
          {/* {editMode ? (
            <input
              type="text"
              className="border p-1 mb-3"
              value={newSection}
              onChange={(e) => setNewSection(e.target.value)}
            />
          ) : (
            section
          )}{" "} */}
          <br />
          Email : {currentUser.email}
          <br />
          {/* {editMode ? (
            <button
              className="bg-green-500 text-white p-2 rounded mt-5"
              onClick={handleSave}
            >
              <FontAwesomeIcon icon={faSave} /> Save
            </button>
          ) : (
            <button
              className="bg-yellow-500 text-white p-2 rounded mt-5"
              onClick={handleEdit}
            >
              <FontAwesomeIcon icon={faEdit} /> Edit
            </button>
          )} */}
        </div>
        <br/>
        <div className="p-10 bg-white font-medium border-solid border-t border-slate-400 shadow-inner">
          <h1 className="text-2xl font-semibold">Enter class code</h1>
          <br />
          <form onSubmit={handleCheckIn} className="flex flex-row items-center">
            <input
              type="text"
              id="id"
              required
              maxLength="5"
              className="mt-1 block w-64 px-5 py-3 border border-solid border-gray-400 rounded-3xl"
              placeholder="Enter Code"
            />
            <button
              type="submit"
              className="ml-3 w-auto px-5 py-3 border border-solid border-violet-800 text-violet-800 rounded-3xl font-semibold hover:bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:text-white"
            >
              Submit Class Code
            </button>
          </form>
        </div>
        
        <br />

        <div className="p-10 bg-white font-medium border-solid border-t border-slate-400 shadow-inner">
          <div className="text-2xl font-semibold">
            Questions
          </div>
            {questionsData.map((questions, index) => (
              <div key={index} className="mt-5 p-10 bg-white font-medium border-solid border-t border-slate-2 shadow inner">
                <h3 className="text-2xl font-semibold">Question {questions.id}:</h3>
                <p className="mt-5 overflow-auto break-words">{questions.question}</p>
                <div className="w-full p-4 bg-white  rounded-md mt-4">
                  <form onSubmit={handleSubmitAns(questions.id)} className="flex flex-row items-center">
                    <input
                      type="text"
                      required
                      ref={answerRef}
                      className="mt-1 block w-1/2 px-5 py-3 border border-solid border-gray-400 rounded-3xl"
                      placeholder={`Enter answer for question ${questions.id}`}
                    />
                    <button
                      type="submit"
                      className="ml-3 w-auto px-5 py-3 border border-solid border-solid border-violet-800 text-violet-800 rounded-3xl font-semibold hover:bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:text-white"
                    >
                      <FontAwesomeIcon className="mr-2" />
                      Submit Answer
                    </button>
                  </form>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Student;
