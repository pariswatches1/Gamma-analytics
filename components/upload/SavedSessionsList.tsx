'use client';

import { UploadSession } from '@/lib/types';
import { formatDate } from '@/lib/calculations';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/ui';
import { Clock, FileSpreadsheet, Trash2, ArrowRight, FolderOpen } from 'lucide-react';

export interface SavedSessionsListProps {
  sessions: UploadSession[];
  activeSessionId?: string | null;
  currentSessionId?: string | null;
  onLoadSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
}

export function SavedSessionsList({
  sessions,
  activeSessionId,
  currentSessionId,
  onLoadSession,
  onDeleteSession,
}: SavedSessionsListProps) {
  // Use currentSessionId or activeSessionId
  const activeId = currentSessionId ?? activeSessionId ?? null;
  if (sessions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Saved Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <div className="mx-auto w-12 h-12 rounded-xl bg-surface-hover flex items-center justify-center mb-3">
              <FolderOpen className="h-6 w-6 text-text-tertiary" />
            </div>
            <p className="text-text-secondary">No saved sessions yet.</p>
            <p className="text-sm text-text-tertiary mt-1">
              Upload a CSV file to create your first session.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort by most recent first
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Saved Sessions</CardTitle>
          <Badge variant="default">{sessions.length} sessions</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {sortedSessions.map((session, index) => {
            const isActive = session.id === activeId;

            return (
              <div
                key={session.id}
                className={cn(
                  'p-4 hover:bg-surface-hover transition-colors animate-fade-in',
                  isActive && 'bg-accent-blue/5 border-l-2 border-l-accent-blue'
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                        isActive ? 'bg-accent-blue/10' : 'bg-surface-hover'
                      )}
                    >
                      <FileSpreadsheet
                        className={cn(
                          'h-5 w-5',
                          isActive ? 'text-accent-blue' : 'text-text-tertiary'
                        )}
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-text-primary truncate">
                          {session.name}
                        </h4>
                        {isActive && (
                          <Badge variant="info" size="sm">
                            Active
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-text-tertiary mt-0.5">
                        <span className="font-medium text-text-secondary">
                          {session.symbol}
                        </span>
                        <span>•</span>
                        <span>{session.optionCount.toLocaleString()} options</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(session.uploadedAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!isActive && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onLoadSession(session.id)}
                      >
                        <span className="hidden sm:inline mr-1">Load</span>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteSession(session.id)}
                      className="text-text-tertiary hover:text-gamma-negative"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
