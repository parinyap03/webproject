import React from 'react';
import { useNavigate } from 'react-router-dom';

const StartPage = () => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate('/login');
    }

    return (
        <div className="flex items-center justify-center h-screen bg-gray-200">
            <button 
                onClick={handleClick}
                className="px-8 py-4 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
            >
                Get Started
            </button>
        </div>
    );
}

export default StartPage;