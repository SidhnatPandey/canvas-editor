import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileImage, FileText, Download } from 'lucide-react';

interface ExportModalProps {
  open: boolean;
  format: 'png' | 'jpg' | 'pdf' | null;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
}

const formatInfo = {
  png: {
    icon: FileImage,
    title: 'Export as PNG',
    description: 'High-resolution image with transparent background support. Best for digital use.',
    extension: '.png',
  },
  jpg: {
    icon: FileImage,
    title: 'Export as JPEG',
    description: 'Compressed image format. Smaller file size, ideal for web and email.',
    extension: '.jpg',
  },
  pdf: {
    icon: FileText,
    title: 'Export as PDF',
    description: 'Print-ready document format. Perfect for professional printing.',
    extension: '.pdf',
  },
};

export function ExportModal({ open, format, onClose, onConfirm, isLoading }: ExportModalProps) {
  if (!format) return null;

  const info = formatInfo[format];
  const Icon = info.icon;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-primary" />
            {info.title}
          </DialogTitle>
          <DialogDescription>{info.description}</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-muted rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Format</span>
              <span className="font-medium">{format.toUpperCase()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Dimensions</span>
              <span className="font-medium">600 × 350 px</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Resolution</span>
              <span className="font-medium">300 DPI</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={onConfirm} className="gap-2" disabled={isLoading}>
            <Download className="h-4 w-4" />
            {isLoading ? 'Downloading...' : `Download ${info.extension}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
