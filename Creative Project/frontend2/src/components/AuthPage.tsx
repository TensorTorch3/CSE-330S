import React from 'react';
import Login from './Login';
import Register from './Register';
import DeleteUser from './DeleteUser';

const AuthPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', gap: '20px' }}>
        <div>
          <h3>Login</h3>
          <Login />
        </div>
        <div>
          <h3>Register</h3>
          <Register />
        </div>
        <div>
          <h3>Delete Account</h3>
          <DeleteUser />
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
