import { useState } from 'react';
import axios from 'axios';

function Signin() {
    const [form, setForm] = useState({ email: '', password: '' });

    const handleSubmit = async (e:React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/auth/signin', form);
            localStorage.setItem('token', res.data.token);
            alert('Login successful');
        } catch (err:any) {
            alert(err.response?.data?.msg || 'Error');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input placeholder="Email" type="email" onChange={e => setForm({ ...form, email: e.target.value })} />
            <input placeholder="Password" type="password" onChange={e => setForm({ ...form, password: e.target.value })} />
            <button type="submit">Sign In</button>
        </form>
    );
}

export default Signin;
