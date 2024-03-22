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

const QuestionDetail = () => {
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
      const docRef = doc(db, "attendance", id);
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
      const checkInRef = collection(doc(db, "attendance", id), "check");
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
    const q = query(collection(doc(db, "attendance", id), "questions"));

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

    const checkinDocRef = doc(db, "attendance", docId);
    const checkinDocSnap = await getDoc(checkinDocRef);

    const questionsCollectionRef = collection(
      db,
      "attendance",
      docId,
      "questions"
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
      "attendance",
      docId,
      "questions",
      String(questionCounter)
    );
    await setDoc(questionDocRef, {
      question: questionText,
      ans: [],
    });

    setQuestion("");
  };

  const deleteQuestion = async (questionId) => {
    const questionDocRef = doc(db, "attendance", id, "questions", questionId);
    await deleteDoc(questionDocRef);
  };

  useEffect(() => {
    const fetchAnswers = async () => {
      const answersCollectionRef = collection(db, "attendance", id, "questions");
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
  const teacherInfoBack = () => {
    navigate(`/teacher-infor/${id}`);
  };


  return (
    <div>
      <div className="container-fluid">
        <div className="mt-20">
          <div className="mt-5 text-lg text-black-600">
            <button
              className="btn btn-primary ml-20 pl-5"
              onClick={teacherInfoBack}
            >
              <FontAwesomeIcon icon={faArrowLeft}/> Back
            </button>
            <div className="text-center">
                <p className="mb-5 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">
                  <span className="font-bold">Check-in ID:</span> {id}
                </p>
                <p className="mb-5">
                  <span className="font-bold">Date:</span>{" "}
                   {teacherDetail.class_date.toDate().toLocaleString()}
                </p>
            </div>   
          </div>
        </div>

        <div className="ml-20 mr-20 p-10 bg-white font-medium border-solid border-t border-slate-400 shadow-inner">
          <h1 className="text-2xl font-semibold">New Questions</h1>
          <br/>
          <form onSubmit={AddQuestionFormSubmit} className="flex flex-row items-center">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="mt-1 block w-3/4 h-auto px-5 py-3 border border-solid border-gray-400 rounded-3xl"
              placeholder="Enter your question here"
            ></textarea>
            <button className="ml-3 w-auto px-5 py-3 border border-solid border-violet-800 text-violet-800 rounded-3xl font-semibold hover:bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:text-white">
              Submit
            </button>
          </form>
        </div>
        
        <div className="ml-20 mr-20 p-10 bg-white font-medium border-solid border-t border-slate-400 shadow-inner">
            <h1 className="text-2xl font-semibold">All Questions</h1>
            <br/>
            <div>
              {questionsData.map((question, index) => (
                <div key={index} className="mt-5 p-10 bg-white font-medium border-solid border-t border-slate-2 shadow inner">
                  <h3 className="text-2xl font-semibold">Question {question.id}:</h3>
                  <p className="mt-5 overflow-auto break-words">
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

        <div className="ml-20 mr-20 p-10 bg-white font-medium border-solid border-t border-slate-400 shadow-inner">
          <h1 className="text-2xl font-semibold">All Answers</h1>
          <br/>
          <button
              onClick={refreshTable}
              className="text-gray-500 hover:opacity-50 font-bold mb-4 rounded inline-flex items-center"
            >
              <FontAwesomeIcon className="mr-2" />Refresh
            </button>
            <div className="mt-5 overflow-x-auto pl-20 pr-20 mb-20">
            <table className="table-auto w-full border-slate-950">
              <thead>
                <tr>
                  <th className="border px-4 py-2 border-slate-950 text-xl">
                    No.
                  </th>
                  <th className="border px-4 py-2 border-slate-950 text-xl">
                    Answer
                  </th>
                </tr>
              </thead>
              <tbody>
                {answersData.map((answer, index) => (
                  <tr key={index } className="text-center">
                    <td className="border px-4 py-2 border-slate-300ap">{answer.id}</td>
                    <td className="border px-4 py-2 border-slate-300p">
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
export default QuestionDetail;
