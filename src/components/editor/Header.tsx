import { Undo2, Redo2, Moon, Sun, Download, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface HeaderProps {
  canUndo: boolean;
  canRedo: boolean;
  isDarkMode: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onToggleDarkMode: () => void;
  onExport: (format: 'png' | 'jpg' | 'pdf') => void;
}

export function Header({
  canUndo,
  canRedo,
  isDarkMode,
  onUndo,
  onRedo,
  onToggleDarkMode,
  onExport,
}: HeaderProps) {
  return (
    <header className="h-14 bg-panel border-b border-panel-border flex items-center justify-between px-4 shadow-panel sticky top-0 z-50">
      {/* Left - Logo */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">C</span>
        </div>
        <span className="font-semibold text-lg">Card Editor</span>
      </div>

      {/* Center - Undo/Redo */}
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onUndo}
              disabled={!canUndo}
              className="h-9 w-9"
            >
              <Undo2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Undo (Ctrl+Z)</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onRedo}
              disabled={!canRedo}
              className="h-9 w-9"
            >
              <Redo2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Redo (Ctrl+Y)</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleDarkMode}
              className="h-9 w-9"
            >
              {isDarkMode ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Toggle {isDarkMode ? 'Light' : 'Dark'} Mode</p>
          </TooltipContent>
        </Tooltip>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="gap-2">
              <Download className="h-4 w-4" />
              Export
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-popover">
            <DropdownMenuItem onClick={() => onExport('png')}>
              <span className="flex-1">PNG</span>
              <span className="text-xs text-muted-foreground">High Resolution</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExport('jpg')}>
              <span className="flex-1">JPEG</span>
              <span className="text-xs text-muted-foreground">Compressed</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExport('pdf')}>
              <span className="flex-1">PDF</span>
              <span className="text-xs text-muted-foreground">Print Ready</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
