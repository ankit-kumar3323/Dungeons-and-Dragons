import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Dice1 } from 'lucide-react';

const RACES = [
  'Human', 'Elf', 'Dwarf', 'Halfling', 'Dragonborn', 'Gnome', 'Half-Elf', 'Half-Orc', 'Tiefling'
];

const CLASSES = [
  'Fighter', 'Wizard', 'Rogue', 'Cleric', 'Ranger', 'Paladin', 'Barbarian', 'Bard', 'Druid', 'Monk', 'Sorcerer', 'Warlock'
];

const BACKGROUNDS = [
  'Acolyte', 'Criminal', 'Folk Hero', 'Noble', 'Sage', 'Soldier', 'Charlatan', 'Entertainer', 'Guild Artisan', 'Hermit', 'Outlander', 'Sailor'
];

interface CharacterCreatorProps {
  onCharacterCreate: (character: any) => void;
}

export function CharacterCreator({ onCharacterCreate }: CharacterCreatorProps) {
  const [character, setCharacter] = useState({
    name: '',
    race: '',
    class: '',
    background: '',
    level: 1,
    hitPoints: 0,
    armorClass: 10,
    speed: 30,
    abilities: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10
    },
    skills: [],
    proficiencies: [],
    backstory: ''
  });

  const rollAbilityScore = () => {
    // Roll 4d6, drop lowest
    const rolls = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
    rolls.sort((a, b) => b - a);
    return rolls.slice(0, 3).reduce((sum, roll) => sum + roll, 0);
  };

  const rollAllAbilities = () => {
    setCharacter(prev => ({
      ...prev,
      abilities: {
        strength: rollAbilityScore(),
        dexterity: rollAbilityScore(),
        constitution: rollAbilityScore(),
        intelligence: rollAbilityScore(),
        wisdom: rollAbilityScore(),
        charisma: rollAbilityScore()
      }
    }));
  };

  const getModifier = (score: number) => {
    return Math.floor((score - 10) / 2);
  };

  const calculateHitPoints = () => {
    const classHitDie = {
      'Barbarian': 12, 'Fighter': 10, 'Paladin': 10, 'Ranger': 10,
      'Bard': 8, 'Cleric': 8, 'Druid': 8, 'Monk': 8, 'Rogue': 8, 'Warlock': 8,
      'Sorcerer': 6, 'Wizard': 6
    };
    const hitDie = classHitDie[character.class as keyof typeof classHitDie] || 8;
    const conModifier = getModifier(character.abilities.constitution);
    return hitDie + conModifier;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCharacter = {
      ...character,
      hitPoints: calculateHitPoints(),
      maxHitPoints: calculateHitPoints(),
      armorClass: 10 + getModifier(character.abilities.dexterity),
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    onCharacterCreate(finalCharacter);
  };

  return (
    <Card className="max-w-4xl mx-auto bg-slate-800 border-slate-700">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-white">Create Your Character</CardTitle>
        <CardDescription className="text-slate-300">
          Build your adventurer for the next campaign
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-white">Character Name</Label>
                <Input
                  id="name"
                  value={character.name}
                  onChange={(e) => setCharacter(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter character name"
                  required
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="race" className="text-white">Race</Label>
                <Select value={character.race} onValueChange={(value) => setCharacter(prev => ({ ...prev, race: value }))}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select a race" />
                  </SelectTrigger>
                  <SelectContent>
                    {RACES.map(race => (
                      <SelectItem key={race} value={race}>{race}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="class" className="text-white">Class</Label>
                <Select value={character.class} onValueChange={(value) => setCharacter(prev => ({ ...prev, class: value }))}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {CLASSES.map(cls => (
                      <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="background" className="text-white">Background</Label>
                <Select value={character.background} onValueChange={(value) => setCharacter(prev => ({ ...prev, background: value }))}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select a background" />
                  </SelectTrigger>
                  <SelectContent>
                    {BACKGROUNDS.map(bg => (
                      <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Ability Scores */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-white">Ability Scores</Label>
                <Button type="button" onClick={rollAllAbilities} variant="outline" size="sm" className="flex items-center gap-2">
                  <Dice1 className="w-4 h-4" />
                  Roll All
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {Object.entries(character.abilities).map(([ability, score]) => (
                  <div key={ability} className="flex items-center justify-between p-3 bg-slate-700 rounded border-slate-600">
                    <span className="text-white capitalize">{ability}</span>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={score}
                        onChange={(e) => setCharacter(prev => ({
                          ...prev,
                          abilities: { ...prev.abilities, [ability]: parseInt(e.target.value) || 10 }
                        }))}
                        className="w-16 bg-slate-600 border-slate-500 text-white text-center"
                        min={3}
                        max={18}
                      />
                      <span className="text-slate-300 w-8 text-center">
                        {getModifier(score) >= 0 ? '+' : ''}{getModifier(score)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-700 rounded border-slate-600">
                <div className="text-center">
                  <div className="text-slate-300">Hit Points</div>
                  <div className="text-white">{calculateHitPoints()}</div>
                </div>
                <div className="text-center">
                  <div className="text-slate-300">Armor Class</div>
                  <div className="text-white">{10 + getModifier(character.abilities.dexterity)}</div>
                </div>
                <div className="text-center">
                  <div className="text-slate-300">Speed</div>
                  <div className="text-white">30 ft</div>
                </div>
              </div>
            </div>
          </div>

          {/* Backstory */}
          <div>
            <Label htmlFor="backstory" className="text-white">Character Backstory</Label>
            <Textarea
              id="backstory"
              value={character.backstory}
              onChange={(e) => setCharacter(prev => ({ ...prev, backstory: e.target.value }))}
              placeholder="Tell your character's story..."
              className="bg-slate-700 border-slate-600 text-white"
              rows={4}
            />
          </div>

          <Button type="submit" className="w-full" disabled={!character.name || !character.race || !character.class}>
            Create Character
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}