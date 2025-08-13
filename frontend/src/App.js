import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [pixels, setPixels] = useState(new Set());
  const socketRef = useRef(null);

  // Initial fetch from API
  useEffect(() => {
    fetch('https://turf-plants.onrender.com/game_api/pixels/')
      .then(res => res.json())
      .then(data => setPixels(new Set(data.map(p => `${p[0]},${p[1]}`))));
  }, []);

  // WebSocket setup
  useEffect(() => {
    const ws = new WebSocket('wss://turf-plants.onrender.com/ws/pixels/');
    socketRef.current = ws;

    ws.onmessage = (event) => {
      const pixel = JSON.parse(event.data);
      const key = `${pixel.x},${pixel.y}`;
      setPixels(prev => new Set(prev).add(key));
    };

    ws.onclose = () => console.log('WebSocket disconnected');
    ws.onerror = (err) => console.error('WebSocket error:', err);

    return () => ws.close();
  }, []);

  const handleClick = (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = Math.floor(e.clientX - rect.left);
    const y = Math.floor(e.clientY - rect.top);

    const pixelData = { x, y };

    // Send pixel to backend via WebSocket
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(pixelData));
    }

    // Optimistically update local state
    setPixels(prev => new Set(prev).add(`${x},${y}`));
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
