import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import PostItem from './pages/PostItem';
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
        <Navbar />
        <main className="container mx-auto px-4 py-8 max-w-6xl">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/post" element={<PostItem />} />
            <Route path="/edit/:id" element={<PostItem />} />
            <Route path="/login" element={<Login />} /> 
            <Route path="/register" element={<Register />} />
            <Route path="/chat/:id" element={<Chat />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;