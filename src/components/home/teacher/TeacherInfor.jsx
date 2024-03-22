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

const TeacherInfor = () => {
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

  return (
    <div>
      <div className="container-fluid">
        <div className="mt-20">
          <div className="mt-5 text-lg text-black-600">
            <button
              className="btn btn-primary ml-20 pl-5"
              onClick={() => navigate("/home")}
            >
              <FontAwesomeIcon icon={faArrowLeft} /> Back
            </button>
            <div className="text-center">
              <p className="mb-5 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">
                <span className="font-bold">Code ID:</span> {id}
              </p>
              <p className="mb-5">
                <span className="font-bold">Date:</span>{" "}
                {teacherDetail.class_date.toDate().toLocaleString()}
              </p>
              <button
                onClick={() => navigate(`/question-detail/${id}`)}
                className="px-5 py-3 border border-solid border-violet-800 text-violet-800 rounded-3xl font-semibold hover:bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:text-white"
              >
                Questions
              </button>
              
            </div>
            
          </div>
        </div>
      </div>

      <div className="mr-20 ml-20 p-10 container-fluid mt-10 boder-solid border-t border-slate-400 shadow-inner">
        <div >
          <button
                onClick={refreshTable}
                className="ml-20 text-gray-500 hover:opacity-50 font-bold  rounded inline-flex items-center"
               >
                <FontAwesomeIcon className="mr-2"/>Refresh 
              </button>

          <div className="mt-8 overflow-x-auto pl-20 pr-20 mb-20 ">
            
            <table className="table-auto w-full border-slate-950 text-center">
              <thead >
                <tr>
                  
                  <th className="border px-4 py-2 border-slate-950 text-xl">
                    Name
                  </th>
                  <th className="border px-4 py-2 border-slate-950 text-xl">
                    TimeStamp
                  </th>
                </tr>
              </thead>
              <tbody className="border px-4 py-2 border-slate-300">
                {checkInData.map((data, index) => (
                  <tr key={index}>
                    
                    <td className="border px-6 py-4 border-slate-300">
                      {data.displayName}
                    </td>
                  
                    <td className="border px-6 py-4 bg-orange border-slate-300">
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

      </div>
    </div>
  );
};



export default TeacherInfor;