import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Book, Search, Dice1, Sword, Shield, Sparkles, Users, Heart } from 'lucide-react';

export function RulesSection() {
  const [searchTerm, setSearchTerm] = useState('');

  const basicRules = [
    {
      title: "The Core Mechanic",
      icon: Dice1,
      content: "Most actions in D&D use a d20 roll. Roll a d20, add your ability modifier and proficiency bonus (if applicable), and compare to a Difficulty Class (DC) or Armor Class (AC)."
    },
    {
      title: "Ability Scores",
      icon: Users,
      content: "Six abilities define your character: Strength (STR), Dexterity (DEX), Constitution (CON), Intelligence (INT), Wisdom (WIS), and Charisma (CHA). Each has a modifier from -5 to +10."
    },
    {
      title: "Proficiency Bonus",
      icon: Shield,
      content: "Your proficiency bonus starts at +2 and increases as you level. Add it to ability checks, attack rolls, and saving throws you're proficient in."
    },
    {
      title: "Advantage and Disadvantage",
      icon: Dice1,
      content: "Advantage: Roll two d20s, use the higher result. Disadvantage: Roll two d20s, use the lower result. They cancel each other out."
    }
  ];

  const combatRules = [
    {
      title: "Initiative",
      content: "At the start of combat, everyone rolls a d20 + DEX modifier. Act in descending order of initiative."
    },
    {
      title: "Actions in Combat",
      content: "On your turn, you can take one Action, one Bonus Action (if available), one Reaction (if triggered), and move up to your speed."
    },
    {
      title: "Attack Rolls",
      content: "Roll d20 + ability modifier + proficiency bonus (if proficient). If the result equals or exceeds the target's AC, you hit."
    },
    {
      title: "Damage and Healing",
      content: "When you hit, roll damage dice and add modifiers. When you reach 0 HP, you're unconscious and must make death saving throws."
    },
    {
      title: "Critical Hits",
      content: "A natural 20 on an attack roll is a critical hit. Roll damage dice twice and add modifiers once."
    }
  ];

  const spellcastingRules = [
    {
      title: "Spell Slots",
      content: "Spellcasters have spell slots of different levels (1st-9th). Casting a spell expends a slot of that level or higher."
    },
    {
      title: "Cantrips",
      content: "0-level spells that can be cast at will without expending spell slots. They scale with character level."
    },
    {
      title: "Concentration",
      content: "Some spells require concentration. You can only concentrate on one spell at a time, and taking damage may break concentration."
    },
    {
      title: "Spell Attack Rolls",
      content: "Some spells require attack rolls: d20 + spellcasting ability modifier + proficiency bonus vs. target's AC."
    },
    {
      title: "Saving Throws",
      content: "Some spells force targets to make saving throws. DC = 8 + spellcasting ability modifier + proficiency bonus."
    }
  ];

  const conditions = [
    { name: "Blinded", effect: "Can't see, attack rolls have disadvantage, attacks against you have advantage" },
    { name: "Charmed", effect: "Can't attack the charmer, charmer has advantage on social interactions with you" },
    { name: "Deafened", effect: "Can't hear, automatically fail ability checks that require hearing" },
    { name: "Frightened", effect: "Disadvantage on ability checks and attack rolls while source of fear is within line of sight" },
    { name: "Grappled", effect: "Speed becomes 0, can't benefit from bonuses to speed" },
    { name: "Incapacitated", effect: "Can't take actions or reactions" },
    { name: "Invisible", effect: "Considered heavily obscured, attack rolls have advantage, attacks against you have disadvantage" },
    { name: "Paralyzed", effect: "Incapacitated, can't move or speak, fail STR and DEX saves, attacks have advantage and are critical hits if within 5 feet" },
    { name: "Poisoned", effect: "Disadvantage on attack rolls and ability checks" },
    { name: "Prone", effect: "Can only crawl, disadvantage on attack rolls, attacks have advantage if within 5 feet, disadvantage if ranged" },
    { name: "Restrained", effect: "Speed becomes 0, disadvantage on DEX saves, attacks against you have advantage" },
    { name: "Stunned", effect: "Incapacitated, can't move, can speak only falteringly, fail STR and DEX saves, attacks have advantage" },
    { name: "Unconscious", effect: "Incapacitated, can't move or speak, unaware of surroundings, drop what you're holding, fall prone" }
  ];

  const quickReference = [
    {
      category: "Common DCs",
      items: [
        "Very Easy: DC 5",
        "Easy: DC 10", 
        "Medium: DC 15",
        "Hard: DC 20",
        "Very Hard: DC 25",
        "Nearly Impossible: DC 30"
      ]
    },
    {
      category: "Movement",
      items: [
        "Walk: Normal speed",
        "Climb: Half speed",
        "Swim: Half speed",
        "Crawl: Half speed",
        "High Jump: 3 + STR mod feet",
        "Long Jump: STR score feet (with 10-foot run)"
      ]
    },
    {
      category: "Cover",
      items: [
        "Half Cover: +2 AC and DEX saves",
        "Three-Quarters Cover: +5 AC and DEX saves", 
        "Total Cover: Can't be targeted directly"
      ]
    }
  ];

  const gettingStarted = [
    {
      step: 1,
      title: "Create Your Character",
      description: "Choose a race, class, and background. Roll or assign ability scores. Calculate your character's starting hit points, AC, and other stats."
    },
    {
      step: 2,
      title: "Learn the Basics",
      description: "Understand how to make ability checks, attack rolls, and saving throws. Learn what each ability score represents."
    },
    {
      step: 3,
      title: "Understand Your Class",
      description: "Read your class features carefully. Learn what you can do in combat and what spells or abilities you have access to."
    },
    {
      step: 4,
      title: "Practice Combat",
      description: "Learn the initiative system, understand actions vs. bonus actions, and practice making attack rolls and calculating damage."
    },
    {
      step: 5,
      title: "Start Playing",
      description: "Join a group, listen to your DM, ask questions, and most importantly - have fun! D&D is about collaborative storytelling."
    }
  ];

  const filteredConditions = conditions.filter(condition =>
    condition.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    condition.effect.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-white flex items-center justify-center gap-2">
            <Book className="w-6 h-6" />
            D&D Rules Reference
          </CardTitle>
          <CardDescription className="text-slate-300">
            Complete guide to Dungeons & Dragons 5th Edition rules and mechanics
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Search */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search rules, conditions, spells..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-700 border-slate-600 text-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Main Rules Tabs */}
      <Tabs defaultValue="basics" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6 bg-slate-800 border-slate-700">
          <TabsTrigger value="basics" className="flex items-center gap-2">
            <Book className="w-4 h-4" />
            Basics
          </TabsTrigger>
          <TabsTrigger value="combat" className="flex items-center gap-2">
            <Sword className="w-4 h-4" />
            Combat
          </TabsTrigger>
          <TabsTrigger value="spells" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Spells
          </TabsTrigger>
          <TabsTrigger value="conditions" className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Conditions
          </TabsTrigger>
          <TabsTrigger value="reference" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Quick Ref
          </TabsTrigger>
          <TabsTrigger value="howto" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            How to Play
          </TabsTrigger>
        </TabsList>

        {/* Basic Rules */}
        <TabsContent value="basics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {basicRules.map((rule, index) => (
              <Card key={index} className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <rule.icon className="w-5 h-5" />
                    {rule.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300 leading-relaxed">{rule.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Combat Rules */}
        <TabsContent value="combat">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Combat Rules</CardTitle>
              <CardDescription className="text-slate-300">
                Essential rules for running combat encounters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="space-y-2">
                {combatRules.map((rule, index) => (
                  <AccordionItem key={index} value={`combat-${index}`} className="border-slate-600">
                    <AccordionTrigger className="text-white hover:text-slate-300">
                      {rule.title}
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-300">
                      {rule.content}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Spellcasting Rules */}
        <TabsContent value="spells">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Spellcasting Rules</CardTitle>
              <CardDescription className="text-slate-300">
                How magic works in D&D 5e
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="space-y-2">
                {spellcastingRules.map((rule, index) => (
                  <AccordionItem key={index} value={`spell-${index}`} className="border-slate-600">
                    <AccordionTrigger className="text-white hover:text-slate-300">
                      {rule.title}
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-300">
                      {rule.content}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conditions */}
        <TabsContent value="conditions">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Conditions</CardTitle>
              <CardDescription className="text-slate-300">
                Status effects that can affect characters and monsters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredConditions.map((condition, index) => (
                  <div key={index} className="p-4 bg-slate-700 rounded border-slate-600">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-white">{condition.name}</Badge>
                    </div>
                    <p className="text-slate-300 text-sm">{condition.effect}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quick Reference */}
        <TabsContent value="reference">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickReference.map((section, index) => (
              <Card key={index} className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">{section.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {section.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="text-slate-300 text-sm p-2 bg-slate-700 rounded">
                        {item}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* How to Play */}
        <TabsContent value="howto">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">How to Play D&D</CardTitle>
              <CardDescription className="text-slate-300">
                A beginner's guide to getting started with Dungeons & Dragons
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {gettingStarted.map((step, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      {step.step}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold mb-2">{step.title}</h3>
                      <p className="text-slate-300 leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-blue-900 rounded border-blue-700">
                <h3 className="text-blue-100 font-semibold mb-2">Remember: The Golden Rule</h3>
                <p className="text-blue-200">
                  The Dungeon Master (DM) has the final say on rules interpretations. 
                  When in doubt, the DM can make a ruling to keep the game flowing, 
                  and look up the exact rule later. The most important thing is that 
                  everyone has fun!
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}