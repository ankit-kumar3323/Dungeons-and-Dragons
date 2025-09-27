import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Crown, Users, MapPin, Dice1, Eye, Plus, Scroll, Swords, Shield } from 'lucide-react';

interface NPCTemplate {
  id: number;
  name: string;
  type: 'humanoid' | 'beast' | 'monstrosity' | 'undead' | 'fiend' | 'celestial' | 'construct';
  challengeRating: string;
  armorClass: number;
  hitPoints: string;
  speed: string;
  abilities: {
    str: number; dex: number; con: number; int: number; wis: number; cha: number;
  };
  skills?: string;
  senses?: string;
  languages?: string;
  actions: string[];
  description: string;
}

interface Campaign {
  id: number;
  name: string;
  description: string;
  sessions: number;
  lastPlayed: string;
  players: string[];
}

export function GameMasterPanel() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: 1,
      name: 'The Lost Mine of Phandelver',
      description: 'A classic D&D adventure for new players',
      sessions: 8,
      lastPlayed: '2024-01-15',
      players: ['Alice', 'Bob', 'Carol', 'Dave']
    },
    {
      id: 2,  
      name: 'Curse of Strahd',
      description: 'A gothic horror campaign in Barovia',
      sessions: 15,
      lastPlayed: '2024-01-10',
      players: ['Eve', 'Frank', 'Grace']
    }
  ]);

  const [npcTemplates] = useState<NPCTemplate[]>([
    {
      id: 1,
      name: 'Guard',
      type: 'humanoid',
      challengeRating: '1/8',
      armorClass: 16,
      hitPoints: '2d8 + 2',
      speed: '30 ft.',
      abilities: { str: 13, dex: 12, con: 12, int: 10, wis: 11, cha: 10 },
      skills: 'Perception +2',
      senses: 'passive Perception 12',
      languages: 'any one language (usually Common)',
      actions: ['Spear: +3 to hit, 1d6+1 piercing damage'],
      description: 'A typical town guard or soldier'
    },
    {
      id: 2,
      name: 'Goblin',
      type: 'humanoid',
      challengeRating: '1/4',
      armorClass: 15,
      hitPoints: '2d6',
      speed: '30 ft.',
      abilities: { str: 8, dex: 14, con: 10, int: 10, wis: 8, cha: 8 },
      skills: 'Stealth +6',
      senses: 'darkvision 60 ft., passive Perception 9',
      languages: 'Common, Goblin',
      actions: [
        'Scimitar: +4 to hit, 1d6+2 slashing damage',
        'Shortbow: +4 to hit, range 80/320 ft., 1d6+2 piercing damage'
      ],
      description: 'Small, cunning humanoid creatures'
    }
  ]);

  const [encounterNotes, setEncounterNotes] = useState('');
  const [campaignNotes, setCampaignNotes] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium');

  const encounterDifficulties = [
    { value: 'easy', label: 'Easy', multiplier: 1 },
    { value: 'medium', label: 'Medium', multiplier: 1.5 },
    { value: 'hard', label: 'Hard', multiplier: 2 },
    { value: 'deadly', label: 'Deadly', multiplier: 2.5 }
  ];

  const randomNames = {
    human: ['Gareth', 'Mira', 'Tobias', 'Elena', 'Marcus', 'Lydia', 'Cedric', 'Vera'],
    elf: ['Aelar', 'Aerdria', 'Ahvir', 'Aramil', 'Aranea', 'Berrian', 'Dayereth', 'Enna'],
    dwarf: ['Adrik', 'Baern', 'Darrak', 'Delg', 'Eberk', 'Einkil', 'Fargrim', 'Flint'],
    halfling: ['Alton', 'Ander', 'Cade', 'Corrin', 'Eldon', 'Errich', 'Finnan', 'Garret']
  };

  const generateRandomName = () => {
    const races = Object.keys(randomNames);
    const randomRace = races[Math.floor(Math.random() * races.length)];
    const names = randomNames[randomRace as keyof typeof randomNames];
    return names[Math.floor(Math.random() * names.length)];
  };

  const rollInitiative = () => {
    return Math.floor(Math.random() * 20) + 1;
  };

  const generateRandomWeather = () => {
    const weather = [
      'Clear skies', 'Light clouds', 'Overcast', 'Light rain', 'Heavy rain',
      'Thunderstorm', 'Light snow', 'Heavy snow', 'Fog', 'Windy'
    ];
    return weather[Math.floor(Math.random() * weather.length)];
  };

  const quickRules = [
    { name: 'Advantage/Disadvantage', description: 'Roll 2d20, take higher/lower' },
    { name: 'Inspiration', description: 'Reward good roleplay with advantage' },
    { name: 'Death Saves', description: '3 successes to stabilize, 3 failures to die' },
    { name: 'Concentration', description: 'DC 10 or half damage, whichever is higher' },
    { name: 'Opportunity Attacks', description: 'Triggered when leaving threatened area' },
    { name: 'Help Action', description: 'Give ally advantage on next ability check' }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* GM Header */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-white flex items-center justify-center gap-2">
            <Crown className="w-6 h-6 text-yellow-500" />
            Game Master Panel
          </CardTitle>
          <CardDescription className="text-slate-300">
            Tools and resources for running your D&D campaign
          </CardDescription>
        </CardHeader>
      </Card>

      {/* GM Tools Tabs */}
      <Tabs defaultValue="campaigns" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6 bg-slate-800 border-slate-700">
          <TabsTrigger value="campaigns" className="flex items-center gap-2">
            <Scroll className="w-4 h-4" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="encounters" className="flex items-center gap-2">
            <Swords className="w-4 h-4" />
            Encounters
          </TabsTrigger>
          <TabsTrigger value="npcs" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            NPCs
          </TabsTrigger>
          <TabsTrigger value="world" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            World
          </TabsTrigger>
          <TabsTrigger value="tools" className="flex items-center gap-2">
            <Dice1 className="w-4 h-4" />
            Tools
          </TabsTrigger>
          <TabsTrigger value="rules" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Quick Rules
          </TabsTrigger>
        </TabsList>

        {/* Campaigns */}
        <TabsContent value="campaigns">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Active Campaigns</CardTitle>
                <CardDescription className="text-slate-300">
                  Manage your ongoing campaigns
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {campaigns.map(campaign => (
                  <div key={campaign.id} className="p-4 bg-slate-700 rounded border-slate-600">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-white font-semibold">{campaign.name}</h3>
                      <Badge variant="outline">{campaign.sessions} sessions</Badge>
                    </div>
                    <p className="text-slate-300 text-sm mb-2">{campaign.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">
                        Players: {campaign.players.join(', ')}
                      </span>
                      <span className="text-slate-400">
                        Last: {campaign.lastPlayed}
                      </span>
                    </div>
                  </div>
                ))}
                <Button className="w-full" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Campaign
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Campaign Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Write your campaign notes here..."
                  value={campaignNotes}
                  onChange={(e) => setCampaignNotes(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white min-h-48"
                />
                <Button className="w-full mt-4">
                  Save Notes
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Encounters */}
        <TabsContent value="encounters">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Encounter Builder</CardTitle>
                <CardDescription className="text-slate-300">
                  Plan and balance combat encounters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="partyLevel" className="text-white">Average Party Level</Label>
                  <Input
                    id="partyLevel"
                    type="number"
                    placeholder="5"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                
                <div>
                  <Label htmlFor="partySize" className="text-white">Party Size</Label>
                  <Input
                    id="partySize"
                    type="number"
                    placeholder="4"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div>
                  <Label className="text-white">Encounter Difficulty</Label>
                  <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {encounterDifficulties.map(diff => (
                        <SelectItem key={diff.value} value={diff.value}>
                          {diff.label} (×{diff.multiplier})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button className="w-full">
                  Generate Encounter
                </Button>

                <div className="space-y-2">
                  <h4 className="text-white font-medium">Quick Encounters</h4>
                  {['2 Goblins', '1 Orc + 2 Kobolds', '1 Owlbear', 'Bandit Ambush'].map(encounter => (
                    <Button key={encounter} variant="outline" className="w-full justify-start">
                      {encounter}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Encounter Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Encounter setup, tactics, environmental hazards..."
                  value={encounterNotes}
                  onChange={(e) => setEncounterNotes(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white min-h-48"
                />
                <div className="mt-4 space-y-2">
                  <Button variant="outline" className="w-full">
                    🎲 Roll Random Encounter
                  </Button>
                  <Button variant="outline" className="w-full">
                    ⚔️ Start Combat
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* NPCs */}
        <TabsContent value="npcs">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">NPC Generator</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={() => alert(`Random NPC: ${generateRandomName()}`)} className="w-full">
                  Generate Random NPC
                </Button>
                
                <div className="space-y-2">
                  <h4 className="text-white font-medium">Quick NPCs</h4>
                  {['Innkeeper', 'Guard Captain', 'Merchant', 'Sage', 'Noble', 'Beggar'].map(npc => (
                    <Button key={npc} variant="outline" size="sm" className="w-full">
                      {npc}
                    </Button>
                  ))}
                </div>

                <div className="space-y-2">
                  <h4 className="text-white font-medium">Voice & Mannerisms</h4>
                  <Button variant="outline" size="sm" className="w-full">
                    🎭 Random Voice
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    🤝 Random Quirk
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="lg:col-span-2">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">NPC Templates</CardTitle>
                  <CardDescription className="text-slate-300">
                    Quick stat blocks for common NPCs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {npcTemplates.map(npc => (
                      <div key={npc.id} className="p-4 bg-slate-700 rounded border-slate-600">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-white font-semibold">{npc.name}</h3>
                          <Badge variant="outline">CR {npc.challengeRating}</Badge>
                        </div>
                        
                        <div className="text-sm text-slate-300 space-y-1">
                          <div>AC {npc.armorClass}, HP {npc.hitPoints}</div>
                          <div>Speed {npc.speed}</div>
                          <div className="text-xs">
                            STR {npc.abilities.str} DEX {npc.abilities.dex} CON {npc.abilities.con} 
                            INT {npc.abilities.int} WIS {npc.abilities.wis} CHA {npc.abilities.cha}
                          </div>
                          {npc.skills && <div><strong>Skills:</strong> {npc.skills}</div>}
                          {npc.senses && <div><strong>Senses:</strong> {npc.senses}</div>}
                        </div>

                        <div className="mt-2">
                          <div className="text-white text-sm font-medium mb-1">Actions:</div>
                          {npc.actions.map((action, idx) => (
                            <div key={idx} className="text-slate-300 text-xs">{action}</div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* World Building */}
        <TabsContent value="world">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">World Generator</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" onClick={() => alert(`Today's weather: ${generateRandomWeather()}`)}>
                    🌤️ Weather
                  </Button>
                  <Button variant="outline" onClick={() => alert(`Random name: ${generateRandomName()}`)}>
                    🏘️ Place Name
                  </Button>
                  <Button variant="outline">
                    🏪 Shop Generator
                  </Button>
                  <Button variant="outline">
                    🗺️ Random Map
                  </Button>
                  <Button variant="outline">
                    📰 News & Rumors
                  </Button>
                  <Button variant="outline">
                    🎭 Random Event
                  </Button>
                </div>

                <div className="space-y-2">
                  <h4 className="text-white font-medium">Settlement Types</h4>
                  {['Village', 'Town', 'City', 'Outpost', 'Ruins'].map(type => (
                    <Button key={type} variant="outline" size="sm" className="w-full">
                      Generate {type}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Session Prep</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-slate-700 rounded">
                  <h4 className="text-white font-medium mb-2">Session Checklist</h4>
                  <div className="space-y-1 text-sm text-slate-300">
                    <div>☐ Review last session notes</div>
                    <div>☐ Prepare NPC voices/mannerisms</div>
                    <div>☐ Set up battle maps/tokens</div>
                    <div>☐ Review monster stat blocks</div>
                    <div>☐ Prepare handouts/props</div>
                    <div>☐ Plan potential encounters</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button variant="outline" className="w-full">
                    📝 Session Summary Template
                  </Button>
                  <Button variant="outline" className="w-full">
                    🎯 Plot Hook Generator
                  </Button>
                  <Button variant="outline" className="w-full">
                    💰 Treasure Generator
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* GM Tools */}
        <TabsContent value="tools">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Quick Rolls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { name: 'd4', sides: 4 },
                  { name: 'd6', sides: 6 },
                  { name: 'd8', sides: 8 },
                  { name: 'd10', sides: 10 },
                  { name: 'd12', sides: 12 },
                  { name: 'd20', sides: 20 },
                  { name: 'd100', sides: 100 }
                ].map(die => (
                  <Button
                    key={die.name}
                    variant="outline"
                    className="w-full"
                    onClick={() => alert(`${die.name}: ${Math.floor(Math.random() * die.sides) + 1}`)}
                  >
                    Roll {die.name}
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Initiative Helper</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  className="w-full"
                  onClick={() => alert(`Initiative: ${rollInitiative()}`)}
                >
                  🎲 Roll Initiative
                </Button>
                <Button variant="outline" className="w-full">
                  👥 Mass Initiative
                </Button>
                <Button variant="outline" className="w-full">
                  ⏭️ Next Turn
                </Button>
                <Button variant="outline" className="w-full">
                  🔄 Reset Combat
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Status Effects</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {['Poisoned', 'Stunned', 'Prone', 'Grappled', 'Restrained', 'Blinded', 'Charmed'].map(condition => (
                  <Button key={condition} variant="outline" size="sm" className="w-full text-xs">
                    {condition}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Quick Rules */}
        <TabsContent value="rules">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickRules.map(rule => (
              <Card key={rule.name} className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-lg">{rule.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300 text-sm">{rule.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-slate-800 border-slate-700 mt-6">
            <CardHeader>
              <CardTitle className="text-white">GM Screen Quick Reference</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div>
                  <h4 className="text-white font-medium mb-2">Difficulty Classes</h4>
                  <div className="space-y-1 text-slate-300">
                    <div>Very Easy: DC 5</div>
                    <div>Easy: DC 10</div>
                    <div>Medium: DC 15</div>
                    <div>Hard: DC 20</div>
                    <div>Very Hard: DC 25</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-white font-medium mb-2">Conditions Quick Ref</h4>
                  <div className="space-y-1 text-slate-300">
                    <div>Advantage: Roll 2d20, take higher</div>
                    <div>Disadvantage: Roll 2d20, take lower</div>
                    <div>Prone: Disadvantage on attacks</div>
                    <div>Stunned: Can't act, fail STR/DEX saves</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-white font-medium mb-2">Cover</h4>
                  <div className="space-y-1 text-slate-300">
                    <div>Half: +2 AC and DEX saves</div>
                    <div>Three-quarters: +5 AC and DEX saves</div>
                    <div>Total: Can't be targeted</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}