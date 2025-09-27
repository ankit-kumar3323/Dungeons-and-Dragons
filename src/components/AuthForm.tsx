import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, Shield, Users, Sparkles } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface AuthFormProps {
  onAuthenticated: (user: any, session: any) => void;
}

export function AuthForm({ onAuthenticated }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form states
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpName, setSignUpName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Demo credentials check first
      if (signInEmail === 'demo@dndtabletop.com' && signInPassword === 'demo123') {
        const demoUser = {
          id: 'demo-user-123',
          email: 'demo@dndtabletop.com',
          name: 'Demo Adventurer'
        };
        
        const demoSession = {
          access_token: 'demo-token-123',
          user: demoUser,
          expires_at: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
        };

        setSuccess('Successfully signed in with demo account! Welcome to the D&D Digital Tabletop.');
        
        // Store auth data in localStorage
        localStorage.setItem('dnd_auth_session', JSON.stringify(demoSession));
        localStorage.setItem('dnd_auth_user', JSON.stringify(demoUser));
        
        // Call the callback with user data
        onAuthenticated(demoUser, demoSession);
        return;
      }

      // Try backend authentication
      try {
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-cdab1a91/auth/signin`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            email: signInEmail,
            password: signInPassword
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Sign in failed');
        }

        setSuccess('Successfully signed in! Welcome to the D&D Digital Tabletop.');
        
        // Store auth data in localStorage
        localStorage.setItem('dnd_auth_session', JSON.stringify(data.session));
        localStorage.setItem('dnd_auth_user', JSON.stringify(data.user));
        
        // Call the callback with user data
        onAuthenticated(data.user, data.session);

      } catch (backendError) {
        console.error('Backend auth failed, trying local auth:', backendError);
        
        // Try to authenticate with local users
        const existingUsers = JSON.parse(localStorage.getItem('dnd_local_users') || '[]');
        const localUser = existingUsers.find((user: any) => 
          user.email === signInEmail && user.password === signInPassword
        );
        
        if (localUser) {
          const localSession = {
            access_token: `local-token-${Date.now()}`,
            user: {
              id: localUser.id,
              email: localUser.email,
              name: localUser.name
            },
            expires_at: Date.now() + (24 * 60 * 60 * 1000)
          };

          setSuccess('Successfully signed in! Welcome to the D&D Digital Tabletop.');
          
          // Store auth data in localStorage
          localStorage.setItem('dnd_auth_session', JSON.stringify(localSession));
          localStorage.setItem('dnd_auth_user', JSON.stringify(localSession.user));
          
          // Call the callback with user data
          onAuthenticated(localSession.user, localSession);
        } else {
          throw new Error('Invalid email or password. Please check your credentials or create a new account.');
        }
      }

    } catch (err) {
      console.error('Sign in error:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (signUpPassword !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (signUpPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      // Try backend registration first
      try {
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-cdab1a91/auth/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            email: signUpEmail,
            password: signUpPassword,
            name: signUpName
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Sign up failed');
        }

        setSuccess('Account created successfully! You can now sign in.');

      } catch (backendError) {
        console.error('Backend signup failed, using local registration:', backendError);
        
        // Fallback to local registration - just save to localStorage for demo
        const existingUsers = JSON.parse(localStorage.getItem('dnd_local_users') || '[]');
        const userExists = existingUsers.some((user: any) => user.email === signUpEmail);
        
        if (userExists) {
          throw new Error('An account with this email already exists');
        }
        
        const newUser = {
          email: signUpEmail,
          password: signUpPassword, // In real app, this would be hashed
          name: signUpName,
          id: `local-${Date.now()}`,
          created_at: new Date().toISOString()
        };
        
        existingUsers.push(newUser);
        localStorage.setItem('dnd_local_users', JSON.stringify(existingUsers));
        
        setSuccess('Account created successfully! You can now sign in.');
      }
      
      // Clear signup form
      setSignUpEmail('');
      setSignUpPassword('');
      setSignUpName('');
      setConfirmPassword('');

    } catch (err) {
      console.error('Sign up error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-slate-900 to-amber-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-12 h-12 text-amber-400" />
            <Sparkles className="w-8 h-8 text-purple-400" />
            <Users className="w-12 h-12 text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent mb-2">
            D&D Digital Tabletop
          </h1>
          <p className="text-amber-200/80">
            Your ultimate Dungeons & Dragons companion
          </p>
        </div>

        {/* Auth Card */}
        <Card className="bg-slate-900/90 border border-amber-500/30 shadow-2xl backdrop-blur-md">
          <CardHeader className="text-center">
            <CardTitle className="text-amber-300">Welcome Adventurer!</CardTitle>
            <CardDescription className="text-amber-200/70">
              Sign in to continue your D&D journey or create a new account
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-slate-800">
                <TabsTrigger value="signin" className="data-[state=active]:bg-amber-600 data-[state=active]:text-slate-900">
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-amber-600 data-[state=active]:text-slate-900">
                  Create Account
                </TabsTrigger>
              </TabsList>

              {/* Error/Success Messages */}
              {error && (
                <Alert className="mt-4 border-red-500 bg-red-500/10">
                  <AlertDescription className="text-red-400">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              
              {success && (
                <Alert className="mt-4 border-green-500 bg-green-500/10">
                  <AlertDescription className="text-green-400">
                    {success}
                  </AlertDescription>
                </Alert>
              )}

              {/* Sign In Tab */}
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="text-amber-300">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="text-amber-300">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="Enter your password"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-amber-600 to-yellow-600 text-slate-900 hover:from-amber-700 hover:to-yellow-700 transition-all duration-200"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      '🎲 Enter the Tavern'
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Sign Up Tab */}
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-amber-300">Character Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="What shall we call you, adventurer?"
                      value={signUpName}
                      onChange={(e) => setSignUpName(e.target.value)}
                      className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-amber-300">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-amber-300">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a secure password (min 6 characters)"
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                      required
                      minLength={6}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-amber-300">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      '⚔️ Begin Your Adventure'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-slate-600">
              <h4 className="text-amber-300 font-medium mb-2">🎯 Quick Demo</h4>
              <p className="text-slate-300 text-sm mb-2">
                Try the demo with these credentials:
              </p>
              <div className="text-xs text-slate-400 space-y-1">
                <div><strong>Email:</strong> demo@dndtabletop.com</div>
                <div><strong>Password:</strong> demo123</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 border-slate-500 text-slate-300 hover:bg-slate-700"
                onClick={() => {
                  setSignInEmail('demo@dndtabletop.com');
                  setSignInPassword('demo123');
                }}
                disabled={isLoading}
              >
                Fill Demo Credentials
              </Button>
              
              <div className="mt-3 pt-3 border-t border-slate-600">
                <p className="text-xs text-slate-400">
                  📱 <strong>Offline Ready:</strong> Create any account to use the app offline with local storage!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-slate-400 text-sm">
          <p>🎲 Ready to embark on epic adventures? 🐉</p>
          <p className="mt-1">Create campaigns, manage characters, and roll for initiative!</p>
        </div>
      </div>
    </div>
  );
}