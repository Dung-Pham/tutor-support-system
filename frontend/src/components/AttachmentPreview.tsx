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

// Set worker source for PDF.js - use unpkg CDN which has all versions
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface AttachmentPreviewProps {
  url: string | null | undefined;
  name: string | null | undefined;
  type: string | null | undefined;
  size?: number | null;
  showPreview?: boolean;
  className?: string;
}

// PDF Viewer Component using PDF.js - Google Drive style
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
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(0.6);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [renderedPages, setRenderedPages] = useState<Set<number>>(new Set());

  // Load PDF document
  useEffect(() => {
    // Don't load if URL is invalid
    if (!url || typeof url !== 'string') {
      setError('URL không hợp lệ');
      setLoading(false);
      return;
    }

    let cancelled = false;
    
    const loadPdf = async () => {
      try {
        setLoading(true);
        setError(null);
        setRenderedPages(new Set());
        
        const loadingTask = pdfjsLib.getDocument({
          url: url,
          cMapUrl: 'https://unpkg.com/pdfjs-dist@5.4.530/cmaps/',
          cMapPacked: true,
        });
        
        const pdf = await loadingTask.promise;
        
        if (!cancelled) {
          setPdfDoc(pdf);
          setTotalPages(pdf.numPages);
          setLoading(false);
        }
      } catch (err: any) {
        console.error('Error loading PDF:', err);
        if (!cancelled) {
          // Check for specific error types
          if (err?.name === 'MissingPDFException') {
            setError('File PDF không tồn tại trên server');
          } else if (err?.message?.includes('404')) {
            setError('File PDF không tìm thấy (404)');
          } else {
            setError('Không thể tải file PDF. Vui lòng thử tải về.');
          }
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
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Scroll to page
      const pageElement = pagesContainerRef.current?.children[page - 1] as HTMLElement;
      if (pageElement) {
        pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // Track current page on scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const pages = pagesContainerRef.current?.children;
      if (!pages) return;

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i] as HTMLElement;
        const rect = page.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        if (rect.top >= containerRect.top - 100 && rect.top <= containerRect.top + 200) {
          setCurrentPage(i + 1);
          break;
        }
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [totalPages]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-[#525659]">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
        <span className="ml-2 text-gray-300">Đang tải PDF...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#525659] p-8">
        <FileText className="h-16 w-16 text-gray-400 mb-4" />
        <p className="text-white font-medium mb-2">Không thể hiển thị file</p>
        <p className="text-gray-400 mb-4 text-sm text-center">{error}</p>
        <p className="text-gray-500 text-xs mb-4 text-center">
          File có thể đã bị xóa hoặc chưa được upload thực sự
        </p>
        <div className="flex gap-2">
          <a href={url} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="bg-transparent border-gray-500 text-white hover:bg-gray-600">
              <ExternalLink className="h-4 w-4 mr-2" />
              Thử mở trong tab mới
            </Button>
          </a>
          <a href={url} download={name}>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Download className="h-4 w-4 mr-2" />
              Tải xuống
            </Button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#525659] relative">
      {/* PDF Content Area - scrollable */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto"
      >
        <div 
          ref={pagesContainerRef}
          className="flex flex-col items-center py-6 px-4"
        />
      </div>

      {/* Floating Zoom Toolbar - middle center, above bottom bar */}
      <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 flex items-center gap-1.5 bg-gray-700/40 rounded-full px-3 py-2 shadow-lg z-50 backdrop-blur-md border border-gray-500/20">
        <button
          onClick={zoomOut}
          disabled={scale <= 0.5}
          className="p-1.5 text-gray-200 hover:bg-gray-500/50 rounded-full disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Thu nhỏ"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <div className="w-px h-5 bg-gray-400/50" />
        <span className="text-gray-200 text-xs px-2 min-w-[36px] text-center font-medium">
          {Math.round(scale * 100)}%
        </span>
        <div className="w-px h-5 bg-gray-400/50" />
        <button
          onClick={zoomIn}
          disabled={scale >= 2.5}
          className="p-1.5 text-gray-200 hover:bg-gray-500/50 rounded-full disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Phóng to"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
      </div>

      {/* Bottom Control Bar - Google Drive style */}
      <div className="flex items-center justify-center gap-4 py-3 px-4 bg-[#323232]">
        {/* Page navigation */}
        <div className="flex items-center gap-2">
          <span className="text-gray-300 text-sm">Trang</span>
          <input
            type="number"
            value={currentPage}
            onChange={(e) => goToPage(parseInt(e.target.value) || 1)}
            className="w-12 px-2 py-1 text-center text-sm bg-[#525659] text-white border border-gray-500 rounded focus:outline-none focus:border-blue-400"
            min={1}
            max={totalPages}
          />
          <span className="text-gray-300 text-sm">/ {totalPages}</span>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-600" />
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
