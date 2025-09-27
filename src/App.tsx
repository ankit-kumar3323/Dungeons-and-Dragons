import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Button } from './components/ui/button';
import { AuthForm } from './components/AuthForm';
import { UserDashboard } from './components/UserDashboard';
import { CharacterSheet } from './components/CharacterSheet';
import { CharacterCreator } from './components/CharacterCreator';
import { CharacterAdvancement } from './components/CharacterAdvancement';
import { DiceRoller } from './components/DiceRoller';
import { CombatTracker } from './components/CombatTracker';
import { AdvancedBattleMap } from './components/AdvancedBattleMap';
import { MonsterDatabase } from './components/MonsterDatabase';
import { RulesSection } from './components/RulesSection';
import { MultiplayerSession } from './components/MultiplayerSession';
import { Inventory } from './components/Inventory';
import { SpellManager } from './components/SpellManager';
import { GameMasterPanel } from './components/GameMasterPanel';
import { CampaignManager } from './components/CampaignManager';
import { Dice1, Users, Sword, Book, Backpack, Sparkles, Shield, MapPin, TrendingUp, Crown, Scroll } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [currentCharacter, setCurrentCharacter] = useState(null);
  const [isGameMaster, setIsGameMaster] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [showDashboard, setShowDashboard] = useState(false);

  useEffect(() => {
    // Check for existing session on app load
    const savedSession = localStorage.getItem('dnd_auth_session');
    const savedUser = localStorage.getItem('dnd_auth_user');
    
    if (savedSession && savedUser) {
      try {
        const sessionData = JSON.parse(savedSession);
        const userData = JSON.parse(savedUser);
        setSession(sessionData);
        setUser(userData);
        setShowDashboard(true);
      } catch (error) {
        console.error('Error parsing saved auth data:', error);
        localStorage.removeItem('dnd_auth_session');
        localStorage.removeItem('dnd_auth_user');
      }
    }
  }, []);

  const handleAuthenticated = (userData: any, sessionData: any) => {
    setUser(userData);
    setSession(sessionData);
    setShowDashboard(true);
  };

  const handleSignOut = () => {
    setUser(null);
    setSession(null);
    setShowDashboard(false);
  };

  const handleStartGame = () => {
    setShowDashboard(false);
  };

  // Show auth form if not authenticated
  if (!user || !session) {
    return <AuthForm onAuthenticated={handleAuthenticated} />;
  }

  // Show dashboard if authenticated and dashboard is active
  if (showDashboard) {
    return (
      <UserDashboard
        user={user}
        session={session}
        onSignOut={handleSignOut}
        onStartGame={handleStartGame}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-slate-900 to-amber-950">
      <div className="container mx-auto p-4">
        {/* Decorative header with D&D styling */}
        <div className="mb-8 text-center relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/10 to-transparent h-px top-1/2"></div>
          <div className="relative bg-gradient-to-br from-purple-950 via-slate-900 to-amber-950 px-8 py-6 rounded-lg border border-amber-500/30 shadow-2xl">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent mb-3 glow-text">
              ⚔️ D&D Digital Tabletop ⚔️
            </h1>
            <p className="text-amber-200/80 text-lg font-medium">Complete Dungeons & Dragons Experience</p>
            <div className="flex justify-center gap-3 mt-6">
              <Button 
                variant={isGameMaster ? "default" : "outline"}
                onClick={() => setIsGameMaster(!isGameMaster)}
                className={`flex items-center gap-2 px-6 py-3 text-base transition-all duration-300 transform hover:scale-105 ${
                  isGameMaster 
                    ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-slate-900 border-amber-400 shadow-lg shadow-amber-500/25' 
                    : 'border-amber-400 text-amber-300 hover:bg-amber-500/10'
                }`}
              >
                <Shield className="w-5 h-5" />
                {isGameMaster ? '👑 Game Master Mode' : '🗡️ Player Mode'}
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Navigation with D&D styling */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 lg:grid-cols-12 bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 border border-amber-500/30 p-1 rounded-lg backdrop-blur-sm">
            <TabsTrigger value="campaigns" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-yellow-600 data-[state=active]:text-slate-900 text-amber-300 hover:text-amber-200 transition-all duration-200">
              <Scroll className="w-4 h-4" />
              <span className="hidden sm:inline">📜 Campaigns</span>
            </TabsTrigger>
            <TabsTrigger value="session" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-yellow-600 data-[state=active]:text-slate-900 text-amber-300 hover:text-amber-200 transition-all duration-200">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">👥 Session</span>
            </TabsTrigger>
            <TabsTrigger value="character" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-yellow-600 data-[state=active]:text-slate-900 text-amber-300 hover:text-amber-200 transition-all duration-200">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">🛡️ Character</span>
            </TabsTrigger>
            <TabsTrigger value="advancement" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-yellow-600 data-[state=active]:text-slate-900 text-amber-300 hover:text-amber-200 transition-all duration-200">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">⭐ Level Up</span>
            </TabsTrigger>
            <TabsTrigger value="dice" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-yellow-600 data-[state=active]:text-slate-900 text-amber-300 hover:text-amber-200 transition-all duration-200">
              <Dice1 className="w-4 h-4" />
              <span className="hidden sm:inline">🎲 Dice</span>
            </TabsTrigger>
            <TabsTrigger value="combat" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-yellow-600 data-[state=active]:text-slate-900 text-amber-300 hover:text-amber-200 transition-all duration-200">
              <Sword className="w-4 h-4" />
              <span className="hidden sm:inline">⚔️ Combat</span>
            </TabsTrigger>
            <TabsTrigger value="battlemap" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-yellow-600 data-[state=active]:text-slate-900 text-amber-300 hover:text-amber-200 transition-all duration-200">
              <MapPin className="w-4 h-4" />
              <span className="hidden sm:inline">🗺️ Maps</span>
            </TabsTrigger>
            <TabsTrigger value="monsters" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-yellow-600 data-[state=active]:text-slate-900 text-amber-300 hover:text-amber-200 transition-all duration-200">
              <Crown className="w-4 h-4" />
              <span className="hidden sm:inline">🐉 Monsters</span>
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-yellow-600 data-[state=active]:text-slate-900 text-amber-300 hover:text-amber-200 transition-all duration-200">
              <Backpack className="w-4 h-4" />
              <span className="hidden sm:inline">🎒 Inventory</span>
            </TabsTrigger>
            <TabsTrigger value="spells" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-yellow-600 data-[state=active]:text-slate-900 text-amber-300 hover:text-amber-200 transition-all duration-200">
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">✨ Spells</span>
            </TabsTrigger>
            <TabsTrigger value="rules" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-yellow-600 data-[state=active]:text-slate-900 text-amber-300 hover:text-amber-200 transition-all duration-200">
              <Book className="w-4 h-4" />
              <span className="hidden sm:inline">📚 Rules</span>
            </TabsTrigger>
            {isGameMaster && (
              <TabsTrigger value="gm" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-yellow-600 data-[state=active]:text-slate-900 text-amber-300 hover:text-amber-200 transition-all duration-200">
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">🎭 GM Tools</span>
              </TabsTrigger>
            )}
          </TabsList>

          {/* Tab Content */}
          <div className="mt-6">
            <TabsContent value="campaigns" className="space-y-4">
              <CampaignManager />
            </TabsContent>

            <TabsContent value="session" className="space-y-4">
              <MultiplayerSession isGameMaster={isGameMaster} />
            </TabsContent>

            <TabsContent value="character" className="space-y-4">
              {currentCharacter ? (
                <CharacterSheet 
                  character={currentCharacter} 
                  onUpdate={setCurrentCharacter}
                  onEdit={() => setCurrentCharacter(null)}
                />
              ) : (
                <CharacterCreator onCharacterCreate={setCurrentCharacter} />
              )}
            </TabsContent>

            <TabsContent value="advancement" className="space-y-4">
              <CharacterAdvancement character={currentCharacter} onUpdate={setCurrentCharacter} />
            </TabsContent>

            <TabsContent value="dice" className="space-y-4">
              <DiceRoller />
            </TabsContent>

            <TabsContent value="combat" className="space-y-4">
              <CombatTracker isGameMaster={isGameMaster} />
            </TabsContent>

            <TabsContent value="battlemap" className="space-y-4">
              <AdvancedBattleMap isGameMaster={isGameMaster} />
            </TabsContent>

            <TabsContent value="monsters" className="space-y-4">
              <MonsterDatabase />
            </TabsContent>

            <TabsContent value="inventory" className="space-y-4">
              <Inventory character={currentCharacter} onUpdate={setCurrentCharacter} />
            </TabsContent>

            <TabsContent value="spells" className="space-y-4">
              <SpellManager character={currentCharacter} onUpdate={setCurrentCharacter} />
            </TabsContent>

            <TabsContent value="rules" className="space-y-4">
              <RulesSection />
            </TabsContent>

            {isGameMaster && (
              <TabsContent value="gm" className="space-y-4">
                <GameMasterPanel />
              </TabsContent>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
}