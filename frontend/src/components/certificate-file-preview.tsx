// components/certificate-file-preview.tsx
"use client";

import { FileText, ImageIcon, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@radix-ui/react-dropdown-menu";

export function CertificateFilePreview({ ipfsHash }: { ipfsHash: string }) {
  const isImage = ipfsHash.match(/\.(jpg|jpeg|png|gif)$/i);
  const isPDF = ipfsHash.match(/\.pdf$/i);
  const ipfsUrl = `https://ipfs.io/ipfs/${ipfsHash.replace("ipfs://", "")}`;

  return (
    <div className="space-y-2">
      <Label className="text-slate-300">Certificate File</Label>
      <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-600">
        {isImage ? (
          <div className="flex flex-col items-center">
            <img
              src={ipfsUrl}
              alt="Certificate preview"
              className="max-w-full max-h-64 rounded-lg mb-4"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(ipfsUrl, "_blank")}
            >
              <Download className="h-4 w-4 mr-2" />
              Download Image
            </Button>
          </div>
        ) : isPDF ? (
          <div className="text-center py-4">
            <FileText className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <p className="text-white">PDF Certificate</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => window.open(ipfsUrl, "_blank")}
            >
              <Download className="h-4 w-4 mr-2" />
              View PDF
            </Button>
          </div>
        ) : (
          <div className="text-center py-4">
            <FileText className="h-16 w-16 text-blue-400 mx-auto mb-4" />
            <p className="text-white">Certificate Document</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 text-black hover:cursor-pointer"
              onClick={() => window.open(ipfsUrl, "_blank")}
            >
              <Download className="h-4 w-4 mr-2" />
              View Document
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
