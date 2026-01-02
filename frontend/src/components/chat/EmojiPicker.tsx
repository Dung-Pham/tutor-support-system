import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Smile } from 'lucide-react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  disabled?: boolean;
}

export function EmojiPicker({ onEmojiSelect, disabled = false }: EmojiPickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowPicker(false);
      }
    };

    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPicker]);

  const handleEmojiSelect = (emoji: any) => {
    onEmojiSelect(emoji.native);
    setShowPicker(false);
  };

  return (
    <div className="relative" ref={pickerRef}>
      {/* Emoji Button */}
      <Button
        onClick={() => setShowPicker(!showPicker)}
        disabled={disabled}
        size="icon"
        variant="ghost"
        className="h-10 w-10"
        type="button"
      >
        <Smile className="w-5 h-5 text-yellow-500" />
      </Button>

      {/* Emoji Picker Popup */}
      {showPicker && (
        <div className="absolute bottom-12 right-0 z-50 shadow-xl rounded-lg overflow-hidden">
          <Picker
            data={data}
            onEmojiSelect={handleEmojiSelect}
            theme="auto"
            previewPosition="none"
            skinTonePosition="none"
            maxFrequentRows={1}
          />
        </div>
      )}
    </div>
  );
}
