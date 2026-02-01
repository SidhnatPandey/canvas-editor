import { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  ChevronDown, 
  ChevronRight,
  Type,
  Square,
  Circle,
  Minus,
  Image,
  Sparkles,
  GripVertical,
} from 'lucide-react';
import { CanvasElement } from '@/types/editor';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LayersPanelProps {
  elements: CanvasElement[];
  selectedIds: string[];
  onSelectElement: (id: string, addToSelection?: boolean) => void;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onReorderLayers: (fromIndex: number, toIndex: number) => void;
}

const elementIcons: Record<string, React.ElementType> = {
  text: Type,
  rectangle: Square,
  circle: Circle,
  line: Minus,
  image: Image,
  icon: Sparkles,
};

export function LayersPanel({
  elements,
  selectedIds,
  onSelectElement,
  onUpdateElement,
  onReorderLayers,
}: LayersPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Reverse elements for layer display (top layer first)
  const reversedElements = [...elements].reverse();

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      // Convert reversed indices back to original
      const fromOriginal = elements.length - 1 - draggedIndex;
      const toOriginal = elements.length - 1 - index;
      onReorderLayers(fromOriginal, toOriginal);
      setDraggedIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="w-56 bg-panel border-l border-panel-border flex flex-col">
      <button
        className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <span className="font-semibold text-sm">Layers</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{elements.length}</span>
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
      </button>

      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto">
          {reversedElements.map((element, reversedIndex) => {
            const Icon = elementIcons[element.type] || Square;
            const isSelected = selectedIds.includes(element.id);

            return (
              <div
                key={element.id}
                draggable
                onDragStart={() => handleDragStart(reversedIndex)}
                onDragOver={(e) => handleDragOver(e, reversedIndex)}
                onDragEnd={handleDragEnd}
                className={cn(
                  'layer-item group',
                  isSelected && 'selected',
                  draggedIndex === reversedIndex && 'opacity-50'
                )}
                onClick={(e) => onSelectElement(element.id, e.ctrlKey || e.metaKey)}
              >
                <GripVertical className="h-3 w-3 text-muted-foreground/50 cursor-grab active:cursor-grabbing" />
                
                <Icon className="h-4 w-4 text-muted-foreground" />
                
                <span className={cn(
                  'flex-1 text-sm truncate',
                  !element.visible && 'text-muted-foreground'
                )}>
                  {element.name}
                </span>

                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateElement(element.id, { visible: !element.visible });
                    }}
                  >
                    {element.visible ? (
                      <Eye className="h-3 w-3" />
                    ) : (
                      <EyeOff className="h-3 w-3" />
                    )}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateElement(element.id, { locked: !element.locked });
                    }}
                  >
                    {element.locked ? (
                      <Lock className="h-3 w-3" />
                    ) : (
                      <Unlock className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
