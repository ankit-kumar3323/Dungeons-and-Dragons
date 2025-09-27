import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Plus, Sword, Shield, Heart, Zap, Trash2, Edit, Play, Pause, SkipForward } from 'lucide-react';

interface Combatant {
  id: number;
  name: string;
  initiative: number;
  hitPoints: number;
  maxHitPoints: number;
  armorClass: number;
  isPlayer: boolean;
  conditions: string[];
  notes: string;
}

interface CombatTrackerProps {
  isGameMaster: boolean;
}

export function CombatTracker({ isGameMaster }: CombatTrackerProps) {
  const [combatants, setCombatants] = useState<Combatant[]>([]);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [round, setRound] = useState(1);
  const [inCombat, setInCombat] = useState(false);
  const [newCombatant, setNewCombatant] = useState({
    name: '',
    initiative: '',
    hitPoints: '',
    armorClass: '',
    isPlayer: true
  });

  const conditions = [
    'Blinded', 'Charmed', 'Deafened', 'Frightened', 'Grappled', 'Incapacitated',
    'Invisible', 'Paralyzed', 'Petrified', 'Poisoned', 'Prone', 'Restrained',
    'Stunned', 'Unconscious', 'Exhausted', 'Concentrating'
  ];

  const addCombatant = () => {
    if (!newCombatant.name || !newCombatant.initiative || !newCombatant.hitPoints) return;

    const combatant: Combatant = {
      id: Date.now(),
      name: newCombatant.name,
      initiative: parseInt(newCombatant.initiative),
      hitPoints: parseInt(newCombatant.hitPoints),
      maxHitPoints: parseInt(newCombatant.hitPoints),
      armorClass: parseInt(newCombatant.armorClass) || 10,
      isPlayer: newCombatant.isPlayer,
      conditions: [],
      notes: ''
    };

    setCombatants(prev => [...prev, combatant].sort((a, b) => b.initiative - a.initiative));
    setNewCombatant({ name: '', initiative: '', hitPoints: '', armorClass: '', isPlayer: true });
  };

  const updateCombatant = (id: number, updates: Partial<Combatant>) => {
    setCombatants(prev => 
      prev.map(c => c.id === id ? { ...c, ...updates } : c)
    );
  };

  const removeCombatant = (id: number) => {
    setCombatants(prev => prev.filter(c => c.id !== id));
    if (currentTurn >= combatants.length - 1) {
      setCurrentTurn(0);
    }
  };

  const startCombat = () => {
    if (combatants.length === 0) return;
    setInCombat(true);
    setCurrentTurn(0);
    setRound(1);
  };

  const endCombat = () => {
    setInCombat(false);
    setCurrentTurn(0);
    setRound(1);
  };

  const nextTurn = () => {
    if (currentTurn >= combatants.length - 1) {
      setCurrentTurn(0);
      setRound(prev => prev + 1);
    } else {
      setCurrentTurn(prev => prev + 1);
    }
  };

  const rollInitiative = () => {
    setCombatants(prev => 
      prev.map(c => ({
        ...c,
        initiative: Math.floor(Math.random() * 20) + 1 + (c.isPlayer ? 3 : 1) // Players get slight bonus
      })).sort((a, b) => b.initiative - a.initiative)
    );
    setCurrentTurn(0);
  };

  const getHealthColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage > 50) return 'bg-green-600';
    if (percentage > 25) return 'bg-yellow-600';
    if (percentage > 0) return 'bg-red-600';
    return 'bg-gray-600';
  };

  const quickDamage = (id: number, amount: number) => {
    updateCombatant(id, {
      hitPoints: Math.max(0, combatants.find(c => c.id === id)!.hitPoints - amount)
    });
  };

  const quickHeal = (id: number, amount: number) => {
    const combatant = combatants.find(c => c.id === id)!;
    updateCombatant(id, {
      hitPoints: Math.min(combatant.maxHitPoints, combatant.hitPoints + amount)
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Combat Controls */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Sword className="w-5 h-5" />
                Combat Tracker
              </CardTitle>
              <CardDescription className="text-slate-300">
                Manage combat encounters and initiative order
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {inCombat && (
                <Badge variant="default" className="bg-red-600">
                  Round {round} • Turn {currentTurn + 1}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {!inCombat ? (
              <>
                <Button onClick={startCombat} disabled={combatants.length === 0} className="flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  Start Combat
                </Button>
                <Button onClick={rollInitiative} variant="outline" disabled={combatants.length === 0}>
                  <Zap className="w-4 h-4 mr-2" />
                  Roll Initiative
                </Button>
              </>
            ) : (
              <>
                <Button onClick={nextTurn} className="flex items-center gap-2">
                  <SkipForward className="w-4 h-4" />
                  Next Turn
                </Button>
                <Button onClick={endCombat} variant="outline" className="flex items-center gap-2">
                  <Pause className="w-4 h-4" />
                  End Combat
                </Button>
              </>
            )}
            <Button onClick={() => setCombatants([])} variant="outline">
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Combatant */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Add Combatant</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-white">Name</Label>
              <Input
                id="name"
                value={newCombatant.name}
                onChange={(e) => setNewCombatant(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Character/Monster name"
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="initiative" className="text-white">Initiative</Label>
                <Input
                  id="initiative"
                  type="number"
                  value={newCombatant.initiative}
                  onChange={(e) => setNewCombatant(prev => ({ ...prev, initiative: e.target.value }))}
                  placeholder="15"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="hp" className="text-white">Hit Points</Label>
                <Input
                  id="hp"
                  type="number"
                  value={newCombatant.hitPoints}
                  onChange={(e) => setNewCombatant(prev => ({ ...prev, hitPoints: e.target.value }))}
                  placeholder="25"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="ac" className="text-white">Armor Class</Label>
              <Input
                id="ac"
                type="number"
                value={newCombatant.armorClass}
                onChange={(e) => setNewCombatant(prev => ({ ...prev, armorClass: e.target.value }))}
                placeholder="14"
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPlayer"
                checked={newCombatant.isPlayer}
                onChange={(e) => setNewCombatant(prev => ({ ...prev, isPlayer: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="isPlayer" className="text-white">Player Character</Label>
            </div>

            <Button onClick={addCombatant} className="w-full" disabled={!newCombatant.name}>
              <Plus className="w-4 h-4 mr-2" />
              Add to Combat
            </Button>
          </CardContent>
        </Card>

        {/* Initiative Order */}
        <div className="lg:col-span-2">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Initiative Order</CardTitle>
              <CardDescription className="text-slate-300">
                {combatants.length} combatants • {inCombat ? `Round ${round}` : 'Not in combat'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {combatants.length === 0 ? (
                <div className="text-center text-slate-400 py-8">
                  No combatants added yet. Add some characters or monsters to start combat!
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {combatants.map((combatant, index) => (
                    <div
                      key={combatant.id}
                      className={`p-4 rounded border ${
                        inCombat && index === currentTurn
                          ? 'bg-blue-900 border-blue-500'
                          : 'bg-slate-700 border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Badge variant={combatant.isPlayer ? "default" : "secondary"}>
                            {combatant.initiative}
                          </Badge>
                          <div>
                            <div className="text-white font-medium">{combatant.name}</div>
                            <div className="text-slate-300 text-sm">
                              AC {combatant.armorClass} • {combatant.isPlayer ? 'Player' : 'NPC'}
                            </div>
                          </div>
                        </div>
                        
                        {isGameMaster && (
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => quickDamage(combatant.id, 5)}
                              size="sm"
                              variant="outline"
                              className="text-red-400"
                            >
                              -5
                            </Button>
                            <Button
                              onClick={() => quickHeal(combatant.id, 5)}
                              size="sm"
                              variant="outline"
                              className="text-green-400"
                            >
                              +5
                            </Button>
                            <Button
                              onClick={() => removeCombatant(combatant.id)}
                              size="sm"
                              variant="outline"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Health Bar */}
                      <div className="mb-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-slate-300 text-sm">Hit Points</span>
                          <span className="text-white text-sm">
                            {combatant.hitPoints}/{combatant.maxHitPoints}
                          </span>
                        </div>
                        <div className="w-full bg-slate-600 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${getHealthColor(
                              combatant.hitPoints,
                              combatant.maxHitPoints
                            )}`}
                            style={{
                              width: `${Math.max(0, (combatant.hitPoints / combatant.maxHitPoints) * 100)}%`
                            }}
                          />
                        </div>
                      </div>

                      {/* Conditions */}
                      {combatant.conditions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {combatant.conditions.map((condition, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {condition}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Quick Condition Toggle */}
                      {isGameMaster && (
                        <div className="flex flex-wrap gap-1">
                          {['Prone', 'Poisoned', 'Stunned', 'Unconscious'].map(condition => (
                            <Button
                              key={condition}
                              onClick={() => {
                                const hasCondition = combatant.conditions.includes(condition);
                                updateCombatant(combatant.id, {
                                  conditions: hasCondition
                                    ? combatant.conditions.filter(c => c !== condition)
                                    : [...combatant.conditions, condition]
                                });
                              }}
                              size="sm"
                              variant={combatant.conditions.includes(condition) ? "default" : "outline"}
                              className="text-xs"
                            >
                              {condition}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}