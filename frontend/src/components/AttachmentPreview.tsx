/**
 * File: components/AttachmentPreview.tsx
 * Mục đích: Component hiển thị file đính kèm (hình ảnh, PDF, link, etc.)
 * Hỗ trợ xem inline ngay trong trang với PDF viewer và image viewer
 */

import React, { useState } from 'react';
import { 
  Download, 
  ExternalLink,
  X,
  Maximize2,
  FileText,
  ZoomIn,
  ZoomOut,
  RotateCw
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

interface AttachmentPreviewProps {
  url: string | null | undefined;
  name: string | null | undefined;
  type: string | null | undefined;
  size?: number | null;
  showPreview?: boolean;
  className?: string;
}

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
  const [pdfError, setPdfError] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  if (!url) return null;

  const fullUrl = getFileUrl(url);
  const isExternal = isExternalLink(url);
  const isImage = isImageFile(type);
  const isPdf = isPdfFile(type);
  const emoji = getFileEmoji(type);

  if (!fullUrl) return null;

  // Fullscreen Modal for both Image and PDF
  const FullscreenModal = () => (
    <div 
      className="fixed inset-0 z-50 bg-black/95 flex flex-col"
      onClick={() => setShowModal(false)}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-gray-900/80 backdrop-blur">
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
              <button
                className="p-2 text-white hover:bg-white/10 rounded transition-colors"
                onClick={(e) => { e.stopPropagation(); setRotation(r => (r + 90) % 360); }}
                title="Xoay"
              >
                <RotateCw className="h-4 w-4" />
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
        className="flex-1 flex items-center justify-center overflow-auto p-4"
        onClick={(e) => e.stopPropagation()}
      >
        {isImage && (
          <img
            src={fullUrl}
            alt={name || 'Image'}
            className="max-w-full max-h-full object-contain transition-transform duration-200"
            style={{ 
              transform: `scale(${zoom/100}) rotate(${rotation}deg)`,
            }}
          />
        )}
        {isPdf && (
          <iframe
            src={fullUrl}
            className="w-full h-full bg-white rounded shadow-2xl"
            title={name || 'PDF Document'}
            style={{ minHeight: '80vh' }}
          />
        )}
      </div>
    </div>
  );

  // Image preview - inline with larger display
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

  // PDF preview - inline with iframe viewer
  if (isPdf && showPreview) {
    return (
      <>
        <div className={`border rounded-lg overflow-hidden shadow-sm ${className}`}>
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowModal(true)}
                title="Xem toàn màn hình"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
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

          {/* PDF Inline Viewer */}
          {!pdfError ? (
            <div className="bg-gray-200 w-full overflow-auto">
              <iframe
                src={fullUrl}
                className="w-full border-0"
                style={{ height: '600px', display: 'block' }}
                title={name || 'PDF Preview'}
                onError={() => setPdfError(true)}
                scrolling="yes"
                sandbox="allow-same-origin allow-scripts"
              />
            </div>
          ) : (
            <div className="p-8 text-center bg-gray-50">
              <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 mb-4">Không thể hiển thị PDF trực tiếp</p>
              <div className="flex justify-center gap-2">
                <a href={fullUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Mở trong tab mới
                  </Button>
                </a>
                <a href={fullUrl} download={name}>
                  <Button size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Tải xuống
                  </Button>
                </a>
              </div>
            </div>
          )}
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
