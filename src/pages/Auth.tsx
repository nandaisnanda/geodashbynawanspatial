
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Mail, Lock, User, ArrowRight, Sparkles, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { error } = await signIn(signInEmail, signInPassword);
    
    if (!error) {
      navigate('/');
    }
    
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { error } = await signUp(signUpEmail, signUpPassword, fullName);
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse pulse-slow"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-2xl animate-pulse pulse-fast"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Enhanced header with staggered animations */}
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full p-4 w-20 h-20 mx-auto mb-6 animate-scale-in hover-glow">
              <MapPin className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-3 animate-fade-in-up">
              Welcome to <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Geodash</span>
            </h1>
            <p className="text-muted-foreground flex items-center justify-center gap-2 animate-fade-in-up animate-delay-100">
              <Sparkles className="h-4 w-4" />
              Advanced Geospatial Analytics Platform
            </p>
          </div>

          {/* Enhanced glass card with improved styling */}
          <Card className="glass-card border-0 shadow-2xl animate-fade-in-up animate-delay-200">
            <Tabs defaultValue="signin" className="w-full">
              <CardHeader className="space-y-4 pb-6">
                <TabsList className="grid w-full grid-cols-2 bg-muted/30 backdrop-blur-sm">
                  <TabsTrigger value="signin" className="text-sm font-medium transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="text-sm font-medium transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Sign Up
                  </TabsTrigger>
                </TabsList>
              </CardHeader>

              <TabsContent value="signin" className="animate-fade-in-left">
                <form onSubmit={handleSignIn}>
                  <CardContent className="space-y-6">
                    <div className="text-center space-y-2">
                      <CardTitle className="text-2xl bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                        Welcome Back!
                      </CardTitle>
                      <CardDescription className="text-base">
                        Sign in to access your geospatial analytics dashboard
                      </CardDescription>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="relative group">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                          type="email"
                          placeholder="Email address"
                          value={signInEmail}
                          onChange={(e) => setSignInEmail(e.target.value)}
                          className="pl-10 glass-button focus-ring transition-all duration-300"
                          required
                        />
                      </div>
                      
                      <div className="relative group">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Password"
                          value={signInPassword}
                          onChange={(e) => setSignInPassword(e.target.value)}
                          className="pl-10 pr-10 glass-button focus-ring transition-all duration-300"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-muted-foreground hover:text-primary transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter>
                    <Button 
                      type="submit" 
                      className="w-full btn-primary group" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="loading-spinner w-4 h-4 mr-2"></div>
                      ) : null}
                      {isLoading ? 'Signing in...' : 'Sign In'}
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardFooter>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="animate-fade-in-right">
                <form onSubmit={handleSignUp}>
                  <CardContent className="space-y-6">
                    <div className="text-center space-y-2">
                      <CardTitle className="text-2xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Create Account
                      </CardTitle>
                      <CardDescription className="text-base">
                        Join thousands of users analyzing geospatial data
                      </CardDescription>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="relative group">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                          type="text"
                          placeholder="Full name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="pl-10 glass-button focus-ring transition-all duration-300"
                          required
                        />
                      </div>
                      
                      <div className="relative group">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                          type="email"
                          placeholder="Email address"
                          value={signUpEmail}
                          onChange={(e) => setSignUpEmail(e.target.value)}
                          className="pl-10 glass-button focus-ring transition-all duration-300"
                          required
                        />
                      </div>
                      
                      <div className="relative group">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                          type={showSignUpPassword ? "text" : "password"}
                          placeholder="Password (min. 6 characters)"
                          value={signUpPassword}
                          onChange={(e) => setSignUpPassword(e.target.value)}
                          className="pl-10 pr-10 glass-button focus-ring transition-all duration-300"
                          minLength={6}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                          className="absolute right-3 top-3 text-muted-foreground hover:text-primary transition-colors"
                        >
                          {showSignUpPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter>
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 focus-ring group" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="loading-spinner w-4 h-4 mr-2"></div>
                      ) : null}
                      {isLoading ? 'Creating account...' : 'Create Account'}
                      <Sparkles className="ml-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
                    </Button>
                  </CardFooter>
                </form>
              </TabsContent>
            </Tabs>
          </Card>

          <div className="text-center mt-8 text-sm text-muted-foreground animate-fade-in-up animate-delay-300">
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
