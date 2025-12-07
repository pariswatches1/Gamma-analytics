'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, Button, Input, Select, Alert } from '@/components/ui';
import { useSettings } from '@/hooks/useSettings';
import { useOptionsData } from '@/hooks/useOptionsData';
import { exportAllData, importAllData, clearAllData } from '@/lib/storage';
import type { UserSettings } from '@/lib/types';
import { 
  Settings, 
  Download, 
  Upload, 
  Trash2, 
  Save,
  RefreshCw,
  Database,
  BarChart3,
  Eye
} from 'lucide-react';

// Default symbols
const SYMBOLS = [
  { value: 'SPX', label: 'SPX - S&P 500 Index' },
  { value: 'SPY', label: 'SPY - S&P 500 ETF' },
  { value: 'QQQ', label: 'QQQ - Nasdaq 100 ETF' },
  { value: 'IWM', label: 'IWM - Russell 2000 ETF' },
  { value: 'DIA', label: 'DIA - Dow Jones ETF' },
];

export default function SettingsPage() {
  const { settings, updateSettings, resetSettings } = useSettings();
  const { sessions } = useOptionsData();
  
  const [localSettings, setLocalSettings] = useState(settings);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Handle settings change
  const handleChange = <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  // Save settings
  const handleSave = () => {
    updateSettings(localSettings);
    setSuccess('Settings saved successfully');
    setTimeout(() => setSuccess(null), 2000);
  };

  // Reset to defaults
  const handleReset = () => {
    resetSettings();
    setLocalSettings({
      defaultSymbol: 'SPX',
      maxLevelsToDisplay: 10,
      chartHeight: 300,
      autoRefresh: false,
      refreshInterval: 60,
      showVolume: true,
      showOpenInterest: true,
      topLevelsCount: 10,
      chartType: 'bar',
      showCallPutSeparate: true,
    });
    setSuccess('Settings reset to defaults');
    setTimeout(() => setSuccess(null), 2000);
  };

  // Export data
  const handleExport = () => {
    try {
      const data = exportAllData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gammascope_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setSuccess('Data exported successfully');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError('Failed to export data');
    }
  };

  // Import data
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const success = importAllData(text);
        if (success) {
          setSuccess('Data imported successfully. Refresh the page to see changes.');
          setTimeout(() => setSuccess(null), 3000);
        } else {
          setError('Failed to import data. Invalid format.');
        }
      } catch (err) {
        setError('Failed to read import file');
      }
    };
    input.click();
  };

  // Clear all data
  const handleClearData = () => {
    clearAllData();
    setShowDeleteConfirm(false);
    setSuccess('All data cleared. Refresh the page.');
    setTimeout(() => setSuccess(null), 3000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        title="Settings" 
        subtitle="Configure your preferences"
      />

      <div className="p-4 lg:p-6 space-y-6">
        {/* Alerts */}
        {success && (
          <Alert variant="success" className="fade-in">
            {success}
          </Alert>
        )}
        {error && (
          <Alert variant="error" className="fade-in" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main Settings */}
          <div className="xl:col-span-2 space-y-6">
            {/* General Settings */}
            <Card>
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold text-text-primary flex items-center gap-2">
                  <Settings className="w-5 h-5 text-accent" />
                  General Settings
                </h3>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Default Symbol
                  </label>
                  <Select
                    value={localSettings.defaultSymbol}
                    onChange={(e) => handleChange('defaultSymbol', e.target.value)}
                    options={SYMBOLS}
                  />
                  <p className="text-xs text-text-muted mt-1">
                    Symbol to use when creating new sessions
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Max Levels to Display
                  </label>
                  <Input
                    type="number"
                    min={5}
                    max={50}
                    value={localSettings.maxLevelsToDisplay}
                    onChange={(e) => handleChange('maxLevelsToDisplay', parseInt(e.target.value) || 10)}
                  />
                  <p className="text-xs text-text-muted mt-1">
                    Number of key gamma levels to show in tables (5-50)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Chart Height (px)
                  </label>
                  <Input
                    type="number"
                    min={200}
                    max={600}
                    step={50}
                    value={localSettings.chartHeight}
                    onChange={(e) => handleChange('chartHeight', parseInt(e.target.value) || 300)}
                  />
                  <p className="text-xs text-text-muted mt-1">
                    Height of dashboard charts (200-600px)
                  </p>
                </div>
              </div>
            </Card>

            {/* Display Settings */}
            <Card>
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold text-text-primary flex items-center gap-2">
                  <Eye className="w-5 h-5 text-accent" />
                  Display Settings
                </h3>
              </div>
              <div className="p-4 space-y-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-text-primary">Show Volume</span>
                    <p className="text-xs text-text-muted">Display volume data in tables</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={localSettings.showVolume}
                    onChange={(e) => handleChange('showVolume', e.target.checked)}
                    className="w-5 h-5 rounded border-border bg-surface text-accent focus:ring-accent focus:ring-offset-background"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-text-primary">Show Open Interest</span>
                    <p className="text-xs text-text-muted">Display open interest data in tables</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={localSettings.showOpenInterest}
                    onChange={(e) => handleChange('showOpenInterest', e.target.checked)}
                    className="w-5 h-5 rounded border-border bg-surface text-accent focus:ring-accent focus:ring-offset-background"
                  />
                </label>
              </div>
            </Card>

            {/* Data Management */}
            <Card>
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold text-text-primary flex items-center gap-2">
                  <Database className="w-5 h-5 text-accent" />
                  Data Management
                </h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="secondary"
                    onClick={handleExport}
                    className="inline-flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export All Data
                  </Button>
                  
                  <Button
                    variant="secondary"
                    onClick={handleImport}
                    className="inline-flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Import Data
                  </Button>
                </div>

                <div className="pt-4 border-t border-border">
                  {showDeleteConfirm ? (
                    <div className="bg-gamma-negative/10 border border-gamma-negative/30 rounded-lg p-4">
                      <p className="text-gamma-negative font-medium mb-3">
                        Are you sure? This will delete all sessions, settings, and watchlist data.
                      </p>
                      <div className="flex gap-3">
                        <Button
                          variant="ghost"
                          onClick={() => setShowDeleteConfirm(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="primary"
                          onClick={handleClearData}
                          className="bg-gamma-negative hover:bg-gamma-negative/80"
                        >
                          Yes, Delete Everything
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="text-gamma-negative hover:text-gamma-negative hover:bg-gamma-negative/10 inline-flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Clear All Data
                    </Button>
                  )}
                </div>
              </div>
            </Card>

            {/* Save Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleSave}
                className="inline-flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Settings
              </Button>
              <Button
                variant="secondary"
                onClick={handleReset}
                className="inline-flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Reset to Defaults
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Storage Info */}
            <Card className="p-4">
              <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-accent" />
                Storage Info
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Saved Sessions</span>
                  <span className="text-text-primary font-medium">{sessions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Storage Type</span>
                  <span className="text-text-primary font-medium">LocalStorage</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Data Location</span>
                  <span className="text-text-primary font-medium">Browser</span>
                </div>
              </div>
              <p className="text-xs text-text-muted mt-4">
                Data is stored locally in your browser. Export your data regularly for backup.
              </p>
            </Card>

            {/* About */}
            <Card className="p-4">
              <h3 className="font-semibold text-text-primary mb-3">About GammaScope</h3>
              <p className="text-sm text-text-secondary mb-3">
                A professional options gamma analytics dashboard for active traders. 
                Analyze gamma exposure, identify key levels, and make informed trading decisions.
              </p>
              <div className="text-xs text-text-muted space-y-1">
                <p>Version 1.0.0</p>
                <p>Built with Next.js 14</p>
              </div>
            </Card>

            {/* Keyboard Shortcuts */}
            <Card className="p-4">
              <h3 className="font-semibold text-text-primary mb-3">Quick Reference</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-text-secondary">
                  <span>Positive Gamma</span>
                  <span className="text-gamma-positive">Support</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Negative Gamma</span>
                  <span className="text-gamma-negative">Resistance</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Gamma Flip</span>
                  <span className="text-gamma-neutral">Pivot Zone</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
