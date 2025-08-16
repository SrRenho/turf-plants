import React, { useState, createContext } from 'react';
import './App.css';
import Game from './Game.js';
import Login from './Login.js';
import WelcomeBanner from './WelcomeBanner.js'

export const UserContext = createContext(null);

function App() {
  const [user, setUser] = useState(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <div style={{ padding: 12 }}>
        <WelcomeBanner />
        <Login />
        <Game />
      </div>
    </UserContext.Provider>
  );
}

export default App;