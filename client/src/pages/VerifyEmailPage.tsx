import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Mail, AlertCircle, ArrowRight, CheckCircle2, RotateCw, GraduationCap } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [debugOtp, setDebugOtp] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const emailParam = searchParams.get('email');
    const otpParam = searchParams.get('otp');
    if (emailParam) setEmail(emailParam);
    if (otpParam) {
      setDebugOtp(otpParam);
      setOtp(otpParam);
    }
  }, [searchParams]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const res = await api.post('/auth/verify-email', { email, otp });
      setMessage('Email verified. Redirecting to your dashboard...');
      setTimeout(() => {
        login(res.data.token, res.data.user);
        navigate('/');
      }, 700);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Verification failed. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError('Please provide your institutional email.');
      return;
    }
    setResending(true);
    setError(null);
    try {
      const res = await api.post('/auth/resend-otp', { email });
      setMessage(res.data.message);
      if (res.data.debugOtp) {
        setDebugOtp(res.data.debugOtp);
        setOtp(res.data.debugOtp);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to resend code.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 animate-fadeIn">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <img
            src="/images/iiitbh_logo.png"
            alt="IIIT Bhagalpur Crest"
            className="w-14 h-14 object-contain bg-white p-1 rounded-xl shadow-xs border border-slate-200 dark:border-slate-800"
          />
        </div>
        <h2 className="mt-3 text-center text-xl font-bold tracking-tight text-slate-900 dark:text-white uppercase">
          Verify Institutional Email
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500">
          Enter the 6-digit one-time verification passcode issued to your official college email
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 sm:px-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-start gap-2.5 text-rose-700 dark:text-rose-300 text-xs animate-slideDown">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="mb-5 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-start gap-2.5 text-emerald-700 dark:text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{message}</span>
            </div>
          )}

          {debugOtp && (
            <div className="mb-5 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-300 text-xs">
              <div className="font-semibold flex items-center gap-1.5 mb-1">
                <CheckCircle2 className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                <span>Development Passcode:</span>
              </div>
              <p className="font-mono text-sm font-bold text-slate-900 dark:text-white tracking-widest bg-white dark:bg-slate-900 py-1.5 px-3 rounded text-center border border-blue-200 dark:border-blue-800">
                {debugOtp}
              </p>
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Institutional Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rollno@iiitbh.ac.in"
                  className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                6-Digit Passcode
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="w-full text-center tracking-[0.3em] font-mono text-lg py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {loading ? (
                'Verifying...'
              ) : (
                <>
                  <span>Verify Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              disabled={resending}
              onClick={handleResend}
              className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400 font-medium hover:underline disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
              Resend Passcode
            </button>
            <Link to="/login" className="hover:underline">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
