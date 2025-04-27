"use client";
import { useEffect, useState } from 'react';

interface TabTrackerProps {
  userId: string;
  showWarning?: boolean; // Optional: control whether to show warnings
  className?: string; // Allow custom styling
}

interface TabActivity {
  status: string;
  timestamp: number;
  formatted_time: string;
}

interface TabMetrics {
  tabSwitchCount: number;
  timeAwaySeconds: number;
  timeAwayFormatted: string;
}

const TabTracker: React.FC<TabTrackerProps> = ({ 
  userId,
  showWarning = true,
  className = ''
}) => {
  const [activities, setActivities] = useState<TabActivity[]>([]);
  const [metrics, setMetrics] = useState<TabMetrics | null>(null);
  const [warningVisible, setWarningVisible] = useState<boolean>(false);

  // Track tab visibility
  useEffect(() => {
    if (!userId) return;

    let lastStatus = document.visibilityState === 'hidden' ? 'hidden' : 'visible';

    const handleVisibilityChange = async () => {
      const currentStatus = document.visibilityState === 'hidden' ? 'hidden' : 'visible';
      
      // Only track changes
      if (currentStatus === lastStatus) return;
      
      // Update last status
      lastStatus = currentStatus;
      
      const timestamp = Date.now();
      
      try {
        // Send data to backend
        const response = await fetch('http://localhost:5000/api/track-tab-activity', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId,
            status: currentStatus,
            timestamp
          })
        });
        
        if (response.ok) {
          // Update local state with the new activity
          const data = await response.json();
          if (data.activity) {
            setActivities(prev => [...prev, data.activity]);
          }
          
          // Show warning if user switched away from tab
          if (currentStatus === 'hidden' && showWarning) {
            setWarningVisible(true);
          }
          
          // Refresh metrics
          fetchTabActivity();
        }
      } catch (error) {
        console.error('Error tracking tab activity:', error);
      }
    };

    // Register event listener
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Initial fetch of activity data
    fetchTabActivity();
    
    // Set up periodic refresh
    const intervalId = setInterval(fetchTabActivity, 10000);
    
    // Clean up
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(intervalId);
    };
  }, [userId, showWarning]);

  // Fetch tab activity from backend
  const fetchTabActivity = async () => {
    if (!userId) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/get-tab-activity?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities || []);
        setMetrics(data.metrics || null);
        
        // Show warning if there are tab switches and warning is enabled
        if (data.metrics?.tabSwitchCount > 0 && showWarning) {
          setWarningVisible(true);
        }
      }
    } catch (error) {
      console.error('Error fetching tab activity:', error);
    }
  };

  // If nothing to display, return null
  if (!warningVisible || !showWarning) {
    return null;
  }

  return (
    <div className={`tab-tracker-component ${className}`}>
      {warningVisible && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium">Tab Switch Detected</h3>
              <div className="mt-2 text-sm">
                <p>
                  We've detected that you've left the interview tab 
                  {metrics?.tabSwitchCount && metrics.tabSwitchCount > 0 ? 
                    ` ${metrics.tabSwitchCount} ${metrics.tabSwitchCount === 1 ? 'time' : 'times'}` : 
                    ''}
                  {metrics?.timeAwayFormatted && ` (${metrics.timeAwayFormatted} away)`}.
                </p>
                <p className="mt-1 font-semibold">
                  Leaving the interview tab during assessment is not recommended.
                </p>
              </div>
            </div>
            {/* Close button */}
            <div className="ml-auto pl-3">
              <button 
                className="text-yellow-500 hover:text-yellow-700"
                onClick={() => setWarningVisible(false)}
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TabTracker;