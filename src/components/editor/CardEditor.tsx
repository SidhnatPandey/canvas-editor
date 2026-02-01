import { useState, useEffect, useCallback } from 'react';
import { useEditorState } from '@/hooks/useEditorState';
import { Header } from './Header';
import { ToolsSidebar } from './ToolsSidebar';
import { Canvas } from './Canvas';
import { PropertiesPanel } from './PropertiesPanel';
import { LayersPanel } from './LayersPanel';
import { ExportModal } from './ExportModal';
import { toast } from 'sonner';

export function CardEditor() {
  const {
    elements,
    selectedIds,
    activeTool,
    zoom,
    isDarkMode,
    showGrid,
    gridSize,
    canUndo,
    canRedo,
    setActiveTool,
    setZoom,
    setIsDarkMode,
    addElement,
    updateElement,
    updateElementWithHistory,
    deleteElements,
    moveElement,
    resizeElement,
    rotateElement,
    reorderLayers,
    selectElement,
    clearSelection,
    getSelectedElements,
    undo,
    redo,
    groupElements,
    ungroupElements,
  } = useEditorState();

  const [exportFormat, setExportFormat] = useState<'png' | 'jpg' | 'pdf' | null>(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Delete selected elements
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedIds.length > 0) {
          deleteElements(selectedIds);
          toast.success('Elements deleted');
        }
      }

      // Undo/Redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }

      // Group/Ungroup shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
        e.preventDefault();
        if (e.shiftKey) {
          // Ctrl/Cmd + Shift + G = Ungroup
          ungroupElements();
          toast.success('Elements ungrouped');
        } else {
          // Ctrl/Cmd + G = Group
          if (selectedIds.length >= 2) {
            groupElements();
            toast.success('Elements grouped');
          }
        }
      }

      // Tool shortcuts
      if (e.key === 'v' || e.key === 'V') setActiveTool('select');
      if (e.key === 't' || e.key === 'T') setActiveTool('text');
      if (e.key === 'r' || e.key === 'R') setActiveTool('rectangle');
      if (e.key === 'c' || e.key === 'C') setActiveTool('circle');
      if (e.key === 'l' || e.key === 'L') setActiveTool('line');

      // Move elements with arrow keys
      if (selectedIds.length > 0 && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
        const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;
        
        selectedIds.forEach(id => {
          const element = elements.find(el => el.id === id);
          if (element && !element.locked) {
            moveElement(id, element.x + dx, element.y + dy);
          }
        });
      }

      // Escape to clear selection
      if (e.key === 'Escape') {
        clearSelection();
        setActiveTool('select');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds, elements, deleteElements, undo, redo, setActiveTool, moveElement, clearSelection, groupElements, ungroupElements]);

  const handleExport = useCallback((format: 'png' | 'jpg' | 'pdf') => {
    setExportFormat(format);
  }, []);

  const [isExporting, setIsExporting] = useState(false);
  const CANVAS_WIDTH = 600;
  const CANVAS_HEIGHT = 350;

  const handleExportConfirm = useCallback(async () => {
    if (!exportFormat) return;

    const node = document.querySelector('.canvas-surface') as HTMLElement | null;
    if (!node) {
      toast.error('Canvas not found');
      setExportFormat(null);
      return;
    }

    setIsExporting(true);

    try {
      const htmlToImage = await import('html-to-image');
      const { jsPDF } = await import('jspdf');
      const pixelRatio = Math.max(1, window.devicePixelRatio || 1) * 2;

      if (exportFormat === 'png') {
        const dataUrl = await htmlToImage.toPng(node, { backgroundColor: null, pixelRatio });
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'card.png';
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else if (exportFormat === 'jpg') {
        const dataUrl = await htmlToImage.toJpeg(node, { quality: 0.95, backgroundColor: '#fff', pixelRatio });
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'card.jpg';
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else if (exportFormat === 'pdf') {
        const dataUrl = await htmlToImage.toPng(node, { backgroundColor: '#fff', pixelRatio });
        const pdf = new jsPDF({ orientation: CANVAS_WIDTH >= CANVAS_HEIGHT ? 'landscape' : 'portrait', unit: 'px', format: [CANVAS_WIDTH, CANVAS_HEIGHT] });
        pdf.addImage(dataUrl, 'PNG', 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        pdf.save('card.pdf');
      }

      toast.success(`Card exported as ${exportFormat.toUpperCase()}`);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Export failed', err);
      toast.error('Export failed');
    } finally {
      setIsExporting(false);
      setExportFormat(null);
    }
  }, [exportFormat]);

  const handleDelete = useCallback(() => {
    if (selectedIds.length > 0) {
      deleteElements(selectedIds);
      toast.success('Elements deleted');
    }
  }, [selectedIds, deleteElements]);

  const handleGroup = useCallback(() => {
    if (selectedIds.length >= 2) {
      groupElements();
      toast.success('Elements grouped');
    }
  }, [selectedIds, groupElements]);

  const handleUngroup = useCallback(() => {
    ungroupElements();
    toast.success('Elements ungrouped');
  }, [ungroupElements]);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header
        canUndo={canUndo}
        canRedo={canRedo}
        isDarkMode={isDarkMode}
        onUndo={undo}
        onRedo={redo}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        onExport={handleExport}
      />

      <div className="flex-1 flex overflow-hidden">
        <ToolsSidebar
          activeTool={activeTool}
          selectedCount={selectedIds.length}
          onToolChange={setActiveTool}
          onDelete={handleDelete}
          onGroup={handleGroup}
          onUngroup={handleUngroup}
        />

        <Canvas
          elements={elements}
          selectedIds={selectedIds}
          activeTool={activeTool}
          zoom={zoom}
          showGrid={showGrid}
          gridSize={gridSize}
          onZoomChange={setZoom}
          onSelectElement={selectElement}
          onClearSelection={clearSelection}
          onMoveElement={moveElement}
          onResizeElement={resizeElement}
          onRotateElement={rotateElement}
          onAddElement={addElement}
          onUpdateElementWithHistory={updateElementWithHistory}
          onUpdateElement={updateElement}
        />

        <PropertiesPanel
          selectedElements={getSelectedElements()}
          onUpdateElement={updateElement}
        />

        <LayersPanel
          elements={elements}
          selectedIds={selectedIds}
          onSelectElement={selectElement}
          onUpdateElement={updateElement}
          onReorderLayers={reorderLayers}
        />
      </div>

      <ExportModal
        open={exportFormat !== null}
        format={exportFormat}
        onClose={() => setExportFormat(null)}
        onConfirm={handleExportConfirm}
        isLoading={isExporting}
      />
    </div>
  );
}
