// import StartPage from "./components/start/StartPage";


import Login from "./components/auth/login/Login";
import Register from "./components/auth/register/Register";

import Header from "./components/header/Header";
import Home from "./components/home";

import TeacherDetails from "./components/home/teacher/TeacherInfor";

import { AuthProvider } from "./contexts/authContext/AuthContext";
import { useRoutes } from "react-router-dom";
// import Footer from "./components/footer/Footer";

function App() {
  const routesArray = [
    // {
    //   path: "*",
    //   element: <StartPage />,
    // },
    {
      path: "*",
      element: <Login />,
    },
    {
      path: "/register",
      element: <Register />,
    },
    {
      path: "/home",
      element: <Home />,
    },
    {
      path: "/teacher-detail/:id",
      element: <TeacherDetails />,
    }
  ];
  let routesElement = useRoutes(routesArray);
  return (
    <AuthProvider>
      <Header />
      <div className="w-full h-screen flex flex-col justify-between">
        {routesElement}
        {/* <Footer /> */}
      </div>
    </AuthProvider>
  );
}

export default App;
