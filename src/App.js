import Login from "./components/auth/login/LoginPage";
import Register from "./components/auth/register/RegisterPage";

import Header from "./components/header/Header";
import Home from "./components/home";

import NotFoundPage from "./components/error/NotFoundPage";

import TeacherDetails from "./components/home/teacher/TeacherDetails";

import { AuthProvider } from "./contexts/authContext/AuthContext";
import { useRoutes } from "react-router-dom";
import Footer from "./components/footer/Footer";

function App() {
  const routesArray = [
    {
      path: "*",
      element: <Login />,
    },
    {
      path: "/login",
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
    },
    {
      path: "*",
      element: <NotFoundPage />,
    },
  ];
  let routesElement = useRoutes(routesArray);
  return (
    <AuthProvider>
      <Header />
      <div className="w-full h-screen flex flex-col justify-between">
        {routesElement}
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;
