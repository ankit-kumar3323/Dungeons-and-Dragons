import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Users, MessageCircle, Dice1, Eye, Send, Crown, UserPlus, Settings, Copy, LogOut, Play, Square } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Player {
  id: string;
  name: string;
  character?: string;
  isConnected: boolean;
  isGameMaster: boolean;
}

interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  timestamp: Date;
  type: 'chat' | 'roll' | 'action' | 'system';
}

interface MultiplayerSessionProps {
  isGameMaster: boolean;
}

export function MultiplayerSession({ isGameMaster }: MultiplayerSessionProps) {
  // Session state
  const [currentSession, setCurrentSession] = useState<any>(null);
  const [sessionCode, setSessionCode] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  
  // UI state
  const [newMessage, setNewMessage] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [isJoiningSession, setIsJoiningSession] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [newSessionName, setNewSessionName] = useState('');
  const [availableSessions, setAvailableSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  
  // Auto-refresh
  const pollInterval = useRef<NodeJS.Timeout | null>(null);
  const chatPollInterval = useRef<NodeJS.Timeout | null>(null);

  // Initialize component
  useEffect(() => {
    const userData = localStorage.getItem('dnd_auth_user');
    if (userData) {
      const user = JSON.parse(userData);
      setPlayerName(user.name || user.email?.split('@')[0] || 'Player');
    }
    loadAvailableSessions();
  }, []);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current);
      if (chatPollInterval.current) clearInterval(chatPollInterval.current);
    };
  }, []);

  const makeRequest = async (url: string, options: any = {}) => {
    const session = localStorage.getItem('dnd_auth_session');
    const token = session ? JSON.parse(session).access_token : publicAnonKey;
    
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-cdab1a91${url}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || 'Request failed');
      }

      return response.json();
    } catch (networkError) {
      // Silently handle expected network errors when backend is not available
      console.log('Backend not available, using offline mode');
      
      // For session operations, provide local fallback
      if (url === '/sessions') {
        return { sessions: [] };
      }
      
      throw new Error('Backend not available. Please try again later or use local mode.');
    }
  };

  const loadAvailableSessions = async () => {
    try {
      const data = await makeRequest('/sessions');
      setAvailableSessions(data.sessions || []);
      setIsOfflineMode(false);
    } catch (error) {
      // Quietly switch to offline mode when backend is unavailable
      setIsOfflineMode(true);
      // Load local sessions from localStorage
      const localSessions = JSON.parse(localStorage.getItem('dnd_local_sessions') || '[]');
      setAvailableSessions(localSessions);
    }
  };

  const createSession = async () => {
    if (!newSessionName.trim()) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      let sessionData;
      
      if (isOfflineMode) {
        // Create local session
        const sessionId = `local_session_${Date.now()}`;
        sessionData = {
          session: {
            id: sessionId,
            name: newSessionName,
            description: `D&D session hosted by ${playerName}`,
            maxPlayers: 6,
            gm_id: 'local-user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            players: [{
              id: 'local-user',
              name: playerName,
              character: '',
              isConnected: true,
              isGameMaster: true,
              joinedAt: new Date().toISOString()
            }],
            active: true
          }
        };
        
        // Save to localStorage
        const localSessions = JSON.parse(localStorage.getItem('dnd_local_sessions') || '[]');
        localSessions.push(sessionData.session);
        localStorage.setItem('dnd_local_sessions', JSON.stringify(localSessions));
        localStorage.setItem(`dnd_session_${sessionId}`, JSON.stringify(sessionData.session));
        localStorage.setItem(`dnd_session_${sessionId}_chat`, JSON.stringify([]));
      } else {
        sessionData = await makeRequest('/sessions', {
          method: 'POST',
          body: JSON.stringify({
            name: newSessionName,
            description: `D&D session hosted by ${playerName}`,
            maxPlayers: 6
          })
        });
      }
      
      setCurrentSession(sessionData.session);
      setSessionCode(sessionData.session.id);
      setIsConnected(true);
      setIsCreatingSession(false);
      setNewSessionName('');
      
      // Start polling for updates (only if online)
      if (!isOfflineMode) {
        startPolling();
      }
      
      // Add welcome message
      const welcomeMessage = {
        id: `msg_${Date.now()}`,
        playerId: 'system',
        playerName: 'System',
        message: `🎉 Welcome to "${sessionData.session.name}"! Session created successfully. ${isOfflineMode ? 'Running in offline mode.' : `Share the session code ${sessionData.session.id} with your friends to invite them.`}`,
        timestamp: new Date().toISOString(),
        type: 'system'
      };
      
      setChatMessages([welcomeMessage]);
      
      if (isOfflineMode) {
        localStorage.setItem(`dnd_session_${sessionData.session.id}_chat`, JSON.stringify([welcomeMessage]));
      }
      
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const joinSession = async (sessionId: string) => {
    setIsLoading(true);
    setError('');
    
    try {
      let sessionData;
      
      if (isOfflineMode || sessionId.startsWith('local_session_')) {
        // Join local session
        const localSessionData = localStorage.getItem(`dnd_session_${sessionId}`);
        if (!localSessionData) {
          throw new Error('Session not found');
        }
        
        const session = JSON.parse(localSessionData);
        
        // Add player to session
        const playerId = `local_player_${Date.now()}`;
        const newPlayer = {
          id: playerId,
          name: playerName,
          character: '',
          isConnected: true,
          isGameMaster: false,
          joinedAt: new Date().toISOString()
        };
        
        session.players.push(newPlayer);
        session.updated_at = new Date().toISOString();
        
        // Save updated session
        localStorage.setItem(`dnd_session_${sessionId}`, JSON.stringify(session));
        
        sessionData = { session };
      } else {
        sessionData = await makeRequest(`/sessions/${sessionId}/join`, {
          method: 'POST',
          body: JSON.stringify({ playerName })
        });
      }
      
      setCurrentSession(sessionData.session);
      setSessionCode(sessionId);
      setIsConnected(true);
      setIsJoiningSession(false);
      setJoinCode('');
      
      // Load session data
      if (isOfflineMode || sessionId.startsWith('local_session_')) {
        const chatMessages = JSON.parse(localStorage.getItem(`dnd_session_${sessionId}_chat`) || '[]');
        setChatMessages(chatMessages);
        setPlayers(sessionData.session.players || []);
      } else {
        await loadSessionData(sessionId);
        startPolling();
      }
      
      // Send join notification
      const joinMessage = {
        id: `msg_${Date.now()}`,
        playerId: 'system',
        playerName: 'System',
        message: `👋 ${playerName} has joined the session!`,
        timestamp: new Date().toISOString(),
        type: 'system'
      };
      
      if (isOfflineMode || sessionId.startsWith('local_session_')) {
        const existingMessages = JSON.parse(localStorage.getItem(`dnd_session_${sessionId}_chat`) || '[]');
        const updatedMessages = [...existingMessages, joinMessage];
        setChatMessages(updatedMessages);
        localStorage.setItem(`dnd_session_${sessionId}_chat`, JSON.stringify(updatedMessages));
      }
      
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const leaveSession = async () => {
    if (!currentSession) return;
    
    try {
      await makeRequest(`/sessions/${currentSession.id}/leave`, {
        method: 'POST'
      });
      
      // Stop polling
      if (pollInterval.current) clearInterval(pollInterval.current);
      if (chatPollInterval.current) clearInterval(chatPollInterval.current);
      
      // Reset state
      setCurrentSession(null);
      setSessionCode('');
      setIsConnected(false);
      setPlayers([]);
      setChatMessages([]);
      
      // Reload available sessions
      loadAvailableSessions();
      
    } catch (error) {
      console.error('Error leaving session:', error);
    }
  };

  const loadSessionData = async (sessionId: string) => {
    try {
      // Load session details
      const sessionData = await makeRequest(`/sessions/${sessionId}`);
      setCurrentSession(sessionData.session);
      setPlayers(sessionData.session.players || []);
      
      // Load chat messages
      const chatData = await makeRequest(`/sessions/${sessionId}/chat`);
      setChatMessages(chatData.messages || []);
      
    } catch (error) {
      console.error('Error loading session data:', error);
    }
  };

  const startPolling = () => {
    // Poll for session updates every 5 seconds
    pollInterval.current = setInterval(async () => {
      if (currentSession) {
        try {
          const data = await makeRequest(`/sessions/${currentSession.id}`);
          setPlayers(data.session.players || []);
        } catch (error) {
          console.error('Error polling session:', error);
        }
      }
    }, 5000);

    // Poll for chat messages every 2 seconds
    chatPollInterval.current = setInterval(async () => {
      if (currentSession) {
        try {
          const data = await makeRequest(`/sessions/${currentSession.id}/chat`);
          setChatMessages(data.messages || []);
        } catch (error) {
          console.error('Error polling chat:', error);
        }
      }
    }, 2000);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentSession) return;
    
    try {
      const message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        playerId: 'current-user',
        playerName: playerName,
        message: newMessage,
        timestamp: new Date().toISOString(),
        type: 'chat'
      };
      
      if (isOfflineMode || currentSession.id.startsWith('local_session_')) {
        // Local mode - save to localStorage
        const existingMessages = JSON.parse(localStorage.getItem(`dnd_session_${currentSession.id}_chat`) || '[]');
        const updatedMessages = [...existingMessages, message];
        setChatMessages(updatedMessages);
        localStorage.setItem(`dnd_session_${currentSession.id}_chat`, JSON.stringify(updatedMessages));
      } else {
        // Online mode - send to backend
        await makeRequest(`/sessions/${currentSession.id}/chat`, {
          method: 'POST',
          body: JSON.stringify({
            message: newMessage,
            type: 'chat'
          })
        });
        
        // Immediately refresh chat to show the new message
        const data = await makeRequest(`/sessions/${currentSession.id}/chat`);
        setChatMessages(data.messages || []);
      }
      
      setNewMessage('');
      
      // Auto-scroll to bottom
      setTimeout(() => {
        if (chatScrollRef.current) {
          chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
      }, 100);
      
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const sendSystemMessage = async (message: string) => {
    if (!currentSession) return;
    
    try {
      await makeRequest(`/sessions/${currentSession.id}/chat`, {
        method: 'POST',
        body: JSON.stringify({
          message,
          type: 'system'
        })
      });
    } catch (error) {
      console.error('Error sending system message:', error);
    }
  };

  const rollDice = async () => {
    const roll = Math.floor(Math.random() * 20) + 1;
    
    try {
      const message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        playerId: 'current-user',
        playerName: playerName,
        message: `Rolled 1d20: ${roll}`,
        timestamp: new Date().toISOString(),
        type: 'roll'
      };
      
      if (isOfflineMode || currentSession.id.startsWith('local_session_')) {
        // Local mode - save to localStorage
        const existingMessages = JSON.parse(localStorage.getItem(`dnd_session_${currentSession.id}_chat`) || '[]');
        const updatedMessages = [...existingMessages, message];
        setChatMessages(updatedMessages);
        localStorage.setItem(`dnd_session_${currentSession.id}_chat`, JSON.stringify(updatedMessages));
      } else {
        // Online mode - send to backend
        await makeRequest(`/sessions/${currentSession.id}/chat`, {
          method: 'POST',
          body: JSON.stringify({
            message: `Rolled 1d20: ${roll}`,
            type: 'roll'
          })
        });
        
        // Immediately refresh chat
        const data = await makeRequest(`/sessions/${currentSession.id}/chat`);
        setChatMessages(data.messages || []);
      }
      
      // Auto-scroll to bottom
      setTimeout(() => {
        if (chatScrollRef.current) {
          chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
      }, 100);
      
    } catch (error) {
      console.error('Error rolling dice:', error);
    }
  };

  const copySessionCode = () => {
    navigator.clipboard.writeText(sessionCode);
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'roll': return '🎲';
      case 'action': return '⚔️';
      case 'system': return '🤖';
      default: return '💬';
    }
  };

  const getMessageColor = (type: string) => {
    switch (type) {
      case 'roll': return 'text-blue-400';
      case 'action': return 'text-yellow-400';
      case 'system': return 'text-green-400';
      default: return 'text-white';
    }
  };

  // Show session creation/joining UI if not connected
  if (!isConnected || !currentSession) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="bg-gradient-to-r from-slate-800 via-purple-900 to-slate-800 border border-amber-500/30">
          <CardHeader>
            <CardTitle className="text-amber-300 flex items-center gap-2">
              <Users className="w-6 h-6" />
              🎲 Multiplayer D&D Session
            </CardTitle>
            <CardDescription className="text-amber-200/80">
              Create a new session or join an existing one to play D&D with friends
            </CardDescription>
          </CardHeader>
        </Card>

        {error && (
          <Card className="bg-red-900/20 border-red-500/30">
            <CardContent className="p-4">
              <p className="text-red-300">❌ {error}</p>
            </CardContent>
          </Card>
        )}

        {isOfflineMode && (
          <Card className="bg-yellow-900/20 border-yellow-500/30">
            <CardContent className="p-4">
              <p className="text-yellow-300">⚠️ Running in offline mode. Multiplayer features are limited to local sessions only.</p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Create Session */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" />
                Host New Session
              </CardTitle>
              <CardDescription className="text-slate-300">
                Start a new D&D session as Game Master
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-white">Your Name</Label>
                <Input
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Game Master"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label className="text-white">Session Name</Label>
                <Input
                  value={newSessionName}
                  onChange={(e) => setNewSessionName(e.target.value)}
                  placeholder="Epic Adventure Campaign"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <Button
                onClick={createSession}
                disabled={isLoading || !newSessionName.trim() || !playerName.trim()}
                className="w-full bg-amber-600 hover:bg-amber-700 text-slate-900"
              >
                {isLoading ? '⏳ Creating...' : '🎭 Create Session'}
              </Button>
            </CardContent>
          </Card>

          {/* Join Session */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-500" />
                Join Session
              </CardTitle>
              <CardDescription className="text-slate-300">
                Join an existing D&D session
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-white">Your Name</Label>
                <Input
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Player Name"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label className="text-white">Session Code</Label>
                <Input
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  placeholder="Enter session code"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <Button
                onClick={() => joinSession(joinCode)}
                disabled={isLoading || !joinCode.trim() || !playerName.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? '⏳ Joining...' : '🚪 Join Session'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Available Sessions */}
        {availableSessions.length > 0 && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">🌟 Available Sessions</CardTitle>
              <CardDescription className="text-slate-300">
                Click to join any public session
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {availableSessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-4 bg-slate-700 rounded-lg border border-slate-600 hover:border-amber-500/50 transition-colors cursor-pointer"
                    onClick={() => joinSession(session.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-medium">{session.name}</h3>
                        <p className="text-slate-400 text-sm">{session.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-600 text-white">
                          {session.players?.length || 0} players
                        </Badge>
                        <Button size="sm" variant="outline">
                          Join
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Session Status */}
      <Card className="bg-gradient-to-r from-slate-800 via-purple-900 to-slate-800 border border-amber-500/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-amber-300 flex items-center gap-2">
                <Users className="w-5 h-5" />
                🎲 {currentSession?.name || 'D&D Session'}
              </CardTitle>
              <CardDescription className="text-amber-200/80 flex items-center gap-2">
                Session Code: 
                <span className="font-mono font-bold bg-slate-700 px-2 py-1 rounded">{sessionCode}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={copySessionCode}
                  className="text-amber-300 hover:text-amber-200"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-600 text-white">
                {isConnected ? '✅ Connected' : '❌ Disconnected'}
              </Badge>
              {isGameMaster && <Badge className="bg-amber-600 text-slate-900"><Crown className="w-3 h-3 mr-1" />Game Master</Badge>}
              <Button
                variant="outline"
                size="sm"
                onClick={leaveSession}
                className="border-red-400 text-red-300 hover:bg-red-500/10"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div>
              <Label htmlFor="playerName" className="text-white">Your Name</Label>
              <Input
                id="playerName"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Enter your name"
                disabled
              />
            </div>
            <div className="flex gap-2 mt-6">
              <Button 
                variant="outline" 
                onClick={copySessionCode}
                className="flex items-center gap-2 border-amber-400 text-amber-300"
              >
                <UserPlus className="w-4 h-4" />
                Share Session Code
              </Button>
              {isGameMaster && (
                <Button variant="outline" className="flex items-center gap-2 border-purple-400 text-purple-300">
                  <Settings className="w-4 h-4" />
                  Session Settings
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Players List */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Players ({players.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {players.map(player => (
                <div
                  key={player.id}
                  className={`p-3 rounded flex items-center justify-between ${
                    player.isConnected ? 'bg-slate-700' : 'bg-slate-750 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      player.isConnected ? 'bg-green-500' : 'bg-gray-500'
                    }`} />
                    <div>
                      <div className="text-white flex items-center gap-2">
                        {player.name}
                        {player.isGameMaster && <Crown className="w-4 h-4 text-yellow-500" />}
                      </div>
                      {player.character && (
                        <div className="text-slate-300 text-sm">{player.character}</div>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {player.isConnected ? 'Online' : 'Offline'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chat & Actions */}
        <div className="lg:col-span-2">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Session Chat
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="chat" className="h-96">
                <TabsList className="bg-slate-700">
                  <TabsTrigger value="chat">Chat</TabsTrigger>
                  <TabsTrigger value="actions">Quick Actions</TabsTrigger>
                  {isGameMaster && <TabsTrigger value="gm">GM Tools</TabsTrigger>}
                </TabsList>

                <TabsContent value="chat" className="h-full">
                  <div className="flex flex-col h-full">
                    <ScrollArea className="flex-1 mb-4 p-3 bg-slate-700 rounded">
                      <div className="space-y-3">
                        {chatMessages.map(message => (
                          <div key={message.id} className="flex items-start gap-3">
                            <span className="text-lg mt-1">
                              {getMessageIcon(message.type)}
                            </span>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-slate-300 text-sm font-medium">
                                  {message.playerName}
                                </span>
                                <span className="text-slate-500 text-xs">
                                  {message.timestamp.toLocaleTimeString()}
                                </span>
                              </div>
                              <div className={`${getMessageColor(message.type)}`}>
                                {message.message}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>

                    <div className="flex gap-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="bg-slate-700 border-slate-600 text-white"
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      />
                      <Button onClick={sendMessage} size="sm">
                        <Send className="w-4 h-4" />
                      </Button>
                      <Button onClick={rollDice} variant="outline" size="sm">
                        <Dice1 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="actions" className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="h-16 flex flex-col items-center gap-1">
                      <Dice1 className="w-5 h-5" />
                      <span className="text-sm">Quick Roll</span>
                    </Button>
                    <Button variant="outline" className="h-16 flex flex-col items-center gap-1">
                      <Eye className="w-5 h-5" />
                      <span className="text-sm">Perception</span>
                    </Button>
                    <Button variant="outline" className="h-16 flex flex-col items-center gap-1">
                      <MessageCircle className="w-5 h-5" />
                      <span className="text-sm">Whisper GM</span>
                    </Button>
                    <Button variant="outline" className="h-16 flex flex-col items-center gap-1">
                      <Users className="w-5 h-5" />
                      <span className="text-sm">Group Check</span>
                    </Button>
                  </div>

                  <div className="p-3 bg-slate-700 rounded">
                    <Label className="text-white">Quick Actions</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {['Initiative', 'Attack', 'Save', 'Skill Check', 'Death Save'].map(action => (
                        <Button key={action} size="sm" variant="outline">
                          {action}
                        </Button>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {isGameMaster && (
                  <TabsContent value="gm" className="space-y-4">
                    <div className="grid grid-cols-1 gap-3">
                      <Button variant="outline" className="justify-start">
                        🎭 Set Scene Description
                      </Button>
                      <Button variant="outline" className="justify-start">
                        🗺️ Share Map/Image
                      </Button>
                      <Button variant="outline" className="justify-start">
                        🎵 Control Music/Ambience
                      </Button>
                      <Button variant="outline" className="justify-start">
                        📋 Call for Group Roll
                      </Button>
                      <Button variant="outline" className="justify-start">
                        ⏸️ Pause Session
                      </Button>
                    </div>

                    <div className="p-3 bg-slate-700 rounded">
                      <Label className="text-white">GM Notes</Label>
                      <Textarea
                        placeholder="Private GM notes..."
                        className="mt-2 bg-slate-600 border-slate-500 text-white"
                        rows={3}
                      />
                    </div>
                  </TabsContent>
                )}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>


    </div>
  );
}