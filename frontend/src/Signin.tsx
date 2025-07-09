/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Signin() {
    const [form, setForm] = useState({ email: '', password: '' });
    const navigate = useNavigate();

    const handleSubmit = async (e:React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5001/api/auth/signin', form);
            // console.log("Request sent to backend");
            if(res.data.token){
                localStorage.setItem('token', res.data.token);
                alert('Login successful');
                navigate('/dashboard');
            } else {
                alert('Login failed - no token received');
            }
            
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
