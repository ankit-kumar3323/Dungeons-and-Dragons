import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Backpack, Plus, Sword, Shield, Gem, Scroll, Edit, Trash2, Coins } from 'lucide-react';

interface InventoryItem {
  id: number;
  name: string;
  type: 'weapon' | 'armor' | 'consumable' | 'treasure' | 'tool' | 'misc';
  quantity: number;
  weight: number;
  value: number;
  description: string;
  magical: boolean;
  equipped: boolean;
}

interface InventoryProps {
  character: any;
  onUpdate: (character: any) => void;
}

export function Inventory({ character, onUpdate }: InventoryProps) {
  const [inventory, setInventory] = useState<InventoryItem[]>([
    {
      id: 1,
      name: 'Longsword',
      type: 'weapon',
      quantity: 1,
      weight: 3,
      value: 15,
      description: '1d8 slashing damage. Versatile (1d10)',
      magical: false,
      equipped: true
    },
    {
      id: 2,
      name: 'Chain Mail',
      type: 'armor',
      quantity: 1,
      weight: 55,
      value: 75,
      description: 'AC 16. Disadvantage on Stealth checks.',
      magical: false,
      equipped: true
    },
    {
      id: 3,
      name: 'Health Potion',
      type: 'consumable',
      quantity: 3,
      weight: 0.5,
      value: 50,
      description: 'Heals 2d4+2 hit points as an action',
      magical: true,
      equipped: false
    },
    {
      id: 4,
      name: 'Thieves\' Tools',
      type: 'tool',
      quantity: 1,
      weight: 1,
      value: 25,
      description: 'Tools for picking locks and disarming traps',
      magical: false,
      equipped: false
    },
    {
      id: 5,
      name: 'Gold Pieces',
      type: 'treasure',
      quantity: 247,
      weight: 0,
      value: 1,
      description: 'Standard currency of the realm',
      magical: false,
      equipped: false
    }
  ]);

  const [newItem, setNewItem] = useState({
    name: '',
    type: 'misc' as const,
    quantity: 1,
    weight: 0,
    value: 0,
    description: '',
    magical: false
  });

  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  const itemTypes = [
    { value: 'weapon', label: 'Weapon', icon: Sword },
    { value: 'armor', label: 'Armor', icon: Shield },
    { value: 'consumable', label: 'Consumable', icon: Scroll },
    { value: 'treasure', label: 'Treasure', icon: Gem },
    { value: 'tool', label: 'Tool', icon: Backpack },
    { value: 'misc', label: 'Miscellaneous', icon: Backpack }
  ];

  const addItem = () => {
    if (!newItem.name) return;

    const item: InventoryItem = {
      id: Date.now(),
      ...newItem,
      equipped: false
    };

    setInventory(prev => [...prev, item]);
    setNewItem({
      name: '',
      type: 'misc',
      quantity: 1,
      weight: 0,
      value: 0,
      description: '',
      magical: false
    });
  };

  const updateItem = (id: number, updates: Partial<InventoryItem>) => {
    setInventory(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const removeItem = (id: number) => {
    setInventory(prev => prev.filter(item => item.id !== id));
  };

  const toggleEquipped = (id: number) => {
    updateItem(id, { equipped: !inventory.find(item => item.id === id)?.equipped });
  };

  const getTotalWeight = () => {
    return inventory.reduce((total, item) => total + (item.weight * item.quantity), 0);
  };

  const getTotalValue = () => {
    return inventory.reduce((total, item) => total + (item.value * item.quantity), 0);
  };

  const getTypeIcon = (type: string) => {
    const typeInfo = itemTypes.find(t => t.value === type);
    return typeInfo ? typeInfo.icon : Backpack;
  };

  const filteredInventory = filterType === 'all' 
    ? inventory 
    : inventory.filter(item => item.type === filterType);

  const carryingCapacity = character ? character.abilities.strength * 15 : 150;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Inventory Header */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Backpack className="w-5 h-5" />
                Inventory
              </CardTitle>
              <CardDescription className="text-slate-300">
                {character ? `${character.name}'s Equipment and Items` : 'Character Inventory'}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-white">
                <span className="flex items-center gap-1">
                  <Coins className="w-4 h-4 text-yellow-500" />
                  {getTotalValue()} gp
                </span>
              </div>
              <div className="text-slate-300 text-sm">
                {getTotalWeight().toFixed(1)} / {carryingCapacity} lbs
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="w-full bg-slate-600 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    getTotalWeight() > carryingCapacity ? 'bg-red-600' : 'bg-blue-600'
                  }`}
                  style={{
                    width: `${Math.min((getTotalWeight() / carryingCapacity) * 100, 100)}%`
                  }}
                />
              </div>
              <div className="text-slate-300 text-sm mt-1">
                Carrying Capacity {getTotalWeight() > carryingCapacity ? '(Encumbered!)' : ''}
              </div>
            </div>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-slate-700">
                <DialogHeader>
                  <DialogTitle className="text-white">Add New Item</DialogTitle>
                  <DialogDescription className="text-slate-300">
                    Add a new item to your inventory
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="itemName" className="text-white">Item Name</Label>
                      <Input
                        id="itemName"
                        value={newItem.name}
                        onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter item name"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="itemType" className="text-white">Type</Label>
                      <Select value={newItem.type} onValueChange={(value: any) => setNewItem(prev => ({ ...prev, type: value }))}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {itemTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="quantity" className="text-white">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        value={newItem.quantity}
                        onChange={(e) => setNewItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                        min={1}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="weight" className="text-white">Weight (lbs)</Label>
                      <Input
                        id="weight"
                        type="number"
                        step="0.1"
                        value={newItem.weight}
                        onChange={(e) => setNewItem(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
                        min={0}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="value" className="text-white">Value (gp)</Label>
                      <Input
                        id="value"
                        type="number"
                        value={newItem.value}
                        onChange={(e) => setNewItem(prev => ({ ...prev, value: parseInt(e.target.value) || 0 }))}
                        min={0}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-white">Description</Label>
                    <Input
                      id="description"
                      value={newItem.description}
                      onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Item description or properties"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="magical"
                      checked={newItem.magical}
                      onChange={(e) => setNewItem(prev => ({ ...prev, magical: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor="magical" className="text-white">Magical Item</Label>
                  </div>

                  <Button onClick={addItem} className="w-full" disabled={!newItem.name}>
                    Add Item
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Tabs */}
      <Tabs defaultValue="all">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="all">All Items ({inventory.length})</TabsTrigger>
          <TabsTrigger value="equipped">Equipped ({inventory.filter(i => i.equipped).length})</TabsTrigger>
          <TabsTrigger value="weapons">Weapons ({inventory.filter(i => i.type === 'weapon').length})</TabsTrigger>
          <TabsTrigger value="armor">Armor ({inventory.filter(i => i.type === 'armor').length})</TabsTrigger>
          <TabsTrigger value="consumables">Consumables ({inventory.filter(i => i.type === 'consumable').length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <InventoryGrid 
            items={inventory} 
            onToggleEquipped={toggleEquipped}
            onUpdateItem={updateItem}
            onRemoveItem={removeItem}
          />
        </TabsContent>

        <TabsContent value="equipped" className="mt-4">
          <InventoryGrid 
            items={inventory.filter(item => item.equipped)} 
            onToggleEquipped={toggleEquipped}
            onUpdateItem={updateItem}
            onRemoveItem={removeItem}
          />
        </TabsContent>

        <TabsContent value="weapons" className="mt-4">
          <InventoryGrid 
            items={inventory.filter(item => item.type === 'weapon')} 
            onToggleEquipped={toggleEquipped}
            onUpdateItem={updateItem}
            onRemoveItem={removeItem}
          />
        </TabsContent>

        <TabsContent value="armor" className="mt-4">
          <InventoryGrid 
            items={inventory.filter(item => item.type === 'armor')} 
            onToggleEquipped={toggleEquipped}
            onUpdateItem={updateItem}
            onRemoveItem={removeItem}
          />
        </TabsContent>

        <TabsContent value="consumables" className="mt-4">
          <InventoryGrid 
            items={inventory.filter(item => item.type === 'consumable')} 
            onToggleEquipped={toggleEquipped}
            onUpdateItem={updateItem}
            onRemoveItem={removeItem}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function InventoryGrid({ 
  items, 
  onToggleEquipped, 
  onUpdateItem, 
  onRemoveItem 
}: {
  items: InventoryItem[];
  onToggleEquipped: (id: number) => void;
  onUpdateItem: (id: number, updates: Partial<InventoryItem>) => void;
  onRemoveItem: (id: number) => void;
}) {
  const getTypeIcon = (type: string) => {
    const icons = {
      weapon: Sword,
      armor: Shield,
      consumable: Scroll,
      treasure: Gem,
      tool: Backpack,
      misc: Backpack
    };
    return icons[type as keyof typeof icons] || Backpack;
  };

  if (items.length === 0) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="text-center py-8">
          <div className="text-slate-400">No items found in this category</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map(item => {
        const Icon = getTypeIcon(item.type);
        return (
          <Card key={item.id} className={`bg-slate-800 border-slate-700 ${item.equipped ? 'ring-2 ring-blue-500' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="w-5 h-5 text-slate-400" />
                  <CardTitle className="text-white text-lg">{item.name}</CardTitle>
                </div>
                <div className="flex items-center gap-1">
                  {item.magical && <Badge variant="secondary" className="bg-purple-600 text-xs">Magic</Badge>}
                  {item.equipped && <Badge variant="default" className="text-xs">Equipped</Badge>}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-slate-300 text-sm">{item.description}</div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-slate-400">Qty: <span className="text-white">{item.quantity}</span></div>
                <div className="text-slate-400">Weight: <span className="text-white">{item.weight} lbs</span></div>
                <div className="text-slate-400">Value: <span className="text-white">{item.value} gp</span></div>
                <div className="text-slate-400">Type: <span className="text-white capitalize">{item.type}</span></div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={item.equipped ? "default" : "outline"}
                  onClick={() => onToggleEquipped(item.id)}
                  className="flex-1"
                >
                  {item.equipped ? 'Unequip' : 'Equip'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onRemoveItem(item.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}