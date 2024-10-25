'use client';
import InputComponent from '@/UI/InputComponent';
import PasswordInputComponent from '@/UI/PasswordInputComponent';
import { Button } from '@/components/ui/button';

import { useToast } from '@/components/ui/use-toast';
import { API_URL } from '@/constants/api';
import { AuthContext } from '@/lib/AuthContext';
import { getNextMonth } from '@/utils/expDate';

import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { Loader2, LogIn } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useContext, useState, useEffect } from 'react';

const SignInPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState(null); // Store token from localStorage
  const router = useRouter();
  const { toast } = useToast();
  const { logIn } = useContext(AuthContext);

  // Ensure localStorage is accessed only on the client side
  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    setToken(storedToken);
  }, []);

  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const refreshExp = getNextMonth();

    try {
      setIsLoading(true);
      const { data } = await axios.post(`${API_URL}/api/v1/login/`, {
        email,
        password,
      });

      logIn();
      localStorage.setItem('email', email);
      localStorage.setItem('access_token', data?.data?.access);
      localStorage.setItem('refresh_token', data?.data?.refresh);
      localStorage.setItem('access_exp', refreshExp);
      localStorage.setItem('refresh_exp', refreshExp);

      setIsLoading(false);

      if (data?.status === 200) {
        const user = await axios.get(`${API_URL}/api/v1/user/`, config);
        localStorage.setItem('user', JSON.stringify(user?.data[0]));
      }

      router.push('/');
      return toast({
        title: '',
        description: 'You have been logged in',
      });
    } catch (error) {
      setIsLoading(false);
      const status = error?.response?.status;
      const description =
        status === 401
          ? 'Incorrect email or password'
          : 'Network error. Try again later';

      toast({
        title: status === 500 ? 'Network error' : '',
        description,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="h-screen flex items-center justify-center flex-col">
      <form
        onSubmit={handleSubmit}
        className="sm:w-[50%] gap-4 w-[95%] grid grid-cols-1"
      >
        <InputComponent
          type="email"
          value={email}
          setValue={setEmail}
          label="Your Email"
          required={true}
        />
        <PasswordInputComponent
          value={password}
          setValue={setPassword}
          label="Password"
          type="password"
          required={true}
          placeholder="Password"
        />
        <div className="flex justify-center">
          <Button
            disabled={isLoading}
            className="bg-[#DE5000] hover:bg-[#a4460f] transition duration-300"
            type="submit"
          >
            {!isLoading && <LogIn className="mr-3" />}
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Login
          </Button>
        </div>
        <div className="flex items-center justify-center space-x-2 mt-8">
          <p>Dont&apos;t have an account?</p>
          <Link
            href="/signup"
            className="text-blue-600 rounded-md transition hover:text-blue-700 duration-300"
          >
            Sign up
          </Link>
        </div>
      </form>
    </div>
  );
};

export default SignInPage;
