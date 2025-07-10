"use client";

import type React from "react";

import { useState, useCallback } from "react";
import { Upload, type File, ImageIcon, X, Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface CertificateFileUploadProps {
  value?: string; // IPFS hash or URL
  onChange?: (ipfsHash: string) => void;
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
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    value ? `https://ipfs.io/ipfs/${value}` : null
  );

  // Mock IPFS upload function - replace with actual IPFS client
  const uploadToIPFS = async (file: File): Promise<string> => {
    setIsUploading(true);

    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock IPFS hash - in real implementation, use IPFS client
    const mockHash = `Qm${Math.random()
      .toString(36)
      .substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;

    setIsUploading(false);
    return mockHash;
  };

  const handleFileSelect = useCallback(
    async (file: File) => {
      if (!file) return;

      // Validate file type - restrict to JPG, PNG, PDF only
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

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB");
        return;
      }

      try {
        const ipfsHash = await uploadToIPFS(file);
        const ipfsUrl = `https://ipfs.io/ipfs/${ipfsHash}`;

        setPreviewUrl(ipfsUrl);
        onChange?.(ipfsHash);
      } catch (error) {
        console.error("Upload failed:", error);
        alert("Upload failed. Please try again.");
      }
    },
    [onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
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
      if (files && files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  const handleRemove = useCallback(() => {
    setPreviewUrl(null);
    onChange?.("");
  }, [onChange]);

  const isImage =
    previewUrl &&
    (previewUrl.includes(".jpg") ||
      previewUrl.includes(".jpeg") ||
      previewUrl.includes(".png") ||
      previewUrl.includes(".gif"));
  const isPDF = previewUrl && previewUrl.includes(".pdf");

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
                  className="bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600"
                  disabled={disabled || isUploading}
                  onClick={() =>
                    document.getElementById("certificate-file-input")?.click()
                  }
                >
                  {isUploading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Uploading to IPFS...</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Choose File
                    </>
                  )}
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
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600"
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = previewUrl;
                      link.download = "certificate";
                      link.click();
                    }}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
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
                    src={previewUrl || "/placeholder.svg"}
                    alt="Certificate preview"
                    className="max-w-full max-h-64 mx-auto rounded-lg shadow-lg"
                    onError={() => setPreviewUrl(null)}
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

              {/* Generic File Preview */}
              {!isImage && !isPDF && (
                <div className="bg-slate-900/50 rounded-lg p-8 text-center">
                  <ImageIcon className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                  <p className="text-white font-medium">Certificate File</p>
                  <p className="text-slate-400 text-sm">Stored on IPFS</p>
                </div>
              )}

              {/* IPFS Info */}
              <div className="bg-green-900/20 border border-green-400/30 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <p className="text-green-300 text-sm font-medium">
                    Stored on IPFS
                  </p>
                </div>
                <p className="text-green-200 text-xs mt-1 font-mono break-all">
                  {value || "Hash will be generated after upload"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
