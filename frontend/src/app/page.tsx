"use client";

import type React from "react";

import { useState } from "react";
import {
  Search,
  Shield,
  CheckCircle,
  AlertCircle,
  Eye,
  Upload,
  ImageIcon,
  X,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster, toast } from "sonner";
import Link from "next/link";
import { ethers } from "ethers";
import CertificateNFT from "@/contracts/CertificateNFT.json";

export default function CertificateVerification() {
  const [activeTab, setActiveTab] = useState("uri");
  const [certificateInput, setCertificateInput] = useState("");
  const [verificationStatus, setVerificationStatus] = useState<
    "idle" | "loading" | "valid" | "invalid" | "revoked" | "partial"
  >("idle");

  type CertificateData = {
    tokenId: string;
    holder: string;
    name: string;
    description: string;
    issuer: string;
    issueDate: string;
    expiryDate: string;
    ipfsHash: string;
    status: "valid" | "expired" | "revoked" | "unverified" | "unknown";
    imageUrl: string;
  };

  const [certificateData, setCertificateData] =
    useState<CertificateData | null>(null);

  const getProvider = () => {
    return new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  };

  // Image verification state
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleVerification = async () => {
    setVerificationStatus("loading");
    setCertificateData(null);

    const provider = getProvider();
    // const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
      CertificateNFT.abi,
      provider
    );

    const input = certificateInput.trim();

    // Check if input is a number (tokenId)
    const isTokenId = /^\d+$/.test(input);

    if (isTokenId) {
      const tokenId = input;

      let owner: string;
      let tokenURI: string;
      let isExpired: boolean;
      let isRevoked: boolean;

      try {
        // Check if token exists
        owner = await contract.ownerOf(tokenId);
      } catch (err) {
        console.error("❌ Invalid token ID (does not exist):", err);
        setVerificationStatus("invalid");
        return;
      }

      try {
        // Fetch related metadata
        tokenURI = await contract.tokenURI(tokenId);
        isExpired = await contract.isExpired(tokenId);
        isRevoked = await contract.isRevoked(tokenId);
      } catch (err) {
        console.error("❌ Failed to fetch token data:", err);
        setVerificationStatus("invalid");
        return;
      }

      // Validate URI
      if (!tokenURI.startsWith("ipfs://")) {
        console.warn("⚠️ tokenURI is not IPFS:", tokenURI);
        setVerificationStatus("invalid");
        return;
      }

      try {
        const metadataRes = await fetch(
          tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/")
        );
        if (!metadataRes.ok) throw new Error("Failed to fetch IPFS metadata");

        const metadata = await metadataRes.json();

        setCertificateData({
          tokenId,
          holder: owner,
          name: metadata.name || "Unknown",
          description: metadata.description || "No description",
          issuer: metadata.issuer || "Unknown",
          issueDate: metadata.issueDate || "-",
          expiryDate: metadata.expiryDate || "-",
          ipfsHash: tokenURI.replace("ipfs://", ""),
          status: isRevoked ? "revoked" : isExpired ? "expired" : "valid",
          imageUrl: metadata.file
            ? metadata.file.replace("ipfs://", "https://ipfs.io/ipfs/")
            : "/placeholder.svg",
        });

        setVerificationStatus("valid");
      } catch (err) {
        console.error("❌ Failed to load metadata from IPFS:", err);
        setVerificationStatus("invalid");
      }
    } else {
      // Manual URI input flow
      const uri = input;

      if (!uri.startsWith("ipfs://")) {
        console.warn("❌ URI is not IPFS format:", uri);
        setVerificationStatus("invalid");
        return;
      }

      try {
        const metadataRes = await fetch(
          uri.replace("ipfs://", "https://ipfs.io/ipfs/")
        );
        if (!metadataRes.ok) throw new Error("IPFS fetch failed");

        const metadata = await metadataRes.json();

        setCertificateData({
          tokenId: "-",
          holder: "-",
          name: metadata.name || "Unknown",
          description: metadata.description || "No description",
          issuer: metadata.issuer || "Unknown",
          issueDate: metadata.issueDate || "-",
          expiryDate: metadata.expiryDate || "-",
          ipfsHash: uri.replace("ipfs://", ""),
          status: "unknown",
          imageUrl: metadata.image
            ? metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/")
            : "/placeholder.svg",
        });

        setVerificationStatus("valid");
      } catch (err) {
        console.error("IPFS metadata fetch failed:", err);
        setVerificationStatus("invalid");
      }
    }
  };

  const calculateFileHash = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashArray = Array.from(
      new Uint8Array(await crypto.subtle.digest("SHA-256", buffer))
    );
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  const verifyCertificateByFile = async (file: File) => {
    try {
      // Compute file hash
      const fileHash = await calculateFileHash(file);

      // Call smart contract
      const provider = getProvider();
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
        CertificateNFT.abi,
        provider
      );
      const [isValid, tokenId, owner] = await contract.verifyByHash(
        "0x" + fileHash
      );

      if (!isValid) {
        return { valid: false };
      }

      const isExpired = await contract.isExpired(tokenId);
      const isRevoked = await contract.isRevoked(tokenId);

      // Fetch metada from IPFS
      const metadataURI = await contract.tokenURI(tokenId);
      const metadataRes = await fetch(
        metadataURI.replace("ipfs://", "https://ipfs.io/ipfs/")
      );
      const metadata = await metadataRes.json();

      if (metadata.fileHash) {
        const storedHash = metadata.fileHash.replace("sha256:", "");
        if (storedHash !== fileHash) {
          console.warn("File hash mismatch");
          return { valid: false };
        }
      }

      let status: "valid" | "expired" | "revoked" = "valid";
      if (isRevoked) {
        status = "revoked";
      } else if (isExpired) {
        status = "expired";
      }
      return {
        valid: true,
        tokenId: tokenId.toString(),
        holder: owner,
        name: metadata.name,
        description: metadata.description,
        issuer: metadata.issuer,
        issueDate: metadata.issueDate,
        expiryDate: metadata.expiryDate,
        ipfsHash: metadataURI,
        imageUrl: metadata.file.replace("ipfs://", "https://ipfs.io/ipfs/"),
        status: status,
      };
    } catch (error) {
      console.error("Verification failed:", error);
      return { valid: false };
    }
  };

  const handleFileVerification = async () => {
    if (!uploadedImage) return;

    setVerificationStatus("loading");

    const result = await verifyCertificateByFile(uploadedImage);

    if (result.valid) {
      setVerificationStatus("valid");
      setCertificateData({
        tokenId: result.tokenId,
        holder: result.holder,
        name: result.name,
        description: result.description,
        issuer: result.issuer,
        issueDate: result.issueDate,
        expiryDate: result.expiryDate,
        ipfsHash: result.ipfsHash,
        status: result.status ?? "unknown",
        imageUrl: result.imageUrl,
      });
    } else {
      setVerificationStatus("invalid");
      setCertificateData(null);
    }
  };

  const handleFileUpload = (file: File) => {
    // Validate file type
    const validTypes = [
      "image/jpg",
      "image/jpeg",
      "image/png",
      "application/pdf",
    ];
    if (!validTypes.includes(file.type)) {
      toast.error("Please select a valid JPG, PNG, or PDF file only", {
        className: "!bg-red-600/40 !text-red-300 !border !border-red-400/30",
        style: {
          backgroundColor: "transparent",
          color: "inherit",
          border: "none",
        },
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Please select a valid image file (JPG or PNG)", {
        className: "!bg-red-600/40 !text-red-300 !border !border-red-400/30",
        style: {
          backgroundColor: "transparent",
          color: "inherit",
          border: "none",
        },
      });
      return;
    }

    setUploadedImage(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Reset verification status when new image is uploaded
    setVerificationStatus("idle");
    setCertificateData(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const removeImage = () => {
    setUploadedImage(null);
    setImagePreview(null);
    setVerificationStatus("idle");
    setCertificateData(null);
  };

  const resetVerification = () => {
    setCertificateInput("");
    setUploadedImage(null);
    setImagePreview(null);
    setVerificationStatus("idle");
    setCertificateData(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleVerification();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-5"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>

      {/* Header */}
      <header className="relative z-10 flex justify-between items-center p-6 mb-7">
        <div className="flex items-center space-x-3">
          <Shield className="h-8 w-8 text-purple-400" />
          <h1 className="text-2xl font-bold text-white">SealChain</h1>
        </div>

        <Link href={"/user"}>
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-200 group hover:cursor-pointer">
            <div className="flex items-center space-x-2">
              <span>Have certificates? View them here</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
            </div>
          </Button>
        </Link>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-6">
        <div className="w-full max-w-4xl space-y-8">
          {/* Title Section */}
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Verify Certificate
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Verify certificate authenticity using ID / URI or by uploading a
              certificate file (JPG, PNG, or PDF)
            </p>
          </div>

          {/* Verification Method */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
            <CardContent className="p-8">
              <Tabs
                value={activeTab}
                onValueChange={(value) => {
                  setActiveTab(value);
                  resetVerification();
                }}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 bg-white/10 backdrop-blur-md border-white/20 mb-6">
                  <TabsTrigger
                    value="uri"
                    className="data-[state=active]:bg-purple-600 text-slate-300 data-[state=active]:text-white hover:cursor-pointer"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    ID / URI Verification
                  </TabsTrigger>
                  <TabsTrigger
                    value="image"
                    className="data-[state=active]:bg-purple-600 text-slate-300 data-[state=active]:text-white hover:cursor-pointer"
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    File Verification
                  </TabsTrigger>
                </TabsList>

                {/* URI/ID Verification Tab */}
                <TabsContent value="uri" className="space-y-6">
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Enter certificate URI or ID..."
                      value={certificateInput}
                      onChange={(e) => setCertificateInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="h-14 text-lg bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:border-purple-400 focus:ring-purple-400/20"
                      disabled={verificationStatus === "loading"}
                    />
                    <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  </div>

                  <Button
                    onClick={handleVerification}
                    disabled={
                      !certificateInput.trim() ||
                      verificationStatus === "loading"
                    }
                    className="w-full h-14 text-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:cursor-pointer"
                  >
                    {verificationStatus === "loading" ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Verifying...</span>
                      </div>
                    ) : (
                      "Verify Certificate"
                    )}
                  </Button>
                </TabsContent>

                {/* Image Verification Tab */}
                <TabsContent value="image" className="space-y-6">
                  {!imagePreview ? (
                    <Card
                      className={`border-2 border-dashed transition-all duration-200 ${
                        isDragging
                          ? "border-purple-400 bg-purple-400/10"
                          : "border-slate-600 bg-slate-800/30 hover:border-slate-500"
                      } cursor-pointer`}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                    >
                      <CardContent className="p-12">
                        <div className="text-center space-y-4">
                          <div className="bg-purple-600/20 p-6 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                            <Upload className="h-10 w-10 text-purple-400" />
                          </div>

                          <div className="space-y-2">
                            <h3 className="text-xl font-semibold text-white">
                              Upload Certificate File
                            </h3>
                            <p className="text-slate-400">
                              Drag and drop your certificate file here, or click
                              to browse
                            </p>
                            <p className="text-slate-500 text-sm">
                              Supports JPG, PNG, or PDF files only (Max 10MB)
                            </p>
                          </div>

                          <Button
                            type="button"
                            variant="outline"
                            className="bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600 hover:cursor-pointer"
                            onClick={() =>
                              document
                                .getElementById("certificate-image-input")
                                ?.click()
                            }
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Choose Image
                          </Button>

                          <input
                            id="certificate-image-input"
                            type="file"
                            accept=".jpg,.jpeg,.png,.pdf"
                            onChange={handleFileInput}
                            className="hidden"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {/* Image Preview */}
                      <Card className="bg-slate-800/30 border-slate-600">
                        <CardContent className="p-4">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="text-white font-medium flex items-center space-x-2">
                                <ImageIcon className="h-5 w-5 text-purple-400" />
                                <span>Certificate File</span>
                              </h4>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={removeImage}
                                className="bg-red-700/50 border-red-600 text-red-300 hover:bg-red-600 hover:cursor-pointer"
                              >
                                <X className="h-4 w-4 mr-1" />
                                Remove
                              </Button>
                            </div>

                            <div className="relative bg-slate-900/50 rounded-lg p-4">
                              <img
                                src={imagePreview || "/placeholder.svg"}
                                alt="Certificate preview"
                                className="max-w-full max-h-96 mx-auto rounded-lg shadow-lg"
                              />
                            </div>

                            <div className="bg-blue-900/20 border border-blue-400/30 rounded-lg p-3">
                              <div className="flex items-center space-x-2">
                                <CheckCircle className="h-4 w-4 text-blue-400" />
                                <p className="text-blue-300 text-sm font-medium">
                                  File Ready for Verification
                                </p>
                              </div>
                              <p className="text-blue-200 text-xs mt-1">
                                File: {uploadedImage?.name} (
                                {(
                                  (uploadedImage?.size || 0) /
                                  1024 /
                                  1024
                                ).toFixed(2)}{" "}
                                MB)
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Verify Button */}
                      <Button
                        onClick={handleFileVerification}
                        disabled={verificationStatus === "loading"}
                        className="w-full h-14 text-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:cursor-pointer"
                      >
                        {verificationStatus === "loading" ? (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            <span>Analyzing File...</span>
                          </div>
                        ) : (
                          <>Verify Certificate File</>
                        )}
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Verification Results */}
          {verificationStatus !== "idle" &&
            verificationStatus !== "loading" && (
              <Card
                className={`bg-white/10 backdrop-blur-md border-white/20 shadow-2xl transition-all duration-500 ${
                  verificationStatus === "valid"
                    ? "border-green-400/50"
                    : "border-red-400/50"
                }`}
              >
                <CardContent className="p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    {verificationStatus === "valid" ? (
                      <CheckCircle className="h-8 w-8 text-green-400" />
                    ) : (
                      <AlertCircle className="h-8 w-8 text-red-400" />
                    )}
                    <h3
                      className={`text-2xl font-bold ${
                        verificationStatus === "valid"
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {verificationStatus === "valid"
                        ? "Certificate Valid"
                        : "Certificate Invalid"}
                    </h3>
                  </div>

                  {/* Warning Badge for URI-only verification */}
                  {certificateData?.tokenId === "-" && (
                    <div className="mb-6 p-3 bg-yellow-900/20 border border-yellow-400/30 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-4 w-4 text-yellow-400" />
                        <span className="text-yellow-300 text-sm font-medium">
                          ⚠️ URI-only verification — not matched on-chain
                        </span>
                      </div>
                      <p className="text-yellow-200/80 text-xs mt-1 ml-6">
                        This certificate was verified using metadata only. For
                        full blockchain verification, use the token ID.
                      </p>
                    </div>
                  )}

                  {verificationStatus === "valid" && certificateData && (
                    <div className="space-y-4 text-slate-300">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-slate-400">
                            Certificate ID
                          </p>
                          <p className="font-mono text-sm break-all">
                            {certificateData.tokenId}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-400">Holder</p>
                          <p className="font-mono text-sm break-all">
                            {certificateData.holder}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-400">Issuer</p>
                          <p>{certificateData.issuer}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-400">Course</p>
                          <p>{certificateData.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-400">Issue Date</p>
                          <p>{certificateData.issueDate}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-400">Expiry Date</p>
                          <p>{certificateData.expiryDate}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-400">Status</p>
                          <p>{certificateData.status}</p>
                        </div>
                      </div>
                      {certificateData.imageUrl &&
                        certificateData?.tokenId !== "-" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-4 w-full text-black hover:cursor-pointer"
                            onClick={() =>
                              window.open(certificateData.imageUrl, "_blank")
                            }
                          >
                            <Eye className="h-4 w-full mr-2" />
                            View Document
                          </Button>
                        )}
                    </div>
                  )}

                  {verificationStatus === "invalid" && (
                    <div className="space-y-4">
                      <p className="text-slate-300">
                        The certificate could not be verified. Please check the{" "}
                        {activeTab === "uri" ? "URI or ID" : "file"} and try
                        again.
                      </p>
                    </div>
                  )}

                  {/* Try Again Button */}
                  <div className="mt-6 pt-4 border-t border-slate-600">
                    <Button
                      onClick={resetVerification}
                      variant="outline"
                      className="bg-slate-700/50 border-slate-600 text-white hover:cursor-pointer"
                    >
                      Verify Another Certificate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
        </div>
        <Toaster position="top-right" />
      </main>
    </div>
  );
}
