import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [pixels, setPixels] = useState(new Set());

  useEffect(() => {
    fetch('https://turf-plants.onrender.com/game_api/pixels/')
      .then(res => res.json())
      .then(data => setPixels(new Set(data.map(p => `${p[0]},${p[1]}`))));
  }, []);

  const handleClick = (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = Math.floor(e.clientX - rect.left);
    const y = Math.floor(e.clientY - rect.top);
    fetch('https://turf-plants.onrender.com/game_api/paint/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ x, y })
    });
    setPixels(new Set(pixels).add(`${x},${y}`));
  };

  return (
    <div
      onClick={handleClick}
      style={{ width: '800px', height: '600px', border: '1px solid black', position: 'relative' }}
    >
      {[...pixels].map(coord => {
        const [x, y] = coord.split(',');
        return (
          <div key={coord} style={{
            position: 'absolute',
            left: `${x}px`,
            top: `${y}px`,
            width: '1px',
            height: '1px',
            backgroundColor: 'black'
          }} />
        );
      })}
    </div>
  );
}

export default App;
