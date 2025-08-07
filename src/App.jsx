import React, { useState } from "react";
import LoginPage from "./components/Login";
import MainAppContent from "./components/MainAppContent";




export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <>
      {!loggedIn ? (
        <LoginPage onEnter={() => setLoggedIn(true)} />
      ) : (
        <MainAppContent />
      )}
    </>
  );
}
