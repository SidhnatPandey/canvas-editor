import { useState, useCallback, useRef, useEffect } from 'react';
import { CanvasElement, TextElement, ShapeElement, LineElement, ImageElement, GroupElement, ResizeHandle } from '@/types/editor';
import { cn } from '@/lib/utils';

interface ResizableElementProps {
  element: CanvasElement;
  isSelected: boolean;
  isMultiSelected: boolean;
  zoom: number;
  activeTool: string;
  onSelect: (id: string, addToSelection: boolean) => void;
  onMove: (id: string, x: number, y: number) => void;
  onResize: (id: string, width: number, height: number, x?: number, y?: number) => void;
  onRotate: (id: string, rotation: number) => void;
  onMoveEnd: (id: string) => void;
  onResizeEnd: (id: string) => void;
  onUpdateElementWithHistory?: (id: string, updates: Partial<CanvasElement>) => void;
  onUpdateElement?: (id: string, updates: Partial<CanvasElement>) => void;
}

const handlePositions: Record<ResizeHandle, { cursor: string; x: string; y: string }> = {
  nw: { cursor: 'nwse-resize', x: '-4px', y: '-4px' },
  n: { cursor: 'ns-resize', x: '50%', y: '-4px' },
  ne: { cursor: 'nesw-resize', x: 'calc(100% - 4px)', y: '-4px' },
  e: { cursor: 'ew-resize', x: 'calc(100% - 4px)', y: '50%' },
  se: { cursor: 'nwse-resize', x: 'calc(100% - 4px)', y: 'calc(100% - 4px)' },
  s: { cursor: 'ns-resize', x: '50%', y: 'calc(100% - 4px)' },
  sw: { cursor: 'nesw-resize', x: '-4px', y: 'calc(100% - 4px)' },
  w: { cursor: 'ew-resize', x: '-4px', y: '50%' },
};

export function ResizableElement({
  element,
  isSelected,
  isMultiSelected,
  zoom,
  activeTool,
  onSelect,
  onMove,
  onResize,
  onRotate,
  onMoveEnd,
  onResizeEnd,
  onUpdateElementWithHistory,
  onUpdateElement,
}: ResizableElementProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<ResizeHandle | null>(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startElement, setStartElement] = useState({ x: 0, y: 0, width: 0, height: 0, rotation: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [textValue, setTextValue] = useState<string>(
    element.type === 'text' ? (element as TextElement).content : ''
  );

  useEffect(() => {
    if (!isEditing && element.type === 'text') {
      setTextValue((element as TextElement).content);
    }
  }, [element, isEditing]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (element.locked) return;
    e.stopPropagation();
    
    const addToSelection = e.ctrlKey || e.metaKey;
    onSelect(element.id, addToSelection);

    if (activeTool === 'select') {
      setIsDragging(true);
      setStartPos({ x: e.clientX, y: e.clientY });
      setStartElement({ x: element.x, y: element.y, width: element.width, height: element.height, rotation: element.rotation });
    }
  };

  const handleResizeMouseDown = (e: React.MouseEvent, handle: ResizeHandle) => {
    if (element.locked) return;
    e.stopPropagation();
    e.preventDefault();
    
    setIsResizing(true);
    setResizeHandle(handle);
    setStartPos({ x: e.clientX, y: e.clientY });
    setStartElement({ x: element.x, y: element.y, width: element.width, height: element.height, rotation: element.rotation });
  };

  const handleRotateMouseDown = (e: React.MouseEvent) => {
    if (element.locked) return;
    e.stopPropagation();
    e.preventDefault();
    
    setIsRotating(true);
    setStartPos({ x: e.clientX, y: e.clientY });
    setStartElement({ x: element.x, y: element.y, width: element.width, height: element.height, rotation: element.rotation });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      const dx = (e.clientX - startPos.x) / zoom;
      const dy = (e.clientY - startPos.y) / zoom;
      onMove(element.id, startElement.x + dx, startElement.y + dy);
    } else if (isResizing && resizeHandle) {
      const dx = (e.clientX - startPos.x) / zoom;
      const dy = (e.clientY - startPos.y) / zoom;
      
      let newX = startElement.x;
      let newY = startElement.y;
      let newWidth = startElement.width;
      let newHeight = startElement.height;

      // Calculate resize based on handle position
      switch (resizeHandle) {
        case 'e':
          newWidth = Math.max(20, startElement.width + dx);
          break;
        case 'w':
          newWidth = Math.max(20, startElement.width - dx);
          newX = startElement.x + (startElement.width - newWidth);
          break;
        case 's':
          newHeight = Math.max(20, startElement.height + dy);
          break;
        case 'n':
          newHeight = Math.max(20, startElement.height - dy);
          newY = startElement.y + (startElement.height - newHeight);
          break;
        case 'se':
          newWidth = Math.max(20, startElement.width + dx);
          newHeight = Math.max(20, startElement.height + dy);
          break;
        case 'sw':
          newWidth = Math.max(20, startElement.width - dx);
          newX = startElement.x + (startElement.width - newWidth);
          newHeight = Math.max(20, startElement.height + dy);
          break;
        case 'ne':
          newWidth = Math.max(20, startElement.width + dx);
          newHeight = Math.max(20, startElement.height - dy);
          newY = startElement.y + (startElement.height - newHeight);
          break;
        case 'nw':
          newWidth = Math.max(20, startElement.width - dx);
          newX = startElement.x + (startElement.width - newWidth);
          newHeight = Math.max(20, startElement.height - dy);
          newY = startElement.y + (startElement.height - newHeight);
          break;
      }

      // Maintain aspect ratio if shift is held
      if (e.shiftKey && ['nw', 'ne', 'se', 'sw'].includes(resizeHandle)) {
        const aspectRatio = startElement.width / startElement.height;
        if (Math.abs(dx) > Math.abs(dy)) {
          newHeight = newWidth / aspectRatio;
        } else {
          newWidth = newHeight * aspectRatio;
        }
      }

      onResize(element.id, newWidth, newHeight, newX, newY);
    } else if (isRotating && elementRef.current) {
      const rect = elementRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
      let rotation = (angle * 180) / Math.PI + 90;
      
      // Snap to 45 degree increments if shift is held
      if (e.shiftKey) {
        rotation = Math.round(rotation / 45) * 45;
      }
      
      onRotate(element.id, rotation);
    }
  }, [isDragging, isResizing, isRotating, resizeHandle, startPos, startElement, zoom, element.id, onMove, onResize, onRotate]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      onMoveEnd(element.id);
    }
    if (isResizing) {
      onResizeEnd(element.id);
    }
    setIsDragging(false);
    setIsResizing(false);
    setIsRotating(false);
    setResizeHandle(null);
  }, [isDragging, isResizing, element.id, onMoveEnd, onResizeEnd]);

  useEffect(() => {
    if (isDragging || isResizing || isRotating) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, isRotating, handleMouseMove, handleMouseUp]);

  if (!element.visible) return null;

  const renderContent = () => {
    switch (element.type) {
      case 'text': {
        const textEl = element as TextElement;

        return (
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            {!isEditing && (
              <div
                onDoubleClick={() => {
                  setIsEditing(true);
                }}
                style={{
                  fontFamily: textEl.fontFamily,
                  fontSize: textEl.fontSize,
                  fontWeight: textEl.fontWeight,
                  fontStyle: textEl.fontStyle,
                  textDecoration: textEl.textDecoration,
                  textAlign: textEl.textAlign,
                  lineHeight: textEl.lineHeight,
                  color: textEl.color,
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: textEl.textAlign === 'center' ? 'center' : 'flex-start',
                  justifyContent: textEl.textAlign === 'left' ? 'flex-start' : textEl.textAlign === 'right' ? 'flex-end' : 'center',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  overflow: 'hidden',
                }}
              >
                {textEl.content}
              </div>
            )}

            {isEditing && (
              <textarea
                autoFocus
                value={textValue}
                onChange={(e) => {
                  setTextValue(e.target.value);
                  if (typeof onUpdateElement === 'function') {
                    onUpdateElement(element.id, { content: e.target.value });
                  }
                }}
                onBlur={() => {
                  setIsEditing(false);
                  if (onUpdateElementWithHistory) {
                    onUpdateElementWithHistory(element.id, { content: textValue });
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    (e.target as HTMLTextAreaElement).blur();
                  }
                }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  resize: 'none',
                  fontFamily: textEl.fontFamily,
                  fontSize: textEl.fontSize,
                  fontWeight: textEl.fontWeight,
                  fontStyle: textEl.fontStyle,
                  lineHeight: String(textEl.lineHeight),
                  color: textEl.color,
                  padding: 4,
                  border: 'none',
                  outline: 'none',
                  boxShadow: 'none',
                  background: 'transparent',
                  boxSizing: 'border-box',
                }}
              />
            )}
          </div>
        );
      }
      case 'rectangle':
      case 'circle': {
        const shapeEl = element as ShapeElement;
        return (
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: shapeEl.fill,
              border: shapeEl.strokeWidth > 0 ? `${shapeEl.strokeWidth}px solid ${shapeEl.stroke}` : 'none',
              borderRadius: element.type === 'circle' ? '50%' : shapeEl.borderRadius,
              boxSizing: 'border-box',
            }}
          />
        );
      }
      case 'line': {
        const lineEl = element as LineElement;
        return (
          <div
            style={{
              width: '100%',
              height: lineEl.strokeWidth,
              backgroundColor: lineEl.stroke,
              position: 'absolute',
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          />
        );
      }
      case 'image': {
        const imgEl = element as ImageElement;
        return (
          <img
            src={imgEl.src}
            alt={element.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: imgEl.fit,
              display: 'block',
            }}
          />
        );
      }
      case 'group': {
        const groupEl = element as GroupElement;

        const renderChildContent = (child: CanvasElement) => {
          switch (child.type) {
            case 'text': {
              const t = child as TextElement;
              return (
                <div
                  style={{
                    fontFamily: t.fontFamily,
                    fontSize: t.fontSize,
                    fontWeight: t.fontWeight,
                    fontStyle: t.fontStyle,
                    textDecoration: t.textDecoration,
                    textAlign: t.textAlign,
                    lineHeight: t.lineHeight,
                    color: t.color,
                    width: '100%',
                    height: '100%',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    overflow: 'hidden',
                  }}
                >
                  {t.content}
                </div>
              );
            }
            case 'rectangle':
            case 'circle': {
              const s = child as ShapeElement;
              return (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: s.fill,
                    border: s.strokeWidth > 0 ? `${s.strokeWidth}px solid ${s.stroke}` : 'none',
                    borderRadius: child.type === 'circle' ? '50%' : s.borderRadius,
                    boxSizing: 'border-box',
                  }}
                />
              );
            }
            case 'line': {
              const l = child as LineElement;
              return (
                <div
                  style={{
                    width: '100%',
                    height: l.strokeWidth,
                    backgroundColor: l.stroke,
                    position: 'absolute',
                    top: '50%',
                    transform: 'translateY(-50%)',
                  }}
                />
              );
            }
            case 'image': {
              const im = child as ImageElement;
              return (
                <img
                  src={im.src}
                  alt={im.name}
                  style={{ width: '100%', height: '100%', objectFit: im.fit, display: 'block' }}
                />
              );
            }
            default:
              return null;
          }
        };

        return (
          <div className="w-full h-full relative">
            {groupEl.children.map((child) => (
              <div
                key={child.id}
                style={{
                  position: 'absolute',
                  left: child.x,
                  top: child.y,
                  width: child.width,
                  height: child.height,
                  opacity: child.opacity,
                  pointerEvents: 'none', // keep group selection unified
                }}
              >
                {renderChildContent(child)}
              </div>
            ))}
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div
      ref={elementRef}
      style={{
        position: 'absolute',
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        transform: `rotate(${element.rotation}deg)`,
        opacity: element.opacity,
        cursor: element.locked ? 'not-allowed' : (activeTool === 'select' ? 'move' : 'default'),
        transformOrigin: 'center center',
      }}
      className={cn(
        'resizable-element select-none transition-shadow duration-100',
        isSelected && 'ring-2 ring-primary ring-offset-0'
      )}
      onMouseDown={handleMouseDown}
    >
      {renderContent()}

      {isSelected && !element.locked && (
        <>
          {/* Resize handles */}
          {(Object.entries(handlePositions) as [ResizeHandle, typeof handlePositions['nw']][]).map(([handle, pos]) => (
            <div
              key={handle}
              className="absolute w-2 h-2 bg-white border-2 border-primary rounded-sm z-10"
              style={{
                left: pos.x,
                top: pos.y,
                transform: handle.includes('n') || handle.includes('s') 
                  ? (handle.length === 1 ? 'translate(-50%, -50%)' : 'translate(-50%, -50%)')
                  : 'translate(-50%, -50%)',
                cursor: pos.cursor,
              }}
              onMouseDown={(e) => handleResizeMouseDown(e, handle)}
            />
          ))}

          {/* Rotate handle */}
          <div
            className="absolute w-3 h-3 bg-white border-2 border-primary rounded-full z-10 cursor-grab"
            style={{
              left: '50%',
              top: '-24px',
              transform: 'translateX(-50%)',
            }}
            onMouseDown={handleRotateMouseDown}
          />
          <div
            className="absolute w-px h-5 bg-primary z-10"
            style={{
              left: '50%',
              top: '-20px',
              transform: 'translateX(-50%)',
            }}
          />
        </>
      )}
    </div>
  );
}