"use client";

import type React from "react";

import { useState } from "react";
import {
  Search,
  Shield,
  CheckCircle,
  AlertCircle,
  User,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConnectKitButton } from "connectkit";

export default function CertificateVerification() {
  const [certificateInput, setCertificateInput] = useState("");
  const [verificationStatus, setVerificationStatus] = useState<
    "idle" | "loading" | "valid" | "invalid"
  >("idle");

  type CertificateData = {
    id: string;
    holder: string;
    issuer: string;
    course: string;
    issueDate: string;
    expiryDate: string;
    status: string;
  };

  const [certificateData, setCertificateData] =
    useState<CertificateData | null>(null);

  const handleVerification = async () => {
    if (!certificateInput.trim()) return;

    setVerificationStatus("loading");

    // Simulate API call
    setTimeout(() => {
      // Mock verification logic
      const isValid = Math.random() > 0.3;

      if (isValid) {
        setVerificationStatus("valid");
        setCertificateData({
          id: certificateInput,
          holder: "0x742d35Cc6634C0532925a3b8D404d3aABe09e3b1",
          issuer: "Blockchain University",
          course: "Advanced Smart Contract Development",
          issueDate: "2024-01-15",
          expiryDate: "2026-01-15",
          status: "Active",
        });
      } else {
        setVerificationStatus("invalid");
        setCertificateData(null);
      }
    }, 2000);
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
      <header className="relative z-10 flex justify-between items-center p-6">
        <div className="flex items-center space-x-3">
          <Shield className="h-8 w-8 text-purple-400" />
          <h1 className="text-2xl font-bold text-white">SealChain</h1>
        </div>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-12 w-12 rounded-full">
              <Avatar className="h-12 w-12 border-2 border-purple-400/50 hover:border-purple-400 transition-colors">
                <AvatarImage
                  src="/placeholder.svg?height=48&width=48"
                  alt="Profile"
                />
                <AvatarFallback className="bg-purple-600 text-white">
                  <User className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="bg-slate-800/95 backdrop-blur-sm border-slate-700"
            align="end"
          >
            <DropdownMenuItem className="p-0">
              <ConnectKitButton.Custom>
                {({ show }) => {
                  return (
                    <Button
                      onClick={show}
                      variant="outline"
                      className="w-full bg-transparent flex items-center space-x-2 px-3 py-2 text-white hover:text-black hover:cursor-pointer"
                    >
                      <Wallet className="h-4 w-4" />
                      <span>Connect Wallet</span>
                    </Button>
                  );
                }}
              </ConnectKitButton.Custom>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-6">
        <div className="w-full max-w-2xl space-y-8">
          {/* Title Section */}
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Verify Certificate
            </h2>
            <p className="text-xl text-slate-300 max-w-lg mx-auto">
              Enter a certificate URI or ID to verify its authenticity on the
              blockchain
            </p>
          </div>

          {/* Verification Input */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
            <CardContent className="p-8">
              <div className="space-y-6">
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
                    !certificateInput.trim() || verificationStatus === "loading"
                  }
                  className="w-full h-14 text-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
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
              </div>
            </CardContent>
          </Card>

          {/* Verification Results */}
          {verificationStatus !== "idle" &&
            verificationStatus !== "loading" && (
              <Card
                className={`bg-white/10 backdrop-blur-md border-white/20 shadow-2xl transition-all duration-500 mb-5 ${
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

                  {verificationStatus === "valid" && certificateData && (
                    <div className="space-y-4 text-slate-300">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-slate-400">
                            Certificate ID
                          </p>
                          <p className="font-mono text-sm break-all">
                            {certificateData.id}
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
                          <p>{certificateData.course}</p>
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
                    </div>
                  )}

                  {verificationStatus === "invalid" && (
                    <p className="text-slate-300">
                      The certificate could not be verified. Please check the
                      URI or ID and try again.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
        </div>
      </main>
    </div>
  );
}
