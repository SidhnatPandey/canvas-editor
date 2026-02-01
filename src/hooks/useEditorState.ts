import { useState, useCallback, useEffect } from 'react';
import { CanvasElement, ToolType, HistoryEntry, GroupElement } from '@/types/editor';

const generateId = () => Math.random().toString(36).substr(2, 9);

const initialElements: CanvasElement[] = [
  {
    id: generateId(),
    type: 'rectangle',
    name: 'Background',
    x: 0,
    y: 0,
    width: 600,
    height: 350,
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
    fill: '#ffffff',
    stroke: 'transparent',
    strokeWidth: 0,
    borderRadius: 0,
  },
  {
    id: generateId(),
    type: 'rectangle',
    name: 'Accent Bar',
    x: 0,
    y: 0,
    width: 600,
    height: 8,
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
    fill: '#3B82F6',
    stroke: 'transparent',
    strokeWidth: 0,
    borderRadius: 0,
  },
  {
    id: generateId(),
    type: 'text',
    name: 'Name',
    x: 40,
    y: 60,
    width: 300,
    height: 40,
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
    content: 'John Doe',
    fontFamily: 'Inter',
    fontSize: 28,
    fontWeight: 'bold',
    fontStyle: 'normal',
    textDecoration: 'none',
    textAlign: 'left',
    lineHeight: 1.2,
    color: '#1a1a1a',
  },
  {
    id: generateId(),
    type: 'text',
    name: 'Title',
    x: 40,
    y: 100,
    width: 300,
    height: 24,
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
    content: 'Senior Product Designer',
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: 'normal',
    fontStyle: 'normal',
    textDecoration: 'none',
    textAlign: 'left',
    lineHeight: 1.4,
    color: '#6b7280',
  },
  {
    id: generateId(),
    type: 'text',
    name: 'Email',
    x: 40,
    y: 200,
    width: 250,
    height: 20,
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
    content: 'john.doe@company.com',
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: 'normal',
    fontStyle: 'normal',
    textDecoration: 'none',
    textAlign: 'left',
    lineHeight: 1.4,
    color: '#374151',
  },
  {
    id: generateId(),
    type: 'text',
    name: 'Phone',
    x: 40,
    y: 225,
    width: 200,
    height: 20,
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
    content: '+1 (555) 123-4567',
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: 'normal',
    fontStyle: 'normal',
    textDecoration: 'none',
    textAlign: 'left',
    lineHeight: 1.4,
    color: '#374151',
  },
  {
    id: generateId(),
    type: 'text',
    name: 'Website',
    x: 40,
    y: 250,
    width: 200,
    height: 20,
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
    content: 'www.company.com',
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: 'normal',
    fontStyle: 'normal',
    textDecoration: 'none',
    textAlign: 'left',
    lineHeight: 1.4,
    color: '#3B82F6',
  },
  {
    id: generateId(),
    type: 'circle',
    name: 'Logo Circle',
    x: 460,
    y: 120,
    width: 100,
    height: 100,
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
    fill: '#EFF6FF',
    stroke: '#3B82F6',
    strokeWidth: 2,
    borderRadius: 50,
  },
];

export function useEditorState() {
  const [elements, setElements] = useState<CanvasElement[]>(initialElements);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [zoom, setZoom] = useState(1);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [gridSize, setGridSize] = useState(20);
  
  const [history, setHistory] = useState<HistoryEntry[]>([{ elements: initialElements, timestamp: Date.now() }]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Apply dark mode class
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const pushHistory = useCallback((newElements: CanvasElement[]) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push({ elements: newElements, timestamp: Date.now() });
      return newHistory.slice(-50);
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  }, [historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setElements(history[newIndex].elements);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setElements(history[newIndex].elements);
    }
  }, [history, historyIndex]);

  const addElement = useCallback((element: Omit<CanvasElement, 'id'>) => {
    const newElement = { ...element, id: generateId() } as CanvasElement;
    const newElements = [...elements, newElement];
    setElements(newElements);
    pushHistory(newElements);
    setSelectedIds([newElement.id]);
    setActiveTool('select');
  }, [elements, pushHistory]);

  const updateElement = useCallback((id: string, updates: Partial<CanvasElement>) => {
    const newElements = elements.map(el => 
      el.id === id ? { ...el, ...updates } as CanvasElement : el
    );
    setElements(newElements);
  }, [elements]);

  const updateElementWithHistory = useCallback((id: string, updates: Partial<CanvasElement>) => {
    const newElements = elements.map(el => 
      el.id === id ? { ...el, ...updates } as CanvasElement : el
    );
    setElements(newElements);
    pushHistory(newElements);
  }, [elements, pushHistory]);

  const deleteElements = useCallback((ids: string[]) => {
    const newElements = elements.filter(el => !ids.includes(el.id));
    setElements(newElements);
    pushHistory(newElements);
    setSelectedIds([]);
  }, [elements, pushHistory]);

  const moveElement = useCallback((id: string, x: number, y: number) => {
    updateElement(id, { x, y });
  }, [updateElement]);

  const resizeElement = useCallback((id: string, width: number, height: number, x?: number, y?: number) => {
    const updates: Partial<CanvasElement> = { width, height };
    if (x !== undefined) updates.x = x;
    if (y !== undefined) updates.y = y;
    updateElement(id, updates);
  }, [updateElement]);

  const rotateElement = useCallback((id: string, rotation: number) => {
    updateElement(id, { rotation });
  }, [updateElement]);

  const reorderLayers = useCallback((fromIndex: number, toIndex: number) => {
    const newElements = [...elements];
    const [removed] = newElements.splice(fromIndex, 1);
    newElements.splice(toIndex, 0, removed);
    setElements(newElements);
    pushHistory(newElements);
  }, [elements, pushHistory]);

  const selectElement = useCallback((id: string, addToSelection = false) => {
    if (addToSelection) {
      setSelectedIds(prev => 
        prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
      );
    } else {
      setSelectedIds([id]);
    }
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const getSelectedElements = useCallback(() => {
    return elements.filter(el => selectedIds.includes(el.id));
  }, [elements, selectedIds]);

  // Group selected elements
  const groupElements = useCallback(() => {
    if (selectedIds.length < 2) return;

    const selectedElements = elements.filter(el => selectedIds.includes(el.id));
    
    // Calculate bounding box
    const minX = Math.min(...selectedElements.map(el => el.x));
    const minY = Math.min(...selectedElements.map(el => el.y));
    const maxX = Math.max(...selectedElements.map(el => el.x + el.width));
    const maxY = Math.max(...selectedElements.map(el => el.y + el.height));

    // Adjust children positions relative to group
    const children = selectedElements.map(el => ({
      ...el,
      x: el.x - minX,
      y: el.y - minY,
    }));

    const groupElement: GroupElement = {
      id: generateId(),
      type: 'group',
      name: 'Group',
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      children: children as CanvasElement[],
    };

    // Remove selected elements and add group
    const newElements = elements.filter(el => !selectedIds.includes(el.id));
    newElements.push(groupElement);
    
    setElements(newElements);
    pushHistory(newElements);
    setSelectedIds([groupElement.id]);
  }, [elements, selectedIds, pushHistory]);

  // Ungroup selected group elements
  const ungroupElements = useCallback(() => {
    const selectedGroups = elements.filter(
      el => selectedIds.includes(el.id) && el.type === 'group'
    ) as GroupElement[];

    if (selectedGroups.length === 0) return;

    let newElements = [...elements];
    const newSelectedIds: string[] = [];

    selectedGroups.forEach(group => {
      // Remove the group
      newElements = newElements.filter(el => el.id !== group.id);
      
      // Add children back with adjusted positions
      const restoredChildren = group.children.map(child => ({
        ...child,
        id: generateId(), // New IDs for ungrouped elements
        x: child.x + group.x,
        y: child.y + group.y,
      }));
      
      newElements.push(...restoredChildren);
      newSelectedIds.push(...restoredChildren.map(c => c.id));
    });

    setElements(newElements);
    pushHistory(newElements);
    setSelectedIds(newSelectedIds);
  }, [elements, selectedIds, pushHistory]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return {
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
    setShowGrid,
    setGridSize,
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
  };
}
