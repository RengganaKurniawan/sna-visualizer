import { Routes, Route } from "react-router-dom";
import TestPage from "./pages/TestPage";
import TestGraph from "./pages/TestGraph";


function App(){
    return (
        <Routes>
            <Route path="/" element={<TestPage />}/>
            <Route path="/test-graph" element={<TestGraph />}/>
        </Routes>
    )
}

export default App;