import { useState } from 'react';
import axios from 'axios';

function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const handleSubmit = async (e:React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/signup', form);
      alert('Signup successful');
    } catch (err:any) {
      alert(err.response?.data?.msg || 'Error');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input placeholder="Name" onChange={e => setForm({ ...form, name: e.target.value })} />
      <input placeholder="Email" type="email" onChange={e => setForm({ ...form, email: e.target.value })} />
      <input placeholder="Password" type="password" onChange={e => setForm({ ...form, password: e.target.value })} />
      <button type="submit">Sign Up</button>
    </form>
  );
}

export default Signup;
