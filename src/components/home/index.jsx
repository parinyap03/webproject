import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/authContext/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import Student from "./student/StudentPage";
import Teacher from "./teacher/TeacherPage";
import NotFoundPage from "../error/NotFoundPage";

const Home = () => {
    const { currentUser } = useAuth();

    const [isStudent, setIsStudent] = useState(false);
    const [isTeacher, setIsTeacher] = useState(false);

    useEffect(() => {
        const fetchName = async () => {
            const studentRef = doc(db, "students", currentUser.email);
            const teacherRef = doc(db, "teachers", currentUser.email);
            const studentDoc = await getDoc(studentRef);
            const teacherDoc = await getDoc(teacherRef);
            if (studentDoc.exists()) {
                setIsStudent(true);
            } else if (teacherDoc.exists()) {
                setIsTeacher(true);
            }
        };
        fetchName();
    }, [currentUser.email]);

    if (isStudent) {
        return <Student />;
    } else if (isTeacher) {
        return <Teacher />;
    } else {
        return <NotFoundPage />;
    }
};

export default Home;