
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Mail, Lock, User, ArrowRight, Sparkles, Eye, EyeOff, Phone, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ForgotPassword from '@/components/ForgotPassword';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

const Auth = () => {
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [showVerification, setShowVerification] = useState(false);
  
  const { signIn, signUp, signInWithPhone, verifyOtp, user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  console.log('Auth page - user:', user?.email, 'loading:', loading);

  useEffect(() => {
    if (user && !loading) {
      console.log('User authenticated, redirecting to /');
      navigate('/', { replace: true });
    }
  }, [user, loading, navigate]);

  // Handle password reset mode
  useEffect(() => {
    if (searchParams.get('mode') === 'reset') {
      setShowForgotPassword(true);
    }
  }, [searchParams]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    console.log('Signing in with:', signInEmail);
    setIsSubmitting(true);
    
    try {
      const { error } = await signIn(signInEmail, signInPassword);
      
      if (!error) {
        console.log('Sign in successful, navigating to /');
      }
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    console.log('Signing up with:', signUpEmail);
    setIsSubmitting(true);
    
    try {
      await signUp(signUpEmail, signUpPassword, fullName);
    } catch (error) {
      console.error('Sign up error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhoneSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const { error } = await signInWithPhone(phoneNumber);
      if (!error) {
        setShowVerification(true);
      }
    } catch (error) {
      console.error('Phone sign in error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const { error } = await verifyOtp(phoneNumber, verificationCode);
      if (!error) {
        setShowVerification(false);
      }
    } catch (error) {
      console.error('OTP verification error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
          <p className="text-white/80 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-2xl animate-pulse"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full p-4 w-20 h-20 mx-auto mb-6 hover:scale-105 transition-transform">
              <MapPin className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-3">
              Welcome to <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Geodash</span>
            </h1>
            <p className="text-gray-300 flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4" />
              Advanced Geospatial Analytics Platform
            </p>
          </div>

          {/* Show Forgot Password component if needed */}
          {showForgotPassword ? (
            <ForgotPassword onBack={() => setShowForgotPassword(false)} />
          ) : (
            /* Auth Card */
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl">
              <Tabs defaultValue="signin" className="w-full">
                <CardHeader className="space-y-4 pb-6">
                  <TabsList className="grid w-full grid-cols-2 bg-white/10 backdrop-blur-sm">
                    <TabsTrigger value="signin" className="text-sm font-medium transition-all duration-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                      Sign In
                    </TabsTrigger>
                    <TabsTrigger value="signup" className="text-sm font-medium transition-all duration-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                      Sign Up
                    </TabsTrigger>
                  </TabsList>
                </CardHeader>

                <TabsContent value="signin">
                  {showVerification ? (
                    <form onSubmit={handleVerifyOtp}>
                      <CardContent className="space-y-6">
                        <div className="text-center space-y-2">
                          <CardTitle className="text-2xl text-white">
                            Verify Your Phone
                          </CardTitle>
                          <CardDescription className="text-gray-300 text-base">
                            Enter the 6-digit code sent to {phoneNumber}
                          </CardDescription>
                        </div>
                        
                        <div className="flex justify-center">
                          <InputOTP maxLength={6} value={verificationCode} onChange={setVerificationCode}>
                            <InputOTPGroup>
                              <InputOTPSlot index={0} />
                              <InputOTPSlot index={1} />
                              <InputOTPSlot index={2} />
                              <InputOTPSlot index={3} />
                              <InputOTPSlot index={4} />
                              <InputOTPSlot index={5} />
                            </InputOTPGroup>
                          </InputOTP>
                        </div>

                        <div className="text-center">
                          <button
                            type="button"
                            onClick={() => setShowVerification(false)}
                            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                            disabled={isSubmitting}
                          >
                            Back to phone sign in
                          </button>
                        </div>
                      </CardContent>
                      
                      <CardFooter>
                        <Button 
                          type="submit" 
                          className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 group" 
                          disabled={isSubmitting || verificationCode.length !== 6}
                        >
                          {isSubmitting ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          ) : null}
                          {isSubmitting ? 'Verifying...' : 'Verify Code'}
                          {!isSubmitting && <MessageSquare className="ml-2 h-4 w-4 group-hover:scale-110 transition-transform" />}
                        </Button>
                      </CardFooter>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      {/* Method Selection */}
                      <div className="flex gap-2 p-1 bg-white/5 rounded-lg">
                        <Button
                          type="button"
                          variant={authMethod === 'email' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setAuthMethod('email')}
                          className="flex-1"
                        >
                          <Mail className="h-4 w-4 mr-1" />
                          Email
                        </Button>
                        <Button
                          type="button"
                          variant={authMethod === 'phone' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setAuthMethod('phone')}
                          className="flex-1"
                        >
                          <Phone className="h-4 w-4 mr-1" />
                          Phone
                        </Button>
                      </div>

                      {authMethod === 'email' ? (
                        <form onSubmit={handleSignIn}>
                          <CardContent className="space-y-6">
                            <div className="text-center space-y-2">
                              <CardTitle className="text-2xl text-white">
                                Welcome Back!
                              </CardTitle>
                              <CardDescription className="text-gray-300 text-base">
                                Sign in to access your geospatial analytics dashboard
                              </CardDescription>
                            </div>
                            
                            <div className="space-y-4">
                              <div className="relative group">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
                                <Input
                                  type="email"
                                  placeholder="Email address"
                                  value={signInEmail}
                                  onChange={(e) => setSignInEmail(e.target.value)}
                                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 transition-all duration-300"
                                  required
                                  disabled={isSubmitting}
                                />
                              </div>
                              
                              <div className="relative group">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
                                <Input
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Password"
                                  value={signInPassword}
                                  onChange={(e) => setSignInPassword(e.target.value)}
                                  className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 transition-all duration-300"
                                  required
                                  disabled={isSubmitting}
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-3 top-3 text-gray-400 hover:text-blue-400 transition-colors"
                                  disabled={isSubmitting}
                                >
                                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                              </div>
                            </div>

                            <div className="text-center">
                              <button
                                type="button"
                                onClick={() => setShowForgotPassword(true)}
                                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                                disabled={isSubmitting}
                              >
                                Forgot your password?
                              </button>
                            </div>
                          </CardContent>
                          
                          <CardFooter>
                            <Button 
                              type="submit" 
                              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 group" 
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              ) : null}
                              {isSubmitting ? 'Signing in...' : 'Sign In'}
                              {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />}
                            </Button>
                          </CardFooter>
                        </form>
                      ) : (
                        <form onSubmit={handlePhoneSignIn}>
                          <CardContent className="space-y-6">
                            <div className="text-center space-y-2">
                              <CardTitle className="text-2xl text-white">
                                Phone Sign In
                              </CardTitle>
                              <CardDescription className="text-gray-300 text-base">
                                Enter your phone number to receive a verification code
                              </CardDescription>
                            </div>
                            
                            <div className="relative group">
                              <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
                              <Input
                                type="tel"
                                placeholder="+1234567890"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 transition-all duration-300"
                                required
                                disabled={isSubmitting}
                              />
                            </div>
                          </CardContent>
                          
                          <CardFooter>
                            <Button 
                              type="submit" 
                              className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 group" 
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              ) : null}
                              {isSubmitting ? 'Sending code...' : 'Send Code'}
                              {!isSubmitting && <MessageSquare className="ml-2 h-4 w-4 group-hover:scale-110 transition-transform" />}
                            </Button>
                          </CardFooter>
                        </form>
                      )}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignUp}>
                    <CardContent className="space-y-6">
                      <div className="text-center space-y-2">
                        <CardTitle className="text-2xl text-white">
                          Create Account
                        </CardTitle>
                        <CardDescription className="text-gray-300 text-base">
                          Join thousands of users analyzing geospatial data
                        </CardDescription>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="relative group">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
                          <Input
                            type="text"
                            placeholder="Full name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 transition-all duration-300"
                            required
                            disabled={isSubmitting}
                          />
                        </div>
                        
                        <div className="relative group">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
                          <Input
                            type="email"
                            placeholder="Email address"
                            value={signUpEmail}
                            onChange={(e) => setSignUpEmail(e.target.value)}
                            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 transition-all duration-300"
                            required
                            disabled={isSubmitting}
                          />
                        </div>
                        
                        <div className="relative group">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
                          <Input
                            type={showSignUpPassword ? "text" : "password"}
                            placeholder="Password (min. 6 characters)"
                            value={signUpPassword}
                            onChange={(e) => setSignUpPassword(e.target.value)}
                            className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 transition-all duration-300"
                            minLength={6}
                            required
                            disabled={isSubmitting}
                          />
                          <button
                            type="button"
                            onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                            className="absolute right-3 top-3 text-gray-400 hover:text-blue-400 transition-colors"
                            disabled={isSubmitting}
                          >
                            {showSignUpPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </CardContent>
                    
                    <CardFooter>
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 group" 
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : null}
                        {isSubmitting ? 'Creating account...' : 'Create Account'}
                        {!isSubmitting && <Sparkles className="ml-2 h-4 w-4 group-hover:rotate-12 transition-transform" />}
                      </Button>
                    </CardFooter>
                  </form>
                </TabsContent>
              </Tabs>
            </Card>
          )}

          <div className="text-center mt-8 text-sm text-gray-400">
            <p className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Secure authentication powered by Supabase
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
