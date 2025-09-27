import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Edit, Heart, Shield, Zap, User, Backpack, Sparkles } from 'lucide-react';

interface CharacterSheetProps {
  character: any;
  onUpdate: (character: any) => void;
  onEdit: () => void;
}

export function CharacterSheet({ character, onUpdate, onEdit }: CharacterSheetProps) {
  const [tempHp, setTempHp] = useState(character.hitPoints);

  const getModifier = (score: number) => {
    return Math.floor((score - 10) / 2);
  };

  const getModifierString = (score: number) => {
    const mod = getModifier(score);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  const handleHpChange = (newHp: number) => {
    const updatedCharacter = { ...character, hitPoints: Math.max(0, Math.min(newHp, character.maxHitPoints)) };
    setTempHp(updatedCharacter.hitPoints);
    onUpdate(updatedCharacter);
  };

  const getProficiencyBonus = (level: number) => {
    return Math.ceil(level / 4) + 1;
  };

  const getSkillModifier = (ability: string, isProficient: boolean = false) => {
    const abilityMod = getModifier(character.abilities[ability.toLowerCase()]);
    const profBonus = isProficient ? getProficiencyBonus(character.level) : 0;
    return abilityMod + profBonus;
  };

  const skills = [
    { name: 'Acrobatics', ability: 'dexterity' },
    { name: 'Animal Handling', ability: 'wisdom' },
    { name: 'Arcana', ability: 'intelligence' },
    { name: 'Athletics', ability: 'strength' },
    { name: 'Deception', ability: 'charisma' },
    { name: 'History', ability: 'intelligence' },
    { name: 'Insight', ability: 'wisdom' },
    { name: 'Intimidation', ability: 'charisma' },
    { name: 'Investigation', ability: 'intelligence' },
    { name: 'Medicine', ability: 'wisdom' },
    { name: 'Nature', ability: 'intelligence' },
    { name: 'Perception', ability: 'wisdom' },
    { name: 'Performance', ability: 'charisma' },
    { name: 'Persuasion', ability: 'charisma' },
    { name: 'Religion', ability: 'intelligence' },
    { name: 'Sleight of Hand', ability: 'dexterity' },
    { name: 'Stealth', ability: 'dexterity' },
    { name: 'Survival', ability: 'wisdom' }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Character Header */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-white flex items-center gap-2">
                <User className="w-6 h-6" />
                {character.name}
              </CardTitle>
              <CardDescription className="text-slate-300">
                Level {character.level} {character.race} {character.class}
              </CardDescription>
            </div>
            <Button onClick={onEdit} variant="outline" size="sm" className="flex items-center gap-2">
              <Edit className="w-4 h-4" />
              Edit Character
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Core Stats */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Core Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-slate-700 rounded">
                  <div className="flex items-center justify-center mb-2">
                    <Heart className="w-5 h-5 text-red-400 mr-1" />
                    <span className="text-white">Hit Points</span>
                  </div>
                  <div className="text-2xl text-white mb-2">{character.hitPoints}/{character.maxHitPoints}</div>
                  <Progress value={(character.hitPoints / character.maxHitPoints) * 100} className="h-2" />
                  <div className="flex gap-1 mt-2">
                    <Button size="sm" onClick={() => handleHpChange(character.hitPoints - 1)} variant="outline">-1</Button>
                    <Button size="sm" onClick={() => handleHpChange(character.hitPoints + 1)} variant="outline">+1</Button>
                  </div>
                </div>

                <div className="text-center p-4 bg-slate-700 rounded">
                  <div className="flex items-center justify-center mb-2">
                    <Shield className="w-5 h-5 text-blue-400 mr-1" />
                    <span className="text-white">Armor Class</span>
                  </div>
                  <div className="text-2xl text-white">{character.armorClass}</div>
                </div>

                <div className="text-center p-4 bg-slate-700 rounded">
                  <div className="flex items-center justify-center mb-2">
                    <Zap className="w-5 h-5 text-yellow-400 mr-1" />
                    <span className="text-white">Speed</span>
                  </div>
                  <div className="text-2xl text-white">{character.speed} ft</div>
                </div>
              </div>

              {/* Ability Scores */}
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {Object.entries(character.abilities).map(([ability, score]) => (
                  <div key={ability} className="text-center p-3 bg-slate-700 rounded">
                    <div className="text-white capitalize mb-1">{ability.slice(0, 3)}</div>
                    <div className="text-xl text-white">{score as number}</div>
                    <div className="text-slate-300">{getModifierString(score as number)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Skills & Saves */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Skills & Saving Throws</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="skills">
                <TabsList className="bg-slate-700">
                  <TabsTrigger value="skills">Skills</TabsTrigger>
                  <TabsTrigger value="saves">Saving Throws</TabsTrigger>
                </TabsList>
                
                <TabsContent value="skills" className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {skills.map(skill => {
                      const isProficient = character.skills?.includes(skill.name);
                      const modifier = getSkillModifier(skill.ability, isProficient);
                      return (
                        <div key={skill.name} className="flex items-center justify-between p-2 bg-slate-700 rounded">
                          <div className="flex items-center gap-2">
                            {isProficient && <Badge variant="secondary" className="w-2 h-2 rounded-full p-0 bg-yellow-500" />}
                            <span className="text-white">{skill.name}</span>
                          </div>
                          <span className="text-slate-300">{modifier >= 0 ? '+' : ''}{modifier}</span>
                        </div>
                      );
                    })}
                  </div>
                </TabsContent>

                <TabsContent value="saves" className="mt-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(character.abilities).map(([ability, score]) => {
                      const modifier = getModifier(score as number);
                      return (
                        <div key={ability} className="flex items-center justify-between p-3 bg-slate-700 rounded">
                          <span className="text-white capitalize">{ability}</span>
                          <span className="text-slate-300">{modifier >= 0 ? '+' : ''}{modifier}</span>
                        </div>
                      );
                    })}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Character Details */}
        <div className="space-y-6">
          {/* Character Info */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Character Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-slate-300">Background</Label>
                <div className="text-white">{character.background}</div>
              </div>
              
              <div>
                <Label className="text-slate-300">Proficiency Bonus</Label>
                <div className="text-white">+{getProficiencyBonus(character.level)}</div>
              </div>

              <div>
                <Label className="text-slate-300">Experience Points</Label>
                <div className="text-white">{character.experience || 0} XP</div>
              </div>
            </CardContent>
          </Card>

          {/* Combat Stats */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Combat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-300">Initiative</span>
                <span className="text-white">{getModifierString(character.abilities.dexterity)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-slate-300">Passive Perception</span>
                <span className="text-white">{10 + getModifier(character.abilities.wisdom)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-300">Hit Dice</span>
                <span className="text-white">1d{character.class === 'Barbarian' ? '12' : character.class === 'Fighter' ? '10' : '8'}</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full flex items-center gap-2">
                <Backpack className="w-4 h-4" />
                Manage Inventory
              </Button>
              <Button variant="outline" className="w-full flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Cast Spell
              </Button>
              <Button variant="outline" className="w-full">
                Long Rest
              </Button>
              <Button variant="outline" className="w-full">
                Short Rest
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Backstory */}
      {character.backstory && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Character Backstory</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 leading-relaxed">{character.backstory}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}