'use client';

import React, { useState } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { cn } from '@/lib/utils';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  className?: string;
}

// Palette de couleurs prédéfinies
const predefinedColors = [
  // Couleurs de base
  '#000000',
  '#FFFFFF',
  '#808080',
  '#C0C0C0',
  // Rouges
  '#FF0000',
  '#FF6B6B',
  '#FF8E8E',
  '#DC143C',
  '#B22222',
  // Bleus
  '#0000FF',
  '#4169E1',
  '#6495ED',
  '#87CEEB',
  '#1E90FF',
  // Verts
  '#00FF00',
  '#32CD32',
  '#90EE90',
  '#00FA9A',
  '#00CED1',
  // Jaunes/Oranges
  '#FFFF00',
  '#FFD700',
  '#FFA500',
  '#FF8C00',
  '#FF7F50',
  // Violets/Roses
  '#800080',
  '#9932CC',
  '#DA70D6',
  '#FF69B4',
  '#FF1493',
  // Marrons/Terres
  '#A52A2A',
  '#D2691E',
  '#CD853F',
  '#DEB887',
  '#F4A460',
  // Couleurs tendance
  '#E6E6FA',
  '#F0F8FF',
  '#FFEFD5',
  '#F5FFFA',
  '#FFF8DC',
];

export function ColorPicker({ value, onChange, className }: ColorPickerProps) {
  const [customColor, setCustomColor] = useState(value);
  const [isOpen, setIsOpen] = useState(false);

  const handleColorSelect = (color: string) => {
    onChange(color);
    setCustomColor(color);
    setIsOpen(false);
  };

  const handleCustomColorChange = (color: string) => {
    setCustomColor(color);
    if (color.match(/^#[0-9A-Fa-f]{6}$/)) {
      onChange(color);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !value && 'text-muted-foreground',
            className
          )}
        >
          <div className="flex items-center gap-2">
            <div
              className="h-4 w-4 rounded border border-gray-300"
              style={{ backgroundColor: value || '#000000' }}
            />
            <span>{value || 'Choisir une couleur'}</span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <Tabs defaultValue="predefined" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="predefined">Palette</TabsTrigger>
            <TabsTrigger value="custom">Personnalisé</TabsTrigger>
          </TabsList>

          <TabsContent value="predefined" className="mt-4">
            <div className="grid grid-cols-8 gap-2">
              {predefinedColors.map((color) => (
                <button
                  key={color}
                  className={cn(
                    'h-8 w-8 rounded border-2 transition-all hover:scale-110',
                    value === color ? 'border-primary ring-2 ring-primary' : 'border-gray-300'
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorSelect(color)}
                  title={color}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="custom" className="mt-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="custom-color">Code couleur hexadécimal</Label>
                <Input
                  id="custom-color"
                  type="text"
                  placeholder="#FF0000"
                  value={customColor}
                  onChange={(e) => handleCustomColorChange(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="color-input">Sélecteur de couleur</Label>
                <Input
                  id="color-input"
                  type="color"
                  value={customColor}
                  onChange={(e) => handleCustomColorChange(e.target.value)}
                  className="mt-1 h-10 w-full cursor-pointer"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleColorSelect(customColor)}
                  disabled={!customColor.match(/^#[0-9A-Fa-f]{6}$/)}
                >
                  Appliquer
                </Button>
                <Button size="sm" variant="outline" onClick={() => setIsOpen(false)}>
                  Annuler
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
