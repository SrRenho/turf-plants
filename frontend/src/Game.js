import React, { useState, useEffect } from 'react';
import { BACKEND, WS_BACKEND } from './config';

export default function Game(){
  const PIXEL_SIZE = 10; // circle diameter in px
  const HALF = PIXEL_SIZE / 2;

  const [pixels, setPixels] = useState(new Set());

  const socketRef = useRef(null);

    useEffect(() => {
      const fetchData = async () => {
        try {
          const resPixels = await fetch(`${BACKEND}/game_api/pixels/`);
          const dataPixels = await resPixels.json();
          setPixels(new Set(dataPixels.map(p => `${p[0]},${p[1]}`)));

        } catch (err) {
          console.error('fetch failed', err);
        }
      };

      fetchData();
    }, []);


  // WebSocket setup
  useEffect(() => {
    const ws = new WebSocket('${WS_BACKEND}/ws/pixels/');
    socketRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const pixel = JSON.parse(event.data);
        const key = `${pixel.x},${pixel.y}`;
        setPixels(prev => new Set(prev).add(key));
      } catch (e) {
        console.error('ws message parse error', e);
      }
    };

    ws.onclose = () => console.log('WebSocket disconnected');
    ws.onerror = (err) => console.error('WebSocket error:', err);

    return () => {
      try { ws.close(); } catch (e) {}
    };
  }, []);

  // helper to get cookie (for CSRF)
  function getCookie(name) {
    const v = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
    return v ? v.pop() : '';
  }

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.floor(e.clientX - rect.left);
    const y = Math.floor(e.clientY - rect.top);

    const pixelData = { x, y, color: '#000000' };

    // Try WebSocket first
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(pixelData));
    } else {
      // fallback to POST (session-based auth). include CSRF and credentials
      const csrftoken = getCookie('csrftoken');
      fetch(`${BACKEND}/game_api/paint/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrftoken,
        },
        body: JSON.stringify({ x, y, color: pixelData.color }),
      }).catch(err => console.error('paint POST failed', err));
    }

    // Optimistically update local state
    setPixels(prev => new Set(prev).add(`${x},${y}`));
  };

  return (
      <div
        onClick={handleClick}
        style={{ width: '800px', height: '600px', border: '1px solid black', position: 'relative', userSelect: 'none' }}
      >
        {[...pixels].map(coord => {
          const [x, y] = coord.split(',').map(Number);
          return (
            <div
              key={coord}
              style={{
                position: 'absolute',
                left: `${x - HALF}px`,   // center the circle at (x,y)
                top: `${y - HALF}px`,
                width: `${PIXEL_SIZE}px`,
                height: `${PIXEL_SIZE}px`,
                borderRadius: '50%',
                backgroundColor: 'black',
                pointerEvents: 'none' // so clicks pass through the pixel divs
              }}
            />
          );
        })}
      </div>
  );
}