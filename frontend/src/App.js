import React, { useState, createContext } from 'react';
import './App.css';
import Game from './Game.js';
import Login from './Login.js';

export const UserContext = createContext(null);

function App() {
  const [user, setUser] = useState(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <div style={{ padding: 12 }}>
        <Login />
        <Game />
      </div>
    </UserContext.Provider>
  );
}

export default App;