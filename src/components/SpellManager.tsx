import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Sparkles, Zap, Clock, Target, Plus, Search, BookOpen } from 'lucide-react';

interface Spell {
  id: number;
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string;
  damage?: string;
  saveType?: string;
  ritual: boolean;
  concentration: boolean;
  prepared: boolean;
}

interface SpellManagerProps {
  character: any;
  onUpdate: (character: any) => void;
}

export function SpellManager({ character, onUpdate }: SpellManagerProps) {
  const [spellSlots, setSpellSlots] = useState({
    1: { total: 4, used: 1 },
    2: { total: 3, used: 0 },
    3: { total: 3, used: 2 },
    4: { total: 1, used: 0 },
    5: { total: 0, used: 0 },
    6: { total: 0, used: 0 },
    7: { total: 0, used: 0 },
    8: { total: 0, used: 0 },
    9: { total: 0, used: 0 }
  });

  const [knownSpells] = useState<Spell[]>([
    {
      id: 1,
      name: 'Magic Missile',
      level: 1,
      school: 'Evocation',
      castingTime: '1 action',
      range: '120 feet',
      components: 'V, S',
      duration: 'Instantaneous',
      description: 'You create three glowing darts of magical force. Each dart hits a creature of your choice that you can see within range. A dart deals 1d4 + 1 force damage to its target. The darts all strike simultaneously, and you can direct them to hit one creature or several.',
      damage: '3 × (1d4 + 1) force',
      ritual: false,
      concentration: false,
      prepared: true
    },
    {
      id: 2,
      name: 'Shield',
      level: 1,
      school: 'Abjuration',
      castingTime: '1 reaction',
      range: 'Self',
      components: 'V, S',
      duration: '1 round',
      description: 'An invisible barrier of magical force appears and protects you. Until the start of your next turn, you have a +5 bonus to AC, including against the triggering attack, and you take no damage from magic missile.',
      ritual: false,
      concentration: false,
      prepared: true
    },
    {
      id: 3,
      name: 'Misty Step',
      level: 2,
      school: 'Conjuration',
      castingTime: '1 bonus action',
      range: 'Self',
      components: 'V',
      duration: 'Instantaneous',
      description: 'Briefly surrounded by silvery mist, you teleport up to 30 feet to an unoccupied space that you can see.',
      ritual: false,
      concentration: false,
      prepared: true
    },
    {
      id: 4,
      name: 'Fireball',
      level: 3,
      school: 'Evocation',
      castingTime: '1 action',
      range: '150 feet',
      components: 'V, S, M (a tiny ball of bat guano and sulfur)',
      duration: 'Instantaneous',
      description: 'A bright streak flashes from your pointing finger to a point you choose within range and then blossoms with a low roar into an explosion of flame. Each creature in a 20-foot-radius sphere centered on that point must make a Dexterity saving throw. A target takes 8d6 fire damage on a failed save, or half as much damage on a successful one.',
      damage: '8d6 fire',
      saveType: 'Dexterity',
      ritual: false,
      concentration: false,
      prepared: true
    },
    {
      id: 5,
      name: 'Detect Magic',
      level: 1,
      school: 'Divination',
      castingTime: '1 action',
      range: 'Self',
      components: 'V, S',
      duration: 'Concentration, up to 10 minutes',
      description: 'For the duration, you sense the presence of magic within 30 feet of you. If you sense magic in this way, you can use your action to see a faint aura around any visible creature or object in the area that bears magic.',
      ritual: true,
      concentration: true,
      prepared: false
    },
    {
      id: 6,
      name: 'Counterspell',
      level: 3,
      school: 'Abjuration',
      castingTime: '1 reaction',
      range: '60 feet',
      components: 'S',
      duration: 'Instantaneous',
      description: 'You attempt to interrupt a creature in the process of casting a spell. If the creature is casting a spell of 3rd level or lower, its spell fails and has no effect. If it is casting a spell of 4th level or higher, make an ability check using your spellcasting ability.',
      ritual: false,
      concentration: false,
      prepared: true
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterSchool, setFilterSchool] = useState('all');

  const schools = [
    'Abjuration', 'Conjuration', 'Divination', 'Enchantment',
    'Evocation', 'Illusion', 'Necromancy', 'Transmutation'
  ];

  const cantrips = knownSpells.filter(spell => spell.level === 0);
  const leveled_spells = knownSpells.filter(spell => spell.level > 0);

  const useSpellSlot = (level: number) => {
    if (spellSlots[level as keyof typeof spellSlots].used < spellSlots[level as keyof typeof spellSlots].total) {
      setSpellSlots(prev => ({
        ...prev,
        [level]: { ...prev[level as keyof typeof prev], used: prev[level as keyof typeof prev].used + 1 }
      }));
    }
  };

  const restoreSpellSlot = (level: number) => {
    if (spellSlots[level as keyof typeof spellSlots].used > 0) {
      setSpellSlots(prev => ({
        ...prev,
        [level]: { ...prev[level as keyof typeof prev], used: prev[level as keyof typeof prev].used - 1 }
      }));
    }
  };

  const longRest = () => {
    setSpellSlots(prev => {
      const restored = { ...prev };
      Object.keys(restored).forEach(level => {
        restored[level as keyof typeof restored].used = 0;
      });
      return restored;
    });
  };

  const filteredSpells = leveled_spells.filter(spell => {
    const matchesSearch = spell.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         spell.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === 'all' || spell.level.toString() === filterLevel;
    const matchesSchool = filterSchool === 'all' || spell.school === filterSchool;
    
    return matchesSearch && matchesLevel && matchesSchool;
  });

  const getSchoolColor = (school: string) => {
    const colors = {
      'Abjuration': 'bg-blue-600',
      'Conjuration': 'bg-yellow-600',
      'Divination': 'bg-purple-600',
      'Enchantment': 'bg-pink-600',
      'Evocation': 'bg-red-600',
      'Illusion': 'bg-indigo-600',
      'Necromancy': 'bg-gray-600',
      'Transmutation': 'bg-green-600'
    };
    return colors[school as keyof typeof colors] || 'bg-slate-600';
  };

  const getSpellLevelName = (level: number) => {
    if (level === 0) return 'Cantrip';
    const ordinals = ['', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th'];
    return `${ordinals[level]} Level`;
  };

  if (!character) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="text-center py-8 text-slate-400">
          Create a character first to manage spells
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Spell Slots */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Spell Slots
              </CardTitle>
              <CardDescription className="text-slate-300">
                Track your available spell slots by level
              </CardDescription>
            </div>
            <Button onClick={longRest} variant="outline" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Long Rest
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-9 gap-4">
            {Object.entries(spellSlots).map(([level, slots]) => {
              if (slots.total === 0) return null;
              return (
                <div key={level} className="text-center p-3 bg-slate-700 rounded">
                  <div className="text-white font-medium mb-2">Level {level}</div>
                  <div className="text-2xl text-white mb-2">
                    {slots.total - slots.used}/{slots.total}
                  </div>
                  <div className="flex gap-1 justify-center mb-2">
                    {Array.from({ length: slots.total }, (_, i) => (
                      <div
                        key={i}
                        className={`w-3 h-3 rounded-full ${
                          i < slots.used ? 'bg-gray-500' : 'bg-blue-500'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => useSpellSlot(parseInt(level))}
                      disabled={slots.used >= slots.total}
                      className="text-xs px-2"
                    >
                      Use
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => restoreSpellSlot(parseInt(level))}
                      disabled={slots.used === 0}
                      className="text-xs px-2"
                    >
                      +
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search spells..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>
            <Select value={filterLevel} onValueChange={setFilterLevel}>
              <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(level => (
                  <SelectItem key={level} value={level.toString()}>{getSpellLevelName(level)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterSchool} onValueChange={setFilterSchool}>
              <SelectTrigger className="w-40 bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="School" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Schools</SelectItem>
                {schools.map(school => (
                  <SelectItem key={school} value={school}>{school}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Spell Lists */}
      <Tabs defaultValue="prepared" className="space-y-4">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="prepared">Prepared Spells ({knownSpells.filter(s => s.prepared).length})</TabsTrigger>
          <TabsTrigger value="cantrips">Cantrips ({cantrips.length})</TabsTrigger>
          <TabsTrigger value="all">All Known ({knownSpells.length})</TabsTrigger>
          <TabsTrigger value="spellbook">Spellbook</TabsTrigger>
        </TabsList>

        <TabsContent value="prepared">
          <SpellGrid 
            spells={knownSpells.filter(spell => spell.prepared)} 
            onCastSpell={useSpellSlot}
            spellSlots={spellSlots}
          />
        </TabsContent>

        <TabsContent value="cantrips">
          <SpellGrid 
            spells={cantrips} 
            onCastSpell={useSpellSlot}
            spellSlots={spellSlots}
            isCantrips={true}
          />
        </TabsContent>

        <TabsContent value="all">
          <SpellGrid 
            spells={filteredSpells} 
            onCastSpell={useSpellSlot}
            spellSlots={spellSlots}
          />
        </TabsContent>

        <TabsContent value="spellbook">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Spellbook & Spell Management
              </CardTitle>
              <CardDescription className="text-slate-300">
                Learn new spells and manage your spellbook
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-slate-400">
                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Spellbook management feature coming soon!</p>
                <p className="text-sm">This will allow you to learn new spells, manage prepared spells, and organize your spellbook.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SpellGrid({ 
  spells, 
  onCastSpell, 
  spellSlots, 
  isCantrips = false 
}: {
  spells: Spell[];
  onCastSpell: (level: number) => void;
  spellSlots: any;
  isCantrips?: boolean;
}) {
  const getSchoolColor = (school: string) => {
    const colors = {
      'Abjuration': 'bg-blue-600',
      'Conjuration': 'bg-yellow-600',
      'Divination': 'bg-purple-600',
      'Enchantment': 'bg-pink-600',
      'Evocation': 'bg-red-600',
      'Illusion': 'bg-indigo-600',
      'Necromancy': 'bg-gray-600',
      'Transmutation': 'bg-green-600'
    };
    return colors[school as keyof typeof colors] || 'bg-slate-600';
  };

  const getSpellLevelName = (level: number) => {
    if (level === 0) return 'Cantrip';
    const ordinals = ['', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th'];
    return `${ordinals[level]} Level`;
  };

  const canCastSpell = (level: number) => {
    if (level === 0) return true; // Cantrips can always be cast
    
    // Check if any spell slot of this level or higher is available
    for (let slotLevel = level; slotLevel <= 9; slotLevel++) {
      const slots = spellSlots[slotLevel];
      if (slots && slots.total > slots.used) {
        return true;
      }
    }
    return false;
  };

  if (spells.length === 0) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="text-center py-8 text-slate-400">
          No spells found
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {spells.map(spell => (
        <Card key={spell.id} className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between mb-2">
              <CardTitle className="text-white">{spell.name}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {getSpellLevelName(spell.level)}
                </Badge>
                <Badge className={`text-xs ${getSchoolColor(spell.school)}`}>
                  {spell.school}
                </Badge>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-1">
              {spell.ritual && <Badge variant="secondary" className="text-xs">Ritual</Badge>}
              {spell.concentration && <Badge variant="secondary" className="text-xs">Concentration</Badge>}
              {spell.prepared && <Badge variant="default" className="text-xs">Prepared</Badge>}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
              <div><span className="text-slate-400">Cast Time:</span> {spell.castingTime}</div>
              <div><span className="text-slate-400">Range:</span> {spell.range}</div>
              <div><span className="text-slate-400">Duration:</span> {spell.duration}</div>
              <div><span className="text-slate-400">Components:</span> {spell.components}</div>
            </div>

            {spell.damage && (
              <div className="text-sm">
                <span className="text-slate-400">Damage:</span> <span className="text-red-400">{spell.damage}</span>
              </div>
            )}

            {spell.saveType && (
              <div className="text-sm">
                <span className="text-slate-400">Save:</span> <span className="text-blue-400">{spell.saveType}</span>
              </div>
            )}

            <div className="text-slate-300 text-sm leading-relaxed max-h-20 overflow-y-auto">
              {spell.description}
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => onCastSpell(spell.level)}
                disabled={!canCastSpell(spell.level)}
                className="flex-1 flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Cast{!isCantrips && !canCastSpell(spell.level) ? ' (No Slots)' : ''}
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Target className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-white">{spell.name}</DialogTitle>
                    <DialogDescription className="text-slate-300">
                      {getSpellLevelName(spell.level)} {spell.school}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><strong className="text-white">Casting Time:</strong> {spell.castingTime}</div>
                      <div><strong className="text-white">Range:</strong> {spell.range}</div>
                      <div><strong className="text-white">Duration:</strong> {spell.duration}</div>
                      <div><strong className="text-white">Components:</strong> {spell.components}</div>
                    </div>
                    <div className="text-slate-300 leading-relaxed">
                      {spell.description}
                    </div>
                    {(spell.damage || spell.saveType) && (
                      <div className="p-3 bg-slate-700 rounded">
                        {spell.damage && <div><strong className="text-red-400">Damage:</strong> {spell.damage}</div>}
                        {spell.saveType && <div><strong className="text-blue-400">Saving Throw:</strong> {spell.saveType}</div>}
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}