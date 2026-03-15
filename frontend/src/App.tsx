import { Routes, Route } from "react-router-dom";
import TestPage from "./pages/TestPage";
import Graph from "./pages/Graph";
import Dashboard from "./pages/Dashboard";
import Claude from "./pages/claude";


function App(){
    return (
        <Routes>
            <Route path="/" element={<Dashboard />}/>
            <Route path="/debugPage" element={<TestPage />}/>
            <Route path="/visualize-graph" element={<Graph />}/>
        </Routes>
    )
}

export default App;