import React, { useState } from 'react';
import { WifiOff, RefreshCw, X } from 'lucide-react';
import { Button } from './Button';

interface OfflineBannerProps {
  isOffline: boolean;
  onRetry: () => void;
  onDismiss?: () => void;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ isOffline, onRetry, onDismiss }) => {
  const [isRetrying, setIsRetrying] = useState(false);

  if (!isOffline) return null;

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setTimeout(() => setIsRetrying(false), 800);
    }
  };

  return (
    <div className="bg-amber-950/80 border-b border-amber-500/30 px-4 py-2 flex items-center justify-between text-xs text-amber-200 z-50 animate-fadeIn">
      <div className="flex items-center gap-2">
        <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
        <span>
          <strong>MASTER AI connection lost:</strong> Backend API is currently offline. Operating in local browser mode.
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleRetry}
          disabled={isRetrying}
          className="h-7 text-xs py-0 border-amber-500/30 text-amber-300 hover:bg-amber-500/20"
          leftIcon={<RefreshCw className={`w-3 h-3 ${isRetrying ? 'animate-spin' : ''}`} />}
        >
          {isRetrying ? 'Connecting...' : 'Retry Connection'}
        </Button>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1 text-amber-400 hover:text-white rounded transition-colors"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

