"use client";

import type React from "react";
import { useState, useCallback, useEffect } from "react";
import { Upload, ImageIcon, X, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface CertificateFileUploadProps {
  value?: File | string | null; // Can be a File object (new) or string (existing IPFS hash)
  onChange?: (file: File | null) => void;
  disabled?: boolean;
  showPreview?: boolean;
}

export function CertificateFileUpload({
  value,
  onChange,
  disabled = false,
  showPreview = true,
}: CertificateFileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Sync internal preview state with the parent's value prop
  useEffect(() => {
    if (!value) {
      setPreviewUrl(null);
      return;
    }

    if (value instanceof File) {
      // Create a local preview for the newly selected file
      const objectUrl = URL.createObjectURL(value);
      setPreviewUrl(objectUrl);
      // Cleanup to prevent memory leaks
      return () => URL.revokeObjectURL(objectUrl);
    } else if (typeof value === "string") {
      // If it's a string, assume it's an existing IPFS hash
      setPreviewUrl(`https://ipfs.io/ipfs/${value.replace("ipfs://", "")}`);
    }
  }, [value]);

  const handleFileSelect = useCallback(
    (file: File) => {
      if (!file) return;

      const validTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "application/pdf",
      ];
      if (!validTypes.includes(file.type)) {
        alert("Please select a valid JPG, PNG, or PDF file only");
        return;
      }

      // Fix: 10MB is 10 * 1024 * 1024
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB");
        return;
      }

      onChange?.(file);
    },
    [onChange],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) handleFileSelect(files[0]);
    },
    [handleFileSelect],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) handleFileSelect(files[0]);
    },
    [handleFileSelect],
  );

  const handleRemove = useCallback(() => {
    onChange?.(null);
  }, [onChange]);

  const isImage =
    previewUrl &&
    (previewUrl.match(/\.(jpeg|jpg|gif|png)$/i) ||
      previewUrl.startsWith("blob:"));
  const isPDF =
    previewUrl &&
    (previewUrl.includes(".pdf") ||
      (value instanceof File && value.type === "application/pdf"));

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {!previewUrl && (
        <Card
          className={`border-2 border-dashed transition-all duration-200 ${
            isDragging
              ? "border-purple-400 bg-purple-400/10"
              : "border-slate-600 bg-slate-800/30 hover:border-slate-500"
          } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div className="bg-purple-600/20 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                <Upload className="h-8 w-8 text-purple-400" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">
                  Upload Certificate File
                </h3>
                <p className="text-slate-400 text-sm">
                  Drag and drop your certificate file here, or click to browse
                </p>
                <p className="text-slate-500 text-xs">
                  Accepts JPG, PNG, or PDF files only (Max 10MB)
                </p>
              </div>

              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  className="bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600 hover:cursor-pointer"
                  disabled={disabled}
                  onClick={() =>
                    document.getElementById("certificate-file-input")?.click()
                  }
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </Button>
                <input
                  id="certificate-file-input"
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileInput}
                  className="hidden"
                  disabled={disabled}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview Area */}
      {previewUrl && showPreview && (
        <Card className="bg-slate-800/30 border-slate-600">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-white font-medium">Certificate File</h4>
                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600"
                    onClick={() => window.open(previewUrl, "_blank")}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  {!disabled && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="bg-red-700/50 border-red-600 text-red-300 hover:bg-red-600"
                      onClick={handleRemove}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  )}
                </div>
              </div>

              {/* Image Preview */}
              {isImage && (
                <div className="relative bg-slate-900/50 rounded-lg p-4">
                  <img
                    src={previewUrl}
                    alt="Certificate preview"
                    className="max-w-full max-h-64 mx-auto rounded-lg shadow-lg"
                  />
                </div>
              )}

              {/* PDF Preview */}
              {isPDF && (
                <div className="bg-slate-900/50 rounded-lg p-8 text-center">
                  <ImageIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
                  <p className="text-white font-medium">PDF Certificate</p>
                  <p className="text-slate-400 text-sm">
                    Click View to open the PDF file
                  </p>
                </div>
              )}

              {/* IPFS Info */}
              <div className="bg-green-900/20 border border-green-400/30 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <p className="text-green-300 text-sm font-medium">
                    {value instanceof File
                      ? "Ready to be minted"
                      : "Stored securely on IPFS"}
                  </p>
                </div>
                <p className="text-green-200 text-xs mt-1 font-mono break-all">
                  {value instanceof File ? value.name : value}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
