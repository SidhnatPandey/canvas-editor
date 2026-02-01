export type ElementType = 'text' | 'rectangle' | 'circle' | 'line' | 'image' | 'icon' | 'group';

export type ToolType = 'select' | 'text' | 'rectangle' | 'circle' | 'line' | 'image' | 'icon';

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface BaseElement {
  id: string;
  type: ElementType;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  visible: boolean;
  locked: boolean;
}

export interface TextElement extends BaseElement {
  type: 'text';
  content: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline';
  textAlign: 'left' | 'center' | 'right';
  lineHeight: number;
  color: string;
}

export interface ShapeElement extends BaseElement {
  type: 'rectangle' | 'circle';
  fill: string;
  stroke: string;
  strokeWidth: number;
  borderRadius: number;
}

export interface LineElement extends BaseElement {
  type: 'line';
  stroke: string;
  strokeWidth: number;
}

export interface ImageElement extends BaseElement {
  type: 'image';
  src: string;
  fit: 'cover' | 'contain' | 'fill';
}

export interface IconElement extends BaseElement {
  type: 'icon';
  iconName: string;
  color: string;
}

export interface GroupElement extends BaseElement {
  type: 'group';
  children: CanvasElement[];
}

export type CanvasElement = TextElement | ShapeElement | LineElement | ImageElement | IconElement | GroupElement;

export interface EditorState {
  elements: CanvasElement[];
  selectedIds: string[];
  activeTool: ToolType;
  zoom: number;
  isDarkMode: boolean;
  showGrid: boolean;
  gridSize: number;
}

export interface HistoryEntry {
  elements: CanvasElement[];
  timestamp: number;
}

export type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';
