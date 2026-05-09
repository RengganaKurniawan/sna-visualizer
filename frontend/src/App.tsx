import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Graph from "./pages/Graph";
import TestPage from "./pages/TestPage";
import Guidelines from "./pages/Guidelines";

function App(){
    const [theme, setTheme] = useState<'dark' | 'light'>('dark')

    useEffect(() => {
        if (theme === 'light') {
            document.body.classList.add('light-mode');
        } else {
            document.body.classList.remove('light-mode');
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
    }

    return (
        <Routes>
            <Route path="/" element={<Dashboard theme={theme} onToggleTheme={toggleTheme} />}/>
            <Route path="/visualize-graph" element={<Graph theme={theme} onToggleTheme={toggleTheme}/>}/>
            <Route path="/guidelines" element={<Guidelines theme={theme} onToggleTheme={toggleTheme} />} />

            <Route path="/debugPage" element={<TestPage />}/>
        </Routes>
    )
}

export default App;