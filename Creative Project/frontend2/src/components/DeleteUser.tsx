import React, { useState, useContext, ChangeEvent, FormEvent } from 'react';
import { AuthContext } from '../contexts/AuthContext';

interface FormData {
  username: string;
  password: string;
}

const DeleteUser: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: '',
  });

  const { deleteUser } = useContext(AuthContext);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      deleteUser(formData.username, formData.password);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="username"
        placeholder="Username"
        value={formData.username}
        onChange={handleChange}
      />
      <br></br>
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
      />
      <br></br><br></br>
      <button type="submit" style={{ backgroundColor: '#ff4d4d' }}>Delete Account</button>
    </form>
  );
};

export default DeleteUser;