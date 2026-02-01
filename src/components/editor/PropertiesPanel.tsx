import { CanvasElement, TextElement, ShapeElement, LineElement } from '@/types/editor';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PropertiesPanelProps {
  selectedElements: CanvasElement[];
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
}

const fonts = [
  'Inter',
  'Arial',
  'Times New Roman',
  'Georgia',
  'Courier New',
  'Verdana',
  'Helvetica',
];

export function PropertiesPanel({ selectedElements, onUpdateElement }: PropertiesPanelProps) {
  if (selectedElements.length === 0) {
    return (
      <aside className="w-64 bg-panel border-l border-panel-border p-4">
        <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
          <p className="text-sm text-center">Select an element to edit its properties</p>
        </div>
      </aside>
    );
  }

  if (selectedElements.length > 1) {
    return (
      <aside className="w-64 bg-panel border-l border-panel-border p-4">
        <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
          <p className="text-sm text-center">{selectedElements.length} elements selected</p>
        </div>
      </aside>
    );
  }

  const element = selectedElements[0];

  const renderPositionProperties = () => (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Position</h3>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <Label className="property-label">X</Label>
          <Input
            type="number"
            value={Math.round(element.x)}
            onChange={(e) => onUpdateElement(element.id, { x: Number(e.target.value) })}
            className="property-input"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="property-label">Y</Label>
          <Input
            type="number"
            value={Math.round(element.y)}
            onChange={(e) => onUpdateElement(element.id, { y: Number(e.target.value) })}
            className="property-input"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="property-label">Width</Label>
          <Input
            type="number"
            value={Math.round(element.width)}
            onChange={(e) => onUpdateElement(element.id, { width: Number(e.target.value) })}
            className="property-input"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="property-label">Height</Label>
          <Input
            type="number"
            value={Math.round(element.height)}
            onChange={(e) => onUpdateElement(element.id, { height: Number(e.target.value) })}
            className="property-input"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <Label className="property-label">Rotation</Label>
          <Input
            type="number"
            value={Math.round(element.rotation)}
            onChange={(e) => onUpdateElement(element.id, { rotation: Number(e.target.value) })}
            className="property-input"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="property-label">Opacity</Label>
          <Slider
            value={[element.opacity * 100]}
            min={0}
            max={100}
            step={1}
            onValueChange={([value]) => onUpdateElement(element.id, { opacity: value / 100 })}
            className="mt-2"
          />
        </div>
      </div>
    </div>
  );

  const renderTextProperties = () => {
    const textEl = element as TextElement;
    return (
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Text</h3>
        
        <div className="space-y-1.5">
          <Label className="property-label">Content</Label>
          <Input
            value={textEl.content}
            onChange={(e) => onUpdateElement(element.id, { content: e.target.value })}
            className="property-input"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="property-label">Font Family</Label>
          <Select
            value={textEl.fontFamily}
            onValueChange={(value) => onUpdateElement(element.id, { fontFamily: value })}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              {fonts.map((font) => (
                <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                  {font}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <Label className="property-label">Font Size</Label>
            <Input
              type="number"
              value={textEl.fontSize}
              onChange={(e) => onUpdateElement(element.id, { fontSize: Number(e.target.value) })}
              className="property-input"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="property-label">Line Height</Label>
            <Input
              type="number"
              step="0.1"
              value={textEl.lineHeight}
              onChange={(e) => onUpdateElement(element.id, { lineHeight: Number(e.target.value) })}
              className="property-input"
            />
          </div>
        </div>

        <div className="flex gap-1">
          <Button
            variant={textEl.fontWeight === 'bold' ? 'default' : 'outline'}
            size="icon"
            className="h-8 w-8"
            onClick={() => onUpdateElement(element.id, { 
              fontWeight: textEl.fontWeight === 'bold' ? 'normal' : 'bold' 
            })}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant={textEl.fontStyle === 'italic' ? 'default' : 'outline'}
            size="icon"
            className="h-8 w-8"
            onClick={() => onUpdateElement(element.id, { 
              fontStyle: textEl.fontStyle === 'italic' ? 'normal' : 'italic' 
            })}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant={textEl.textDecoration === 'underline' ? 'default' : 'outline'}
            size="icon"
            className="h-8 w-8"
            onClick={() => onUpdateElement(element.id, { 
              textDecoration: textEl.textDecoration === 'underline' ? 'none' : 'underline' 
            })}
          >
            <Underline className="h-4 w-4" />
          </Button>
          <div className="w-px bg-border mx-1" />
          <Button
            variant={textEl.textAlign === 'left' ? 'default' : 'outline'}
            size="icon"
            className="h-8 w-8"
            onClick={() => onUpdateElement(element.id, { textAlign: 'left' })}
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            variant={textEl.textAlign === 'center' ? 'default' : 'outline'}
            size="icon"
            className="h-8 w-8"
            onClick={() => onUpdateElement(element.id, { textAlign: 'center' })}
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            variant={textEl.textAlign === 'right' ? 'default' : 'outline'}
            size="icon"
            className="h-8 w-8"
            onClick={() => onUpdateElement(element.id, { textAlign: 'right' })}
          >
            <AlignRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-1.5">
          <Label className="property-label">Color</Label>
          <div className="flex gap-2">
            <input
              type="color"
              value={textEl.color}
              onChange={(e) => onUpdateElement(element.id, { color: e.target.value })}
              className="w-8 h-8 rounded-md border cursor-pointer bg-transparent"
            />
            <Input
              value={textEl.color}
              onChange={(e) => onUpdateElement(element.id, { color: e.target.value })}
              className="property-input flex-1"
            />
          </div>
        </div>
      </div>
    );
  };

  const renderShapeProperties = () => {
    const shapeEl = element as ShapeElement;
    return (
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Fill & Stroke</h3>
        
        <div className="space-y-1.5">
          <Label className="property-label">Fill Color</Label>
          <div className="flex gap-2">
            <input
              type="color"
              value={shapeEl.fill}
              onChange={(e) => onUpdateElement(element.id, { fill: e.target.value })}
              className="w-8 h-8 rounded-md border cursor-pointer"
            />
            <Input
              value={shapeEl.fill}
              onChange={(e) => onUpdateElement(element.id, { fill: e.target.value })}
              className="property-input flex-1"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="property-label">Stroke Color</Label>
          <div className="flex gap-2">
            <input
              type="color"
              value={shapeEl.stroke === 'transparent' ? '#000000' : shapeEl.stroke}
              onChange={(e) => onUpdateElement(element.id, { stroke: e.target.value })}
              className="w-8 h-8 rounded-md border cursor-pointer"
            />
            <Input
              value={shapeEl.stroke}
              onChange={(e) => onUpdateElement(element.id, { stroke: e.target.value })}
              className="property-input flex-1"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <Label className="property-label">Stroke Width</Label>
            <Input
              type="number"
              value={shapeEl.strokeWidth}
              onChange={(e) => onUpdateElement(element.id, { strokeWidth: Number(e.target.value) })}
              className="property-input"
            />
          </div>
          {element.type === 'rectangle' && (
            <div className="space-y-1.5">
              <Label className="property-label">Border Radius</Label>
              <Input
                type="number"
                value={shapeEl.borderRadius}
                onChange={(e) => onUpdateElement(element.id, { borderRadius: Number(e.target.value) })}
                className="property-input"
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderLineProperties = () => {
    const lineEl = element as LineElement;
    return (
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Line</h3>
        
        <div className="space-y-1.5">
          <Label className="property-label">Stroke Color</Label>
          <div className="flex gap-2">
            <input
              type="color"
              value={lineEl.stroke}
              onChange={(e) => onUpdateElement(element.id, { stroke: e.target.value })}
              className="w-8 h-8 rounded-md border cursor-pointer"
            />
            <Input
              value={lineEl.stroke}
              onChange={(e) => onUpdateElement(element.id, { stroke: e.target.value })}
              className="property-input flex-1"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="property-label">Stroke Width</Label>
          <Input
            type="number"
            value={lineEl.strokeWidth}
            onChange={(e) => onUpdateElement(element.id, { strokeWidth: Number(e.target.value) })}
            className="property-input"
          />
        </div>
      </div>
    );
  };

  return (
    <aside className="w-64 bg-panel border-l border-panel-border overflow-y-auto">
      <div className="p-4 border-b border-panel-border">
        <h2 className="font-semibold text-sm">{element.name}</h2>
        <p className="text-xs text-muted-foreground capitalize">{element.type}</p>
      </div>
      
      <div className="p-4 space-y-6">
        {renderPositionProperties()}
        
        <Separator />
        
        {element.type === 'text' && renderTextProperties()}
        {(element.type === 'rectangle' || element.type === 'circle') && renderShapeProperties()}
        {element.type === 'line' && renderLineProperties()}
      </div>
    </aside>
  );
}
