import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Search, Plus, Sword, Shield, Heart, Zap, Eye } from 'lucide-react';

interface Monster {
  id: string;
  name: string;
  size: string;
  type: string;
  alignment: string;
  challengeRating: string;
  experiencePoints: number;
  armorClass: number;
  hitPoints: string;
  speed: string;
  abilities: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  skills?: string[];
  damageResistances?: string[];
  damageImmunities?: string[];
  conditionImmunities?: string[];
  senses: string;
  languages: string;
  actions: Action[];
  legendaryActions?: Action[];
  reactions?: Action[];
  description: string;
  environment: string[];
}

interface Action {
  name: string;
  description: string;
  attackBonus?: number;
  damage?: string;
  damageType?: string;
  range?: string;
  recharge?: string;
}

export function MonsterDatabase() {
  const [monsters] = useState<Monster[]>([
    {
      id: '1',
      name: 'Goblin',
      size: 'Small',
      type: 'humanoid (goblinoid)',
      alignment: 'neutral evil',
      challengeRating: '1/4',
      experiencePoints: 50,
      armorClass: 15,
      hitPoints: '2d6 (7)',
      speed: '30 ft.',
      abilities: {
        strength: 8,
        dexterity: 14,
        constitution: 10,
        intelligence: 10,
        wisdom: 8,
        charisma: 8
      },
      skills: ['Stealth +6'],
      senses: 'darkvision 60 ft., passive Perception 9',
      languages: 'Common, Goblin',
      actions: [
        {
          name: 'Scimitar',
          description: 'Melee Weapon Attack: +4 to hit, reach 5 ft., one target.',
          attackBonus: 4,
          damage: '1d6 + 2',
          damageType: 'slashing'
        },
        {
          name: 'Shortbow',
          description: 'Ranged Weapon Attack: +4 to hit, range 80/320 ft., one target.',
          attackBonus: 4,
          damage: '1d6 + 2',
          damageType: 'piercing',
          range: '80/320 ft.'
        }
      ],
      description: 'Goblins are small, black-hearted humanoids that lair in despoiled dungeons and other dismal settings.',
      environment: ['Forest', 'Hills', 'Underdark']
    },
    {
      id: '2',
      name: 'Orc',
      size: 'Medium',
      type: 'humanoid (orc)',
      alignment: 'chaotic evil',
      challengeRating: '1/2',
      experiencePoints: 100,
      armorClass: 13,
      hitPoints: '2d8 + 6 (15)',
      speed: '30 ft.',
      abilities: {
        strength: 16,
        dexterity: 12,
        constitution: 16,
        intelligence: 7,
        wisdom: 11,
        charisma: 10
      },
      skills: ['Intimidation +2'],
      senses: 'darkvision 60 ft., passive Perception 10',
      languages: 'Common, Orc',
      actions: [
        {
          name: 'Greataxe',
          description: 'Melee Weapon Attack: +5 to hit, reach 5 ft., one target.',
          attackBonus: 5,
          damage: '1d12 + 3',
          damageType: 'slashing'
        },
        {
          name: 'Javelin',
          description: 'Melee or Ranged Weapon Attack: +5 to hit, reach 5 ft. or range 30/120 ft., one target.',
          attackBonus: 5,
          damage: '1d6 + 3',
          damageType: 'piercing',
          range: '30/120 ft.'
        }
      ],
      description: 'Orcs are savage raiders and pillagers with stooped postures, low foreheads, and piggish faces.',
      environment: ['Arctic', 'Forest', 'Grassland', 'Hills', 'Mountains', 'Swamp', 'Underdark']
    },
    {
      id: '3',
      name: 'Dragon, Adult Red',
      size: 'Huge',
      type: 'dragon',
      alignment: 'chaotic evil',
      challengeRating: '17',
      experiencePoints: 18000,
      armorClass: 19,
      hitPoints: '17d12 + 85 (256)',
      speed: '40 ft., climb 40 ft., fly 80 ft.',
      abilities: {
        strength: 27,
        dexterity: 10,
        constitution: 21,
        intelligence: 14,
        wisdom: 13,
        charisma: 21
      },
      skills: ['Intimidation +16', 'Perception +13', 'Stealth +6'],
      damageImmunities: ['fire'],
      senses: 'blindsight 60 ft., darkvision 120 ft., passive Perception 23',
      languages: 'Common, Draconic',
      actions: [
        {
          name: 'Multiattack',
          description: 'The dragon can use its Frightful Presence. It then makes three attacks: one with its bite and two with its claws.'
        },
        {
          name: 'Bite',
          description: 'Melee Weapon Attack: +14 to hit, reach 10 ft., one target.',
          attackBonus: 14,
          damage: '2d10 + 8',
          damageType: 'piercing'
        },
        {
          name: 'Fire Breath',
          description: 'The dragon exhales fire in a 60-foot cone. Each creature in that area must make a DC 21 Dexterity saving throw, taking 63 (18d6) fire damage on a failed save, or half as much damage on a successful one.',
          damage: '18d6',
          damageType: 'fire',
          recharge: '5-6'
        }
      ],
      legendaryActions: [
        {
          name: 'Detect',
          description: 'The dragon makes a Wisdom (Perception) check.'
        },
        {
          name: 'Tail Attack',
          description: 'The dragon makes a tail attack.'
        },
        {
          name: 'Wing Attack (Costs 2 Actions)',
          description: 'The dragon beats its wings. Each creature within 10 feet of the dragon must succeed on a DC 22 Dexterity saving throw or take 15 (2d6 + 8) bludgeoning damage and be knocked prone.'
        }
      ],
      description: 'The most covetous of the true dragons, red dragons tirelessly seek to increase their treasure hoards.',
      environment: ['Hills', 'Mountains']
    },
    {
      id: '4',
      name: 'Owlbear',
      size: 'Large',
      type: 'monstrosity',
      alignment: 'unaligned',
      challengeRating: '3',
      experiencePoints: 700,
      armorClass: 13,
      hitPoints: '7d10 + 21 (59)',
      speed: '40 ft.',
      abilities: {
        strength: 20,
        dexterity: 12,
        constitution: 17,
        intelligence: 3,
        wisdom: 12,
        charisma: 7
      },
      skills: ['Perception +3'],
      senses: 'darkvision 60 ft., passive Perception 13',
      languages: '—',
      actions: [
        {
          name: 'Multiattack',
          description: 'The owlbear makes two attacks: one with its beak and one with its claws.'
        },
        {
          name: 'Beak',
          description: 'Melee Weapon Attack: +7 to hit, reach 5 ft., one creature.',
          attackBonus: 7,
          damage: '1d10 + 5',
          damageType: 'piercing'
        },
        {
          name: 'Claws',
          description: 'Melee Weapon Attack: +7 to hit, reach 5 ft., one target.',
          attackBonus: 7,
          damage: '2d8 + 5',
          damageType: 'slashing'
        }
      ],
      description: 'An owlbear\'s reputation for ferocity and aggression makes it one of the most feared predators of the wild.',
      environment: ['Forest']
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCR, setFilterCR] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterEnvironment, setFilterEnvironment] = useState('all');

  const challengeRatings = ['0', '1/8', '1/4', '1/2', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30'];
  
  const monsterTypes = ['aberration', 'beast', 'celestial', 'construct', 'dragon', 'elemental', 'fey', 'fiend', 'giant', 'humanoid', 'monstrosity', 'ooze', 'plant', 'undead'];
  
  const environments = ['Arctic', 'Coast', 'Desert', 'Forest', 'Grassland', 'Hills', 'Mountains', 'Swamp', 'Underdark', 'Underwater', 'Urban'];

  const getModifier = (score: number) => {
    return Math.floor((score - 10) / 2);
  };

  const getModifierString = (score: number) => {
    const mod = getModifier(score);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  const filteredMonsters = monsters.filter(monster => {
    const matchesSearch = monster.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         monster.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCR = filterCR === 'all' || monster.challengeRating === filterCR;
    const matchesType = filterType === 'all' || monster.type.toLowerCase().includes(filterType);
    const matchesEnvironment = filterEnvironment === 'all' || monster.environment.includes(filterEnvironment);
    
    return matchesSearch && matchesCR && matchesType && matchesEnvironment;
  });

  const getCRColor = (cr: string) => {
    const crNum = cr.includes('/') ? parseFloat(cr.split('/')[0]) / parseFloat(cr.split('/')[1]) : parseFloat(cr);
    if (crNum < 1) return 'bg-green-600';
    if (crNum < 5) return 'bg-yellow-600';
    if (crNum < 10) return 'bg-orange-600';
    if (crNum < 20) return 'bg-red-600';
    return 'bg-purple-600';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Search and Filters */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sword className="w-5 h-5" />
            Monster Database
          </CardTitle>
          <CardDescription className="text-slate-300">
            Browse and search D&D monsters for your encounters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search monsters..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>
            
            <Select value={filterCR} onValueChange={setFilterCR}>
              <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="CR" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All CR</SelectItem>
                {challengeRatings.map(cr => (
                  <SelectItem key={cr} value={cr}>CR {cr}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-36 bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {monsterTypes.map(type => (
                  <SelectItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterEnvironment} onValueChange={setFilterEnvironment}>
              <SelectTrigger className="w-36 bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Environment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Environments</SelectItem>
                {environments.map(env => (
                  <SelectItem key={env} value={env}>{env}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Monster Results */}
      <div className="text-slate-300 mb-4">
        Found {filteredMonsters.length} monster{filteredMonsters.length !== 1 ? 's' : ''}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMonsters.map(monster => (
          <Card key={monster.id} className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-white">{monster.name}</CardTitle>
                <Badge className={`${getCRColor(monster.challengeRating)} text-white`}>
                  CR {monster.challengeRating}
                </Badge>
              </div>
              <div className="text-slate-300 text-sm">
                {monster.size} {monster.type}, {monster.alignment}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="text-center p-2 bg-slate-700 rounded">
                  <div className="text-slate-400">AC</div>
                  <div className="text-white font-bold">{monster.armorClass}</div>
                </div>
                <div className="text-center p-2 bg-slate-700 rounded">
                  <div className="text-slate-400">HP</div>
                  <div className="text-white font-bold">{monster.hitPoints}</div>
                </div>
                <div className="text-center p-2 bg-slate-700 rounded">
                  <div className="text-slate-400">Speed</div>
                  <div className="text-white font-bold text-xs">{monster.speed}</div>
                </div>
              </div>

              <div className="text-slate-300 text-sm leading-relaxed max-h-16 overflow-y-auto">
                {monster.description}
              </div>

              {monster.environment.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {monster.environment.slice(0, 3).map(env => (
                    <Badge key={env} variant="outline" className="text-xs">
                      {env}
                    </Badge>
                  ))}
                  {monster.environment.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{monster.environment.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <Eye className="w-4 h-4 mr-2" />
                    View Full Stats
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-800 border-slate-700 max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-white">{monster.name}</DialogTitle>
                    <DialogDescription className="text-slate-300">
                      {monster.size} {monster.type}, {monster.alignment}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <MonsterStatBlock monster={monster} />
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMonsters.length === 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="text-center py-8 text-slate-400">
            No monsters found matching your criteria
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function MonsterStatBlock({ monster }: { monster: Monster }) {
  const getModifier = (score: number) => {
    return Math.floor((score - 10) / 2);
  };

  const getModifierString = (score: number) => {
    const mod = getModifier(score);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  return (
    <div className="space-y-4">
      {/* Basic Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-slate-700 rounded">
          <div className="text-slate-400">Armor Class</div>
          <div className="text-white text-xl font-bold">{monster.armorClass}</div>
        </div>
        <div className="text-center p-3 bg-slate-700 rounded">
          <div className="text-slate-400">Hit Points</div>
          <div className="text-white text-xl font-bold">{monster.hitPoints}</div>
        </div>
        <div className="text-center p-3 bg-slate-700 rounded">
          <div className="text-slate-400">Speed</div>
          <div className="text-white font-bold">{monster.speed}</div>
        </div>
      </div>

      {/* Ability Scores */}
      <div>
        <h4 className="text-white font-semibold mb-2">Ability Scores</h4>
        <div className="grid grid-cols-6 gap-2">
          {Object.entries(monster.abilities).map(([ability, score]) => (
            <div key={ability} className="text-center p-2 bg-slate-700 rounded">
              <div className="text-slate-400 text-xs uppercase">{ability.slice(0, 3)}</div>
              <div className="text-white font-bold">{score}</div>
              <div className="text-slate-300 text-sm">{getModifierString(score)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Skills and Resistances */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {monster.skills && (
          <div>
            <h4 className="text-white font-semibold mb-1">Skills</h4>
            <div className="text-slate-300 text-sm">{monster.skills.join(', ')}</div>
          </div>
        )}
        
        {monster.damageResistances && (
          <div>
            <h4 className="text-white font-semibold mb-1">Damage Resistances</h4>
            <div className="text-slate-300 text-sm">{monster.damageResistances.join(', ')}</div>
          </div>
        )}
        
        {monster.damageImmunities && (
          <div>
            <h4 className="text-white font-semibold mb-1">Damage Immunities</h4>
            <div className="text-slate-300 text-sm">{monster.damageImmunities.join(', ')}</div>
          </div>
        )}

        <div>
          <h4 className="text-white font-semibold mb-1">Senses</h4>
          <div className="text-slate-300 text-sm">{monster.senses}</div>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-1">Languages</h4>
          <div className="text-slate-300 text-sm">{monster.languages}</div>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-1">Challenge</h4>
          <div className="text-slate-300 text-sm">
            {monster.challengeRating} ({monster.experiencePoints.toLocaleString()} XP)
          </div>
        </div>
      </div>

      {/* Actions */}
      <div>
        <h4 className="text-white font-semibold mb-2">Actions</h4>
        <div className="space-y-2">
          {monster.actions.map((action, index) => (
            <div key={index} className="p-3 bg-slate-700 rounded">
              <div className="text-white font-medium mb-1">{action.name}</div>
              <div className="text-slate-300 text-sm">{action.description}</div>
              {action.damage && (
                <div className="text-red-400 text-sm mt-1">
                  Damage: {action.damage} {action.damageType}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Legendary Actions */}
      {monster.legendaryActions && (
        <div>
          <h4 className="text-white font-semibold mb-2">Legendary Actions</h4>
          <div className="space-y-2">
            {monster.legendaryActions.map((action, index) => (
              <div key={index} className="p-3 bg-slate-700 rounded">
                <div className="text-white font-medium mb-1">{action.name}</div>
                <div className="text-slate-300 text-sm">{action.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}