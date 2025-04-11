/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import '../css/SignInUpForm.css'; 
import OAuthSignIn from '../OAuthSignIn';
import axios from 'axios';
import { CircularProgress, IconButton, InputAdornment, LinearProgress, TextField } from '@mui/material';
import { Box } from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { RemoveRedEye } from '@mui/icons-material';

const baseUrl = import.meta.env.VITE_BASE_URL; 

const SignInUpForm = ({ onSignIn }) => {
  const [rightPanelActive, setRightPanelActive] = useState(false);
  const [signUpData, setSignUpData] = useState({ email: '', username: '', role:"staff", password: '' });
  const [signInData, setSignInData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errorCondition, setErrorCondition] = useState ();

  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate(); 

  useEffect(() => {
    const savedToken = JSON.parse(sessionStorage.getItem('token'));
    if (savedToken) setToken(savedToken);
  }, []);

  const handleSignUpClick = () => {setRightPanelActive(true); setError('')}
  const handleSignInClick = () => {setRightPanelActive(false); setError('')}

  const handleSignUpChange = (e) => {
    const { name, value } = e.target;
      setSignUpData({ ...signUpData, [name]: value });
    
    
  };

  const handleSignInChange = (e) => {
    const { name, value } = e.target; 
    setSignInData({ ...signInData, [name]: value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };
  
  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
  
    if (confirmPassword === signUpData.password) {
      try {
        const response = await axios.post(`${baseUrl}/auth/signup`, signUpData);
        console.log("Sign-Up successful:", response.data);
        setRightPanelActive(false);
        setError('');
        setErrorCondition(response.status);
      } catch (error) {
        if (error.response.status === 400) {
          setError('Email already in use. Please try again.');
        } else {
          setError('Sign Up failed. Please try again.');
        }
        console.error('Sign-Up error:', error);
      } finally {
        setIsLoading(false);
      }
    } else if (confirmPassword !== signUpData.password) {
      setError('Passwords do not match.');
      setIsLoading(false)
    }
  };
  
  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };
  

  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const requestBody = {
      email: signInData.email.trim().toLowerCase(),
      password: signInData.password,
    };

    try {
      const response = await axios.post(`${baseUrl}/auth/signin`, requestBody, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Sign-In successful:', response.data);
      
      if (response.data.token) {
        setToken(response.data.token); 
        sessionStorage.setItem('token', JSON.stringify(response.data.token));
        sessionStorage.setItem('role', JSON.stringify(response.data.role));
        sessionStorage.setItem('userEmail', JSON.stringify(response.data.email));
        sessionStorage.setItem('userName', JSON.stringify(response.data.username || response.data.email.split('@')[0]));
        onSignIn();
        
        // Redirect based on user role
        if (response.data.role === 'staff') {
          navigate('/dashboard');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error) {
      if (error.response) {
        console.error('Error response:', error.response.data);
        setError(error.response.status === 401 
          ? 'Sign In failed: Unauthorized. Please check your credentials.' 
          : `Sign In failed: ${error.response.data.message}`);
      } else {
        console.error('Error:', error.message);
        setError('Sign In failed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if(isLoading){
    return (
      <LoadingSpinner name={signInData.email}/>
    );
  }

  return (
    <div className={`container ${rightPanelActive ? 'right-panel-active' : ''}`} id="container">
      <div className="form-container sign-up-container">
        <form onSubmit={handleSignUpSubmit} autoComplete="off">
          <h1 style={{ marginTop: 10 }}>Create Account</h1>
         
          <input className='emailInput' type="text" name="email" placeholder="Email" onChange={handleSignUpChange} required  />
          <input type="text" name="username" placeholder="Enter Username"  autoComplete="off" onChange={handleSignUpChange} required/>
          <input type="password" name="password" placeholder="Password" onChange={handleSignUpChange} required style={{ marginTop: 10 }}/>
          <input 
            type="password" 
            name="confirmPassword" 
            placeholder="Confirm Password" 
            onChange={handleConfirmPasswordChange} 
            required 
            style={{ marginTop:5 }}
          />

          <button className='signupBtnSbt' type="submit" disabled={isLoading} >Sign Up</button>
          {error && <p className="error">{error}</p>}
        </form>
      </div>

      <div className="form-container sign-in-container">
        <form onSubmit={handleSignInSubmit} >
          <img src="/src/assets/componentsRes/hkotiskLogo.png" alt="Logo" className='Logo' />
          <h1 className='sign-in-text'>Sign in</h1>
          <div className='marg'></div>
          <TextField className='emailIn'type="email" size='small' name="email" placeholder="Email" onChange={handleSignInChange} required sx={{mt:2}}/>
          <TextField className='password'
                type={showPassword ? "text" : "password"}
                name="password"
                size='small'
                placeholder="Enter your password"
                onChange={handleSignInChange}
                sx={{mt:3.5}}
               
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={togglePasswordVisibility}
                        edge="end"
                      >
                    {showPassword ? <VisibilityOffIcon /> : <RemoveRedEye/>}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
      
          <div className='marg'></div>
          <button type="submit" disabled={isLoading} style={{marginTop:10}}>Sign In</button>
          <OAuthSignIn/>
          {error && <p className="error">{error}</p>}
        </form>

      </div>

      <div className="overlay-container">
        <div className="overlay">
          <div className="overlay-panel overlay-left">
            <h1>Welcome Back!</h1>
            <p>To keep connected with us please login with your personal info</p>
            <button className="ghost" onClick={handleSignInClick}>Sign In</button>
          </div>
          <div className="overlay-panel overlay-right">
            <h1>Hello, Friend!</h1>
            <p>Enter your personal details and start your journey with us</p>
            <button className="ghost" onClick={handleSignUpClick}>Sign Up</button>
          </div>
        </div>
      </div>
    </div>
    
  );
};

export default SignInUpForm;

const MyLogOut = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await axios.post(`${baseUrl}/auth/signout`);
      console.log('SignOut successful:', response.data);
      setSuccessMessage('You have been successfully signed out.');
    } catch (error) {
      console.error('Error:', error.message);
      setError('Failed to sign out. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSignInSubmit}>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Signing out...' : 'Sign Out'}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
    </>
  );
};
