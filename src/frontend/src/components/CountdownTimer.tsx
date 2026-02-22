import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  targetTime: number;
  onComplete?: () => void;
}

export function CountdownTimer({ targetTime, onComplete }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = Date.now();
      const difference = targetTime - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        if (onComplete) {
          onComplete();
        }
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [targetTime, onComplete]);

  if (!timeLeft) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-2 text-muted-foreground">
        <Clock className="w-5 h-5" />
        <span className="text-sm font-medium">Time Until Unlock</span>
      </div>
      
      <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
        <div className="text-center">
          <div className="bg-primary/10 rounded-lg p-4 mb-2">
            <span className="text-3xl font-bold text-primary">{timeLeft.days}</span>
          </div>
          <span className="text-xs text-muted-foreground uppercase tracking-wide">Days</span>
        </div>
        <div className="text-center">
          <div className="bg-primary/10 rounded-lg p-4 mb-2">
            <span className="text-3xl font-bold text-primary">{timeLeft.hours}</span>
          </div>
          <span className="text-xs text-muted-foreground uppercase tracking-wide">Hours</span>
        </div>
        <div className="text-center">
          <div className="bg-primary/10 rounded-lg p-4 mb-2">
            <span className="text-3xl font-bold text-primary">{timeLeft.minutes}</span>
          </div>
          <span className="text-xs text-muted-foreground uppercase tracking-wide">Minutes</span>
        </div>
        <div className="text-center">
          <div className="bg-primary/10 rounded-lg p-4 mb-2">
            <span className="text-3xl font-bold text-primary">{timeLeft.seconds}</span>
          </div>
          <span className="text-xs text-muted-foreground uppercase tracking-wide">Seconds</span>
        </div>
      </div>
    </div>
  );
}
