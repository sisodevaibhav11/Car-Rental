import React from 'react'
import toast from 'react-hot-toast';
import { useAppContext } from '../context/AppContext';

const Login = () => {
  const fallbackGoogleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

  const { setShowLogin, axios, setToken, navigate } = useAppContext();
  const [state, setState] = React.useState("login");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [googleAuthReady, setGoogleAuthReady] = React.useState(Boolean(window.google?.accounts?.id));
  const [googleClientId, setGoogleClientId] = React.useState("");
  const googleButtonRef = React.useRef(null);
  const googleToastRef = React.useRef(null);

  const completeLogin = React.useCallback((token, message) => {
    toast.success(message)
    navigate('/')
    setToken(token)
    localStorage.setItem('token', token)
    setShowLogin(false)
  }, [navigate, setShowLogin, setToken]);

  const handleGoogleResponse = React.useCallback(async (response) => {
    try {
      if (!response?.credential) {
        toast.error('Google sign-in did not return a credential')
        return;
      }

      googleToastRef.current = toast.loading('Signing you in with Google...')
      const { data } = await axios.post('/api/user/google', { credential: response.credential })
      if (data.success) {
        completeLogin(data.token, data.message || 'Logged in with Google successfully')
      } else {
        toast.error(data.message || 'Google authentication failed')
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message)
    } finally {
      if (googleToastRef.current) {
        toast.dismiss(googleToastRef.current)
        googleToastRef.current = null
      }
    }
  }, [axios, completeLogin]);

  React.useEffect(() => {
    let isMounted = true;

    const fetchGoogleConfig = async () => {
      try {
        const { data } = await axios.get('/api/user/auth-config');
        if (!isMounted) return;

        if (data.success && data.googleClientId) {
          setGoogleClientId(data.googleClientId);
          return;
        }

        if (fallbackGoogleClientId) {
          setGoogleClientId(fallbackGoogleClientId);
          return;
        }

        toast.error(data.message || 'Google sign-in is not configured on the server');
      } catch (error) {
        if (!isMounted) return;

        if (fallbackGoogleClientId) {
          setGoogleClientId(fallbackGoogleClientId);
          return;
        }

        toast.error(error?.response?.data?.message || error.message || 'Failed to load Google sign-in configuration');
      }
    };

    fetchGoogleConfig();

    const handleGoogleScriptReady = () => {
      if (window.google?.accounts?.id && isMounted) {
        setGoogleAuthReady(true);
      }
    };

    if (window.google?.accounts?.id) {
      handleGoogleScriptReady();
    } else {
      window.addEventListener('load', handleGoogleScriptReady);
      const intervalId = window.setInterval(handleGoogleScriptReady, 300);
      const timeoutId = window.setTimeout(() => {
        if (isMounted && !window.google?.accounts?.id) {
          toast.error('Google sign-in script did not load. Check internet connection and allowed origins.');
        }
      }, 5000);

      return () => {
        isMounted = false;
        window.removeEventListener('load', handleGoogleScriptReady);
        window.clearInterval(intervalId);
        window.clearTimeout(timeoutId);
      };
    }

    return () => {
      isMounted = false;
    };
  }, [axios, fallbackGoogleClientId]);

  React.useEffect(() => {
    if (!googleClientId || !googleButtonRef.current || !googleAuthReady || !window.google?.accounts?.id) {
      return;
    }

    const buttonContainer = googleButtonRef.current;

    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: handleGoogleResponse,
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    buttonContainer.innerHTML = '';
    window.google.accounts.id.renderButton(buttonContainer, {
      theme: 'outline',
      size: 'large',
      shape: 'pill',
      text: state === 'register' ? 'signup_with' : 'signin_with',
      width: buttonContainer.offsetWidth || 288,
    });

    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed?.()) {
        const reason = notification.getNotDisplayedReason?.();
        if (reason && reason !== 'suppressed_by_user') {
          toast.error(`Google sign-in is unavailable right now${reason ? `: ${reason}` : ''}. Check your Google OAuth authorized origins.`);
        }
      }

      if (notification.isSkippedMoment?.()) {
        const reason = notification.getSkippedReason?.();
        if (reason === 'user_cancel' || reason === 'tap_outside') {
          toast('Google sign-in was cancelled');
        }
      }
    });
  }, [googleAuthReady, googleClientId, handleGoogleResponse, state]);

  const onSubmitHandler = async (event) => {
    try {
      event.preventDefault();
      const { data } = await axios.post(`/api/user/${state}`, { name, email, password })
      if (data.success) {
        completeLogin(data.token, state === "register" ? "Account created successfully" : "Logged in successfully")
      } else {
        toast.error(data.message || 'Authentication failed')
      }
    }
    catch (error) {
      toast.error(error?.response?.data?.message || error.message)
    }

  }
  return (
    <div onClick={() => setShowLogin(false)} className='fixed top-0 bottom-0 left-0 right-0 z-100 flex item-center text-sm text-gray-600 bg-black/50'>
      <form onSubmit={onSubmitHandler} onClick={(e) => e.stopPropagation()} className="flex flex-col gap-4 m-auto items-start p-8 py-12 w-80 sm:w-[352px] text-gray-500 rounded-lg shadow-xl border border-gray-200 bg-white">
        <p className="text-2xl font-medium m-auto">
          <span className="text-indigo-500">User</span> {state === "login" ? "Login" : "Sign Up"}
        </p>
        {state === "register" && (
          <div className="w-full">
            <p>Name</p>
            <input onChange={(e) => setName(e.target.value)} value={name} placeholder="type here" className="border border-gray-200 rounded w-full p-2 mt-1 outline-indigo-500" type="text" autoComplete="name" required />
          </div>
        )}
        <div className="w-full ">
          <p>Email</p>
          <input onChange={(e) => setEmail(e.target.value)} value={email} placeholder="type here" className="border border-gray-200 rounded w-full p-2 mt-1 outline-indigo-500" type="email" autoComplete="email" required />
        </div>
        <div className="w-full ">
          <p>Password</p>
          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            placeholder="type here"
            className="border border-gray-200 rounded w-full p-2 mt-1 outline-indigo-500"
            type="password"
            autoComplete={state === "register" ? "new-password" : "current-password"}
            minLength={state === "register" ? 8 : undefined}
            required
          />
        </div>
        {state === "register" ? (
          <p>
            Already have account? <span onClick={() => setState("login")} className="text-indigo-500 cursor-pointer">click here</span>
          </p>
        ) : (
          <p>
            Create an account? <span onClick={() => setState("register")} className="text-indigo-500 cursor-pointer">click here</span>
          </p>
        )}
        <button className="bg-indigo-500 hover:bg-indigo-600 transition-all text-white w-full py-2 rounded-md cursor-pointer">
          {state === "register" ? "Create Account" : "Login"}
        </button>
        <div className="relative w-full pt-2">
          <div className="absolute inset-0 top-1/2 h-px -translate-y-1/2 bg-gray-200"></div>
          <p className="relative mx-auto w-fit bg-white px-3 text-xs uppercase tracking-[0.24em] text-gray-400">
            or
          </p>
        </div>
        {googleClientId ? (
          <div ref={googleButtonRef} className="w-full min-h-11"></div>
        ) : (
          <p className="w-full text-center text-xs text-gray-400">
            Google sign-in is unavailable until the Google client ID is configured.
          </p>
        )}
      </form>
    </div>
  )
}

export default Login
