import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  LogOut, 
  Settings, 
  User, 
  Scroll, 
  Shield, 
  Crown, 
  MapPin,
  Plus,
  Calendar,
  Clock,
  Users
} from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface UserDashboardProps {
  user: any;
  session: any;
  onSignOut: () => void;
  onStartGame: () => void;
}

interface Campaign {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  players: string[];
  status: 'planning' | 'active' | 'completed';
}

interface Character {
  id: string;
  name: string;
  class: string;
  level: number;
  race: string;
  created_at: string;
  updated_at: string;
}

interface GameSession {
  id: string;
  name: string;
  campaign_id?: string;
  created_at: string;
  players: string[];
  active: boolean;
}

export function UserDashboard({ user, session, onSignOut, onStartGame }: UserDashboardProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const accessToken = session?.access_token;
      if (!accessToken) return;

      // Check if this is a local session (offline mode)
      if (accessToken.startsWith('local-token-') || accessToken.startsWith('demo-token-')) {
        setIsOfflineMode(true);
        // Load data from localStorage for offline mode
        const localProfile = JSON.parse(localStorage.getItem(`dnd_profile_${user.id}`) || 'null');
        const localCampaigns = JSON.parse(localStorage.getItem(`dnd_campaigns_${user.id}`) || '[]');
        const localCharacters = JSON.parse(localStorage.getItem(`dnd_characters_${user.id}`) || '[]');
        const localSessions = JSON.parse(localStorage.getItem(`dnd_sessions_${user.id}`) || '[]');

        setUserProfile(localProfile || {
          id: user.id,
          email: user.email,
          name: user.name || 'Adventurer',
          created_at: new Date().toISOString(),
          campaigns: [],
          characters: [],
          settings: {
            theme: 'dark',
            gridSize: 40,
            showGrid: true,
            autoSave: true
          }
        });
        
        setCampaigns(localCampaigns);
        setCharacters(localCharacters);
        setSessions(localSessions);
        setIsLoading(false);
        return;
      }

      // Try to load from backend
      try {
        // Load user profile
        const profileResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-cdab1a91/user/profile`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setUserProfile(profileData.profile);
        }

        // Load campaigns
        const campaignsResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-cdab1a91/campaigns`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        if (campaignsResponse.ok) {
          const campaignsData = await campaignsResponse.json();
          setCampaigns(campaignsData.campaigns || []);
        }

        // Load characters
        const charactersResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-cdab1a91/characters`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        if (charactersResponse.ok) {
          const charactersData = await charactersResponse.json();
          setCharacters(charactersData.characters || []);
        }

        // Load active sessions
        const sessionsResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-cdab1a91/sessions`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        if (sessionsResponse.ok) {
          const sessionsData = await sessionsResponse.json();
          setSessions(sessionsData.sessions || []);
        }

      } catch (backendError) {
        console.log('Backend unavailable, using local storage:', backendError);
        setIsOfflineMode(true);
        
        // Fallback to localStorage
        const localProfile = JSON.parse(localStorage.getItem(`dnd_profile_${user.id}`) || 'null');
        const localCampaigns = JSON.parse(localStorage.getItem(`dnd_campaigns_${user.id}`) || '[]');
        const localCharacters = JSON.parse(localStorage.getItem(`dnd_characters_${user.id}`) || '[]');
        const localSessions = JSON.parse(localStorage.getItem(`dnd_sessions_${user.id}`) || '[]');

        setUserProfile(localProfile || {
          id: user.id,
          email: user.email,
          name: user.name || 'Adventurer',
          created_at: new Date().toISOString(),
          campaigns: [],
          characters: [],
          settings: {
            theme: 'dark',
            gridSize: 40,
            showGrid: true,
            autoSave: true
          }
        });
        
        setCampaigns(localCampaigns);
        setCharacters(localCharacters);
        setSessions(localSessions);
      }

    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createQuickCampaign = async () => {
    try {
      const accessToken = session?.access_token;
      if (!accessToken) return;

      const newCampaign = {
        id: `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: 'New Adventure',
        description: 'A fresh D&D campaign waiting for epic stories',
        status: 'planning' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        players: [],
        owner_id: user.id
      };

      // Check if this is a local session
      if (accessToken.startsWith('local-token-') || accessToken.startsWith('demo-token-')) {
        // Save to localStorage
        const existingCampaigns = JSON.parse(localStorage.getItem(`dnd_campaigns_${user.id}`) || '[]');
        existingCampaigns.push(newCampaign);
        localStorage.setItem(`dnd_campaigns_${user.id}`, JSON.stringify(existingCampaigns));
        setCampaigns(prev => [...prev, newCampaign]);
        return;
      }

      // Try backend first
      try {
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-cdab1a91/campaigns`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            name: 'New Adventure',
            description: 'A fresh D&D campaign waiting for epic stories',
            status: 'planning'
          })
        });

        if (response.ok) {
          const data = await response.json();
          setCampaigns(prev => [...prev, data.campaign]);
        } else {
          throw new Error('Backend failed');
        }
      } catch (backendError) {
        console.log('Backend failed, saving locally:', backendError);
        
        // Fallback to localStorage
        const existingCampaigns = JSON.parse(localStorage.getItem(`dnd_campaigns_${user.id}`) || '[]');
        existingCampaigns.push(newCampaign);
        localStorage.setItem(`dnd_campaigns_${user.id}`, JSON.stringify(existingCampaigns));
        setCampaigns(prev => [...prev, newCampaign]);
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('dnd_auth_session');
    localStorage.removeItem('dnd_auth_user');
    onSignOut();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-slate-900 to-amber-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">🎲</div>
          <p className="text-amber-300 text-lg">Loading your D&D dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-slate-900 to-amber-950 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16 border-2 border-amber-500">
              <AvatarFallback className="bg-gradient-to-br from-amber-600 to-yellow-600 text-slate-900 text-xl font-bold">
                {userProfile?.name?.charAt(0) || user?.email?.charAt(0) || 'A'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-amber-300">
                Welcome back, {userProfile?.name || 'Adventurer'}!
              </h1>
              <p className="text-amber-200/80">Ready for your next D&D adventure?</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {isOfflineMode && (
              <Badge className="bg-yellow-600 text-slate-900 px-3 py-1">
                📱 Offline Mode
              </Badge>
            )}
            <Button
              onClick={onStartGame}
              className="bg-gradient-to-r from-amber-600 to-yellow-600 text-slate-900 hover:from-amber-700 hover:to-yellow-700 px-6 py-3"
            >
              🎲 Launch Game
            </Button>
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800/80 border-amber-500/30">
            <CardContent className="p-4 text-center">
              <Scroll className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{campaigns.length}</div>
              <div className="text-amber-300 text-sm">Campaigns</div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/80 border-blue-500/30">
            <CardContent className="p-4 text-center">
              <Shield className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{characters.length}</div>
              <div className="text-blue-300 text-sm">Characters</div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/80 border-green-500/30">
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{sessions.length}</div>
              <div className="text-green-300 text-sm">Active Sessions</div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/80 border-purple-500/30">
            <CardContent className="p-4 text-center">
              <MapPin className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">∞</div>
              <div className="text-purple-300 text-sm">Adventures</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="campaigns" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800 mb-6">
            <TabsTrigger value="campaigns" className="data-[state=active]:bg-amber-600 data-[state=active]:text-slate-900">
              📜 Campaigns
            </TabsTrigger>
            <TabsTrigger value="characters" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              🛡️ Characters
            </TabsTrigger>
            <TabsTrigger value="sessions" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
              👥 Sessions
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              ⚙️ Profile
            </TabsTrigger>
          </TabsList>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Your Campaigns</h2>
              <Button
                onClick={createQuickCampaign}
                className="bg-amber-600 text-slate-900 hover:bg-amber-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Campaign
              </Button>
            </div>

            {campaigns.length === 0 ? (
              <Card className="bg-slate-800/80 border-slate-700">
                <CardContent className="p-8 text-center">
                  <Scroll className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-slate-300 mb-2">No campaigns yet</h3>
                  <p className="text-slate-400 mb-4">Create your first campaign to begin your D&D journey!</p>
                  <Button onClick={createQuickCampaign} className="bg-amber-600 text-slate-900">
                    🎲 Create First Campaign
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {campaigns.map(campaign => (
                  <Card key={campaign.id} className="bg-slate-800/80 border-slate-700 hover:border-amber-500/50 transition-colors cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-amber-300">{campaign.name}</CardTitle>
                        <Badge 
                          className={
                            campaign.status === 'active' ? 'bg-green-600' :
                            campaign.status === 'planning' ? 'bg-yellow-600' : 'bg-slate-600'
                          }
                        >
                          {campaign.status}
                        </Badge>
                      </div>
                      <CardDescription className="text-slate-400">
                        {campaign.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-slate-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(campaign.created_at)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {campaign.players?.length || 0} players
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Characters Tab */}
          <TabsContent value="characters" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Your Characters</h2>
              <Button className="bg-blue-600 text-white hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                New Character
              </Button>
            </div>

            {characters.length === 0 ? (
              <Card className="bg-slate-800/80 border-slate-700">
                <CardContent className="p-8 text-center">
                  <Shield className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-slate-300 mb-2">No characters created</h3>
                  <p className="text-slate-400 mb-4">Create your first character to join adventures!</p>
                  <Button onClick={onStartGame} className="bg-blue-600 text-white">
                    🛡️ Create First Character
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {characters.map(character => (
                  <Card key={character.id} className="bg-slate-800/80 border-slate-700 hover:border-blue-500/50 transition-colors cursor-pointer">
                    <CardHeader>
                      <CardTitle className="text-blue-300">{character.name}</CardTitle>
                      <CardDescription className="text-slate-400">
                        Level {character.level} {character.race} {character.class}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-slate-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(character.created_at)}
                        </div>
                        <Badge className="bg-blue-600">
                          Level {character.level}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Game Sessions</h2>
              <Button className="bg-green-600 text-white hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Start Session
              </Button>
            </div>

            {sessions.length === 0 ? (
              <Card className="bg-slate-800/80 border-slate-700">
                <CardContent className="p-8 text-center">
                  <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-slate-300 mb-2">No active sessions</h3>
                  <p className="text-slate-400 mb-4">Start or join a multiplayer session!</p>
                  <Button onClick={onStartGame} className="bg-green-600 text-white">
                    👥 Launch Game Session
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sessions.map(session => (
                  <Card key={session.id} className="bg-slate-800/80 border-slate-700 hover:border-green-500/50 transition-colors cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-green-300">{session.name}</CardTitle>
                        <Badge className={session.active ? 'bg-green-600' : 'bg-slate-600'}>
                          {session.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-slate-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDate(session.created_at)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {session.players?.length || 0} players
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Profile Settings</h2>
            
            <Card className="bg-slate-800/80 border-slate-700">
              <CardHeader>
                <CardTitle className="text-purple-300">Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-300">Display Name</label>
                    <div className="text-white">{userProfile?.name || 'Adventurer'}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-300">Email</label>
                    <div className="text-white">{user?.email}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-300">Member Since</label>
                    <div className="text-white">
                      {userProfile?.created_at ? formatDate(userProfile.created_at) : 'Recently'}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-300">User ID</label>
                    <div className="text-slate-400 text-sm font-mono">{user?.id}</div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-slate-600">
                  <Button variant="outline" className="border-slate-600 text-slate-300">
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}