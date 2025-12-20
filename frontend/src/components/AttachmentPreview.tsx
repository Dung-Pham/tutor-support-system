/**
 * File: components/AttachmentPreview.tsx
 * Mục đích: Component hiển thị file đính kèm (hình ảnh, PDF, link, etc.)
 * Sử dụng PDF.js để render PDF thành canvas - không dùng iframe
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Download, 
  ExternalLink,
  X,
  Maximize2,
  FileText,
  ZoomIn,
  ZoomOut,
  Loader2
} from 'lucide-react';
import { Button } from './ui/button';
import { 
  getFileUrl, 
  isExternalLink, 
  isImageFile, 
  isPdfFile,
  getFileEmoji,
  formatFileSize 
} from '../utils/fileHelper';
import * as pdfjsLib from 'pdfjs-dist';

// Set worker source for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface AttachmentPreviewProps {
  url: string | null | undefined;
  name: string | null | undefined;
  type: string | null | undefined;
  size?: number | null;
  showPreview?: boolean;
  className?: string;
}

// PDF Viewer Component using PDF.js - renders ALL pages for scrolling
const PDFViewer: React.FC<{
  url: string;
  name?: string;
  onFullscreen?: () => void;
  isFullscreen?: boolean;
}> = ({ url, name, onFullscreen, isFullscreen = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pagesContainerRef = useRef<HTMLDivElement>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [renderedPages, setRenderedPages] = useState<Set<number>>(new Set());

  // Load PDF document
  useEffect(() => {
    let cancelled = false;
    
    const loadPdf = async () => {
      try {
        setLoading(true);
        setError(null);
        setRenderedPages(new Set());
        
        const loadingTask = pdfjsLib.getDocument({
          url: url,
          cMapUrl: `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/cmaps/`,
          cMapPacked: true,
        });
        
        const pdf = await loadingTask.promise;
        
        if (!cancelled) {
          setPdfDoc(pdf);
          setTotalPages(pdf.numPages);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error loading PDF:', err);
        if (!cancelled) {
          setError('Không thể tải file PDF');
          setLoading(false);
        }
      }
    };

    loadPdf();
    
    return () => {
      cancelled = true;
    };
  }, [url]);

  // Render a single page to canvas
  const renderPageToCanvas = useCallback(async (pageNum: number, canvas: HTMLCanvasElement) => {
    if (!pdfDoc) return;

    try {
      const page = await pdfDoc.getPage(pageNum);
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;

      // Use device pixel ratio for sharp rendering
      const pixelRatio = window.devicePixelRatio || 1;
      const viewport = page.getViewport({ scale: scale * pixelRatio });
      
      // Set canvas dimensions accounting for pixel ratio
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.width = `${viewport.width / pixelRatio}px`;
      canvas.style.height = `${viewport.height / pixelRatio}px`;

      const renderContext = {
        canvasContext: ctx,
        viewport: viewport,
      };

      await page.render(renderContext).promise;
      
      setRenderedPages(prev => new Set(prev).add(pageNum));
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'name' in err && err.name !== 'RenderingCancelledException') {
        console.error('Error rendering page:', err);
      }
    }
  }, [pdfDoc, scale]);

  // Render all pages when PDF is loaded or scale changes
  useEffect(() => {
    if (!pdfDoc || !pagesContainerRef.current) return;

    const container = pagesContainerRef.current;
    container.innerHTML = ''; // Clear previous pages
    setRenderedPages(new Set());

    // Create and render all pages
    for (let i = 1; i <= totalPages; i++) {
      const pageWrapper = document.createElement('div');
      pageWrapper.className = 'pdf-page-wrapper mb-4 shadow-lg bg-white';
      pageWrapper.style.display = 'flex';
      pageWrapper.style.justifyContent = 'center';
      
      const canvas = document.createElement('canvas');
      canvas.className = 'pdf-page-canvas';
      pageWrapper.appendChild(canvas);
      container.appendChild(pageWrapper);
      
      // Render page
      renderPageToCanvas(i, canvas);
    }
  }, [pdfDoc, totalPages, scale, renderPageToCanvas]);

  const zoomIn = () => setScale(s => Math.min(2.5, s + 0.2));
  const zoomOut = () => setScale(s => Math.max(0.5, s - 0.2));
  const resetZoom = () => setScale(1.0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] bg-gray-100">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Đang tải PDF...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-gray-100 p-8">
        <FileText className="h-16 w-16 text-gray-300 mb-4" />
        <p className="text-gray-500 mb-4">{error}</p>
        <div className="flex gap-2">
          <a href={url} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              Mở trong tab mới
            </Button>
          </a>
          <a href={url} download={name}>
            <Button size="sm">
              <Download className="h-4 w-4 mr-2" />
              Tải xuống
            </Button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${isFullscreen ? 'h-full' : ''}`}>
      {/* Controls */}
      <div className={`flex items-center justify-between p-2 border-b bg-gray-50 sticky top-0 z-10 ${isFullscreen ? 'bg-gray-800 border-gray-700' : ''}`}>
        {/* Page info */}
        <div className="flex items-center gap-2">
          <span className={`text-sm ${isFullscreen ? 'text-white' : 'text-gray-600'}`}>
            {totalPages} trang {renderedPages.size < totalPages && `(đang tải ${renderedPages.size}/${totalPages})`}
          </span>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={zoomOut}
            disabled={scale <= 0.5}
            title="Thu nhỏ"
            className={isFullscreen ? 'text-white hover:bg-gray-700' : ''}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <button
            onClick={resetZoom}
            className={`text-xs px-2 min-w-[50px] text-center hover:bg-gray-200 rounded ${isFullscreen ? 'text-white hover:bg-gray-700' : 'text-gray-600'}`}
            title="Reset zoom"
          >
            {Math.round(scale * 100)}%
          </button>
          <Button
            variant="ghost"
            size="sm"
            onClick={zoomIn}
            disabled={scale >= 2.5}
            title="Phóng to"
            className={isFullscreen ? 'text-white hover:bg-gray-700' : ''}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          
          {!isFullscreen && onFullscreen && (
            <>
              <div className="w-px h-5 bg-gray-300 mx-1" />
              <Button
                variant="ghost"
                size="sm"
                onClick={onFullscreen}
                title="Toàn màn hình"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Pages container - scrollable */}
      <div 
        ref={containerRef}
        className={`overflow-auto ${isFullscreen ? 'flex-1 bg-gray-900' : 'bg-gray-300'}`}
        style={{ height: isFullscreen ? 'calc(100vh - 120px)' : '600px' }}
      >
        <div 
          ref={pagesContainerRef}
          className="flex flex-col items-center py-4 px-2"
        />
      </div>
    </div>
  );
};

export const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({
  url,
  name,
  type,
  size,
  showPreview = true,
  className = '',
}) => {
  const [showModal, setShowModal] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [zoom, setZoom] = useState(100);

  const fullUrl = url ? getFileUrl(url) : null;
  const isExternal = url ? isExternalLink(url) : false;
  const isImage = isImageFile(type);
  const isPdf = isPdfFile(type);
  const emoji = getFileEmoji(type);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowModal(false);
    };
    if (showModal) {
      window.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [showModal]);

  if (!url || !fullUrl) return null;

  // Fullscreen Modal
  const FullscreenModal = () => (
    <div 
      className="fixed inset-0 z-50 bg-black/95 flex flex-col"
      onClick={() => setShowModal(false)}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-gray-900/80 backdrop-blur shrink-0">
        <div className="flex items-center gap-3 text-white">
          <span className="text-xl">{emoji}</span>
          <span className="font-medium truncate max-w-md text-sm">{name}</span>
        </div>
        <div className="flex items-center gap-1">
          {isImage && (
            <>
              <button
                className="p-2 text-white hover:bg-white/10 rounded transition-colors"
                onClick={(e) => { e.stopPropagation(); setZoom(z => Math.max(50, z - 25)); }}
                title="Thu nhỏ"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="text-white text-xs px-2">{zoom}%</span>
              <button
                className="p-2 text-white hover:bg-white/10 rounded transition-colors"
                onClick={(e) => { e.stopPropagation(); setZoom(z => Math.min(200, z + 25)); }}
                title="Phóng to"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <div className="w-px h-5 bg-white/20 mx-1" />
            </>
          )}
          <a
            href={fullUrl}
            download={name}
            className="p-2 text-white hover:bg-white/10 rounded transition-colors"
            onClick={(e) => e.stopPropagation()}
            title="Tải xuống"
          >
            <Download className="h-4 w-4" />
          </a>
          <a
            href={fullUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-white hover:bg-white/10 rounded transition-colors"
            onClick={(e) => e.stopPropagation()}
            title="Mở trong tab mới"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
          <button
            className="p-2 text-white hover:bg-white/10 rounded transition-colors ml-2"
            onClick={() => setShowModal(false)}
            title="Đóng (Esc)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div 
        className="flex-1 flex items-center justify-center overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {isImage && (
          <img
            src={fullUrl}
            alt={name || 'Image'}
            className="max-w-full max-h-full object-contain transition-transform duration-200 p-4"
            style={{ 
              transform: `scale(${zoom/100})`,
            }}
          />
        )}
        {isPdf && (
          <div className="w-full h-full">
            <PDFViewer 
              url={fullUrl} 
              name={name || undefined}
              isFullscreen={true}
            />
          </div>
        )}
      </div>
    </div>
  );

  // Image preview
  if (isImage && showPreview && !imageError) {
    return (
      <>
        <div className={`relative group rounded-lg overflow-hidden border bg-gray-50 ${className}`}>
          <img
            src={fullUrl}
            alt={name || 'Attachment'}
            className="w-full h-auto max-h-[400px] object-contain cursor-pointer transition-opacity hover:opacity-95"
            onClick={() => setShowModal(true)}
            onError={() => setImageError(true)}
          />
          {/* Overlay buttons */}
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => setShowModal(true)}
              className="shadow-lg"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
            <a href={fullUrl} download={name} onClick={(e) => e.stopPropagation()}>
              <Button variant="secondary" size="sm" className="shadow-lg">
                <Download className="h-4 w-4" />
              </Button>
            </a>
          </div>
          {/* File name */}
          {name && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
              <p className="text-white text-sm truncate">{name}</p>
            </div>
          )}
        </div>

        {showModal && <FullscreenModal />}
      </>
    );
  }

  // PDF preview using PDF.js
  if (isPdf && showPreview) {
    return (
      <>
        <div className={`border rounded-lg overflow-hidden shadow-sm bg-white ${className}`}>
          {/* Header */}
          <div className="bg-gray-100 p-3 flex items-center justify-between border-b">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-red-500" />
              <div>
                <p className="font-medium text-sm truncate max-w-[300px]">{name || 'Document.pdf'}</p>
                {size && <p className="text-xs text-gray-500">{formatFileSize(size)}</p>}
              </div>
            </div>
            <div className="flex gap-1">
              <a href={fullUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="sm" title="Mở trong tab mới">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
              <a href={fullUrl} download={name}>
                <Button variant="ghost" size="sm" title="Tải xuống">
                  <Download className="h-4 w-4" />
                </Button>
              </a>
            </div>
          </div>

          {/* PDF Viewer using PDF.js canvas rendering */}
          <PDFViewer 
            url={fullUrl} 
            name={name || undefined}
            onFullscreen={() => setShowModal(true)}
          />
        </div>

        {showModal && <FullscreenModal />}
      </>
    );
  }

  // External link
  if (isExternal || type === 'link') {
    return (
      <div className={`p-4 bg-blue-50 rounded-lg border border-blue-200 ${className}`}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔗</span>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{name || 'External Link'}</p>
            <p className="text-xs text-gray-500 truncate">{fullUrl}</p>
          </div>
          <a
            href={fullUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium whitespace-nowrap"
          >
            Mở link
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    );
  }

  // Generic file (Word, Excel, ZIP, etc.)
  return (
    <div className={`p-4 bg-gray-50 rounded-lg border ${className}`}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{name || 'File'}</p>
          {size && <p className="text-xs text-gray-500">{formatFileSize(size)}</p>}
        </div>
        <a
          href={fullUrl}
          download={name}
          className="flex items-center gap-1 text-green-600 hover:text-green-800 text-sm font-medium whitespace-nowrap"
        >
          <Download className="h-4 w-4" />
          Tải xuống
        </a>
      </div>
    </div>
  );
};

export default AttachmentPreview;
