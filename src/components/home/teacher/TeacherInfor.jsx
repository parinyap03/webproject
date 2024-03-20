import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getDoc,
  doc,
  collection,
  getDocs,
  query,
  onSnapshot,
  updateDoc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../../firebase/firebase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faArrowLeft,
  faSync,
} from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";

const TeacherDetails = () => {
  const { id } = useParams();
  const [teacherDetail, setTeacherDetail] = useState(null);
  const navigate = useNavigate();

  const [checkInData, setCheckInData] = useState([]);
  const [questionsData, setQuestionsData] = useState([]);

  const [questionId, setQuestionId] = useState("");
  const [answersData, setAnswersData] = useState([]);
  const [question, setQuestion] = useState("");

  useEffect(() => {
    const fetchTeacherDetail = async () => {
      const docRef = doc(db, "checkin", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setTeacherDetail(docSnap.data());
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "No such document!",
        }).then(() => {
          navigate("/login");
        });
      }
    };

    fetchTeacherDetail();
  }, [id, navigate]);

  useEffect(() => {
    const fetchCheckInData = async () => {
      const checkInRef = collection(doc(db, "checkin", id), "check");
      const studentsRef = collection(db, "students");

      const checkInSnapshot = await getDocs(checkInRef);
      const checkInData = [];

      for (let docSnap of checkInSnapshot.docs) {
        const studentSnapshot = await getDoc(doc(studentsRef, docSnap.id));
        const studentData = studentSnapshot.data();
        const checkInDocData = docSnap.data();

        // console.log(checkInDocData);

        checkInData.push({
          id: studentData.id,
          displayName: studentData.displayName,
          section: studentData.section,
          datetime_check: checkInDocData.datetime_check,
        });
      }

      setCheckInData(checkInData);
    };

    fetchCheckInData();
  }, [id]);

  useEffect(() => {
    const q = query(collection(doc(db, "checkin", id), "question"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newQuestions = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setQuestionsData(newQuestions); // Update the state here
    });

    return () => unsubscribe();
  }, [id]);

  const AddQuestionFormSubmit = async (event) => {
    event.preventDefault();
    const questionText = event.target.elements[0].value;
    const docId = id;

    const checkinDocRef = doc(db, "checkin", docId);
    const checkinDocSnap = await getDoc(checkinDocRef);

    const questionsCollectionRef = collection(
      db,
      "checkin",
      docId,
      "question"
    );
    const questionDocsSnap = await getDocs(questionsCollectionRef);

    let questionCounter = checkinDocSnap.data().questionCounter || 0;
    if (questionDocsSnap.empty) {
      questionCounter = 1;
    } else {
      questionCounter++;
    }

    setQuestionId(questionCounter);
    console.log(questionId);
    await updateDoc(checkinDocRef, { questionCounter });

    const questionDocRef = doc(
      db,
      "checkin",
      docId,
      "question",
      String(questionCounter)
    );
    await setDoc(questionDocRef, {
      question: questionText,
      ans: [],
    });

    setQuestion("");
  };

  const deleteQuestion = async (questionId) => {
    const questionDocRef = doc(db, "checkin", id, "question", questionId);
    await deleteDoc(questionDocRef);
  };

  useEffect(() => {
    const fetchAnswers = async () => {
      const answersCollectionRef = collection(db, "checkin", id, "question");
      const answerDocsSnap = await getDocs(answersCollectionRef);

      const answers = answerDocsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      // console.log(answers);
      setAnswersData(answers);
    };

    fetchAnswers();
  }, [id]);

  function refreshTable() {
    window.location.reload();
  }

  if (!teacherDetail) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row mt-5">
        <div className="p-5 bg-white rounded shadow-md md:w-1/3">
          <div className="mt-10">
            <button
              className="px-2 py-1 text-sm font-regular text-white bg-blue-500 rounded hover:bg-blue-700 mb-4"
              onClick={() => navigate("/home")}
            >
              <FontAwesomeIcon icon={faArrowLeft} />
            </button>
            <p className="mb-2">
              <span className="font-bold">Check-in ID:</span> {id}
            </p>
            <p className="mb-2">
              <span className="font-bold">Subject:</span>{" "}
              {teacherDetail.subject}
            </p>
            <p className="mb-2">
              <span className="font-bold">Room:</span> {teacherDetail.room}
            </p>
            <p className="mb-2">
              <span className="font-bold">Date:</span>{" "}
              {teacherDetail.class_date.toDate().toLocaleString()}
            </p>
            <p className="mb-2">
              <span className="font-bold">Teacher:</span>{" "}
              {teacherDetail.teacher}
            </p>
          </div>
        </div>
        <div className="p-5 bg-white rounded shadow-md mt-5 md:mt-0 md:ml-5 md:w-1/3">
          <div className="mt-10">
            <h2 className="font-bold text-xl mb-4">New Questions</h2>
            <form onSubmit={AddQuestionFormSubmit}>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full p-3 mb-4 border rounded"
                placeholder="Enter your question here"
              ></textarea>
              <button className="px-4 py-2 font-bold text-white bg-green-500 rounded hover:bg-green-700">
                Submit
              </button>
            </form>
          </div>
        </div>
        <div className="p-5 bg-white rounded shadow-md mt-5 md:mt-0 md:ml-5 md:w-1/3">
          <div className="mt-10">
            <h2 className="font-bold text-xl mb-4">All Questions</h2>
            <div>
              {questionsData.map((question, index) => (
                <div key={index} className="flex items-center">
                  <h3 className="font-bold mr-2">Question {question.id}:</h3>
                  <p className="overflow-hidden break-all">
                    {question.question}
                  </p>
                  <button
                    onClick={() => deleteQuestion(question.id)}
                    className="bg-red-500 hover:bg-red-600 text-sm text-white font-regular py-1 px-2 rounded m-2"
                  >
                    <FontAwesomeIcon icon={faTrash} size="xs" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col md:flex-row justify-between mt-5">
        <div className="w-full md:w-1/2 p-5 m-2 bg-white rounded shadow-md">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold mb-4">Student Check-In</h2>
            <button
              onClick={refreshTable}
              className="text-black-500 hover:opacity-50 font-bold mb-4 rounded inline-flex items-center"
            >
              <FontAwesomeIcon icon={faSync} className="mr-2" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Section
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    TimeStamp
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {checkInData.map((data, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">{data.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {data.displayName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {data.section}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {data.datetime_check
                        ? data.datetime_check.toDate().toLocaleString()
                        : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="w-full md:w-1/2 p-5 m-2 bg-white rounded shadow-md mt-5 md:mt-0">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold mb-4">All Answers</h2>
            <button
              onClick={refreshTable}
              className="text-black-500 hover:opacity-50 font-bold mb-4 rounded inline-flex items-center"
            >
              <FontAwesomeIcon icon={faSync} className="mr-2" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 mt-4">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    No.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Answer
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {answersData.map((answer, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">{answer.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {answer.ans.join(", ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDetails;
