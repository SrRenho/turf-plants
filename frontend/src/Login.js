import React, { useContext } from 'react';
import { BACKEND } from './config';
import { UserContext } from './App';

export default function Login() {
  const { user, setUser } = useContext(UserContext);

  // Login (redirect to Google flow)
  const startGoogleLogin = () => {
    window.location.href = `${BACKEND}/accounts/google/login/?process=login/`; // Cambiarlo a ${BACKEND}/accounts/login/ cuando quiera mas opciones. Actualmente fuerza ir a iniciar con google };
  };

  // Logout (redirect to allauth logout endpoint)
  const startLogout = () => {
    window.location.href = `${BACKEND}/accounts/logout/`;
    setUser(null);
  };

  return (
    <div style={{ marginBottom: 8 }}>
      {user ? (
        <div>
          <span style={{ marginRight: 10 }}>
            Signed in as <strong>{user.username}</strong>
          </span>
          <button onClick={startLogout}>Logout</button>
        </div>
      ) : (
        <button onClick={startGoogleLogin}>Login with Google</button>
      )}
    </div>
  );
}