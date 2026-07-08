import React from 'react';
import { MaintenanceIcon } from './MaintenanceIcons';

type Activity = {
  id: string;
  type: 'submitted' | 'resolved' | 'in_progress' | 'pending';
  category: string;
  location: string;
  timeAgo: string;
};

type ActivityFeedProps = {
  activities: Activity[];
  className?: string;
};

const statusColors = {
  submitted: 'text-neon-blue',
  resolved: 'text-neon-green',
  in_progress: 'text-neon-gold',
  pending: 'text-yellow-500'
};

const statusLabels = {
  submitted: 'Submitted',
  resolved: 'Resolved',
  in_progress: 'In Progress',
  pending: 'Pending'
};

export function ActivityFeed({ activities, className = '' }: ActivityFeedProps) {
  return (
    <div className={`glass p-6 rounded-xl ${className}`}>
      <h3 className="text-lg font-semibold text-foreground mb-6">Recent Activity</h3>
      <div className="space-y-4">
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No recent activity
          </p>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-4 pb-4 border-b border-border last:border-b-0 last:pb-0"
            >
              <div className="flex-shrink-0 w-10 h-10 text-neon-blue">
                <MaintenanceIcon type={activity.category} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-foreground truncate">
                    {activity.category}
                  </p>
                  <span className={`text-xs font-semibold ${statusColors[activity.type]}`}>
                    {statusLabels[activity.type]}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {activity.location}
                </p>
              </div>
              <span className="text-xs text-muted-foreground flex-shrink-0">
                {activity.timeAgo}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
