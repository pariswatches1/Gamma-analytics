'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { CSVUploader } from '@/components/upload/CSVUploader';
import { SavedSessionsList } from '@/components/upload/SavedSessionsList';
import { Alert, Card } from '@/components/ui';
import { useOptionsData } from '@/hooks/useOptionsData';
import { generateSampleCSV } from '@/lib/csvParser';
import type { OptionData } from '@/lib/types';
import { FileText, Download, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

export default function UploadPage() {
  const router = useRouter();
  const { 
    sessions, 
    currentSessionId,
    isLoading, 
    error,
    createSession,
    loadSession,
    deleteSession
  } = useOptionsData();

  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Handle successful upload
  const handleUploadSuccess = (
    data: OptionData[],
    symbol: string,
    spotPrice: number
  ) => {
    createSession(data, symbol, spotPrice);
    setUploadSuccess(true);
    
    // Redirect to dashboard after short delay
    setTimeout(() => {
      router.push('/');
    }, 1500);
  };

  // Handle session load
  const handleLoadSession = (sessionId: string) => {
    loadSession(sessionId);
    router.push('/');
  };

  // Download sample CSV
  const handleDownloadSample = () => {
    const csv = generateSampleCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_options_data.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        title="Upload Data" 
        subtitle="Import options chain data"
      />

      <div className="p-4 lg:p-6 space-y-6">
        {/* Success Alert */}
        {uploadSuccess && (
          <Alert variant="success" className="fade-in">
            Data uploaded successfully! Redirecting to dashboard...
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert variant="error" className="fade-in">
            {error}
          </Alert>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main Upload Area */}
          <div className="xl:col-span-2 space-y-6">
            {/* CSV Uploader */}
            <CSVUploader 
              onUploadSuccess={handleUploadSuccess}
              isLoading={isLoading}
            />

            {/* Help Section */}
            <Card>
              <button
                onClick={() => setShowHelp(!showHelp)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-5 h-5 text-accent" />
                  <span className="font-medium text-text-primary">CSV Format Guide</span>
                </div>
                {showHelp ? (
                  <ChevronUp className="w-5 h-5 text-text-secondary" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-text-secondary" />
                )}
              </button>
              
              {showHelp && (
                <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
                  <div>
                    <h4 className="font-medium text-text-primary mb-2">Required Columns</h4>
                    <p className="text-text-secondary text-sm mb-2">
                      Your CSV should contain these columns (column names are detected automatically):
                    </p>
                    <ul className="text-sm text-text-secondary space-y-1">
                      <li>• <code className="text-accent">Strike</code> - Option strike price</li>
                      <li>• <code className="text-accent">Type</code> - Call or Put (C/P or Call/Put)</li>
                      <li>• <code className="text-accent">Gamma</code> - Option gamma value</li>
                      <li>• <code className="text-accent">Expiry</code> - Expiration date</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-text-primary mb-2">Optional Columns</h4>
                    <ul className="text-sm text-text-secondary space-y-1">
                      <li>• <code className="text-accent">Symbol</code> - Underlying symbol (SPX, SPY, etc.)</li>
                      <li>• <code className="text-accent">Open Interest</code> - Contract open interest</li>
                      <li>• <code className="text-accent">Volume</code> - Daily volume</li>
                      <li>• <code className="text-accent">Delta</code> - Option delta</li>
                      <li>• <code className="text-accent">IV</code> - Implied volatility</li>
                      <li>• <code className="text-accent">Bid/Ask</code> - Current bid and ask prices</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-text-primary mb-2">Supported Formats</h4>
                    <ul className="text-sm text-text-secondary space-y-1">
                      <li>• Thinkorswim option chain exports</li>
                      <li>• Interactive Brokers option exports</li>
                      <li>• Generic CSV with standard column names</li>
                    </ul>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleDownloadSample}
                      className="btn-secondary inline-flex items-center gap-2 text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Download Sample CSV
                    </button>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Saved Sessions */}
            <SavedSessionsList
              sessions={sessions}
              currentSessionId={currentSessionId}
              onLoadSession={handleLoadSession}
              onDeleteSession={deleteSession}
            />

            {/* Quick Tips */}
            <Card className="p-4">
              <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-accent" />
                Quick Tips
              </h3>
              <ul className="text-sm text-text-secondary space-y-2">
                <li className="flex gap-2">
                  <span className="text-accent">•</span>
                  <span>Export option chain data with Greeks enabled</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent">•</span>
                  <span>Include all expiries for complete gamma analysis</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent">•</span>
                  <span>For best results, export during market hours</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent">•</span>
                  <span>Sessions are saved locally in your browser</span>
                </li>
              </ul>
            </Card>

            {/* Download Sample */}
            <Card className="p-4">
              <h3 className="font-semibold text-text-primary mb-3">No Data?</h3>
              <p className="text-sm text-text-secondary mb-3">
                Download a sample CSV file to test the application with realistic SPX options data.
              </p>
              <button
                onClick={handleDownloadSample}
                className="w-full btn-secondary inline-flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Sample CSV
              </button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
