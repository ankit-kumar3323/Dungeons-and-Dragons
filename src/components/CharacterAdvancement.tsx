import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { TrendingUp, Star, Plus, Award, BookOpen, Zap } from 'lucide-react';

interface CharacterAdvancementProps {
  character: any;
  onUpdate: (character: any) => void;
}

const EXPERIENCE_TABLE = [
  { level: 1, xp: 0, proficiencyBonus: 2 },
  { level: 2, xp: 300, proficiencyBonus: 2 },
  { level: 3, xp: 900, proficiencyBonus: 2 },
  { level: 4, xp: 2700, proficiencyBonus: 2 },
  { level: 5, xp: 6500, proficiencyBonus: 3 },
  { level: 6, xp: 14000, proficiencyBonus: 3 },
  { level: 7, xp: 23000, proficiencyBonus: 3 },
  { level: 8, xp: 34000, proficiencyBonus: 3 },
  { level: 9, xp: 48000, proficiencyBonus: 4 },
  { level: 10, xp: 64000, proficiencyBonus: 4 },
  { level: 11, xp: 85000, proficiencyBonus: 4 },
  { level: 12, xp: 100000, proficiencyBonus: 4 },
  { level: 13, xp: 120000, proficiencyBonus: 5 },
  { level: 14, xp: 140000, proficiencyBonus: 5 },
  { level: 15, xp: 165000, proficiencyBonus: 5 },
  { level: 16, xp: 195000, proficiencyBonus: 5 },
  { level: 17, xp: 225000, proficiencyBonus: 6 },
  { level: 18, xp: 265000, proficiencyBonus: 6 },
  { level: 19, xp: 305000, proficiencyBonus: 6 },
  { level: 20, xp: 355000, proficiencyBonus: 6 }
];

const FEATS = [
  {
    name: 'Alert',
    description: '+5 bonus to initiative. You can\'t be surprised while you are conscious. Other creatures don\'t gain advantage on attack rolls against you as a result of being unseen by you.',
    prerequisite: null
  },
  {
    name: 'Actor',
    description: 'Increase your Charisma score by 1, to a maximum of 20. You have advantage on Charisma (Deception) and Charisma (Performance) checks when trying to pass yourself off as a different person.',
    prerequisite: null
  },
  {
    name: 'Crossbow Expert',
    description: 'You ignore the loading quality of crossbows with which you are proficient. When you use the Attack action and attack with a one handed weapon, you can use a bonus action to attack with a hand crossbow you are holding.',
    prerequisite: null
  },
  {
    name: 'Great Weapon Master',
    description: 'On your turn, when you score a critical hit with a melee weapon or reduce a creature to 0 hit points with one, you can make one melee weapon attack as a bonus action. Before making a melee attack with a heavy weapon, you can choose to take a -5 penalty to the attack roll. If the attack hits, you add +10 to the attack\'s damage.',
    prerequisite: null
  },
  {
    name: 'Lucky',
    description: 'You have 3 luck points. Whenever you make an attack roll, an ability check, or a saving throw, you can spend one luck point to roll an additional d20. You can use this ability after the original roll, but before the outcome is determined.',
    prerequisite: null
  },
  {
    name: 'Magic Initiate',
    description: 'Choose a class: bard, cleric, druid, sorcerer, warlock, or wizard. You learn two cantrips of your choice from that class\'s spell list. You also learn one 1st-level spell of your choice from that same list.',
    prerequisite: null
  },
  {
    name: 'Sharpshooter',
    description: 'Attacking at long range doesn\'t impose disadvantage on your ranged weapon attack rolls. Your ranged weapon attacks ignore half cover and three-quarters cover. Before making a ranged attack, you can choose to take a -5 penalty to the attack roll. If the attack hits, you add +10 to the attack\'s damage.',
    prerequisite: null
  },
  {
    name: 'War Caster',
    description: 'You have advantage on Constitution saving throws that you make to maintain your concentration on a spell when you take damage. You can perform the somatic components of spells even when you have weapons or a shield in one or both hands.',
    prerequisite: 'The ability to cast at least one spell'
  }
];

const CLASS_FEATURES = {
  Fighter: {
    1: ['Fighting Style', 'Second Wind'],
    2: ['Action Surge'],
    3: ['Martial Archetype'],
    4: ['Ability Score Improvement'],
    5: ['Extra Attack'],
    6: ['Ability Score Improvement'],
    7: ['Martial Archetype Feature'],
    8: ['Ability Score Improvement'],
    9: ['Indomitable'],
    10: ['Martial Archetype Feature'],
    11: ['Extra Attack (2)'],
    12: ['Ability Score Improvement'],
    13: ['Indomitable (2)'],
    14: ['Ability Score Improvement'],
    15: ['Martial Archetype Feature'],
    16: ['Ability Score Improvement'],
    17: ['Action Surge (2)', 'Indomitable (3)'],
    18: ['Martial Archetype Feature'],
    19: ['Ability Score Improvement'],
    20: ['Extra Attack (3)']
  },
  Wizard: {
    1: ['Spellcasting', 'Arcane Recovery'],
    2: ['Arcane Tradition'],
    3: [],
    4: ['Ability Score Improvement'],
    5: [],
    6: ['Arcane Tradition Feature'],
    7: [],
    8: ['Ability Score Improvement'],
    9: [],
    10: ['Arcane Tradition Feature'],
    11: [],
    12: ['Ability Score Improvement'],
    13: [],
    14: ['Arcane Tradition Feature'],
    15: [],
    16: ['Ability Score Improvement'],
    17: [],
    18: ['Spell Mastery'],
    19: ['Ability Score Improvement'],
    20: ['Signature Spells']
  }
};

export function CharacterAdvancement({ character, onUpdate }: CharacterAdvancementProps) {
  const [xpToAdd, setXpToAdd] = useState(0);
  const [selectedAbilityIncrease, setSelectedAbilityIncrease] = useState<string[]>([]);
  const [selectedFeat, setSelectedFeat] = useState('');
  const [useFeats, setUseFeats] = useState(false);

  if (!character) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="text-center py-8 text-slate-400">
          Create a character first to manage advancement
        </CardContent>
      </Card>
    );
  }

  const currentLevel = character.level || 1;
  const currentXP = character.experience || 0;
  const currentLevelInfo = EXPERIENCE_TABLE.find(entry => entry.level === currentLevel);
  const nextLevelInfo = EXPERIENCE_TABLE.find(entry => entry.level === currentLevel + 1);

  const canLevelUp = nextLevelInfo && currentXP >= nextLevelInfo.xp;
  const xpToNextLevel = nextLevelInfo ? nextLevelInfo.xp - currentXP : 0;
  const xpProgress = nextLevelInfo ? 
    ((currentXP - (currentLevelInfo?.xp || 0)) / ((nextLevelInfo.xp - (currentLevelInfo?.xp || 0)))) * 100 : 100;

  const addExperience = () => {
    if (xpToAdd <= 0) return;
    
    const newXP = currentXP + xpToAdd;
    const newLevel = EXPERIENCE_TABLE.reduce((level, entry) => {
      return newXP >= entry.xp ? entry.level : level;
    }, 1);

    onUpdate({
      ...character,
      experience: newXP,
      level: newLevel
    });
    
    setXpToAdd(0);
  };

  const levelUp = () => {
    if (!canLevelUp || !nextLevelInfo) return;

    let updates: any = {
      ...character,
      level: nextLevelInfo.level
    };

    // Add hit points (for simplicity, using average + CON modifier)
    const classHitDie = {
      'Barbarian': 12, 'Fighter': 10, 'Paladin': 10, 'Ranger': 10,
      'Bard': 8, 'Cleric': 8, 'Druid': 8, 'Monk': 8, 'Rogue': 8, 'Warlock': 8,
      'Sorcerer': 6, 'Wizard': 6
    };
    
    const hitDie = classHitDie[character.class as keyof typeof classHitDie] || 8;
    const conModifier = Math.floor((character.abilities.constitution - 10) / 2);
    const hpIncrease = Math.floor(hitDie / 2) + 1 + conModifier;
    
    updates.maxHitPoints = (character.maxHitPoints || 0) + hpIncrease;
    updates.hitPoints = Math.min(updates.maxHitPoints, (character.hitPoints || 0) + hpIncrease);

    // Handle Ability Score Improvements or Feats at levels 4, 8, 12, 16, 19
    if ([4, 8, 12, 16, 19].includes(nextLevelInfo.level)) {
      if (useFeats && selectedFeat) {
        updates.feats = [...(character.feats || []), selectedFeat];
      } else if (selectedAbilityIncrease.length > 0) {
        const newAbilities = { ...character.abilities };
        selectedAbilityIncrease.forEach(ability => {
          if (newAbilities[ability] < 20) {
            newAbilities[ability] += 1;
          }
        });
        updates.abilities = newAbilities;
      }
    }

    onUpdate(updates);
    setSelectedAbilityIncrease([]);
    setSelectedFeat('');
    setUseFeats(false);
  };

  const getClassFeatures = (level: number) => {
    const features = CLASS_FEATURES[character.class as keyof typeof CLASS_FEATURES];
    return features ? features[level as keyof typeof features] || [] : [];
  };

  const hasASI = [4, 8, 12, 16, 19].includes(currentLevel + 1);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Level Overview */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Character Advancement
          </CardTitle>
          <CardDescription className="text-slate-300">
            Manage experience points, level progression, and character features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-slate-700 rounded">
              <div className="text-2xl font-bold text-white mb-1">Level {currentLevel}</div>
              <div className="text-slate-300">Current Level</div>
              {canLevelUp && (
                <Badge className="mt-2 bg-green-600">Ready to Level Up!</Badge>
              )}
            </div>
            
            <div className="text-center p-4 bg-slate-700 rounded">
              <div className="text-2xl font-bold text-white mb-1">{currentXP.toLocaleString()}</div>
              <div className="text-slate-300">Experience Points</div>
              {nextLevelInfo && (
                <div className="text-sm text-slate-400 mt-1">
                  {xpToNextLevel.toLocaleString()} XP to level {nextLevelInfo.level}
                </div>
              )}
            </div>

            <div className="text-center p-4 bg-slate-700 rounded">
              <div className="text-2xl font-bold text-white mb-1">+{currentLevelInfo?.proficiencyBonus || 2}</div>
              <div className="text-slate-300">Proficiency Bonus</div>
            </div>
          </div>

          {nextLevelInfo && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300">Progress to Level {nextLevelInfo.level}</span>
                <span className="text-slate-300">{Math.floor(xpProgress)}%</span>
              </div>
              <Progress value={xpProgress} className="h-3" />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Experience Management */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Add Experience</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="xpAmount" className="text-white">Experience Points</Label>
              <Input
                id="xpAmount"
                type="number"
                value={xpToAdd}
                onChange={(e) => setXpToAdd(parseInt(e.target.value) || 0)}
                placeholder="Enter XP to add"
                className="bg-slate-700 border-slate-600 text-white"
                min={0}
              />
            </div>

            <Button onClick={addExperience} disabled={xpToAdd <= 0} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Experience
            </Button>

            <div className="space-y-2">
              <div className="text-slate-300 text-sm font-medium">Quick XP Awards:</div>
              <div className="grid grid-cols-2 gap-2">
                {[50, 100, 200, 500, 1000, 2000].map(amount => (
                  <Button
                    key={amount}
                    variant="outline"
                    size="sm"
                    onClick={() => setXpToAdd(amount)}
                  >
                    {amount} XP
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Level Up */}
        {canLevelUp && (
          <Card className="bg-slate-800 border-slate-700 border-green-500">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Level Up Available!
              </CardTitle>
              <CardDescription className="text-slate-300">
                Your character can advance to level {nextLevelInfo?.level}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Class Features */}
              <div>
                <div className="text-white font-medium mb-2">New Features:</div>
                <div className="space-y-1">
                  {getClassFeatures(nextLevelInfo!.level).map((feature, index) => (
                    <div key={index} className="text-slate-300 text-sm flex items-center gap-2">
                      <Award className="w-4 h-4 text-yellow-500" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>

              {/* Ability Score Improvement or Feat */}
              {hasASI && (
                <div className="space-y-3">
                  <div className="text-white font-medium">Ability Score Improvement or Feat:</div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="useFeats"
                      checked={useFeats}
                      onChange={(e) => setUseFeats(e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="useFeats" className="text-white">Use Feat instead of ASI</Label>
                  </div>

                  {useFeats ? (
                    <Select value={selectedFeat} onValueChange={setSelectedFeat}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue placeholder="Choose a feat" />
                      </SelectTrigger>
                      <SelectContent>
                        {FEATS.map(feat => (
                          <SelectItem key={feat.name} value={feat.name}>
                            {feat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-slate-300 text-sm">Choose two ability scores to increase by 1 each (max 20):</div>
                      <div className="grid grid-cols-3 gap-2">
                        {Object.entries(character.abilities).map(([ability, score]) => (
                          <Button
                            key={ability}
                            variant={selectedAbilityIncrease.includes(ability) ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              if (selectedAbilityIncrease.includes(ability)) {
                                setSelectedAbilityIncrease(prev => prev.filter(a => a !== ability));
                              } else if (selectedAbilityIncrease.length < 2 && score < 20) {
                                setSelectedAbilityIncrease(prev => [...prev, ability]);
                              }
                            }}
                            disabled={score >= 20}
                            className="text-xs"
                          >
                            {ability.slice(0, 3).toUpperCase()} ({score})
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <Button 
                onClick={levelUp} 
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={hasASI && !useFeats && selectedAbilityIncrease.length !== 2 && !selectedFeat}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Level Up to {nextLevelInfo?.level}!
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Current Features */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Current Features</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="features">
              <TabsList className="bg-slate-700">
                <TabsTrigger value="features">Class Features</TabsTrigger>
                <TabsTrigger value="feats">Feats</TabsTrigger>
              </TabsList>
              
              <TabsContent value="features" className="mt-4">
                <div className="space-y-2">
                  {Array.from({ length: currentLevel }, (_, i) => i + 1).map(level => {
                    const features = getClassFeatures(level);
                    return features.length > 0 && (
                      <div key={level} className="p-2 bg-slate-700 rounded">
                        <div className="text-white font-medium">Level {level}:</div>
                        <div className="text-slate-300 text-sm">
                          {features.join(', ')}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
              
              <TabsContent value="feats" className="mt-4">
                {character.feats && character.feats.length > 0 ? (
                  <div className="space-y-2">
                    {character.feats.map((featName: string, index: number) => {
                      const feat = FEATS.find(f => f.name === featName);
                      return feat && (
                        <div key={index} className="p-3 bg-slate-700 rounded">
                          <div className="text-white font-medium mb-1">{feat.name}</div>
                          <div className="text-slate-300 text-sm">{feat.description}</div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-slate-400 text-center py-4">
                    No feats learned yet
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Level Benefits Table */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Level Progression</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-64 overflow-y-auto">
              <div className="space-y-1 text-sm">
                {EXPERIENCE_TABLE.slice(currentLevel - 1, currentLevel + 5).map((entry, index) => (
                  <div 
                    key={entry.level}
                    className={`p-2 rounded flex justify-between ${
                      entry.level === currentLevel ? 'bg-blue-600' : 
                      entry.level < currentLevel ? 'bg-slate-600' : 'bg-slate-700'
                    }`}
                  >
                    <span className="text-white">Level {entry.level}</span>
                    <span className="text-slate-300">{entry.xp.toLocaleString()} XP</span>
                    <span className="text-slate-300">+{entry.proficiencyBonus}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feat Reference */}
      {useFeats && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Available Feats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {FEATS.map(feat => (
                <div key={feat.name} className="p-3 bg-slate-700 rounded">
                  <div className="text-white font-medium mb-1">{feat.name}</div>
                  <div className="text-slate-300 text-sm mb-2">{feat.description}</div>
                  {feat.prerequisite && (
                    <div className="text-yellow-400 text-xs">
                      Prerequisite: {feat.prerequisite}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}