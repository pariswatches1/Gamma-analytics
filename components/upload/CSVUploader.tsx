'use client';

import { useState, useCallback, useRef } from 'react';
import { parseCSV, generateSampleCSV } from '@/lib/csvParser';
import { OptionData, CSVParseResult } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button, Card, Input, Alert } from '@/components/ui';
import {
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle,
  AlertCircle,
  X,
  FileText,
} from 'lucide-react';

interface CSVUploaderProps {
  onUploadSuccess: (data: OptionData[], symbol: string, spotPrice: number) => void;
  isLoading?: boolean;
}

export function CSVUploader({ onUploadSuccess, isLoading }: CSVUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [spotPrice, setSpotPrice] = useState('');
  const [symbol, setSymbol] = useState('SPX');
  const [parseResult, setParseResult] = useState<CSVParseResult | null>(null);
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    // Check file extension instead of MIME type (browsers report CSV inconsistently)
    if (droppedFile && droppedFile.name.toLowerCase().endsWith('.csv')) {
      handleFileSelect(droppedFile);
    }
  }, []);

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setProcessing(true);
    setParseResult(null);

    try {
      const content = await selectedFile.text();
      const result = parseCSV(content);
      setParseResult(result);

      // Try to detect symbol and spot price from data
      if (result.data.length > 0) {
        if (result.data[0].underlying) {
          setSymbol(result.data[0].underlying);
        }
        if (result.data[0].underlyingPrice) {
          setSpotPrice(result.data[0].underlyingPrice.toString());
        }
      }
    } catch (err) {
      setParseResult({
        success: false,
        data: [],
        errors: ['Failed to read file'],
        warnings: [],
        rowCount: 0,
        validRowCount: 0,
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleUpload = () => {
    if (!parseResult?.success || !spotPrice.trim()) return;
    const price = parseFloat(spotPrice);
    if (isNaN(price) || price <= 0) return;
    
    onUploadSuccess(parseResult.data, symbol, price);
    
    // Reset state
    setFile(null);
    setParseResult(null);
    setSpotPrice('');
  };

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

  const handleClear = () => {
    setFile(null);
    setParseResult(null);
    setSpotPrice('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Drop zone */}
      <Card
        padding="none"
        className={cn(
          'relative border-2 border-dashed transition-all duration-200',
          isDragging
            ? 'border-accent-blue bg-accent-blue/5'
            : 'border-border hover:border-border-strong',
          file && 'border-solid'
        )}
      >
        <div
          className={cn(
            'p-8 text-center',
            !file && 'cursor-pointer'
          )}
          onDragOver={!file ? handleDragOver : undefined}
          onDragLeave={!file ? handleDragLeave : undefined}
          onDrop={!file ? handleDrop : undefined}
          onClick={!file ? () => fileInputRef.current?.click() : undefined}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileInputChange}
            disabled={!!file}
          />

          {!file ? (
            <>
              <div className="mx-auto w-16 h-16 rounded-2xl bg-surface-hover flex items-center justify-center mb-4">
                <Upload className="h-8 w-8 text-text-secondary" />
              </div>
              <h3 className="text-lg font-medium text-text-primary mb-2">
                Upload Options Data
              </h3>
              <p className="text-sm text-text-secondary mb-4 max-w-md mx-auto">
                Drag and drop your CSV file here, or click to browse.
                Supported formats: CSV exports from Thinkorswim, IBKR, or similar platforms.
              </p>
              <Button variant="secondary" size="sm">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Select CSV File
              </Button>
            </>
          ) : (
            <div className="text-left">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      'w-14 h-14 rounded-xl flex items-center justify-center',
                      parseResult?.success
                        ? 'bg-gamma-positive/10'
                        : parseResult?.errors.length
                        ? 'bg-gamma-negative/10'
                        : 'bg-surface-hover'
                    )}
                  >
                    {processing ? (
                      <div className="animate-spin">
                        <FileSpreadsheet className="h-6 w-6 text-text-secondary" />
                      </div>
                    ) : parseResult?.success ? (
                      <CheckCircle className="h-6 w-6 text-gamma-positive" />
                    ) : parseResult?.errors.length ? (
                      <AlertCircle className="h-6 w-6 text-gamma-negative" />
                    ) : (
                      <FileSpreadsheet className="h-6 w-6 text-text-secondary" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-text-primary">{file.name}</h4>
                    <p className="text-sm text-text-tertiary">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={handleClear}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Parse results */}
              {parseResult && (
                <div className="space-y-4">
                  {parseResult.success ? (
                    <Alert variant="success" title="File parsed successfully">
                      Found {parseResult.validRowCount.toLocaleString()} valid options out of{' '}
                      {parseResult.rowCount.toLocaleString()} rows.
                    </Alert>
                  ) : (
                    <Alert variant="error" title="Parsing failed">
                      {parseResult.errors[0]}
                    </Alert>
                  )}

                  {parseResult.warnings.length > 0 && (
                    <Alert variant="warning" title={`${parseResult.warnings.length} warnings`}>
                      <ul className="list-disc list-inside space-y-1">
                        {parseResult.warnings.slice(0, 3).map((warning, i) => (
                          <li key={i}>{warning}</li>
                        ))}
                        {parseResult.warnings.length > 3 && (
                          <li>...and {parseResult.warnings.length - 3} more</li>
                        )}
                      </ul>
                    </Alert>
                  )}

                  {parseResult.errors.length > 1 && (
                    <Alert variant="error" title="Errors">
                      <ul className="list-disc list-inside space-y-1">
                        {parseResult.errors.slice(0, 3).map((error, i) => (
                          <li key={i}>{error}</li>
                        ))}
                        {parseResult.errors.length > 3 && (
                          <li>...and {parseResult.errors.length - 3} more</li>
                        )}
                      </ul>
                    </Alert>
                  )}

                  {parseResult.success && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border">
                      <Input
                        label="Spot Price"
                        type="number"
                        value={spotPrice}
                        onChange={(e) => setSpotPrice(e.target.value)}
                        placeholder="e.g., 5850.00"
                      />
                      <Input
                        label="Symbol"
                        value={symbol}
                        onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                        placeholder="e.g., SPX, SPY, QQQ"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={handleDownloadSample}>
          <Download className="h-4 w-4 mr-2" />
          Download Sample CSV
        </Button>

        {file && parseResult?.success && (
          <Button
            variant="primary"
            onClick={handleUpload}
            disabled={!spotPrice.trim() || parseFloat(spotPrice) <= 0 || isLoading}
            isLoading={isLoading}
          >
            <Upload className="h-4 w-4 mr-2" />
            Import {parseResult.validRowCount.toLocaleString()} Options
          </Button>
        )}
      </div>

      {/* Expected format info */}
      <Card variant="bordered" padding="md">
        <h4 className="flex items-center gap-2 font-medium text-text-primary mb-3">
          <FileText className="h-4 w-4" />
          Expected CSV Format
        </h4>
        <p className="text-sm text-text-secondary mb-3">
          Your CSV should contain the following columns (column names are case-insensitive):
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {[
            { name: 'strike', required: true },
            { name: 'gamma', required: true },
            { name: 'open_interest', required: true },
            { name: 'type (call/put)', required: false },
            { name: 'expiry', required: false },
            { name: 'delta', required: false },
            { name: 'volume', required: false },
            { name: 'iv', required: false },
          ].map((col) => (
            <div
              key={col.name}
              className={cn(
                'px-2 py-1.5 rounded-md',
                col.required
                  ? 'bg-accent-blue/10 text-accent-blue border border-accent-blue/20'
                  : 'bg-surface-hover text-text-secondary'
              )}
            >
              {col.name}
              {col.required && <span className="text-gamma-negative ml-1">*</span>}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
