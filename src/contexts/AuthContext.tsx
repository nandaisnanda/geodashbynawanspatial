
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (session) {
          setSession(session);
          setUser(session.user);
        } else {
          setSession(null);
          setUser(null);
        }
        
        setLoading(false);
        
        // Track user activity for sign in events (with delay to avoid blocking)
        if (session?.user && event === 'SIGNED_IN') {
          setTimeout(() => {
            trackActivity('sign_in');
          }, 100);
        }
      }
    );

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (!mounted) return;
        
        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          return;
        }
        
        console.log('Initial session:', session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const trackActivity = async (activityType: string, metadata?: any) => {
    if (!user) return;
    
    try {
      await supabase
        .from('user_activity')
        .insert({
          user_id: user.id,
          activity_type: activityType,
          metadata: metadata || {}
        });
    } catch (error) {
      console.error('Error tracking activity:', error);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true);
      const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/` : 'https://your-app.vercel.app/';
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName
          }
        }
      });

      if (error) {
        console.error('Sign up error:', error);
        toast.error(error.message);
        return { error };
      } else {
        console.log('Sign up successful:', data);
        toast.success('Check your email to confirm your account!');
        return { error: null };
      }
    } catch (error) {
      console.error('Sign up exception:', error);
      toast.error('An unexpected error occurred');
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Sign in error:', error);
        toast.error(error.message);
        return { error };
      } else {
        console.log('Sign in successful:', data);
        toast.success('Welcome back!');
        return { error: null };
      }
    } catch (error) {
      console.error('Sign in exception:', error);
      toast.error('An unexpected error occurred');
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      if (user) {
        await trackActivity('sign_out');
      }
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        toast.error('Error signing out');
      } else {
        toast.success('Signed out successfully');
      }
    } catch (error) {
      console.error('Sign out exception:', error);
      toast.error('An unexpected error occurred');
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
