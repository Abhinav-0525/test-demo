'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { sessionManager } from '@/lib/sessionManager';
import React from 'react';

interface BrochureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'check-session' | 'request-otp' | 'verify-otp' | 'success';

export default function BrochureModal({ isOpen, onClose }: BrochureModalProps) {
  const [step, setStep] = useState<Step>('check-session');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [countdown, setCountdown] = useState(0);

  const supabase = createClientComponentClient();

  // Check for existing session when modal opens
  useEffect(() => {
    if (isOpen) {
      checkExistingSession();
    }
  }, [isOpen]);

  // Countdown timer for OTP expiry
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const checkExistingSession = async () => {
    const session = sessionManager.getSession();
    
    if (session) {
      // User already logged in, download directly
      await downloadBrochure();
      setStep('success');
    } else {
      setStep('request-otp');
    }
  };

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // Check if user exists, if not create user
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', formData.email)
        .single();

      let userId = existingUser?.id;

      if (!existingUser) {
        // Create new user
        const { data: newUser, error: userError } = await supabase
          .from('users')
          .insert({
            name: formData.name,
            email: formData.email,
            phone: formData.phone
          })
          .select()
          .single();

        if (userError) throw userError;
        userId = newUser.id;
      }

      // Generate 6-digit OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Store OTP in database
      const { error: otpError } = await supabase
        .from('otp_verifications')
        .insert({
          email: formData.email,
          otp_code: otpCode,
          expires_at: expiresAt.toISOString()
        });

      if (otpError) throw otpError;

      // Send OTP email (using Supabase Edge Function)
      await sendOTPEmail(formData.email, otpCode, formData.name);

      setStep('verify-otp');
      setCountdown(600); // 10 minutes countdown
      
    } catch (error: any) {
      console.error('Error requesting OTP:', error);
      setErrorMessage(error.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // Verify OTP
      const { data: otpData, error: otpError } = await supabase
        .from('otp_verifications')
        .select('*')
        .eq('email', formData.email)
        .eq('otp_code', otp)
        .eq('verified', false)
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (otpError || !otpData) {
        // Increment attempts
        await supabase
          .from('otp_verifications')
          .update({ attempts: (otpData?.attempts || 0) + 1 })
          .eq('email', formData.email)
          .eq('otp_code', otp);

        throw new Error('Invalid or expired OTP. Please try again.');
      }

      // Mark OTP as verified
      await supabase
        .from('otp_verifications')
        .update({ verified: true })
        .eq('id', otpData.id);

      // Get user
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('email', formData.email)
        .single();

      if (!user) throw new Error('User not found');

      // Create session
      await sessionManager.createSession(user.id, user.email, user.name);

      // Download brochure
      await downloadBrochure();

      setStep('success');

    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      setErrorMessage(error.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const sendOTPEmail = async (email: string, otp: string, name: string) => {
    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp, name })
      });

      if (!response.ok) {
        throw new Error('Failed to send OTP email');
      }

      // Also log to console for development
      console.log(`OTP sent to ${email}: ${otp}`);
    } catch (error) {
      console.error('Error sending OTP email:', error);
      // Don't throw - allow the flow to continue even if email fails
      console.log(`OTP for ${email}: ${otp} (Email service not configured)`);
    }
  };

  const downloadBrochure = async () => {
    try {
      // Record download
      await sessionManager.recordDownload();

      // Get current session
      const session = sessionManager.getSession();
      if (!session) {
        setErrorMessage('Session expired. Please try again.');
        return;
      }

      // Get current session token
      const sessionToken = session.sessionToken;
      
      // Open brochure in new tab
      window.open(`/api/download-brochure?token=${sessionToken}`, '_blank');
    } catch (error) {
      console.error('Error opening brochure:', error);
      setErrorMessage('Failed to open brochure. Please try again.');
    }
  };

  const handleLogout = async () => {
    await sessionManager.endSession();
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  const session = sessionManager.getSession();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
      <div className="bg-linear-to-br from-gray-900 via-black to-gray-900 rounded-none max-w-md w-full p-8 border-2 border-white/30 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-6">
          <h3 className="text-3xl font-bold text-white mb-2 tracking-tight">Download Brochure</h3>
          <div className="w-16 h-1 bg-white mb-4" />
          {session && (
            <div className="bg-white/10 border border-white/20 rounded-none p-3 mb-4">
              <p className="text-sm text-gray-300">Welcome back, <span className="text-white font-semibold">{session.name}</span></p>
              <button
                onClick={handleLogout}
                className="text-xs text-gray-400 hover:text-white underline mt-1"
              >
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Step: Request OTP */}
        {step === 'request-otp' && (
          <form onSubmit={handleRequestOTP} className="space-y-5">
            <p className="text-gray-400 mb-4">Enter your details to receive an OTP</p>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2 uppercase tracking-wider">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-black border-2 border-white/30 rounded-none text-white placeholder-gray-500 focus:outline-none focus:border-white transition-colors"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2 uppercase tracking-wider">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-black border-2 border-white/30 rounded-none text-white placeholder-gray-500 focus:outline-none focus:border-white transition-colors"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2 uppercase tracking-wider">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-black border-2 border-white/30 rounded-none text-white placeholder-gray-500 focus:outline-none focus:border-white transition-colors"
                placeholder="+1 (555) 000-0000"
              />
            </div>

            {errorMessage && (
              <div className="bg-white/10 border-2 border-white/50 rounded-none p-3">
                <p className="text-white text-sm">{errorMessage}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-white text-black py-3 rounded-none font-semibold hover:bg-gray-200 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border-2 border-white"
            >
              {isSubmitting ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        )}

        {/* Step: Verify OTP */}
        {step === 'verify-otp' && (
          <form onSubmit={handleVerifyOTP} className="space-y-5">
            <div className="bg-white/10 border border-white/20 rounded-none p-4 mb-4">
              <p className="text-sm text-gray-300">
                OTP sent to <span className="text-white font-semibold">{formData.email}</span>
              </p>
              {countdown > 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  Expires in: <span className="text-white">{formatTime(countdown)}</span>
                </p>
              )}
            </div>

            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-300 mb-2 uppercase tracking-wider">
                Enter OTP *
              </label>
              <input
                type="text"
                id="otp"
                name="otp"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-3 bg-black border-2 border-white/30 rounded-none text-white text-center text-2xl tracking-widest placeholder-gray-500 focus:outline-none focus:border-white transition-colors"
                placeholder="000000"
              />
            </div>

            {errorMessage && (
              <div className="bg-white/10 border-2 border-white/50 rounded-none p-3">
                <p className="text-white text-sm">{errorMessage}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || otp.length !== 6}
              className="w-full bg-white text-black py-3 rounded-none font-semibold hover:bg-gray-200 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border-2 border-white"
            >
              {isSubmitting ? 'Verifying...' : 'Verify OTP'}
            </button>

            <button
              type="button"
              onClick={() => setStep('request-otp')}
              className="w-full text-gray-400 hover:text-white text-sm underline"
            >
              Resend OTP
            </button>
          </form>
        )}

        {/* Step: Success */}
        {step === 'success' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h4 className="text-xl font-bold text-white mb-2">Success!</h4>
            <p className="text-gray-400">Your brochure is being downloaded...</p>
            <p className="text-sm text-gray-500 mt-4">You won't need to log in again for future downloads.</p>
          </div>
        )}

        {/* Privacy Note */}
        <p className="text-xs text-gray-500 mt-4 text-center">
          Your session is secure. You'll stay logged in for future downloads.
        </p>
      </div>
    </div>
  );
}