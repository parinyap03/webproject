import React, { useEffect, useState } from "react";
import { useAuth } from "../../../contexts/authContext/AuthContext";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase/firebase";

const Student = () => {
  const { currentUser } = useAuth();
  const [name, setName] = useState("");
  const [id, setId] = useState("");
  const [section, setSection] = useState("");

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

  return (
    <div className="text-2xl font-bold pt-14">
      You are a student.
      <br />
      ID :{" "}
      {editMode ? (
        <input
          type="text"
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
        <button style={{ backgroundColor: "green" }} onClick={handleSave}>
          Save
        </button>
      ) : (
        <button style={{ backgroundColor: "yellow" }} onClick={handleEdit}>
          Edit
        </button>
      )}
    </div>
  );
};

export default Student;
