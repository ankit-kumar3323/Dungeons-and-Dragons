import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Calendar, Users, MapPin, BookOpen, Plus, Edit, Trash2, Play, Clock, Star } from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  description: string;
  setting: string;
  dmName: string;
  players: Player[];
  sessions: Session[];
  notes: Note[];
  status: 'planning' | 'active' | 'paused' | 'completed';
  createdAt: string;
  lastPlayed?: string;
}

interface Player {
  id: string;
  name: string;
  characterName: string;
  characterClass: string;
  characterLevel: number;
  isActive: boolean;
}

interface Session {
  id: string;
  sessionNumber: number;
  title: string;
  date: string;
  duration: number; // in minutes
  summary: string;
  notes: string;
  experience: number;
  treasure: string;
  nextSteps: string;
}

interface Note {
  id: string;
  title: string;
  content: string;
  category: 'plot' | 'npc' | 'location' | 'rules' | 'other';
  isSecret: boolean; // GM only
  createdAt: string;
}

export function CampaignManager() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: '1',
      name: 'The Lost Mine of Phandelver',
      description: 'A classic D&D adventure perfect for new players, featuring goblins, ancient magic, and mysterious disappearances.',
      setting: 'Forgotten Realms',
      dmName: 'Alice',
      status: 'active',
      createdAt: '2024-01-01',
      lastPlayed: '2024-01-15',
      players: [
        { id: '1', name: 'Bob', characterName: 'Thorin Ironforge', characterClass: 'Fighter', characterLevel: 3, isActive: true },
        { id: '2', name: 'Carol', characterName: 'Elara Moonwhisper', characterClass: 'Wizard', characterLevel: 3, isActive: true },
        { id: '3', name: 'Dave', characterName: 'Finn Lightfinger', characterClass: 'Rogue', characterLevel: 3, isActive: true }
      ],
      sessions: [
        {
          id: '1',
          sessionNumber: 1,
          title: 'Goblin Ambush',
          date: '2024-01-01',
          duration: 240,
          summary: 'The party was ambushed by goblins on the road to Phandalin. They defeated the goblins and rescued Sildar Hallwinter.',
          notes: 'Players worked well together. Need to introduce more NPCs next session.',
          experience: 300,
          treasure: '50 gold pieces, 2 healing potions',
          nextSteps: 'Head to Phandalin, investigate Gundren\'s disappearance'
        },
        {
          id: '2',
          sessionNumber: 2,
          title: 'Welcome to Phandalin',
          date: '2024-01-08',
          duration: 180,
          summary: 'The party arrived in Phandalin and learned about the Redbrands causing trouble in town.',
          notes: 'Great roleplay with Toblen Stonehill. Players are invested in the story.',
          experience: 400,
          treasure: 'Information about Cragmaw Castle',
          nextSteps: 'Deal with the Redbrands at Tresendar Manor'
        }
      ],
      notes: [
        {
          id: '1',
          title: 'Sildar Hallwinter',
          content: 'Lords\' Alliance agent. Grateful to the party for rescue. Can provide information about Gundren and Wave Echo Cave.',
          category: 'npc',
          isSecret: false,
          createdAt: '2024-01-01'
        },
        {
          id: '2',
          title: 'Black Spider Identity',
          content: 'The Black Spider is actually Nezznar the drow. He seeks the Forge of Spells in Wave Echo Cave.',
          category: 'plot',
          isSecret: true,
          createdAt: '2024-01-01'
        }
      ]
    }
  ]);

  const [selectedCampaign, setSelectedCampaign] = useState<string>('1');
  const [activeTab, setActiveTab] = useState('overview');
  
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    description: '',
    setting: '',
    dmName: ''
  });

  const [newSession, setNewSession] = useState({
    title: '',
    date: '',
    duration: 240,
    summary: '',
    notes: '',
    experience: 0,
    treasure: '',
    nextSteps: ''
  });

  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    category: 'other' as const,
    isSecret: false
  });

  const campaign = campaigns.find(c => c.id === selectedCampaign);

  const createCampaign = () => {
    if (!newCampaign.name) return;

    const campaign: Campaign = {
      id: Date.now().toString(),
      ...newCampaign,
      players: [],
      sessions: [],
      notes: [],
      status: 'planning',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setCampaigns(prev => [...prev, campaign]);
    setSelectedCampaign(campaign.id);
    setNewCampaign({ name: '', description: '', setting: '', dmName: '' });
  };

  const addSession = () => {
    if (!campaign || !newSession.title) return;

    const session: Session = {
      id: Date.now().toString(),
      sessionNumber: campaign.sessions.length + 1,
      ...newSession,
      date: newSession.date || new Date().toISOString().split('T')[0]
    };

    const updatedCampaign = {
      ...campaign,
      sessions: [...campaign.sessions, session],
      lastPlayed: session.date
    };

    setCampaigns(prev => prev.map(c => c.id === campaign.id ? updatedCampaign : c));
    setNewSession({
      title: '',
      date: '',
      duration: 240,
      summary: '',
      notes: '',
      experience: 0,
      treasure: '',
      nextSteps: ''
    });
  };

  const addNote = () => {
    if (!campaign || !newNote.title) return;

    const note: Note = {
      id: Date.now().toString(),
      ...newNote,
      createdAt: new Date().toISOString().split('T')[0]
    };

    const updatedCampaign = {
      ...campaign,
      notes: [...campaign.notes, note]
    };

    setCampaigns(prev => prev.map(c => c.id === campaign.id ? updatedCampaign : c));
    setNewNote({
      title: '',
      content: '',
      category: 'other',
      isSecret: false
    });
  };

  const getTotalSessions = () => campaign?.sessions.length || 0;
  const getTotalHours = () => campaign?.sessions.reduce((total, session) => total + session.duration, 0) / 60 || 0;
  const getAverageLevel = () => {
    if (!campaign?.players.length) return 0;
    return campaign.players.reduce((sum, player) => sum + player.characterLevel, 0) / campaign.players.length;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-600';
      case 'planning': return 'bg-blue-600';
      case 'paused': return 'bg-yellow-600';
      case 'completed': return 'bg-purple-600';
      default: return 'bg-gray-600';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'plot': return '📖';
      case 'npc': return '👤';
      case 'location': return '🏛️';
      case 'rules': return '⚖️';
      default: return '📝';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Campaign Selection */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Campaign Manager
              </CardTitle>
              <CardDescription className="text-slate-300">
                Organize and track your D&D campaigns
              </CardDescription>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  New Campaign
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-slate-700">
                <DialogHeader>
                  <DialogTitle className="text-white">Create New Campaign</DialogTitle>
                  <DialogDescription className="text-slate-300">
                    Create a new D&D campaign to organize your adventures
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="campaignName" className="text-white">Campaign Name</Label>
                    <Input
                      id="campaignName"
                      value={newCampaign.name}
                      onChange={(e) => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter campaign name"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="campaignDescription" className="text-white">Description</Label>
                    <Textarea
                      id="campaignDescription"
                      value={newCampaign.description}
                      onChange={(e) => setNewCampaign(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief campaign description"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="setting" className="text-white">Setting</Label>
                      <Input
                        id="setting"
                        value={newCampaign.setting}
                        onChange={(e) => setNewCampaign(prev => ({ ...prev, setting: e.target.value }))}
                        placeholder="e.g., Forgotten Realms"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dmName" className="text-white">DM Name</Label>
                      <Input
                        id="dmName"
                        value={newCampaign.dmName}
                        onChange={(e) => setNewCampaign(prev => ({ ...prev, dmName: e.target.value }))}
                        placeholder="Dungeon Master"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                  </div>
                  <Button onClick={createCampaign} className="w-full" disabled={!newCampaign.name}>
                    Create Campaign
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {campaigns.map(c => (
              <Button
                key={c.id}
                variant={selectedCampaign === c.id ? "default" : "outline"}
                onClick={() => setSelectedCampaign(c.id)}
                className="flex items-center gap-2"
              >
                <Badge className={`${getStatusColor(c.status)} text-white`} />
                {c.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {campaign && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="players">Players</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="planning">Planning</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-white">{getTotalSessions()}</div>
                  <div className="text-slate-300">Sessions</div>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-white">{getTotalHours().toFixed(1)}h</div>
                  <div className="text-slate-300">Total Hours</div>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-white">{campaign.players.length}</div>
                  <div className="text-slate-300">Players</div>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-white">{getAverageLevel().toFixed(1)}</div>
                  <div className="text-slate-300">Avg Level</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">{campaign.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className={`${getStatusColor(campaign.status)} text-white`}>
                      {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                    </Badge>
                    <Badge variant="outline">{campaign.setting}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300 mb-4">{campaign.description}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">DM:</span>
                      <span className="text-white ml-2">{campaign.dmName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Created:</span>
                      <span className="text-white ml-2">{campaign.createdAt}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Last Played:</span>
                      <span className="text-white ml-2">{campaign.lastPlayed || 'Never'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Recent Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  {campaign.sessions.length > 0 ? (
                    <div className="space-y-3">
                      {campaign.sessions.slice(-3).reverse().map(session => (
                        <div key={session.id} className="p-3 bg-slate-700 rounded">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-white font-medium">
                              Session {session.sessionNumber}: {session.title}
                            </span>
                            <span className="text-slate-400 text-sm">{session.date}</span>
                          </div>
                          <p className="text-slate-300 text-sm">{session.summary}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-slate-400 text-center py-4">
                      No sessions yet
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Sessions */}
          <TabsContent value="sessions" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Session Log</CardTitle>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Add Session
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-white">Add New Session</DialogTitle>
                        <DialogDescription className="text-slate-300">
                          Record details from your latest D&D session
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="sessionTitle" className="text-white">Session Title</Label>
                            <Input
                              id="sessionTitle"
                              value={newSession.title}
                              onChange={(e) => setNewSession(prev => ({ ...prev, title: e.target.value }))}
                              placeholder="Session title"
                              className="bg-slate-700 border-slate-600 text-white"
                            />
                          </div>
                          <div>
                            <Label htmlFor="sessionDate" className="text-white">Date</Label>
                            <Input
                              id="sessionDate"
                              type="date"
                              value={newSession.date}
                              onChange={(e) => setNewSession(prev => ({ ...prev, date: e.target.value }))}
                              className="bg-slate-700 border-slate-600 text-white"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="sessionSummary" className="text-white">Session Summary</Label>
                          <Textarea
                            id="sessionSummary"
                            value={newSession.summary}
                            onChange={(e) => setNewSession(prev => ({ ...prev, summary: e.target.value }))}
                            placeholder="What happened this session?"
                            className="bg-slate-700 border-slate-600 text-white"
                            rows={3}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="experience" className="text-white">Experience Awarded</Label>
                            <Input
                              id="experience"
                              type="number"
                              value={newSession.experience}
                              onChange={(e) => setNewSession(prev => ({ ...prev, experience: parseInt(e.target.value) || 0 }))}
                              className="bg-slate-700 border-slate-600 text-white"
                            />
                          </div>
                          <div>
                            <Label htmlFor="duration" className="text-white">Duration (minutes)</Label>
                            <Input
                              id="duration"
                              type="number"
                              value={newSession.duration}
                              onChange={(e) => setNewSession(prev => ({ ...prev, duration: parseInt(e.target.value) || 240 }))}
                              className="bg-slate-700 border-slate-600 text-white"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="treasure" className="text-white">Treasure Found</Label>
                          <Input
                            id="treasure"
                            value={newSession.treasure}
                            onChange={(e) => setNewSession(prev => ({ ...prev, treasure: e.target.value }))}
                            placeholder="Gold, items, etc."
                            className="bg-slate-700 border-slate-600 text-white"
                          />
                        </div>

                        <div>
                          <Label htmlFor="nextSteps" className="text-white">Next Steps</Label>
                          <Textarea
                            id="nextSteps"
                            value={newSession.nextSteps}
                            onChange={(e) => setNewSession(prev => ({ ...prev, nextSteps: e.target.value }))}
                            placeholder="What's planned for next session?"
                            className="bg-slate-700 border-slate-600 text-white"
                            rows={2}
                          />
                        </div>

                        <Button onClick={addSession} className="w-full" disabled={!newSession.title}>
                          Add Session
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {campaign.sessions.length > 0 ? (
                  <div className="space-y-4">
                    {campaign.sessions.map(session => (
                      <Card key={session.id} className="bg-slate-700 border-slate-600">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-white">
                              Session {session.sessionNumber}: {session.title}
                            </CardTitle>
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                              <Calendar className="w-4 h-4" />
                              {session.date}
                              <Clock className="w-4 h-4 ml-2" />
                              {Math.floor(session.duration / 60)}h {session.duration % 60}m
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <span className="text-slate-400 font-medium">Summary:</span>
                            <p className="text-slate-300 mt-1">{session.summary}</p>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <span className="text-slate-400 font-medium">Experience:</span>
                              <span className="text-white ml-2">{session.experience} XP</span>
                            </div>
                            <div>
                              <span className="text-slate-400 font-medium">Treasure:</span>
                              <span className="text-white ml-2">{session.treasure}</span>
                            </div>
                          </div>

                          {session.nextSteps && (
                            <div>
                              <span className="text-slate-400 font-medium">Next Steps:</span>
                              <p className="text-slate-300 mt-1">{session.nextSteps}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-slate-400 text-center py-8">
                    No sessions recorded yet
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Players */}
          <TabsContent value="players" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Campaign Players</CardTitle>
              </CardHeader>
              <CardContent>
                {campaign.players.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {campaign.players.map(player => (
                      <Card key={player.id} className="bg-slate-700 border-slate-600">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-medium">{player.name}</span>
                            <Badge variant={player.isActive ? "default" : "secondary"}>
                              {player.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <div className="text-slate-300">
                            <div>{player.characterName}</div>
                            <div className="text-sm">
                              Level {player.characterLevel} {player.characterClass}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-slate-400 text-center py-8">
                    No players added yet
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notes */}
          <TabsContent value="notes" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Campaign Notes</CardTitle>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Add Note
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-white">Add New Note</DialogTitle>
                        <DialogDescription className="text-slate-300">
                          Add a note to track important campaign information
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="noteTitle" className="text-white">Title</Label>
                          <Input
                            id="noteTitle"
                            value={newNote.title}
                            onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Note title"
                            className="bg-slate-700 border-slate-600 text-white"
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-white">Category</Label>
                            <Select value={newNote.category} onValueChange={(value: any) => setNewNote(prev => ({ ...prev, category: value }))}>
                              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="plot">Plot</SelectItem>
                                <SelectItem value="npc">NPC</SelectItem>
                                <SelectItem value="location">Location</SelectItem>
                                <SelectItem value="rules">Rules</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-6">
                            <input
                              type="checkbox"
                              id="isSecret"
                              checked={newNote.isSecret}
                              onChange={(e) => setNewNote(prev => ({ ...prev, isSecret: e.target.checked }))}
                              className="rounded"
                            />
                            <Label htmlFor="isSecret" className="text-white">GM Only</Label>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="noteContent" className="text-white">Content</Label>
                          <Textarea
                            id="noteContent"
                            value={newNote.content}
                            onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                            placeholder="Note content"
                            className="bg-slate-700 border-slate-600 text-white"
                            rows={4}
                          />
                        </div>

                        <Button onClick={addNote} className="w-full" disabled={!newNote.title}>
                          Add Note
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {campaign.notes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {campaign.notes.map(note => (
                      <Card key={note.id} className="bg-slate-700 border-slate-600">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-white flex items-center gap-2">
                              <span>{getCategoryIcon(note.category)}</span>
                              {note.title}
                            </CardTitle>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {note.category}
                              </Badge>
                              {note.isSecret && (
                                <Badge variant="destructive" className="text-xs">
                                  GM Only
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-slate-300 text-sm leading-relaxed">{note.content}</p>
                          <div className="text-slate-500 text-xs mt-2">
                            Created: {note.createdAt}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-slate-400 text-center py-8">
                    No notes yet
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Planning */}
          <TabsContent value="planning" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Next Session Planning</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-slate-700 rounded">
                      <h4 className="text-white font-medium mb-2">Preparation Checklist</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <input type="checkbox" className="rounded" />
                          <span className="text-slate-300">Review last session notes</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" className="rounded" />
                          <span className="text-slate-300">Prepare encounter maps</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" className="rounded" />
                          <span className="text-slate-300">Review NPC motivations</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" className="rounded" />
                          <span className="text-slate-300">Plan combat encounters</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" className="rounded" />
                          <span className="text-slate-300">Prepare handouts</span>
                        </div>
                      </div>
                    </div>
                    
                    <Button variant="outline" className="w-full">
                      <Play className="w-4 h-4 mr-2" />
                      Start Session
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Campaign Tools</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    Manage Players
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <MapPin className="w-4 h-4 mr-2" />
                    Battle Maps
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Star className="w-4 h-4 mr-2" />
                    NPC Generator
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Adventure Hooks
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}