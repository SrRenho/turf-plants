import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const PIXEL_SIZE = 10; // circle diameter in px
  const HALF = PIXEL_SIZE / 2;

  const [pixels, setPixels] = useState(new Set());
  const [user, setUser] = useState(null);
  const socketRef = useRef(null);

  const BACKEND = 'https://turfplants.onrender.com';

  // helper to get cookie (for CSRF)
  function getCookie(name) {
    const v = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
    return v ? v.pop() : '';
  }

  // Initial fetch from API (pixel map) + current user check
  useEffect(() => {
    fetch(`${BACKEND}/game_api/pixels/`)
      .then(res => res.json())
      .then(data => setPixels(new Set(data.map(p => `${p[0]},${p[1]}`))))
      .catch(console.error);

    // check logged-in user (must return JSON {username, ...} or {user: null})
    fetch(`${BACKEND}/api/current_user/`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data && data.username) setUser(data);
        else setUser(null);
      })
      .catch(err => {
        console.error('current_user check failed', err);
        setUser(null);
      });
  }, []);

  // WebSocket setup
  useEffect(() => {
    const ws = new WebSocket('wss://turfplants.onrender.com/ws/pixels/');
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

  // Login (redirect to allauth Google flow)
  const startGoogleLogin = () => {
    window.location.href = `${BACKEND}/accounts/google/login/?process=login`;
  };

  // Logout (redirect to allauth logout endpoint which will clear session and redirect)
  const startLogout = () => {
    window.location.href = `${BACKEND}/accounts/logout/`;
  };

  return (
    <div style={{ padding: 12 }}>
      <div style={{ marginBottom: 8 }}>
        {user ? (
          <div>
            <span style={{ marginRight: 10 }}>Signed in as <strong>{user.username}</strong></span>
            <button onClick={startLogout}>Logout</button>
          </div>
        ) : (
          <button onClick={startGoogleLogin}>Login with Google</button>
        )}
      </div>

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
    </div>
  );
}

export default App;
