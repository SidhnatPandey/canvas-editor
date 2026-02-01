import { useRef, useState, useEffect } from 'react';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CanvasElement, ToolType, TextElement, ShapeElement, LineElement, ImageElement } from '@/types/editor';
import { ResizableElement } from './ResizableElement';

interface CanvasProps {
  elements: CanvasElement[];
  selectedIds: string[];
  activeTool: ToolType;
  zoom: number;
  showGrid: boolean;
  gridSize: number;
  onZoomChange: (zoom: number) => void;
  onSelectElement: (id: string, addToSelection?: boolean) => void;
  onClearSelection: () => void;
  onMoveElement: (id: string, x: number, y: number) => void;
  onResizeElement: (id: string, width: number, height: number, x?: number, y?: number) => void;
  onRotateElement: (id: string, rotation: number) => void;
  onAddElement: (element: Omit<CanvasElement, 'id'>) => void;
  onUpdateElementWithHistory: (id: string, updates: Partial<CanvasElement>) => void;
  onUpdateElement?: (id: string, updates: Partial<CanvasElement>) => void;
} 

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 350;

export function Canvas({
  elements,
  selectedIds,
  activeTool,
  zoom,
  showGrid,
  gridSize,
  onZoomChange,
  onSelectElement,
  onClearSelection,
  onMoveElement,
  onResizeElement,
  onRotateElement,
  onAddElement,
  onUpdateElementWithHistory,
  onUpdateElement,
}: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imageUploadCoords = useRef<{ x: number; y: number } | null>(null);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const img = new Image();
      img.onload = () => {
        const maxW = 300;
        const maxH = 300;
        let w = img.naturalWidth;
        let h = img.naturalHeight;
        const scale = Math.min(1, maxW / w, maxH / h);
        w = Math.round(w * scale);
        h = Math.round(h * scale);

        const coords = imageUploadCoords.current;
        const x = coords ? coords.x - w / 2 : (CANVAS_WIDTH - w) / 2;
        const y = coords ? coords.y - h / 2 : (CANVAS_HEIGHT - h) / 2;

        onAddElement({
          type: 'image',
          name: 'Image',
          x,
          y,
          width: w,
          height: h,
          rotation: 0,
          opacity: 1,
          visible: true,
          locked: false,
          src: dataUrl,
          fit: 'cover',
        } as Omit<any, 'id'>);

        imageUploadCoords.current = null;
        if (fileInputRef.current) fileInputRef.current.value = '';
      };
      img.onerror = () => {
        // eslint-disable-next-line no-console
        console.error('Failed to load image');
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // Open file picker automatically when the Image tool is selected
  useEffect(() => {
    if (activeTool === 'image') {
      // Place upload at center by default
      imageUploadCoords.current = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 };
      // defer click to next tick to avoid interfering with UI events
      setTimeout(() => fileInputRef.current?.click(), 0);
    }
    // only trigger when tool changes
  }, [activeTool]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const surface = canvasRef.current?.querySelector('.canvas-surface') as HTMLElement | null;
    if (!surface || !surface.contains(target)) return;
    if (target.closest('.resizable-element')) return;

    if (activeTool === 'text') {
      const rect = surface.getBoundingClientRect();
      const x = (e.clientX - rect.left) / zoom - (rect.width / zoom - CANVAS_WIDTH) / 2;
      const y = (e.clientY - rect.top) / zoom - (rect.height / zoom - CANVAS_HEIGHT) / 2;
      createNewElement(x, y);
    }

    if (activeTool === 'image') {
      const rect = surface.getBoundingClientRect();
      const x = (e.clientX - rect.left) / zoom - (rect.width / zoom - CANVAS_WIDTH) / 2;
      const y = (e.clientY - rect.top) / zoom - (rect.height / zoom - CANVAS_HEIGHT) / 2;
      imageUploadCoords.current = { x, y };
      fileInputRef.current?.click();
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    const surface = canvasRef.current?.querySelector('.canvas-surface') as HTMLElement | null;
    const target = e.target as HTMLElement;

    if (!surface || !surface.contains(target)) return;

    // If clicking on an existing element, ignore (don't create)
    if (target.closest('.resizable-element')) return;

    onClearSelection();

    if (activeTool !== 'select') {
      const rect = surface.getBoundingClientRect();
      if (!rect) return;

      const x = (e.clientX - rect.left) / zoom - (rect.width / zoom - CANVAS_WIDTH) / 2;
      const y = (e.clientY - rect.top) / zoom - (rect.height / zoom - CANVAS_HEIGHT) / 2;

      if (x >= 0 && x <= CANVAS_WIDTH && y >= 0 && y <= CANVAS_HEIGHT) {
        createNewElement(x, y);
      }
    }
  };

  const createNewElement = (x: number, y: number) => {
    const baseElement = {
      x: x - 50,
      y: y - 25,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
    };

    switch (activeTool) {
      case 'text':
        onAddElement({
          ...baseElement,
          type: 'text',
          name: 'New Text',
          width: 150,
          height: 30,
          content: 'Double-click to edit',
          fontFamily: 'Inter',
          fontSize: 16,
          fontWeight: 'normal',
          fontStyle: 'normal',
          textDecoration: 'none',
          textAlign: 'left',
          lineHeight: 1.4,
          color: '#1a1a1a',
        } as Omit<TextElement, 'id'>);
        break;
      case 'rectangle':
        onAddElement({
          ...baseElement,
          type: 'rectangle',
          name: 'Rectangle',
          width: 100,
          height: 60,
          fill: '#E5E7EB',
          stroke: '#9CA3AF',
          strokeWidth: 1,
          borderRadius: 8,
        } as Omit<ShapeElement, 'id'>);
        break;
      case 'circle':
        onAddElement({
          ...baseElement,
          type: 'circle',
          name: 'Circle',
          width: 80,
          height: 80,
          fill: '#DBEAFE',
          stroke: '#3B82F6',
          strokeWidth: 1,
          borderRadius: 50,
        } as Omit<ShapeElement, 'id'>);
        break;
      case 'line':
        onAddElement({
          ...baseElement,
          type: 'line',
          name: 'Line',
          width: 100,
          height: 2,
          stroke: '#6B7280',
          strokeWidth: 2,
        } as Omit<LineElement, 'id'>);
        break;
    }
  };

  const handleMoveEnd = (id: string) => {
    const element = elements.find(el => el.id === id);
    if (element) {
      onUpdateElementWithHistory(id, { x: element.x, y: element.y });
    }
  };

  const handleResizeEnd = (id: string) => {
    const element = elements.find(el => el.id === id);
    if (element) {
      onUpdateElementWithHistory(id, { 
        x: element.x, 
        y: element.y, 
        width: element.width, 
        height: element.height 
      });
    }
  };

  return (
    <div className="flex-1 bg-canvas relative overflow-hidden" ref={canvasRef}>
      {/* Canvas wrapper with checkerboard */}
      <div 
        className="canvas-wrapper absolute inset-0 flex items-center justify-center"
        onClick={handleCanvasClick}
      >
        {/* The actual canvas */}
        <div
          className="canvas-surface relative bg-white shadow-canvas transition-transform duration-200"
          style={{
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
            transform: `scale(${zoom})`,
          }}
          onDoubleClick={handleDoubleClick}>
          {/* Grid overlay */}
          {showGrid && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `
                  linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)
                `,
                backgroundSize: `${gridSize}px ${gridSize}px`,
              }}
            />
          )}
          
          {/* Elements */}
          {elements.map((element) => (
            <ResizableElement
              key={element.id}
              element={element}
              isSelected={selectedIds.includes(element.id)}
              isMultiSelected={selectedIds.length > 1}
              zoom={zoom}
              activeTool={activeTool}
              onSelect={onSelectElement}
              onMove={onMoveElement}
              onResize={onResizeElement}
              onRotate={onRotateElement}
              onMoveEnd={handleMoveEnd}
              onResizeEnd={handleResizeEnd}
              onUpdateElementWithHistory={onUpdateElementWithHistory}
              onUpdateElement={onUpdateElement}
            />
          ))}

          {/* Hidden file input for image uploads */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleImageFileChange}
          />
        </div>
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-panel border border-panel-border rounded-lg p-1 shadow-panel">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onZoomChange(Math.max(0.25, zoom - 0.25))}
          disabled={zoom <= 0.25}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        
        <span className="w-16 text-center text-sm font-medium">
          {Math.round(zoom * 100)}%
        </span>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onZoomChange(Math.min(2, zoom + 0.25))}
          disabled={zoom >= 2}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-5 bg-border" />
        
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onZoomChange(1)}
        >
          <Maximize className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
