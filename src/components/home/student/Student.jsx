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

    const checkinDocRef = doc(db, "checkin", checkID);
    const checkSubcollectionRef = doc(
      checkinDocRef,
      "check",
      currentUser.email
    );

    const checkinSnapshot = await getDoc(checkinDocRef);
    const checkSnapshot = await getDoc(checkSubcollectionRef);

    if (!checkinSnapshot.exists()) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "No such check-in ID!",
      });
    } else if (checkSnapshot.exists()) {
      Swal.fire({
        icon: "warning",
        title: "Oops...",
        text: "Already checked in!",
      }).then(() => {
        window.location.reload();
      });;
      localStorage.setItem("checkInId", checkID);
    } else {
      await setDoc(checkSubcollectionRef, {
        datetime_check: serverTimestamp(),
        displayName: doc(db, "students", currentUser.email),
        id: doc(db, "students", currentUser.email),
        section: doc(db, "students", currentUser.email),
      });

      Swal.fire({
        icon: "success",
        title: "Check-in successful",
      }).then(() => {
        window.location.reload();
      });;

      localStorage.setItem("checkInId", checkID);
      document.getElementById("id").value = "";
    }
  };

  useEffect(() => {
    const checkInId = localStorage.getItem("checkInId");
    if (!checkInId) {
      return;
    }
    const q = query(collection(doc(db, "checkin", checkInId), "question"));

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
          doc(db, "checkin", checkInId, "question", questionId),
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
    <div className="flex justify-center flex-wrap  flex-column mt-20">
      <div className="w-auto p-4 bg-white shadow-md rounded-md mr-5">
        <div className="text-xl font-semibold pt-14 m-5">
          ID :{" "}
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
          <br />
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
          Section :{" "}
          {editMode ? (
            <input
              type="text"
              className="border p-1 mb-3"
              value={newSection}
              onChange={(e) => setNewSection(e.target.value)}
            />
          ) : (
            section
          )}{" "}
          <br />
          Email : {currentUser.email}
          <br />
          {editMode ? (
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
          )}
        </div>
        <div className="w-full p-4 bg-white shadow-md rounded-md">
          <form onSubmit={handleCheckIn}>
            <input
              type="text"
              id="id"
              required
              maxLength="5"
              className="mt-1 block w-full p-2 border rounded-md"
              placeholder="Enter Code"
            />
            <button
              type="submit"
              className="mt-4 bg-blue-500 text-white p-2 rounded"
            >
              Submit
            </button>
          </form>
        </div>
        <div className="text-xl font-semibold pt-14 m-5">
          Code: {checkInId}
          <button
            className="text-sm bg-red-500 text-white p-2 rounded ml-12"
            onClick={() => {
              localStorage.removeItem("checkInId");
              setCheckInId("");
              window.location.reload();
            }}
          >
            Clear
          </button>
        </div>
        <br />
        <div>
        <div className="text-2xl font-bold text-center m-5">
          Questions
        </div>
        {questionsData.map((question, index) => (
          <div key={index} className="flex items-center flex-col pt-5">
            <h3 className="font-bold mr-2">Question {question.id}:</h3>
            <p className="overflow-auto break-words">{question.question}</p>
            <div className="w-full p-4 bg-white shadow-md rounded-md mt-4">
              <form onSubmit={handleSubmitAns(question.id)}>
                <input
                  type="text"
                  required
                  ref={answerRef}
                  className="text-sm mt-1 block w-full p-2 border rounded-md"
                  placeholder={`Enter answer for question ${question.id}`}
                />
                <button
                  type="submit"
                  className="flex items-center justify-center mt-4 bg-green-500 hover:bg-green-700 text-white text-sm py-2 px-4 rounded"
                >
                  <FontAwesomeIcon icon={faPaperPlane} className="mr-2" />
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
