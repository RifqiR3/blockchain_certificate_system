"use client";

import { useState, useEffect } from "react";
import {
  Shield,
  User,
  Wallet,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Copy,
  Eye,
  Share2,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAccount } from "wagmi";
import { ConnectKitButton } from "connectkit";
import { toast } from "sonner";
import { Toaster } from "sonner";

// Mock certificate data - in real app, this would come from blockchain
const mockCertificates = [
  {
    tokenId: "1",
    name: "Advanced Smart Contract Development",
    description:
      "Comprehensive course covering advanced Solidity patterns and security best practices",
    image:
      "https://marketplace.canva.com/EAFlVDzb7sA/3/0/1600w/canva-white-gold-elegant-modern-certificate-of-participation-Qn4Rei141MM.jpg",
    issuer: "Blockchain University",
    issueDate: "2024-01-15",
    expiryDate: "2026-01-15",
    status: "valid",
    ipfsHash: "QmExampleHash1234567890abcdef",
  },
  {
    tokenId: "2",
    name: "DeFi Protocol Design",
    description: "Learn to build and deploy decentralized finance protocols",
    image:
      "https://cdn.create.microsoft.com/catalog-assets/en-us/5824ad94-f1f1-4ef0-8f4a-312e98b556a3/thumbnails/1034/olive-branch-certificate-of-accomplishment-gray-organic-simple-1-1-a60a7e665ae6.webp",
    issuer: "DeFi Academy",
    issueDate: "2024-02-20",
    expiryDate: "2025-02-20",
    status: "expired",
    ipfsHash: "QmExampleHash0987654321fedcba",
  },
  {
    tokenId: "3",
    name: "NFT Development Fundamentals",
    description: "Complete guide to creating and deploying NFT collections",
    image: "/placeholder.svg?height=300&width=400",
    issuer: "Web3 Institute",
    issueDate: "2023-12-10",
    expiryDate: "2024-12-10",
    status: "revoked",
    ipfsHash: "QmExampleHashRevoked111222333",
  },
  {
    tokenId: "4",
    name: "Blockchain Security Audit",
    description:
      "Professional certification in smart contract security auditing",
    image: "/placeholder.svg?height=300&width=400",
    issuer: "Security Labs",
    issueDate: "2024-03-01",
    expiryDate: "2027-03-01",
    status: "valid",
    ipfsHash: "QmExampleHashSecurity999888777",
  },
];

export default function StudentDashboard() {
  const { address, isConnected } = useAccount();
  const [certificates, setCertificates] = useState(mockCertificates);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCertificates = certificates.filter((certificate) => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    return (
      certificate.name.toLowerCase().includes(query) ||
      certificate.description.toLowerCase().includes(query) ||
      certificate.issuer.toLowerCase().includes(query)
    );
  });

  // Mock function to load certificates from blockchain
  const loadCertificates = async () => {
    if (!address) return;

    setIsLoading(true);
    // Simulate API call to load certificates
    setTimeout(() => {
      setCertificates(mockCertificates);
      setIsLoading(false);
    }, 1500);
  };

  useEffect(() => {
    if (isConnected && address) {
      loadCertificates();
    }
  }, [isConnected, address]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "valid":
        return (
          <Badge className="bg-green-600/20 text-green-300 border-green-400/30">
            <CheckCircle className="h-3 w-3 mr-1" />
            Valid
          </Badge>
        );
      case "expired":
        return (
          <Badge className="bg-yellow-600/20 text-yellow-300 border-yellow-400/30">
            <Clock className="h-3 w-3 mr-1" />
            Expired
          </Badge>
        );
      case "revoked":
        return (
          <Badge className="bg-red-600/20 text-red-300 border-red-400/30">
            <XCircle className="h-3 w-3 mr-1" />
            Revoked
          </Badge>
        );
      default:
        return (
          <Badge className="bg-green-600/20 text-green-300 border-green-400/30">
            <CheckCircle className="h-3 w-3 mr-1" />
            Valid
          </Badge>
        );
    }
  };

  const generateVerificationLink = (certificate: any) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/?verify=${certificate.tokenId}`;
  };

  const copyVerificationLink = (certificate: any) => {
    const link = generateVerificationLink(certificate);
    navigator.clipboard.writeText(link);
    toast.success("Verification link copied to clipboard!");
  };

  const shareVerificationLink = (certificate: any) => {
    const link = generateVerificationLink(certificate);
    if (navigator.share) {
      navigator.share({
        title: `Verify Certificate: ${certificate.name}`,
        text: `Please verify my certificate for ${certificate.name}`,
        url: link,
      });
    } else {
      copyVerificationLink(certificate);
    }
  };

  // Wallet Not Connected State
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=100&width=100')] opacity-5"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>

        {/* Header */}
        <header className="relative z-10 flex justify-between items-center p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-purple-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">My Certificates</h1>
              <p className="text-slate-400 text-sm">
                View and share your blockchain certificates
              </p>
            </div>
          </div>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-12 w-12 rounded-full"
              >
                <Avatar className="h-12 w-12 border-2 border-red-400/50 hover:border-red-400 transition-colors">
                  <AvatarFallback className="bg-red-600 text-white">
                    <User className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56 bg-slate-800/95 backdrop-blur-sm border-slate-700"
              align="end"
            >
              <DropdownMenuItem className="p-0">
                <ConnectKitButton.Custom>
                  {({ show }) => {
                    return (
                      <Button
                        onClick={show}
                        variant="outline"
                        className="w-full bg-transparent flex items-center space-x-2 px-3 py-2"
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

        {/* Not Connected Content */}
        <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-6">
          <div className="w-full max-w-2xl space-y-8">
            <Card className="bg-white/10 backdrop-blur-md border-blue-400/30 shadow-2xl">
              <CardContent className="p-12 text-center">
                <div className="space-y-6">
                  <div className="bg-blue-600/20 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                    <Wallet className="h-10 w-10 text-blue-400" />
                  </div>

                  <div className="space-y-3">
                    <h2 className="text-3xl font-bold text-white">
                      Connect Your Wallet
                    </h2>
                    <p className="text-xl text-slate-300 max-w-md mx-auto">
                      Connect your wallet to view your blockchain certificates
                    </p>
                  </div>

                  <div className="bg-blue-900/20 border border-blue-400/30 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-blue-400 flex-shrink-0" />
                      <p className="text-blue-300 text-sm">
                        Your certificates are stored as NFTs on the blockchain
                        and linked to your wallet address
                      </p>
                    </div>
                  </div>

                  <div className="pt-4">
                    <ConnectKitButton.Custom>
                      {({ show }) => {
                        return (
                          <Button
                            onClick={show}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                          >
                            <Wallet className="h-5 w-5 mr-2" />
                            Connect Wallet to View Certificates
                          </Button>
                        );
                      }}
                    </ConnectKitButton.Custom>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                <FileText className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                <h3 className="text-white font-semibold mb-1">
                  View Certificates
                </h3>
                <p className="text-slate-400 text-sm">
                  See all your earned certificates
                </p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                <Share2 className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                <h3 className="text-white font-semibold mb-1">
                  Share & Verify
                </h3>
                <p className="text-slate-400 text-sm">
                  Generate verification links
                </p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                <Shield className="h-8 w-8 text-green-400 mx-auto mb-2" />
                <h3 className="text-white font-semibold mb-1">
                  Blockchain Verified
                </h3>
                <p className="text-slate-400 text-sm">
                  Cryptographically secure
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Connected State - Certificate Dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('/placeholder.svg?height=100&width=100')] opacity-5"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>

      {/* Header */}
      <header className="relative z-10 flex justify-between items-center p-6 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <Shield className="h-8 w-8 text-purple-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">My Certificates</h1>
            <p className="text-slate-400 text-sm">
              View and share your blockchain certificates
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Connected Wallet Info */}
          <div className="hidden md:flex items-center space-x-2 bg-green-600/20 px-3 py-2 rounded-full border border-green-400/30">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-300 text-sm font-mono">
              {address
                ? `${address.slice(0, 6)}...${address.slice(-4)}`
                : "Connected"}
            </span>
          </div>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-12 w-12 rounded-full"
              >
                <Avatar className="h-12 w-12 border-2 border-green-400/50 hover:border-green-400 transition-colors">
                  <AvatarImage
                    src="/placeholder.svg?height=48&width=48"
                    alt="Student Profile"
                  />
                  <AvatarFallback className="bg-green-600 text-white">
                    <User className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56 bg-slate-800/95 backdrop-blur-sm border-slate-700"
              align="end"
            >
              <DropdownMenuItem className="p-0">
                <ConnectKitButton.Custom>
                  {({ show }) => {
                    return (
                      <Button
                        onClick={show}
                        variant="outline"
                        className="w-full bg-transparent flex items-center space-x-2 px-3 py-2"
                      >
                        <Wallet className="h-4 w-4" />
                        <span>Wallet Settings</span>
                      </Button>
                    );
                  }}
                </ConnectKitButton.Custom>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 p-6">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">
                    Total Certificates
                  </p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {certificates.length}
                  </p>
                </div>
                <div className="bg-purple-600/20 p-3 rounded-full">
                  <FileText className="h-6 w-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">Valid</p>
                  <p className="text-3xl font-bold text-green-400 mt-2">
                    {
                      certificates.filter((cert) => cert.status === "valid")
                        .length
                    }
                  </p>
                </div>
                <div className="bg-green-600/20 p-3 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">Expired</p>
                  <p className="text-3xl font-bold text-yellow-400 mt-2">
                    {
                      certificates.filter((cert) => cert.status === "expired")
                        .length
                    }
                  </p>
                </div>
                <div className="bg-yellow-600/20 p-3 rounded-full">
                  <Clock className="h-6 w-6 text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">Revoked</p>
                  <p className="text-3xl font-bold text-red-400 mt-2">
                    {
                      certificates.filter((cert) => cert.status === "revoked")
                        .length
                    }
                  </p>
                </div>
                <div className="bg-red-600/20 p-3 rounded-full">
                  <XCircle className="h-6 w-6 text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Certificates Section */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle className="text-white flex items-center space-x-2">
                <FileText className="h-6 w-6 text-purple-400" />
                <span>Your Certificates</span>
                {searchQuery && (
                  <span className="text-slate-400 text-sm font-normal">
                    ({filteredCertificates.length} of {certificates.length})
                  </span>
                )}
              </CardTitle>

              <div className="flex items-center space-x-3">
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search certificates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64 bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:border-purple-400 focus:ring-purple-400/20"
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-slate-400 hover:text-white"
                      onClick={() => setSearchQuery("")}
                    >
                      ×
                    </Button>
                  )}
                </div>

                <Button
                  onClick={loadCertificates}
                  disabled={isLoading}
                  variant="outline"
                  className="bg-white/5 border-white/20 text-white hover:bg-white/10 hover:cursor-pointer hover:text-white"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Loading...</span>
                    </div>
                  ) : (
                    "Refresh"
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-slate-800/30 rounded-lg p-4 border border-slate-600 animate-pulse"
                  >
                    <div className="bg-slate-700 h-48 rounded-lg mb-4"></div>
                    <div className="space-y-2">
                      <div className="bg-slate-700 h-4 rounded w-3/4"></div>
                      <div className="bg-slate-700 h-3 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredCertificates.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  {searchQuery
                    ? "No Certificates Found"
                    : "No Certificates Found"}
                </h3>
                <p className="text-slate-400">
                  {searchQuery
                    ? `No certificates match "${searchQuery}". Try a different search term.`
                    : "You don't have any certificates yet."}
                </p>
                {searchQuery && (
                  <Button
                    variant="outline"
                    className="mt-4 bg-white/5 border-white/20 text-white hover:bg-white/10 hover:cursor-pointer hover:text-white"
                    onClick={() => setSearchQuery("")}
                  >
                    Clear Search
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCertificates.map((certificate) => (
                  <Card
                    key={certificate.tokenId}
                    className="bg-slate-800/30 border-slate-600 hover:bg-slate-800/50 transition-all duration-200 group overflow-hidden p-0"
                  >
                    <CardContent className="!p-0 !m-0">
                      {/* Certificate Image */}
                      <div className="relative">
                        <img
                          src={certificate.image || "/placeholder.svg"}
                          alt={certificate.name}
                          className="w-full h-48 object-cover rounded-t-lg block"
                        />
                        <div className="absolute top-3 right-3">
                          {getStatusBadge(certificate.status)}
                        </div>
                      </div>

                      {/* Certificate Details */}
                      <div className="p-4 space-y-4">
                        <div>
                          <h3 className="text-white font-semibold text-lg mb-1">
                            {certificate.name}
                          </h3>
                          <p className="text-slate-400 text-sm line-clamp-2">
                            {certificate.description}
                          </p>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Issuer:</span>
                            <span className="text-white">
                              {certificate.issuer}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Issued:</span>
                            <span className="text-white">
                              {certificate.issueDate}
                            </span>
                          </div>
                          {certificate.expiryDate && (
                            <div className="flex justify-between">
                              <span className="text-slate-400">Expires:</span>
                              <span className="text-white">
                                {certificate.expiryDate}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center space-x-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600 hover:cursor-pointer hover:text-white"
                            onClick={() =>
                              window.open(
                                `https://ipfs.io/ipfs/${certificate.ipfsHash}`,
                                "_blank"
                              )
                            }
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600 hover:cursor-pointer hover:text-white"
                            onClick={() => shareVerificationLink(certificate)}
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Verification Link */}
                        <div className="bg-green-900/20 border border-green-400/30 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Shield className="h-4 w-4 text-green-400" />
                              <span className="text-green-300 text-sm font-medium">
                                Verification Link
                              </span>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-green-300 hover:text-green-200 p-1 hover:cursor-pointer"
                              onClick={() => copyVerificationLink(certificate)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                          <Input
                            value={generateVerificationLink(certificate)}
                            readOnly
                            className="mt-2 bg-green-900/10 border-green-400/20 text-green-200 text-xs font-mono"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Toaster
        position="top-right"
        toastOptions={{
          className:
            "!bg-green-600/40 !text-green-300 !border !border-green-400/30",
          style: {
            backgroundColor: "transparent",
            color: "inherit",
            border: "none",
          },
        }}
      />
    </div>
  );
}
