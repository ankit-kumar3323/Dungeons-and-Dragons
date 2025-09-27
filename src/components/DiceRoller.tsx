import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Plus, RotateCcw } from 'lucide-react';

interface RollResult {
  id: number;
  dice: string;
  result: number;
  individual: number[];
  modifier: number;
  total: number;
  timestamp: Date;
  description?: string;
}

export function DiceRoller() {
  const [rollHistory, setRollHistory] = useState<RollResult[]>([]);
  const [customRoll, setCustomRoll] = useState('1d20');
  const [modifier, setModifier] = useState(0);
  const [description, setDescription] = useState('');

  const rollDice = (sides: number) => Math.floor(Math.random() * sides) + 1;

  const parseDiceString = (diceString: string) => {
    const match = diceString.match(/(\d+)d(\d+)/i);
    if (!match) return null;
    
    const count = parseInt(match[1]);
    const sides = parseInt(match[2]);
    
    if (count > 20 || sides > 100) return null; // Reasonable limits
    
    return { count, sides };
  };

  const performRoll = (diceString: string, mod: number = 0, desc: string = '') => {
    const parsed = parseDiceString(diceString);
    if (!parsed) return;

    const { count, sides } = parsed;
    const individual = Array.from({ length: count }, () => rollDice(sides));
    const result = individual.reduce((sum, roll) => sum + roll, 0);
    const total = result + mod;

    const rollResult: RollResult = {
      id: Date.now(),
      dice: diceString,
      result,
      individual,
      modifier: mod,
      total,
      timestamp: new Date(),
      description: desc
    };

    setRollHistory(prev => [rollResult, ...prev.slice(0, 19)]); // Keep last 20 rolls
  };

  const quickRolls = [
    { name: 'd4', dice: '1d4', icon: Dice1 },
    { name: 'd6', dice: '1d6', icon: Dice2 },
    { name: 'd8', dice: '1d8', icon: Dice3 },
    { name: 'd10', dice: '1d10', icon: Dice4 },
    { name: 'd12', dice: '1d12', icon: Dice5 },
    { name: 'd20', dice: '1d20', icon: Dice6 }
  ];

  const commonRolls = [
    { name: 'Attack Roll', dice: '1d20', modifier: 5, description: 'Basic attack' },
    { name: 'Skill Check', dice: '1d20', modifier: 3, description: 'Skill check' },
    { name: 'Damage', dice: '1d8', modifier: 3, description: 'Weapon damage' },
    { name: 'Healing', dice: '1d8', modifier: 4, description: 'Cure Wounds' },
    { name: 'Initiative', dice: '1d20', modifier: 2, description: 'Initiative roll' },
    { name: 'Death Save', dice: '1d20', modifier: 0, description: 'Death saving throw' }
  ];

  const getDiceIcon = (result: number, max: number) => {
    if (result === 1) return '😞'; // Critical fail
    if (result === max) return '🎉'; // Critical success
    if (result >= max * 0.8) return '😊'; // Good roll
    if (result <= max * 0.2) return '😐'; // Poor roll
    return '🎲'; // Average roll
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Quick Dice */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Quick Dice Rolls</CardTitle>
          <CardDescription className="text-slate-300">
            Click any die for a quick roll
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {quickRolls.map(({ name, dice, icon: Icon }) => (
              <Button
                key={name}
                onClick={() => performRoll(dice)}
                variant="outline"
                className="h-20 flex flex-col items-center gap-2 bg-slate-700 border-slate-600 hover:bg-slate-600"
              >
                <Icon className="w-6 h-6 text-white" />
                <span className="text-white">{name}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Custom Roll */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Custom Roll</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dice" className="text-white">Dice (e.g., 2d6, 1d20)</Label>
                <Input
                  id="dice"
                  value={customRoll}
                  onChange={(e) => setCustomRoll(e.target.value)}
                  placeholder="1d20"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="modifier" className="text-white">Modifier</Label>
                <Input
                  id="modifier"
                  type="number"
                  value={modifier}
                  onChange={(e) => setModifier(parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="description" className="text-white">Description (Optional)</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this roll for?"
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <Button
              onClick={() => performRoll(customRoll, modifier, description)}
              className="w-full"
              disabled={!parseDiceString(customRoll)}
            >
              <Dice1 className="w-4 h-4 mr-2" />
              Roll {customRoll}{modifier !== 0 && ` ${modifier >= 0 ? '+' : ''}${modifier}`}
            </Button>
          </CardContent>
        </Card>

        {/* Common Rolls */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Common Rolls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {commonRolls.map((roll, index) => (
              <Button
                key={index}
                onClick={() => performRoll(roll.dice, roll.modifier, roll.description)}
                variant="outline"
                className="w-full justify-between bg-slate-700 border-slate-600 hover:bg-slate-600"
              >
                <span className="text-white">{roll.name}</span>
                <Badge variant="secondary" className="bg-slate-600">
                  {roll.dice} {roll.modifier !== 0 && `${roll.modifier >= 0 ? '+' : ''}${roll.modifier}`}
                </Badge>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Roll History */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-white">Roll History</CardTitle>
            <CardDescription className="text-slate-300">
              Your recent dice rolls
            </CardDescription>
          </div>
          <Button
            onClick={() => setRollHistory([])}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Clear
          </Button>
        </CardHeader>
        <CardContent>
          {rollHistory.length === 0 ? (
            <div className="text-center text-slate-400 py-8">
              No rolls yet. Roll some dice to see your history!
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {rollHistory.map((roll) => (
                <div key={roll.id} className="flex items-center justify-between p-3 bg-slate-700 rounded border-slate-600">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {getDiceIcon(roll.total, parseDiceString(roll.dice)?.sides || 20)}
                    </span>
                    <div>
                      <div className="text-white font-medium">
                        {roll.description || `${roll.dice} roll`}
                      </div>
                      <div className="text-slate-300 text-sm">
                        {roll.individual.join(' + ')}
                        {roll.modifier !== 0 && ` ${roll.modifier >= 0 ? '+' : ''}${roll.modifier}`}
                        {' = '}
                        <span className="font-bold text-white">{roll.total}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">{roll.total}</div>
                    <div className="text-xs text-slate-400">
                      {roll.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}