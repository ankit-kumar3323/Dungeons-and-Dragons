import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Checkbox } from './ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { MapPin, Grid3X3, Ruler, Move, Eye, EyeOff, Save, Upload, Download, Settings, Palette, Layers, Zap, Shield, Sword, Crown, Users, Plus, Trash2, Copy, RotateCcw, ZoomIn, ZoomOut, Hand, Crosshair, Brush } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Token {
  id: string;
  name: string;
  type: 'player' | 'npc' | 'monster' | 'object';
  x: number;
  y: number;
  size: 'tiny' | 'small' | 'medium' | 'large' | 'huge' | 'gargantuan';
  color: string;
  image?: string;
  hitPoints?: number;
  maxHitPoints?: number;
  armorClass?: number;
  initiative?: number;
  conditions: string[];
  visible: boolean;
  notes?: string;
  rotation: number;
  elevation: number;
  aura?: {
    radius: number;
    color: string;
    type: 'emanation' | 'aura' | 'light';
  };
}

interface TerrainCell {
  x: number;
  y: number;
  type: 'normal' | 'wall' | 'difficult' | 'water' | 'lava' | 'pit' | 'door' | 'pillar' | 'tree' | 'rubble' | 'ice' | 'sand' | 'mud' | 'bridge' | 'stairs' | 'trap' | 'secret_door' | 'chest' | 'altar' | 'statue';
  passable: boolean;
  elevation: number;
  rotation: number;
  metadata?: Record<string, any>;
}

interface MapTemplate {
  id: string;
  name: string;
  category: string;
  width: number;
  height: number;
  terrain: TerrainCell[];
  tokens: Token[];
  description: string;
  tags: string[];
  backgroundImage?: string;
  lighting: 'bright' | 'dim' | 'dark' | 'magical';
  weatherEffects: string[];
  ambientSounds?: string;
}

interface MapLayer {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  tokens: Token[];
  terrain: TerrainCell[];
}

interface AdvancedBattleMapProps {
  isGameMaster: boolean;
}

export function AdvancedBattleMap({ isGameMaster }: AdvancedBattleMapProps) {
  // Canvas and display state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mapWidth, setMapWidth] = useState(25);
  const [mapHeight, setMapHeight] = useState(20);
  const [gridSize, setGridSize] = useState(40);
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [showGrid, setShowGrid] = useState(true);
  const [showCoordinates, setShowCoordinates] = useState(false);
  const [showDistances, setShowDistances] = useState(false);
  const [gridColor, setGridColor] = useState('#d4af37');
  const [gridOpacity, setGridOpacity] = useState(0.3);

  // Tool state
  const [activeTool, setActiveTool] = useState<'select' | 'move' | 'terrain' | 'token' | 'measure' | 'pan' | 'brush'>('select');
  const [selectedTerrain, setSelectedTerrain] = useState<TerrainCell['type']>('wall');
  const [brushSize, setBrushSize] = useState(1);

  // Selection and editing state
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
  const [draggedToken, setDraggedToken] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isMultiSelect, setIsMultiSelect] = useState(false);

  // Map data and layers
  const [terrain, setTerrain] = useState<TerrainCell[]>([]);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [layers, setLayers] = useState<MapLayer[]>([
    { id: 'base', name: 'Base Layer', visible: true, opacity: 1, tokens: [], terrain: [] },
    { id: 'objects', name: 'Objects', visible: true, opacity: 1, tokens: [], terrain: [] },
    { id: 'characters', name: 'Characters', visible: true, opacity: 1, tokens: [], terrain: [] },
    { id: 'effects', name: 'Effects', visible: true, opacity: 0.8, tokens: [], terrain: [] }
  ]);
  const [activeLayer, setActiveLayer] = useState('characters');

  // Template and customization state
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [templateCategory, setTemplateCategory] = useState<string>('all');
  const [customMapName, setCustomMapName] = useState('');
  const [mapNotes, setMapNotes] = useState('');
  const [backgroundImage, setBackgroundImage] = useState<string>('');
  const [mapLighting, setMapLighting] = useState<'bright' | 'dim' | 'dark' | 'magical'>('bright');

  // Advanced features
  const [fogOfWar, setFogOfWar] = useState<boolean[][]>([]);
  const [lineOfSight, setLineOfSight] = useState(true);
  const [dynamicLighting, setDynamicLighting] = useState(false);
  const [weatherEffects, setWeatherEffects] = useState<string[]>([]);
  const [ambientSounds, setAmbientSounds] = useState('');

  const tokenSizes = {
    tiny: 0.5,
    small: 0.75,
    medium: 1,
    large: 2,
    huge: 3,
    gargantuan: 4
  };

  const terrainTypes = [
    { type: 'normal', name: 'Clear', icon: '🧹', color: '#2d3748', passable: true },
    { type: 'wall', name: 'Wall', icon: '🧱', color: '#4a5568', passable: false },
    { type: 'door', name: 'Door', icon: '🚪', color: '#d69e2e', passable: true },
    { type: 'secret_door', name: 'Secret Door', icon: '🔒', color: '#805ad5', passable: true },
    { type: 'pillar', name: 'Pillar', icon: '🏛️', color: '#a0aec0', passable: false },
    { type: 'tree', name: 'Tree', icon: '🌳', color: '#48bb78', passable: false },
    { type: 'difficult', name: 'Brush', icon: '🌿', color: '#68d391', passable: true },
    { type: 'water', name: 'Water', icon: '💧', color: '#4299e1', passable: true },
    { type: 'lava', name: 'Lava', icon: '🌋', color: '#fc8181', passable: true },
    { type: 'ice', name: 'Ice', icon: '🧊', color: '#bee3f8', passable: true },
    { type: 'pit', name: 'Pit', icon: '🕳️', color: '#1a202c', passable: false },
    { type: 'bridge', name: 'Bridge', icon: '🌉', color: '#d69e2e', passable: true },
    { type: 'stairs', name: 'Stairs', icon: '🪜', color: '#a0aec0', passable: true },
    { type: 'rubble', name: 'Rubble', icon: '🪨', color: '#718096', passable: true },
    { type: 'sand', name: 'Sand', icon: '🏖️', color: '#f6e05e', passable: true },
    { type: 'mud', name: 'Mud', icon: '🟫', color: '#8b4513', passable: true },
    { type: 'trap', name: 'Trap', icon: '⚠️', color: '#fc8181', passable: true },
    { type: 'chest', name: 'Chest', icon: '📦', color: '#d69e2e', passable: false },
    { type: 'altar', name: 'Altar', icon: '⛪', color: '#b794f6', passable: false },
    { type: 'statue', name: 'Statue', icon: '🗿', color: '#a0aec0', passable: false }
  ];

  // Comprehensive map templates
  const mapTemplates: MapTemplate[] = [
    {
      id: 'classic_dungeon',
      name: 'Classic Dungeon Room',
      category: 'dungeon',
      width: 20,
      height: 15,
      description: 'A traditional stone dungeon chamber with pillars and multiple entrances',
      tags: ['dungeon', 'indoor', 'stone', 'classic'],
      lighting: 'dim',
      weatherEffects: [],
      terrain: [
        // Outer walls
        ...Array.from({ length: 20 }, (_, x) => ({ x, y: 0, type: 'wall' as const, passable: false, elevation: 0, rotation: 0 })),
        ...Array.from({ length: 20 }, (_, x) => ({ x, y: 14, type: 'wall' as const, passable: false, elevation: 0, rotation: 0 })),
        ...Array.from({ length: 15 }, (_, y) => ({ x: 0, y, type: 'wall' as const, passable: false, elevation: 0, rotation: 0 })),
        ...Array.from({ length: 15 }, (_, y) => ({ x: 19, y, type: 'wall' as const, passable: false, elevation: 0, rotation: 0 })),
        // Doors
        { x: 9, y: 0, type: 'door' as const, passable: true, elevation: 0, rotation: 0 },
        { x: 19, y: 7, type: 'door' as const, passable: true, elevation: 0, rotation: 90 },
        { x: 5, y: 14, type: 'secret_door' as const, passable: true, elevation: 0, rotation: 0 },
        // Pillars in decorative pattern
        { x: 5, y: 4, type: 'pillar' as const, passable: false, elevation: 0, rotation: 0 },
        { x: 14, y: 4, type: 'pillar' as const, passable: false, elevation: 0, rotation: 0 },
        { x: 5, y: 10, type: 'pillar' as const, passable: false, elevation: 0, rotation: 0 },
        { x: 14, y: 10, type: 'pillar' as const, passable: false, elevation: 0, rotation: 0 },
        // Furniture
        { x: 3, y: 3, type: 'chest' as const, passable: false, elevation: 0, rotation: 0 },
        { x: 16, y: 11, type: 'altar' as const, passable: false, elevation: 0, rotation: 0 }
      ],
      tokens: []
    },
    {
      id: 'forest_encounter',
      name: 'Deep Forest Encounter',
      category: 'outdoor',
      width: 30,
      height: 25,
      description: 'Dense woodland with clearings, streams, and natural obstacles',
      tags: ['forest', 'outdoor', 'nature', 'wilderness'],
      lighting: 'dim',
      weatherEffects: ['light_rain'],
      terrain: [
        // Dense forest border
        ...Array.from({ length: 30 }, (_, x) => [0, 1, 23, 24].map(y => ({ x, y, type: 'tree' as const, passable: false, elevation: 0, rotation: 0 }))).flat(),
        ...Array.from({ length: 25 }, (_, y) => [0, 1, 28, 29].map(x => ({ x, y, type: 'tree' as const, passable: false, elevation: 0, rotation: 0 }))).flat(),
        // Scattered trees in main area
        ...Array.from({ length: 25 }, (_, i) => {
          const x = 3 + Math.floor(Math.random() * 24);
          const y = 3 + Math.floor(Math.random() * 19);
          return { x, y, type: 'tree' as const, passable: false, elevation: 0, rotation: 0 };
        }),
        // Undergrowth patches
        ...Array.from({ length: 40 }, (_, i) => {
          const x = 2 + Math.floor(Math.random() * 26);
          const y = 2 + Math.floor(Math.random() * 21);
          return { x, y, type: 'difficult' as const, passable: true, elevation: 0, rotation: 0 };
        }),
        // Winding stream
        ...Array.from({ length: 20 }, (_, i) => {
          const x = 5 + Math.floor(i * 1.2) + Math.floor(Math.sin(i * 0.5) * 2);
          const y = 8 + Math.floor(Math.sin(i * 0.3) * 3);
          return { x, y, type: 'water' as const, passable: true, elevation: -1, rotation: 0 };
        }),
        // Bridge crossing
        { x: 15, y: 10, type: 'bridge' as const, passable: true, elevation: 0, rotation: 0 },
        { x: 16, y: 10, type: 'bridge' as const, passable: true, elevation: 0, rotation: 0 },
        // Hidden ruins
        { x: 22, y: 5, type: 'statue' as const, passable: false, elevation: 0, rotation: 0 },
        { x: 24, y: 7, type: 'rubble' as const, passable: true, elevation: 0, rotation: 0 }
      ],
      tokens: []
    },
    {
      id: 'tavern_brawl',
      name: 'The Prancing Pony Tavern',
      category: 'settlement',
      width: 22,
      height: 16,
      description: 'A bustling tavern interior with tables, bar, and fireplace - perfect for social encounters or brawls',
      tags: ['tavern', 'indoor', 'social', 'urban'],
      lighting: 'bright',
      weatherEffects: [],
      terrain: [
        // Outer walls
        ...Array.from({ length: 22 }, (_, x) => ({ x, y: 0, type: 'wall' as const, passable: false, elevation: 0, rotation: 0 })),
        ...Array.from({ length: 22 }, (_, x) => ({ x, y: 15, type: 'wall' as const, passable: false, elevation: 0, rotation: 0 })),
        ...Array.from({ length: 16 }, (_, y) => ({ x: 0, y, type: 'wall' as const, passable: false, elevation: 0, rotation: 0 })),
        ...Array.from({ length: 16 }, (_, y) => ({ x: 21, y, type: 'wall' as const, passable: false, elevation: 0, rotation: 0 })),
        // Main entrance
        { x: 10, y: 0, type: 'door' as const, passable: true, elevation: 0, rotation: 0 },
        { x: 11, y: 0, type: 'door' as const, passable: true, elevation: 0, rotation: 0 },
        // Back entrance
        { x: 20, y: 8, type: 'door' as const, passable: true, elevation: 0, rotation: 90 },
        // Bar counter (L-shaped)
        ...Array.from({ length: 8 }, (_, i) => ({ x: 2 + i, y: 13, type: 'wall' as const, passable: false, elevation: 0, rotation: 0 })),
        ...Array.from({ length: 3 }, (_, i) => ({ x: 9, y: 11 + i, type: 'wall' as const, passable: false, elevation: 0, rotation: 0 })),
        // Tables (difficult terrain represents furniture)
        { x: 4, y: 4, type: 'difficult' as const, passable: true, elevation: 0, rotation: 0 },
        { x: 5, y: 4, type: 'difficult' as const, passable: true, elevation: 0, rotation: 0 },
        { x: 8, y: 4, type: 'difficult' as const, passable: true, elevation: 0, rotation: 0 },
        { x: 9, y: 4, type: 'difficult' as const, passable: true, elevation: 0, rotation: 0 },
        { x: 13, y: 4, type: 'difficult' as const, passable: true, elevation: 0, rotation: 0 },
        { x: 14, y: 4, type: 'difficult' as const, passable: true, elevation: 0, rotation: 0 },
        { x: 17, y: 4, type: 'difficult' as const, passable: true, elevation: 0, rotation: 0 },
        { x: 18, y: 4, type: 'difficult' as const, passable: true, elevation: 0, rotation: 0 },
        { x: 4, y: 8, type: 'difficult' as const, passable: true, elevation: 0, rotation: 0 },
        { x: 5, y: 8, type: 'difficult' as const, passable: true, elevation: 0, rotation: 0 },
        { x: 13, y: 8, type: 'difficult' as const, passable: true, elevation: 0, rotation: 0 },
        { x: 14, y: 8, type: 'difficult' as const, passable: true, elevation: 0, rotation: 0 },
        { x: 17, y: 8, type: 'difficult' as const, passable: true, elevation: 0, rotation: 0 },
        { x: 18, y: 8, type: 'difficult' as const, passable: true, elevation: 0, rotation: 0 },
        // Fireplace
        { x: 1, y: 7, type: 'altar' as const, passable: false, elevation: 0, rotation: 0 },
        { x: 1, y: 8, type: 'altar' as const, passable: false, elevation: 0, rotation: 0 },
        // Stairs to upper level
        { x: 19, y: 13, type: 'stairs' as const, passable: true, elevation: 0, rotation: 0 }
      ],
      tokens: []
    },
    {
      id: 'dragon_lair',
      name: 'Ancient Dragon\'s Lair',
      category: 'dungeon',
      width: 35,
      height: 28,
      description: 'A massive cavern lair with treasure hoard, lava pools, and treacherous terrain',
      tags: ['dragon', 'lair', 'treasure', 'dangerous', 'boss'],
      lighting: 'dark',
      weatherEffects: ['extreme_heat'],
      terrain: [
        // Cavern walls (irregular shape)
        ...Array.from({ length: 35 }, (_, x) => [0, 1, 26, 27].map(y => ({ x, y, type: 'wall' as const, passable: false, elevation: 0, rotation: 0 }))).flat(),
        ...Array.from({ length: 28 }, (_, y) => [0, 1, 33, 34].map(x => ({ x, y, type: 'wall' as const, passable: false, elevation: 0, rotation: 0 }))).flat(),
        // Inner cavern shaping
        ...Array.from({ length: 10 }, (_, i) => [
          { x: 2 + i, y: 2, type: 'wall' as const, passable: false, elevation: 0, rotation: 0 },
          { x: 23 + i, y: 2, type: 'wall' as const, passable: false, elevation: 0, rotation: 0 },
          { x: 2 + i, y: 25, type: 'wall' as const, passable: false, elevation: 0, rotation: 0 },
          { x: 23 + i, y: 25, type: 'wall' as const, passable: false, elevation: 0, rotation: 0 }
        ]).flat(),
        // Lava pools and channels
        ...Array.from({ length: 8 }, (_, i) => ({ x: 5 + i, y: 20, type: 'lava' as const, passable: true, elevation: -1, rotation: 0 })),
        ...Array.from({ length: 6 }, (_, i) => ({ x: 25 + i, y: 8 + i, type: 'lava' as const, passable: true, elevation: -1, rotation: 0 })),
        ...Array.from({ length: 4 }, (_, i) => Array.from({ length: 4 }, (_, j) => ({ x: 8 + i, y: 6 + j, type: 'lava' as const, passable: true, elevation: -1, rotation: 0 }))).flat(),
        // Treasure hoard area (center-back)
        ...Array.from({ length: 6 }, (_, i) => Array.from({ length: 4 }, (_, j) => ({ x: 14 + i, y: 22 + j, type: 'difficult' as const, passable: true, elevation: 0, rotation: 0 }))).flat(),
        // Treasure chests
        { x: 16, y: 24, type: 'chest' as const, passable: false, elevation: 0, rotation: 0 },
        { x: 18, y: 23, type: 'chest' as const, passable: false, elevation: 0, rotation: 0 },
        // Stalagmites and pillars
        { x: 8, y: 12, type: 'pillar' as const, passable: false, elevation: 0, rotation: 0 },
        { x: 12, y: 8, type: 'pillar' as const, passable: false, elevation: 0, rotation: 0 },
        { x: 20, y: 15, type: 'pillar' as const, passable: false, elevation: 0, rotation: 0 },
        { x: 25, y: 18, type: 'pillar' as const, passable: false, elevation: 0, rotation: 0 },
        // Rubble and difficult terrain
        ...Array.from({ length: 15 }, (_, i) => {
          const x = 3 + Math.floor(Math.random() * 29);
          const y = 3 + Math.floor(Math.random() * 20);
          return { x, y, type: 'rubble' as const, passable: true, elevation: 0, rotation: 0 };
        }),
        // Entrance tunnel
        { x: 17, y: 1, type: 'normal' as const, passable: true, elevation: 0, rotation: 0 }
      ],
      tokens: [
        {
          id: 'ancient_red_dragon',
          name: 'Ancient Red Dragon',
          type: 'monster',
          x: 17,
          y: 20,
          size: 'gargantuan',
          color: '#dc2626',
          hitPoints: 546,
          maxHitPoints: 546,
          armorClass: 22,
          conditions: [],
          visible: true,
          notes: 'Legendary creature with lair actions',
          rotation: 0,
          elevation: 0,
          aura: { radius: 3, color: '#dc2626', type: 'aura' }
        }
      ]
    },
    {
      id: 'wizard_tower',
      name: 'Arcane Tower Library',
      category: 'dungeon',
      width: 18,
      height: 18,
      description: 'Circular tower room filled with magical tomes, arcane circles, and mystical apparatus',
      tags: ['wizard', 'magic', 'tower', 'library', 'arcane'],
      lighting: 'magical',
      weatherEffects: ['magical_aura'],
      terrain: [
        // Circular outer walls
        ...Array.from({ length: 18 }, (_, i) => {
          const angle = (i / 18) * 2 * Math.PI;
          const x = Math.round(9 + 8 * Math.cos(angle));
          const y = Math.round(9 + 8 * Math.sin(angle));
          return { x, y, type: 'wall' as const, passable: false, elevation: 0, rotation: 0 };
        }),
        // Tower door
        { x: 9, y: 1, type: 'door' as const, passable: true, elevation: 0, rotation: 0 },
        // Central magic circle
        ...Array.from({ length: 8 }, (_, i) => {
          const angle = (i / 8) * 2 * Math.PI;
          const x = Math.round(9 + 2 * Math.cos(angle));
          const y = Math.round(9 + 2 * Math.sin(angle));
          return { x, y, type: 'difficult' as const, passable: true, elevation: 0, rotation: 0 };
        }),
        // Bookshelves around the walls
        { x: 5, y: 4, type: 'wall' as const, passable: false, elevation: 0, rotation: 0 },
        { x: 13, y: 4, type: 'wall' as const, passable: false, elevation: 0, rotation: 0 },
        { x: 4, y: 9, type: 'wall' as const, passable: false, elevation: 0, rotation: 0 },
        { x: 14, y: 9, type: 'wall' as const, passable: false, elevation: 0, rotation: 0 },
        { x: 5, y: 14, type: 'wall' as const, passable: false, elevation: 0, rotation: 0 },
        { x: 13, y: 14, type: 'wall' as const, passable: false, elevation: 0, rotation: 0 },
        // Magical apparatus
        { x: 6, y: 6, type: 'altar' as const, passable: false, elevation: 0, rotation: 0 },
        { x: 12, y: 12, type: 'altar' as const, passable: false, elevation: 0, rotation: 0 },
        // Spiral stairs up
        { x: 15, y: 15, type: 'stairs' as const, passable: true, elevation: 0, rotation: 0 }
      ],
      tokens: []
    },
    {
      id: 'pirate_ship',
      name: 'Pirate Ship Deck',
      category: 'vehicle',
      width: 28,
      height: 12,
      description: 'The deck of a pirate galleon with masts, rigging, and cannons ready for naval combat',
      tags: ['ship', 'pirate', 'naval', 'vehicle', 'combat'],
      lighting: 'bright',
      weatherEffects: ['ocean_spray'],
      terrain: [
        // Ship hull outline
        ...Array.from({ length: 28 }, (_, x) => ({ x, y: 0, type: 'wall' as const, passable: false, elevation: 0, rotation: 0 })),
        ...Array.from({ length: 28 }, (_, x) => ({ x, y: 11, type: 'wall' as const, passable: false, elevation: 0, rotation: 0 })),
        // Bow and stern shaping
        { x: 0, y: 1, type: 'wall' as const, passable: false, elevation: 0, rotation: 0 },
        { x: 0, y: 2, type: 'wall' as const, passable: false, elevation: 0, rotation: 0 },
        { x: 0, y: 9, type: 'wall' as const, passable: false, elevation: 0, rotation: 0 },
        { x: 0, y: 10, type: 'wall' as const, passable: false, elevation: 0, rotation: 0 },
        { x: 27, y: 1, type: 'wall' as const, passable: false, elevation: 0, rotation: 0 },
        { x: 27, y: 2, type: 'wall' as const, passable: false, elevation: 0, rotation: 0 },
        { x: 27, y: 9, type: 'wall' as const, passable: false, elevation: 0, rotation: 0 },
        { x: 27, y: 10, type: 'wall' as const, passable: false, elevation: 0, rotation: 0 },
        // Masts (pillars)
        { x: 7, y: 6, type: 'pillar' as const, passable: false, elevation: 0, rotation: 0 },
        { x: 14, y: 6, type: 'pillar' as const, passable: false, elevation: 0, rotation: 0 },
        { x: 21, y: 6, type: 'pillar' as const, passable: false, elevation: 0, rotation: 0 },
        // Cannons
        { x: 4, y: 2, type: 'difficult' as const, passable: true, elevation: 0, rotation: 0 },
        { x: 9, y: 2, type: 'difficult' as const, passable: true, elevation: 0, rotation: 0 },
        { x: 16, y: 2, type: 'difficult' as const, passable: true, elevation: 0, rotation: 0 },
        { x: 23, y: 2, type: 'difficult' as const, passable: true, elevation: 0, rotation: 0 },
        { x: 4, y: 9, type: 'difficult' as const, passable: true, elevation: 0, rotation: 0 },
        { x: 9, y: 9, type: 'difficult' as const, passable: true, elevation: 0, rotation: 0 },
        { x: 16, y: 9, type: 'difficult' as const, passable: true, elevation: 0, rotation: 0 },
        { x: 23, y: 9, type: 'difficult' as const, passable: true, elevation: 0, rotation: 0 },
        // Ship's wheel
        { x: 25, y: 6, type: 'altar' as const, passable: false, elevation: 0, rotation: 0 },
        // Stairs to lower deck
        { x: 3, y: 6, type: 'stairs' as const, passable: true, elevation: 0, rotation: 0 },
        // Cargo and barrels
        { x: 11, y: 4, type: 'chest' as const, passable: false, elevation: 0, rotation: 0 },
        { x: 11, y: 8, type: 'chest' as const, passable: false, elevation: 0, rotation: 0 },
        { x: 18, y: 4, type: 'chest' as const, passable: false, elevation: 0, rotation: 0 },
        { x: 18, y: 8, type: 'chest' as const, passable: false, elevation: 0, rotation: 0 }
      ],
      tokens: []
    },
    {
      id: 'mountain_pass',
      name: 'Treacherous Mountain Pass',
      category: 'outdoor',
      width: 32,
      height: 20,
      description: 'A narrow mountain path with cliffs, loose rocks, and dangerous drops',
      tags: ['mountain', 'outdoor', 'dangerous', 'cliff', 'narrow'],
      lighting: 'bright',
      weatherEffects: ['high_winds'],
      terrain: [
        // Mountain walls (cliffs)
        ...Array.from({ length: 32 }, (_, x) => [0, 1, 18, 19].map(y => ({ x, y, type: 'wall' as const, passable: false, elevation: 3, rotation: 0 }))).flat(),
        // Pits (drops off cliffs)
        ...Array.from({ length: 32 }, (_, x) => [2, 17].map(y => ({ x, y, type: 'pit' as const, passable: false, elevation: -5, rotation: 0 }))).flat(),
        // Narrow winding path
        ...Array.from({ length: 32 }, (_, x) => {
          const pathY = 10 + Math.floor(Math.sin(x * 0.3) * 3);
          return [
            { x, y: pathY - 1, type: 'normal' as const, passable: true, elevation: 0, rotation: 0 },
            { x, y: pathY, type: 'normal' as const, passable: true, elevation: 0, rotation: 0 },
            { x, y: pathY + 1, type: 'normal' as const, passable: true, elevation: 0, rotation: 0 }
          ];
        }).flat(),
        // Loose rocks and rubble
        ...Array.from({ length: 20 }, (_, i) => {
          const x = Math.floor(Math.random() * 32);
          const pathY = 10 + Math.floor(Math.sin(x * 0.3) * 3);
          const y = pathY + (Math.random() > 0.5 ? -2 : 2);
          if (y > 3 && y < 16) {
            return { x, y, type: 'rubble' as const, passable: true, elevation: 0, rotation: 0 };
          }
          return null;
        }).filter(Boolean) as TerrainCell[],
        // Ice patches (slippery)
        { x: 8, y: 9, type: 'ice' as const, passable: true, elevation: 0, rotation: 0 },
        { x: 9, y: 10, type: 'ice' as const, passable: true, elevation: 0, rotation: 0 },
        { x: 20, y: 8, type: 'ice' as const, passable: true, elevation: 0, rotation: 0 },
        { x: 21, y: 9, type: 'ice' as const, passable: true, elevation: 0, rotation: 0 },
        // Bridge across narrow gap
        { x: 15, y: 10, type: 'bridge' as const, passable: true, elevation: 1, rotation: 0 },
        { x: 16, y: 10, type: 'bridge' as const, passable: true, elevation: 1, rotation: 0 }
      ],
      tokens: []
    },
    {
      id: 'underground_lake',
      name: 'Underground Lake Cavern',
      category: 'dungeon',
      width: 26,
      height: 20,
      description: 'A vast underground cavern with a deep lake, rocky islands, and phosphorescent fungi',
      tags: ['underground', 'lake', 'cavern', 'water', 'mysterious'],
      lighting: 'dark',
      weatherEffects: ['echoing_water'],
      terrain: [
        // Cavern walls
        ...Array.from({ length: 26 }, (_, x) => [0, 19].map(y => ({ x, y, type: 'wall' as const, passable: false, elevation: 0, rotation: 0 }))).flat(),
        ...Array.from({ length: 20 }, (_, y) => [0, 25].map(x => ({ x, y, type: 'wall' as const, passable: false, elevation: 0, rotation: 0 }))).flat(),
        // Lake (central area)
        ...Array.from({ length: 16 }, (_, x) => Array.from({ length: 12 }, (_, y) => ({
          x: x + 5,
          y: y + 4,
          type: 'water' as const,
          passable: true,
          elevation: -2,
          rotation: 0
        }))).flat(),
        // Rocky islands in lake
        { x: 10, y: 8, type: 'normal' as const, passable: true, elevation: 0, rotation: 0 },
        { x: 11, y: 8, type: 'normal' as const, passable: true, elevation: 0, rotation: 0 },
        { x: 16, y: 12, type: 'normal' as const, passable: true, elevation: 0, rotation: 0 },
        { x: 17, y: 12, type: 'normal' as const, passable: true, elevation: 0, rotation: 0 },
        { x: 17, y: 13, type: 'normal' as const, passable: true, elevation: 0, rotation: 0 },
        // Stalagmites
        { x: 7, y: 10, type: 'pillar' as const, passable: false, elevation: 0, rotation: 0 },
        { x: 19, y: 9, type: 'pillar' as const, passable: false, elevation: 0, rotation: 0 },
        { x: 13, y: 6, type: 'pillar' as const, passable: false, elevation: 0, rotation: 0 },
        // Phosphorescent fungi (magical light sources)
        { x: 3, y: 3, type: 'difficult' as const, passable: true, elevation: 0, rotation: 0 },
        { x: 22, y: 16, type: 'difficult' as const, passable: true, elevation: 0, rotation: 0 },
        { x: 4, y: 16, type: 'difficult' as const, passable: true, elevation: 0, rotation: 0 },
        // Ancient altar on island
        { x: 16, y: 12, type: 'altar' as const, passable: false, elevation: 0, rotation: 0 },
        // Entrance tunnel
        { x: 1, y: 10, type: 'normal' as const, passable: true, elevation: 0, rotation: 0 }
      ],
      tokens: []
    }
  ];

  // Initialize fog of war
  useEffect(() => {
    const newFogOfWar = Array(mapHeight).fill(null).map(() => Array(mapWidth).fill(true));
    setFogOfWar(newFogOfWar);
  }, [mapWidth, mapHeight]);

  const getGridPosition = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(((clientX - rect.left) / zoom - panX) / gridSize);
    const y = Math.floor(((clientY - rect.top) / zoom - panY) / gridSize);
    
    return { 
      x: Math.max(0, Math.min(mapWidth - 1, x)), 
      y: Math.max(0, Math.min(mapHeight - 1, y))
    };
  };

  const getTerrainAt = (x: number, y: number) => {
    return terrain.find(cell => cell.x === x && cell.y === y);
  };

  const drawTerrain = (ctx: CanvasRenderingContext2D, cell: TerrainCell) => {
    const cellX = (cell.x * gridSize + panX) * zoom;
    const cellY = (cell.y * gridSize + panY) * zoom;
    const size = gridSize * zoom;
    
    const terrainInfo = terrainTypes.find(t => t.type === cell.type);
    if (!terrainInfo) return;

    ctx.fillStyle = terrainInfo.color;
    ctx.fillRect(cellX, cellY, size, size);

    // Add terrain-specific visual effects
    switch (cell.type) {
      case 'wall':
        // Stone wall with depth
        ctx.fillStyle = '#2d3748';
        ctx.fillRect(cellX + 2, cellY + 2, size - 4, size - 4);
        ctx.strokeStyle = '#4a5568';
        ctx.lineWidth = 2;
        ctx.strokeRect(cellX + 1, cellY + 1, size - 2, size - 2);
        break;
        
      case 'door':
        // Wooden door with handle
        ctx.fillStyle = '#d69e2e';
        ctx.fillRect(cellX + 4, cellY + 4, size - 8, size - 8);
        ctx.strokeStyle = '#b7791f';
        ctx.lineWidth = 2;
        ctx.strokeRect(cellX + 4, cellY + 4, size - 8, size - 8);
        // Door handle
        ctx.fillStyle = '#744210';
        ctx.beginPath();
        ctx.arc(cellX + size - 8, cellY + size/2, 3, 0, 2 * Math.PI);
        ctx.fill();
        break;
        
      case 'water':
        // Animated water effect
        const time = Date.now() * 0.001;
        ctx.strokeStyle = '#63b3ed';
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.7;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.arc(cellX + size/2, cellY + size/2, (i + 1) * 8 + Math.sin(time + i) * 2, 0, 2 * Math.PI);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
        break;
        
      case 'lava':
        // Glowing lava effect
        const lavaGradient = ctx.createRadialGradient(cellX + size/2, cellY + size/2, 0, cellX + size/2, cellY + size/2, size/2);
        lavaGradient.addColorStop(0, '#ff6b35');
        lavaGradient.addColorStop(0.7, '#fc8181');
        lavaGradient.addColorStop(1, '#8b0000');
        ctx.fillStyle = lavaGradient;
        ctx.fillRect(cellX, cellY, size, size);
        break;
        
      case 'tree':
        // Tree with trunk and canopy
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(cellX + size/3, cellY + size/2, size/3, size/2);
        ctx.fillStyle = '#228b22';
        ctx.beginPath();
        ctx.arc(cellX + size/2, cellY + size/3, size/3, 0, 2 * Math.PI);
        ctx.fill();
        break;
        
      case 'pillar':
        // 3D pillar effect
        ctx.fillStyle = '#a0aec0';
        ctx.fillRect(cellX + size/4, cellY + size/4, size/2, size/2);
        ctx.fillStyle = '#cbd5e0';
        ctx.fillRect(cellX + size/4, cellY + size/4, size/4, size/2);
        ctx.strokeStyle = '#718096';
        ctx.lineWidth = 2;
        ctx.strokeRect(cellX + size/4, cellY + size/4, size/2, size/2);
        break;
        
      case 'chest':
        // Treasure chest
        ctx.fillStyle = '#d69e2e';
        ctx.fillRect(cellX + size/4, cellY + size/3, size/2, size/3);
        ctx.strokeStyle = '#b7791f';
        ctx.lineWidth = 2;
        ctx.strokeRect(cellX + size/4, cellY + size/3, size/2, size/3);
        // Lock
        ctx.fillStyle = '#4a5568';
        ctx.beginPath();
        ctx.arc(cellX + size/2, cellY + size/2, 3, 0, 2 * Math.PI);
        ctx.fill();
        break;
        
      case 'trap':
        // Hidden trap indicator (only visible to GM)
        if (isGameMaster) {
          ctx.strokeStyle = '#dc2626';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.strokeRect(cellX + 2, cellY + 2, size - 4, size - 4);
          ctx.setLineDash([]);
        }
        break;
    }
  };

  const drawToken = (ctx: CanvasRenderingContext2D, token: Token) => {
    if (!token.visible && !isGameMaster) return;

    const x = (token.x * gridSize + gridSize / 2 + panX) * zoom;
    const y = (token.y * gridSize + gridSize / 2 + panY) * zoom;
    const radius = (gridSize * tokenSizes[token.size] / 2 - 2) * zoom;

    // Token shadow
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(x + 2, y + 2, radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Aura effect
    if (token.aura && (isGameMaster || token.visible)) {
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = token.aura.color;
      ctx.beginPath();
      ctx.arc(x, y, token.aura.radius * gridSize * zoom, 0, 2 * Math.PI);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Token gradient
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, token.color);
    gradient.addColorStop(0.7, token.color);
    gradient.addColorStop(1, '#000000');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fill();
    
    // Selection highlight
    if (selectedTokens.includes(token.id)) {
      ctx.shadowColor = '#d4af37';
      ctx.shadowBlur = 10;
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 3;
    } else {
      ctx.shadowBlur = 0;
      ctx.strokeStyle = token.type === 'player' ? '#3b82f6' : token.type === 'monster' ? '#ef4444' : '#8b5cf6';
      ctx.lineWidth = 2;
    }
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Token icon
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.max(12, 12 * zoom)}px sans-serif`;
    ctx.textAlign = 'center';
    const icon = token.type === 'player' ? '🛡️' : token.type === 'monster' ? '👹' : token.type === 'object' ? '📦' : '👤';
    ctx.fillText(icon, x, y - 4 * zoom);

    // Token name
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.font = `bold ${Math.max(8, 10 * zoom)}px sans-serif`;
    ctx.strokeText(token.name, x, y + 8 * zoom);
    ctx.fillText(token.name, x, y + 8 * zoom);

    // Health bar (only if has HP)
    if (token.hitPoints !== undefined && token.maxHitPoints !== undefined) {
      const healthPercent = Math.max(0, token.hitPoints / token.maxHitPoints);
      const barWidth = radius * 1.6;
      const barHeight = 6 * zoom;
      const barX = x - barWidth / 2;
      const barY = y + radius + 8 * zoom;

      // Background
      ctx.fillStyle = '#1a1625';
      ctx.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);
      ctx.fillStyle = '#4a5568';
      ctx.fillRect(barX, barY, barWidth, barHeight);

      // Health bar color
      if (healthPercent > 0.6) {
        ctx.fillStyle = '#10b981';
      } else if (healthPercent > 0.3) {
        ctx.fillStyle = '#f59e0b';
      } else {
        ctx.fillStyle = '#ef4444';
      }
      
      ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);

      // Health text
      ctx.fillStyle = '#ffffff';
      ctx.font = `${Math.max(6, 8 * zoom)}px sans-serif`;
      ctx.fillText(`${token.hitPoints}/${token.maxHitPoints}`, x, barY + barHeight + 10 * zoom);
    }

    // Conditions
    if (token.conditions.length > 0) {
      const conditionSize = 12 * zoom;
      ctx.fillStyle = '#8b5cf6';
      ctx.beginPath();
      ctx.arc(x + radius - conditionSize/2, y - radius + conditionSize/2, conditionSize/2, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.max(6, 8 * zoom)}px sans-serif`;
      ctx.fillText(token.conditions.length.toString(), x + radius - conditionSize/2, y - radius + conditionSize/2 + 2);
    }

    // Invisible indicator
    if (!token.visible) {
      ctx.globalAlpha = 0.6;
      ctx.strokeStyle = '#6b7280';
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.arc(x, y, radius + 3, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
    }
  };

  const drawMap = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear and set background
    ctx.fillStyle = '#1a1625';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Background image
    if (backgroundImage) {
      // Would draw background image here if implemented
    }

    // Draw base floor
    for (let x = 0; x < mapWidth; x++) {
      for (let y = 0; y < mapHeight; y++) {
        const cellX = (x * gridSize + panX) * zoom;
        const cellY = (y * gridSize + panY) * zoom;
        const size = gridSize * zoom;
        
        // Base floor color based on lighting
        let floorColor = '#2d3748';
        switch (mapLighting) {
          case 'bright': floorColor = '#4a5568'; break;
          case 'dim': floorColor = '#2d3748'; break;
          case 'dark': floorColor = '#1a202c'; break;
          case 'magical': floorColor = '#553c9a'; break;
        }
        
        ctx.fillStyle = floorColor;
        ctx.fillRect(cellX, cellY, size, size);
        
        // Fog of war
        if (fogOfWar[y] && fogOfWar[y][x] && !isGameMaster) {
          ctx.fillStyle = '#000000';
          ctx.globalAlpha = 0.8;
          ctx.fillRect(cellX, cellY, size, size);
          ctx.globalAlpha = 1;
        }
      }
    }

    // Draw terrain
    terrain.forEach(cell => {
      if (!fogOfWar[cell.y] || !fogOfWar[cell.y][cell.x] || isGameMaster) {
        drawTerrain(ctx, cell);
      }
    });

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 0.5;
      ctx.globalAlpha = gridOpacity;
      
      for (let x = 0; x <= mapWidth; x++) {
        ctx.beginPath();
        ctx.moveTo((x * gridSize + panX) * zoom, panY * zoom);
        ctx.lineTo((x * gridSize + panX) * zoom, (mapHeight * gridSize + panY) * zoom);
        ctx.stroke();
      }
      
      for (let y = 0; y <= mapHeight; y++) {
        ctx.beginPath();
        ctx.moveTo(panX * zoom, (y * gridSize + panY) * zoom);
        ctx.lineTo((mapWidth * gridSize + panX) * zoom, (y * gridSize + panY) * zoom);
        ctx.stroke();
      }
      
      ctx.globalAlpha = 1;
    }

    // Draw coordinates
    if (showCoordinates) {
      ctx.fillStyle = '#d4af37';
      ctx.font = `${Math.max(8, 10 * zoom)}px sans-serif`;
      ctx.textAlign = 'center';
      
      for (let x = 0; x < mapWidth; x++) {
        for (let y = 0; y < mapHeight; y++) {
          const cellX = (x * gridSize + gridSize/2 + panX) * zoom;
          const cellY = (y * gridSize + gridSize/2 + panY) * zoom;
          ctx.fillText(`${x},${y}`, cellX, cellY);
        }
      }
    }

    // Draw tokens
    tokens.forEach(token => {
      if (!fogOfWar[token.y] || !fogOfWar[token.y][token.x] || isGameMaster || token.visible) {
        drawToken(ctx, token);
      }
    });

    // Draw measurement line if active
    if (activeTool === 'measure' && draggedToken) {
      // Would draw measurement line here
    }

  }, [mapWidth, mapHeight, gridSize, zoom, panX, panY, showGrid, showCoordinates, gridColor, gridOpacity, terrain, tokens, fogOfWar, isGameMaster, selectedTokens, activeTool, draggedToken, mapLighting, backgroundImage]);

  useEffect(() => {
    drawMap();
  }, [drawMap]);

  const paintTerrain = (centerX: number, centerY: number) => {
    if (!isGameMaster) return;
    
    const terrainInfo = terrainTypes.find(t => t.type === selectedTerrain);
    if (!terrainInfo) return;
    
    const halfBrush = Math.floor(brushSize / 2);
    const newTerrainCells: TerrainCell[] = [];
    
    for (let dx = -halfBrush; dx <= halfBrush; dx++) {
      for (let dy = -halfBrush; dy <= halfBrush; dy++) {
        const x = centerX + dx;
        const y = centerY + dy;
        
        // Check bounds
        if (x >= 0 && x < mapWidth && y >= 0 && y < mapHeight) {
          if (selectedTerrain === 'normal') {
            // Remove terrain (clear cell)
            setTerrain(prev => prev.filter(cell => !(cell.x === x && cell.y === y)));
          } else {
            // Add/update terrain
            newTerrainCells.push({
              x,
              y,
              type: selectedTerrain,
              passable: terrainInfo.passable,
              elevation: 0,
              rotation: 0
            });
          }
        }
      }
    }
    
    if (newTerrainCells.length > 0) {
      setTerrain(prev => {
        // Remove existing terrain at these positions
        const filtered = prev.filter(cell => 
          !newTerrainCells.some(newCell => newCell.x === cell.x && newCell.y === cell.y)
        );
        return [...filtered, ...newTerrainCells];
      });
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    const { x, y } = getGridPosition(e.clientX, e.clientY);
    
    switch (activeTool) {
      case 'terrain':
        paintTerrain(x, y);
        break;
        
      case 'select':
        const clickedToken = tokens.find(token => token.x === x && token.y === y);
        if (clickedToken) {
          if (e.ctrlKey || e.metaKey) {
            setSelectedTokens(prev => 
              prev.includes(clickedToken.id) 
                ? prev.filter(id => id !== clickedToken.id)
                : [...prev, clickedToken.id]
            );
          } else {
            setSelectedTokens([clickedToken.id]);
          }
        } else {
          if (!e.ctrlKey && !e.metaKey) {
            setSelectedTokens([]);
          }
        }
        break;
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (activeTool === 'pan') {
      setDraggedToken('pan');
      setDragOffset({ x: e.clientX - panX, y: e.clientY - panY });
    } else if (activeTool === 'move') {
      const { x, y } = getGridPosition(e.clientX, e.clientY);
      const token = tokens.find(t => t.x === x && t.y === y);
      if (token && (isGameMaster || token.type === 'player')) {
        setDraggedToken(token.id);
        setDragOffset({ x: e.clientX - token.x * gridSize, y: e.clientY - token.y * gridSize });
      }
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (draggedToken === 'pan') {
      setPanX(e.clientX - dragOffset.x);
      setPanY(e.clientY - dragOffset.y);
    } else if (draggedToken && draggedToken !== 'pan') {
      const { x, y } = getGridPosition(e.clientX, e.clientY);
      setTokens(prev => prev.map(token => 
        token.id === draggedToken ? { ...token, x, y } : token
      ));
    }
  };

  const handleCanvasMouseUp = () => {
    setDraggedToken(null);
    setDragOffset({ x: 0, y: 0 });
  };

  const loadMapTemplate = (templateId: string) => {
    const template = mapTemplates.find(t => t.id === templateId);
    if (!template) return;

    setMapWidth(template.width);
    setMapHeight(template.height);
    setTerrain(template.terrain);
    setTokens(template.tokens);
    setSelectedTemplate(templateId);
    setMapLighting(template.lighting);
    setWeatherEffects(template.weatherEffects);
    setCustomMapName(template.name);
    setMapNotes(template.description);
    
    // Initialize fog of war for new map
    const newFogOfWar = Array(template.height).fill(null).map(() => Array(template.width).fill(false));
    setFogOfWar(newFogOfWar);
  };

  const clearMap = () => {
    setTerrain([]);
    setTokens([]);
    setSelectedTokens([]);
    setSelectedTemplate('');
    setCustomMapName('');
    setMapNotes('');
    setBackgroundImage('');
    const newFogOfWar = Array(mapHeight).fill(null).map(() => Array(mapWidth).fill(false));
    setFogOfWar(newFogOfWar);
  };

  const addToken = (type: Token['type']) => {
    const newToken: Token = {
      id: `token_${Date.now()}`,
      name: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      type,
      x: Math.floor(mapWidth / 2),
      y: Math.floor(mapHeight / 2),
      size: 'medium',
      color: type === 'player' ? '#3b82f6' : type === 'monster' ? '#ef4444' : '#8b5cf6',
      hitPoints: type === 'object' ? undefined : 25,
      maxHitPoints: type === 'object' ? undefined : 25,
      armorClass: type === 'object' ? undefined : 15,
      conditions: [],
      visible: true,
      rotation: 0,
      elevation: 0
    };
    
    setTokens(prev => [...prev, newToken]);
    setSelectedTokens([newToken.id]);
  };

  const deleteSelectedTokens = () => {
    setTokens(prev => prev.filter(token => !selectedTokens.includes(token.id)));
    setSelectedTokens([]);
  };

  const duplicateSelectedTokens = () => {
    const tokensToClone = tokens.filter(token => selectedTokens.includes(token.id));
    const clonedTokens = tokensToClone.map(token => ({
      ...token,
      id: `token_${Date.now()}_${Math.random()}`,
      name: `${token.name} (Copy)`,
      x: Math.min(mapWidth - 1, token.x + 1),
      y: Math.min(mapHeight - 1, token.y + 1)
    }));
    
    setTokens(prev => [...prev, ...clonedTokens]);
    setSelectedTokens(clonedTokens.map(token => token.id));
  };

  const filteredTemplates = templateCategory === 'all' 
    ? mapTemplates 
    : mapTemplates.filter(template => template.category === templateCategory);

  const categories = ['all', ...Array.from(new Set(mapTemplates.map(t => t.category)))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-slate-800 via-purple-900 to-slate-800 border border-amber-500/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-amber-300 flex items-center gap-2">
                <MapPin className="w-6 h-6" />
                🗺️ Advanced Battle Map System
              </CardTitle>
              <CardDescription className="text-amber-200/80">
                Professional D&D battle maps with dynamic terrain, fog of war, and advanced features
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-purple-600 text-white">
                {mapWidth}×{mapHeight} Grid
              </Badge>
              {selectedTemplate && (
                <Badge className="bg-amber-600 text-slate-900">
                  {mapTemplates.find(t => t.id === selectedTemplate)?.name}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tool Bar */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 p-1 bg-slate-700 rounded-lg">
              {[
                { tool: 'select', icon: Crosshair, label: 'Select' },
                { tool: 'move', icon: Move, label: 'Move' },
                { tool: 'terrain', icon: Brush, label: 'Terrain' },
                { tool: 'measure', icon: Ruler, label: 'Measure' },
                { tool: 'pan', icon: Hand, label: 'Pan' }
              ].map(({ tool, icon: Icon, label }) => (
                <Button
                  key={tool}
                  variant={activeTool === tool ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTool(tool as any)}
                  className={activeTool === tool ? "bg-amber-600 text-slate-900" : "text-slate-300"}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline ml-1">{label}</span>
                </Button>
              ))}
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom(Math.min(3, zoom * 1.2))}
                className="border-slate-600 text-slate-300"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom(Math.max(0.3, zoom / 1.2))}
                className="border-slate-600 text-slate-300"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setZoom(1); setPanX(0); setPanY(0); }}
                className="border-slate-600 text-slate-300"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant={showGrid ? "default" : "outline"}
                size="sm"
                onClick={() => setShowGrid(!showGrid)}
                className={showGrid ? "bg-amber-600 text-slate-900" : "border-amber-400 text-amber-300"}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={showCoordinates ? "default" : "outline"}
                size="sm"
                onClick={() => setShowCoordinates(!showCoordinates)}
                className={showCoordinates ? "bg-amber-600 text-slate-900" : "border-amber-400 text-amber-300"}
              >
                📍
              </Button>
              <Button
                variant={showDistances ? "default" : "outline"}
                size="sm"
                onClick={() => setShowDistances(!showDistances)}
                className={showDistances ? "bg-amber-600 text-slate-900" : "border-amber-400 text-amber-300"}
              >
                <Ruler className="w-4 h-4" />
              </Button>
            </div>

            {isGameMaster && (
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addToken('player')}
                  className="border-blue-400 text-blue-300"
                >
                  <Shield className="w-4 h-4" />
                  Player
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addToken('monster')}
                  className="border-red-400 text-red-300"
                >
                  <Crown className="w-4 h-4" />
                  Monster
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addToken('object')}
                  className="border-gray-400 text-gray-300"
                >
                  📦 Object
                </Button>
              </div>
            )}

            {selectedTokens.length > 0 && (
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={duplicateSelectedTokens}
                  className="border-green-400 text-green-300"
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={deleteSelectedTokens}
                  className="border-red-400 text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Map Canvas */}
        <div className="xl:col-span-3">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="overflow-hidden border-2 border-slate-600 rounded-lg shadow-2xl">
                <canvas
                  ref={canvasRef}
                  width={1200}
                  height={800}
                  className="bg-slate-900 cursor-crosshair"
                  onClick={handleCanvasClick}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onMouseLeave={handleCanvasMouseUp}
                />
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-4 text-sm">
                  <Badge className="bg-amber-600 text-slate-900">
                    🗺️ {mapWidth}×{mapHeight} • Zoom: {Math.round(zoom * 100)}%
                  </Badge>
                  {activeTool !== 'select' && (
                    <Badge className="bg-purple-600 text-white">
                      🛠️ {activeTool.charAt(0).toUpperCase() + activeTool.slice(1)} Mode
                    </Badge>
                  )}
                  {selectedTokens.length > 0 && (
                    <Badge className="bg-blue-600 text-white">
                      🎯 {selectedTokens.length} Selected
                    </Badge>
                  )}
                </div>
                
                <div className="text-slate-400 text-sm">
                  Each square = 5 feet • Right-click for context menu
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls Panel */}
        <div className="space-y-4">
          <Tabs defaultValue="templates" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-slate-700">
              <TabsTrigger value="templates">🏰 Maps</TabsTrigger>
              <TabsTrigger value="terrain">🏗️ Terrain</TabsTrigger>
              <TabsTrigger value="tokens">🎭 Tokens</TabsTrigger>
              <TabsTrigger value="settings">⚙️ Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="templates" className="space-y-4">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Map Templates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select value={templateCategory} onValueChange={setTemplateCategory}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                    {filteredTemplates.map(template => (
                      <Button
                        key={template.id}
                        variant={selectedTemplate === template.id ? "default" : "outline"}
                        onClick={() => loadMapTemplate(template.id)}
                        className="p-4 h-auto flex-col items-start text-left"
                      >
                        <div className="font-medium text-left w-full">{template.name}</div>
                        <div className="text-sm text-slate-400 text-left w-full">{template.description}</div>
                        <div className="text-xs text-slate-500 text-left w-full">
                          {template.width}×{template.height} • {template.category}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {template.tags.slice(0, 3).map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </Button>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={clearMap} className="flex-1">
                      🗑️ Clear
                    </Button>
                    <Button variant="outline" className="flex-1">
                      💾 Save
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="terrain" className="space-y-4">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Terrain Tools</CardTitle>
                  <CardDescription className="text-slate-300">
                    {isGameMaster ? 'Select terrain type and paint on the map' : 'View terrain information'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                    {terrainTypes.map(terrain => (
                      <Button
                        key={terrain.type}
                        variant={selectedTerrain === terrain.type ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setSelectedTerrain(terrain.type);
                          if (isGameMaster) {
                            setActiveTool('terrain');
                          }
                        }}
                        className={`text-xs justify-start ${
                          selectedTerrain === terrain.type 
                            ? 'bg-amber-600 text-slate-900' 
                            : 'border-slate-600 text-slate-300'
                        }`}
                        disabled={!isGameMaster}
                      >
                        {terrain.icon} {terrain.name}
                      </Button>
                    ))}
                  </div>
                  
                  {isGameMaster && (
                    <>
                      <div>
                        <Label className="text-white text-sm">Brush Size</Label>
                        <Slider
                          value={[brushSize]}
                          onValueChange={(value) => setBrushSize(value[0])}
                          max={5}
                          min={1}
                          step={1}
                          className="mt-2"
                        />
                        <div className="text-xs text-slate-400 mt-1">Size: {brushSize}x{brushSize}</div>
                      </div>

                      <div className="text-xs text-slate-400 p-3 bg-slate-700 rounded">
                        💡 <strong>How to use:</strong><br/>
                        1. Select terrain type above<br/>
                        2. Click "Terrain" tool in toolbar<br/>
                        3. Click on map to paint terrain<br/>
                        4. Hold Shift to paint multiple squares
                      </div>
                    </>
                  )}
                  
                  {!isGameMaster && (
                    <div className="text-xs text-slate-400 p-3 bg-slate-700 rounded">
                      ℹ️ Only the Game Master can modify terrain. You can view terrain types and their properties here.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tokens" className="space-y-4">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Token Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isGameMaster && (
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addToken('player')}
                        className="border-blue-400 text-blue-300"
                      >
                        <Shield className="w-4 h-4 mr-1" />
                        Player
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addToken('monster')}
                        className="border-red-400 text-red-300"
                      >
                        <Crown className="w-4 h-4 mr-1" />
                        Monster
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addToken('object')}
                        className="border-gray-400 text-gray-300"
                      >
                        📦 Object
                      </Button>
                    </div>
                  )}

                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {tokens.map(token => (
                      <div
                        key={token.id}
                        className={`p-3 rounded border ${
                          selectedTokens.includes(token.id)
                            ? 'border-amber-500 bg-amber-500/10'
                            : 'border-slate-600 bg-slate-700'
                        } cursor-pointer`}
                        onClick={() => setSelectedTokens([token.id])}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: token.color }}
                            />
                            <span className="text-white text-sm font-medium">
                              {token.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setTokens(prev => prev.map(t => 
                                  t.id === token.id ? { ...t, visible: !t.visible } : t
                                ));
                              }}
                            >
                              {token.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            </Button>
                          </div>
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          {token.type} • ({token.x}, {token.y}) • {token.size}
                          {token.hitPoints !== undefined && (
                            <span> • {token.hitPoints}/{token.maxHitPoints} HP</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Map Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-white text-sm">Width</Label>
                      <Input
                        type="number"
                        value={mapWidth}
                        onChange={(e) => setMapWidth(Math.max(10, Math.min(50, parseInt(e.target.value) || 20)))}
                        className="bg-slate-700 border-slate-600 text-white"
                        min={10}
                        max={50}
                      />
                    </div>
                    <div>
                      <Label className="text-white text-sm">Height</Label>
                      <Input
                        type="number"
                        value={mapHeight}
                        onChange={(e) => setMapHeight(Math.max(10, Math.min(50, parseInt(e.target.value) || 20)))}
                        className="bg-slate-700 border-slate-600 text-white"
                        min={10}
                        max={50}
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-white text-sm">Grid Size</Label>
                    <Slider
                      value={[gridSize]}
                      onValueChange={(value) => setGridSize(value[0])}
                      max={60}
                      min={20}
                      step={5}
                      className="mt-2"
                    />
                    <div className="text-xs text-slate-400 mt-1">{gridSize}px</div>
                  </div>

                  <div>
                    <Label className="text-white text-sm">Grid Opacity</Label>
                    <Slider
                      value={[gridOpacity]}
                      onValueChange={(value) => setGridOpacity(value[0])}
                      max={1}
                      min={0}
                      step={0.1}
                      className="mt-2"
                    />
                    <div className="text-xs text-slate-400 mt-1">{Math.round(gridOpacity * 100)}%</div>
                  </div>

                  <div>
                    <Label className="text-white text-sm">Lighting</Label>
                    <Select value={mapLighting} onValueChange={setMapLighting}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bright">☀️ Bright Light</SelectItem>
                        <SelectItem value="dim">🌅 Dim Light</SelectItem>
                        <SelectItem value="dark">🌑 Darkness</SelectItem>
                        <SelectItem value="magical">✨ Magical Light</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {isGameMaster && (
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="dynamic-lighting" 
                        checked={dynamicLighting}
                        onCheckedChange={setDynamicLighting}
                      />
                      <Label htmlFor="dynamic-lighting" className="text-white text-sm">
                        Dynamic Lighting
                      </Label>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}