import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./components/Login";
import MainAppContent from "./components/MainAppContent";
import ScannedPlotPage from "./components/ScannedPlotPage";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [scannedPlot, setScannedPlot] = useState(null);

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={!loggedIn ? (
            <LoginPage onEnter={() => setLoggedIn(true)} />
          ) : (
            <Navigate to="/" />
          )}
        />

        <Route
          path="/"
          element={loggedIn ? (
            <MainAppContent setScannedPlot={setScannedPlot} />
          ) : (
            <Navigate to="/login" />
          )}
        />

        <Route
          path="/scanned-plot"
          element={loggedIn ? (
            <ScannedPlotPage plot={scannedPlot} />
          ) : (
            <Navigate to="/login" />
          )}
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
