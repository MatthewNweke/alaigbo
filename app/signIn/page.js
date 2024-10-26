'use client';
import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { AuthContext } from '@/lib/AuthContext';
import InputComponent from '@/UI/InputComponent';
import PasswordInputComponent from '@/UI/PasswordInputComponent';
import { getNextMonth } from '@/utils/expDate';
import { Loader2, LogIn } from 'lucide-react';

const SignInPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState(null);

  const router = useRouter();
  const { toast } = useToast();
  const { logIn } = useContext(AuthContext);

  useEffect(() => {
    // Only access localStorage if running in the browser
    if (typeof window !== 'undefined') {
      const accessToken = localStorage.getItem('access_token');
      setToken(accessToken);
    }
  }, []);

  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const refreshExp = getNextMonth();

    try {
      setIsLoading(true);
      // const { data } = await axios.post(`${API_URL}/api/v1/login/`, { email, password });

      logIn();
      if (typeof window !== 'undefined') {
        localStorage.setItem('email', email);
        localStorage.setItem('access_token', data?.data?.access);
        localStorage.setItem('refresh_token', data?.data?.refresh);
        localStorage.setItem('access_exp', refreshExp);
        localStorage.setItem('refresh_exp', refreshExp);
      }

      setIsLoading(false);

      if (data?.status === 200) {
        // const user = await axios.get(`${API_URL}/api/v1/user/`, config);
        localStorage.setItem('user', JSON.stringify(user?.data[0]));
      }

      router.push('/');
      toast({
        title: 'Login successful',
        description: 'You have been logged in',
      });
    } catch (error) {
      setIsLoading(false);
      const message = error?.response?.status === 401 
        ? 'Incorrect email or password' 
        : 'Network error, try again later';
      toast({ description: message, variant: 'destructive' });
    }
  };

  return (
    <div className="h-screen flex items-center justify-center flex-col">
      <form onSubmit={handleSubmit} className="sm:w-[50%] gap-4 w-[95%] grid grid-cols-1">
        <InputComponent
          type="email"
          value={email}
          setValue={setEmail}
          label="Your Email"
          required
        />
        <PasswordInputComponent
          value={password}
          setValue={setPassword}
          label="Password"
          required
          type="password"
        />
        <div className="flex justify-center">
          <Button
            disabled={isLoading}
            className="bg-[#DE5000] hover:bg-[#a4460f] transition duration-300"
            type="submit"
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-3" />}
            Login
          </Button>
        </div>
        <div className="flex items-center justify-center space-x-2 mt-8">
          <p>Don&apos;t have an account?</p>
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
