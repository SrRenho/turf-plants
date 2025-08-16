import React, { useContext } from 'react';
import { UserContext } from './App';

export default function WelcomeBanner() {
  const { user } = useContext(UserContext);

  return (
    <div style={{ marginBottom: 8 }}>
      {user ? `Hola ${user.name}` : "Please login putita"}
    </div>
  );
}