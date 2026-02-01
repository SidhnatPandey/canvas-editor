import {
  MousePointer2,
  Type,
  Square,
  Circle,
  Minus,
  Image,
  Sparkles,
  Group,
  Ungroup,
  Trash2,
} from 'lucide-react';
import { ToolType } from '@/types/editor';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface ToolsSidebarProps {
  activeTool: ToolType;
  selectedCount: number;
  onToolChange: (tool: ToolType) => void;
  onDelete: () => void;
  onGroup: () => void;
  onUngroup: () => void;
}

const tools: { id: ToolType; icon: React.ElementType; label: string; shortcut?: string }[] = [
  { id: 'select', icon: MousePointer2, label: 'Select', shortcut: 'V' },
  { id: 'text', icon: Type, label: 'Text', shortcut: 'T' },
  { id: 'rectangle', icon: Square, label: 'Rectangle', shortcut: 'R' },
  { id: 'circle', icon: Circle, label: 'Circle', shortcut: 'C' },
  { id: 'line', icon: Minus, label: 'Line', shortcut: 'L' },
  { id: 'image', icon: Image, label: 'Image', shortcut: 'I' },
  { id: 'icon', icon: Sparkles, label: 'Icon', shortcut: 'K' },
];

export function ToolsSidebar({
  activeTool,
  selectedCount,
  onToolChange,
  onDelete,
  onGroup,
  onUngroup,
}: ToolsSidebarProps) {
  return (
    <aside className="w-16 bg-panel border-r border-panel-border flex flex-col items-center py-3 gap-1">
      {tools.map((tool) => (
        <Tooltip key={tool.id}>
          <TooltipTrigger asChild>
            <button
              className={cn(
                'tool-button w-12 h-12',
                activeTool === tool.id && 'active'
              )}
              onClick={() => onToolChange(tool.id)}
            >
              <tool.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{tool.label}</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{tool.label} {tool.shortcut && <span className="text-muted-foreground ml-1">({tool.shortcut})</span>}</p>
          </TooltipContent>
        </Tooltip>
      ))}

      <Separator className="my-2 w-10" />

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className={cn(
              'tool-button w-12 h-12',
              selectedCount >= 2 && 'hover:bg-primary/10'
            )}
            disabled={selectedCount < 2}
            onClick={onGroup}
          >
            <Group className="h-5 w-5" />
            <span className="text-[10px] font-medium">Group</span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>Group (Ctrl+G)</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className={cn(
              'tool-button w-12 h-12',
              selectedCount > 0 && 'hover:bg-primary/10'
            )}
            disabled={selectedCount === 0}
            onClick={onUngroup}
          >
            <Ungroup className="h-5 w-5" />
            <span className="text-[10px] font-medium">Ungroup</span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>Ungroup (Ctrl+Shift+G)</p>
        </TooltipContent>
      </Tooltip>

      <div className="flex-1" />

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className={cn(
              'tool-button w-12 h-12',
              selectedCount > 0 && 'text-destructive hover:text-destructive hover:bg-destructive/10'
            )}
            disabled={selectedCount === 0}
            onClick={onDelete}
          >
            <Trash2 className="h-5 w-5" />
            <span className="text-[10px] font-medium">Delete</span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>Delete (Del)</p>
        </TooltipContent>
      </Tooltip>
    </aside>
  );
}
