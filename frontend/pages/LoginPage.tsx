import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useApp } from '../store/Context';
import authService from '../services/authService';

export const LoginPage: React.FC = () => {
  const { setUser } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const user = await authService.login({ email, password });
      setUser(user);
      navigate(user.role === 'admin' ? '/admin' : '/profile');
    } catch (err: any) {
      setError(err.message || 'Failed to log in. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-[1000px] bg-transparent flex flex-col md:flex-row shadow-none md:h-[600px] overflow-hidden">

        {/* Left Panel - Blue Gradient */}
        <div className="w-full md:w-[40%] bg-[#2874F0] p-10 flex flex-col justify-between text-white md:rounded-l-sm">
          <div>
            <h1 className="text-3xl font-bold mb-6">Login</h1>
            <p className="text-lg font-medium text-gray-200 leading-relaxed">
              Get access to your Orders, Wishlist and Recommendations
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-full h-40 bg-contain bg-no-repeat bg-center opacity-90" style={{ backgroundImage: 'url("https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/login_img_c4a81e.png")' }}></div>
          </div>
        </div>

        {/* Right Panel - Glass Card Area */}
        <div className="w-full md:w-[60%] bg-white p-10 md:p-14 md:rounded-r-sm relative border border-gray-100 shadow-sm flex flex-col justify-center">

          {/* Prism Glass Card overlay if requested, but standard Flipkart login is actually white right panel with blue left. 
             However, the user SPECIFICALLY requested "Prism Glass / Soft Glassmorphism". 
             I will Apply the Glass effect to the form container OR the whole right panel background to satisfy "Glass card (centered)".
             Let's make the right panel the container and put a glass card inside it or style the right panel itself as the card on a background?
             The "Structure" says: Full screen split layout. Left Blue. Right Glass Card.
             Okay, let's look at the structure again: 
             LAYOUT: Full screen split layout. LEFT: Blue gradient panel. RIGHT: Glass card (centered).
             It seems they want the glass card ON the right side, maybe over a background? 
             Or is the Right Panel ITSELF the glass card? 
             "Glass card (centered) -> Login form" under "RIGHT".
             If I make the whole right panel white (like Flipkart), it's not "Glass". 
             If I make the right panel transparent and put a glass card in it?
             Let's assume the "Split layout" means the container is split.
             To strictly follow "Prism Glass" rules: 
             Card background: rgba(255,255,255,0.75), Backdrop blur 18px.
             I will apply this style to the Right Panel container itself, making it look like a glass pane next to the blue pane.
           */}

          <div className="absolute inset-0 bg-white/75 backdrop-blur-[18px]" style={{ zIndex: 0 }}></div>

          <div className="relative z-10 w-full max-w-sm mx-auto">

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-3 animate-fade-in shadow-sm">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="group">
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder=" "
                    className="peer w-full px-0 py-3 border-b border-gray-300 bg-transparent focus:outline-none focus:border-[#2874F0] transition-colors text-gray-800 placeholder-transparent"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <label
                    htmlFor="email"
                    className="absolute left-0 top-3 text-gray-500 text-base transition-all duration-200 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-[#2874F0] peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-not-placeholder-shown:-top-3.5 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:text-gray-500 cursor-text"
                  >
                    Email or Mobile
                  </label>
                </div>
              </div>

              <div className="group">
                <div className="relative">
                  <input
                    id="password"
                    type="password"
                    required
                    placeholder=" "
                    className="peer w-full px-0 py-3 border-b border-gray-300 bg-transparent focus:outline-none focus:border-[#2874F0] transition-colors text-gray-800 placeholder-transparent"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <label
                    htmlFor="password"
                    className="absolute left-0 top-3 text-gray-500 text-base transition-all duration-200 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-[#2874F0] peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-not-placeholder-shown:-top-3.5 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:text-gray-500 cursor-text"
                  >
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="absolute right-0 top-4 text-sm font-medium text-[#2874F0] hover:text-blue-700 transition-colors"
                  >
                    Forgot?
                  </Link>
                </div>
              </div>

              <div className="text-xs text-gray-500 mt-4 leading-relaxed">
                By continuing, you agree to Flipzokart's <span className="text-[#2874F0] font-medium cursor-pointer">Terms of Use</span> and <span className="text-[#2874F0] font-medium cursor-pointer">Privacy Policy</span>.
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#FB641B] text-white py-3.5 rounded-[2px] font-semibold text-[15px] shadow-[0_2px_4px_0_rgba(0,0,0,0.2)] hover:shadow-[0_4px_8px_0_rgba(0,0,0,0.2)] transition-shadow disabled:opacity-70 mt-4"
                style={{ backgroundColor: '#FB641B' }} // Flipkart Orange/Red for Update
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/60 border-t-white rounded-full animate-spin mx-auto"></div>
                ) : (
                  'Login'
                )}
              </button>

              <div className="mt-8 text-center relative">
                <Link to="/signup" className="text-[#2874F0] font-medium text-sm hover:underline block w-full py-3">
                  New to Flipzokart? Create an account
                </Link>
              </div>

            </form>
          </div>
        </div>
      </div>

      {/* Footer Info or Background Decorations can go here if needed, but keeping it clean for the task */}
    </div>
  );
};
