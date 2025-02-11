import { Route, Routes, Navigate } from 'react-router-dom';

import HomePage from './pages/home/HomePage';
import LoginPage from './pages/auth/login/LoginPage';
import SignUpPage from './pages/auth/signup/SignUpPage';
import NotificationPage from './pages/notification/NotificationPage';
import ProfilePage from './pages/profile/ProfilePage';

import Sidebar from './components/common/Sidebar';
import RightPanel from './components/common/RightPanel';
import LoadingSpinner from './components/common/LoadingSpinner';

import { Toaster } from "react-hot-toast";

import { useQuery } from "@tanstack/react-query";

function App() {

	// query to get authentication information
	const { 
		data:authUser, 
		isLoading, 
		isError, 
		error 
	} = useQuery({
		queryKey: ["authUser"],	// Providing unique name to query to reference later. 
		queryFn: async() => {
			try {
				const res = await fetch("/api/auth/me");
				const data = await res.json();
				if(data.error) return null;	// Return null if authentication fails, so that user is redirected to login. 
				if(!res.ok) {
					throw new Error("Something went wrong");
				}
				return data;
			} catch (error) {
				throw new Error(error);
			}
		},
		retry: false,
	});

	if(isLoading) {
		return (
			<div className='h-screen flex justify-center items-center'>
				<LoadingSpinner size='lg' />
			</div>
		)
	};



  return (
		<div className='flex max-w-6xl mx-auto'>
			{/* Common component because this is not wrapped with Routes */}
			{authUser && <Sidebar />}
			<Routes>
				<Route path='/' element={ authUser ? <HomePage /> : <Navigate to="/login" /> } />
				<Route path='/signup' element={ !authUser ? <SignUpPage /> : <Navigate to="/" /> } />
				<Route path='/login' element={ !authUser ? <LoginPage /> : <Navigate to="/" /> } />
				<Route path='/notifications' element={ authUser ? <NotificationPage /> : <Navigate to="/login" /> } />
				<Route path='/profile/:username' element={ authUser ? <ProfilePage /> : <Navigate to="/login" /> } />
			</Routes>
    		{authUser && <RightPanel />}
			<Toaster />
		</div>
  )
}

export default App
