"use client";

import { useEffect, useState } from "react";
import {
  Shield,
  User,
  Wallet,
  BarChart3,
  FileText,
  Users,
  Settings,
  Plus,
  Search,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  TrendingUp,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAccount } from "wagmi";
import { ConnectKitButton } from "connectkit";
import { CertificateModals } from "../../components/certificate-modals";
import { ethers } from "ethers";
import CertificateNFT from "@/contracts/CertificateNFT.json";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;

interface Certificate {
  id: string;
  tokenId: string;
  holder: string;
  issuer: string;
  metadataURI: string;
  ipfsHash: string;
  issueDate: number;
  expirationDate: number;
  isRevoked: boolean;
  isExpired: boolean;
  course?: string;
  description?: string;
}
export default function AdminDashboard() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [issuerName, setIssuerName] = useState<string | null>(null);
  const [isAuthorized, setisAuthorized] = useState<boolean>(false);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loadingCertificates, setLoadingCertificates] = useState(false);
  const [certificateStats, setCertificateStats] = useState({
    total: 0,
    active: 0,
    revoked: 0,
    issuedByYou: 0,
  });

  useEffect(() => {
    if (!isAuthorized || !address) return;

    const fetchCertificates = async () => {
      setLoadingCertificates(true);
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          CertificateNFT.abi,
          provider
        );

        // Get count and convert to number
        const totalCountBigInt = await contract.getActiveCertificateCount();
        const totalCount = Number(totalCountBigInt);
        console.log(`Found ${totalCount} certificates`);

        const fetchedCertificates: Certificate[] = [];
        const batchSize = 10;

        for (let i = 0; i < totalCount; i += batchSize) {
          const end = Math.min(i + batchSize, totalCount);

          const batchPromises = [];
          for (let j = i; j < end; j++) {
            batchPromises.push(
              contract
                .getActiveCertificateId(j)
                .then(async (tokenId: bigint) => {
                  const tokenIdStr = tokenId.toString();

                  const [metadataURI, holder, isRevoked, expirationTimestamp] =
                    await Promise.all([
                      contract.tokenURI(tokenId),
                      contract.ownerOf(tokenId),
                      contract.isRevoked(tokenId),
                      contract.getExpirationTimestamp(tokenId),
                    ]);

                  const ipfsHash = metadataURI.replace("ipfs://", "");
                  const expirationDate = Number(expirationTimestamp);
                  const isExpired =
                    expirationDate > 0
                      ? expirationDate < Math.floor(Date.now() / 1000)
                      : false;

                  // Fetch metadata
                  let course = `Certificate ${tokenIdStr}`;
                  let description = "";
                  let file: string = "";
                  try {
                    const res = await fetch(`https://ipfs.io/ipfs/${ipfsHash}`);
                    if (res.ok) {
                      const metadata = await res.json();
                      course = metadata.name || course;
                      description = metadata.description || "";
                      file = metadata.file;
                    }
                  } catch (error) {
                    console.error("Error fetching metadata:", error);
                  }

                  return {
                    id: tokenIdStr,
                    tokenId: tokenIdStr,
                    holder,
                    issuer: address || "",
                    metadataURI,
                    ipfsHash: file,
                    issueDate:
                      expirationDate > 0
                        ? expirationDate - 31536000
                        : Math.floor(Date.now() / 1000),
                    expirationDate,
                    isRevoked,
                    isExpired,
                    course,
                    description,
                  };
                })
            );
          }

          const batchResults = await Promise.all(batchPromises);
          fetchedCertificates.push(...batchResults);
        }

        setCertificates(fetchedCertificates);
        setCertificateStats({
          total: fetchedCertificates.length,
          active: fetchedCertificates.filter(
            (c) => !c.isRevoked && !c.isExpired
          ).length,
          revoked: fetchedCertificates.filter((c) => c.isRevoked).length,
          issuedByYou: fetchedCertificates.filter((c) => c.issuer === address)
            .length,
        });
      } catch (error) {
        console.error("Failed to fetch certificates:", error);
      } finally {
        setLoadingCertificates(false);
      }
    };

    fetchCertificates();
  }, [isAuthorized, address]);

  useEffect(() => {
    const checkIssuer = async () => {
      if (!address) return;

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);

        if (!CONTRACT_ADDRESS) {
          throw new Error("Contract address is not defined.");
        }

        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          CertificateNFT.abi,
          provider
        );

        const isRegistered = await contract.isRegisteredIssuer(address);
        const name = await contract.issuerNames(address);

        if (isRegistered && name) {
          setIssuerName(name);
          setisAuthorized(true);
        } else {
          setIssuerName(null);
          setisAuthorized(false);
        }
      } catch (err) {
        console.error("Failed to check issuer status", err);
        setisAuthorized(false);
      }
    };

    checkIssuer();
  }, [address]);

  // Modal states
  const [issueCertificateOpen, setIssueCertificateOpen] = useState(false);
  const [viewCertificateOpen, setViewCertificateOpen] = useState(false);
  const [editCertificateOpen, setEditCertificateOpen] = useState(false);
  const [revokeCertificateOpen, setRevokeCertificateOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<any>(null);

  const StatCard = ({
    title,
    value,
    icon: Icon,
    trend,
    trendValue,
  }: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    trend?: "up" | "down";
    trendValue?: string;
  }) => (
    <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl hover:bg-white/15 transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm font-medium">{title}</p>
            <p className="text-3xl font-bold text-white mt-2">{value}</p>
            {trend && trendValue && (
              <div className="flex items-center mt-2">
                <TrendingUp
                  className={`h-4 w-4 mr-1 ${
                    trend === "up" ? "text-green-400" : "text-red-400"
                  }`}
                />
                <span
                  className={`text-sm ${
                    trend === "up" ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {trendValue}
                </span>
              </div>
            )}
          </div>
          <div className="bg-purple-600/20 p-3 rounded-full">
            <Icon className="h-6 w-6 text-purple-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const handleViewCertificate = (cert: Certificate) => {
    setSelectedCertificate(cert);
    setViewCertificateOpen(true);
  };

  const handleEditCertificate = (cert: Certificate) => {
    setSelectedCertificate(cert);
    setEditCertificateOpen(true);
  };

  const handleRevokeCertificate = (cert: Certificate) => {
    setSelectedCertificate(cert);
    setRevokeCertificateOpen(true);
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
              <h1 className="text-2xl font-bold text-white">SealChain Admin</h1>
              <p className="text-slate-400 text-sm">
                Certificate Management System
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
                        className="w-full bg-transparent flex items-center space-x-2 px-3 py-2 hover:cursor-pointer text-white"
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
            <Card className="bg-white/10 backdrop-blur-md border-red-400/30 shadow-2xl">
              <CardContent className="p-12 text-center">
                <div className="space-y-6">
                  <div className="bg-red-600/20 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                    <Wallet className="h-10 w-10 text-red-400" />
                  </div>

                  <div className="space-y-3">
                    <h2 className="text-3xl font-bold text-white">
                      Wallet Not Connected
                    </h2>
                    <p className="text-xl text-slate-300 max-w-md mx-auto">
                      Please connect your wallet to access the admin dashboard
                    </p>
                  </div>

                  <div className="bg-red-900/20 border border-red-400/30 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <XCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                      <p className="text-red-300 text-sm">
                        Admin access requires a connected wallet for security
                        verification
                      </p>
                    </div>
                  </div>

                  <div className="pt-4">
                    <ConnectKitButton.Custom>
                      {({ show }) => {
                        return (
                          <Button
                            onClick={show}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:cursor-pointer"
                          >
                            <Wallet className="h-5 w-5 mr-2" />
                            Connect Wallet to Continue
                          </Button>
                        );
                      }}
                    </ConnectKitButton.Custom>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                <Shield className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                <h3 className="text-white font-semibold mb-1">Secure Access</h3>
                <p className="text-slate-400 text-sm">
                  Wallet-based authentication
                </p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                <FileText className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                <h3 className="text-white font-semibold mb-1">
                  Manage Certificates
                </h3>
                <p className="text-slate-400 text-sm">
                  Issue and revoke certificates
                </p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                <BarChart3 className="h-8 w-8 text-green-400 mx-auto mb-2" />
                <h3 className="text-white font-semibold mb-1">Analytics</h3>
                <p className="text-slate-400 text-sm">
                  Track system performance
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (isConnected && !isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-black text-white px-6">
        <div className="max-w-md text-center space-y-6">
          <Shield className="w-12 h-12 mx-auto text-red-500" />
          <h2 className="text-2xl font-bold">Access Denied</h2>
          <p className="text-slate-400">
            This wallet is not a registered certificate issuer. Please contact
            the system administrator to be added.
          </p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="text-black hover:cursor-pointer"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Connected State - Original Admin Dashboard
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
            <h1 className="text-2xl font-bold text-white">SealChain Admin</h1>
            <p className="text-slate-400 text-sm">
              Certificate Management System
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
                    alt="Admin Profile"
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

      {/* Main Content - Dashboard Tabs */}
      <main className="relative z-10 p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-md border-white/20 mb-8 ">
            <TabsTrigger
              value="dashboard"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white hover:cursor-pointer text-gray-400"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger
              value="certificates"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white hover:cursor-pointer text-gray-400"
            >
              <FileText className="h-4 w-4 mr-2" />
              Certificates
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white hover:cursor-pointer text-gray-400"
            >
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white hover:cursor-pointer text-gray-400"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Certificates"
                value={certificateStats.total.toLocaleString()}
                icon={FileText}
              />
              <StatCard
                title="Active Certificates"
                value={certificateStats.active.toLocaleString()}
                icon={CheckCircle}
              />
              <StatCard
                title="Revoked Certificates"
                value={certificateStats.revoked}
                icon={XCircle}
              />
              <StatCard
                title="Total Users"
                value={certificateStats.issuedByYou.toLocaleString()}
                icon={Users}
              />
            </div>

            {/* Loading State for certificates */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  Recent Certificate Activity
                  <Button
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 hover:cursor-pointer"
                    onClick={() => setIssueCertificateOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Issue New
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingCertificates ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                ) : certificates.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white">
                      No Certificates Yet
                    </h3>
                    <p className="text-slate-400 mt-2">
                      You haven&apos;t issued any certificates yet.
                    </p>
                    <Button
                      className="mt-4 bg-purple-600 hover:bg-purple-700 hover:cursor-pointer"
                      onClick={() => setIssueCertificateOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Issue Your First Certificate
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {certificates.slice(0, 5).map((cert) => {
                      const issueDate = new Date(cert.issueDate * 1000)
                        .toISOString()
                        .split("T")[0];
                      const status = cert.isRevoked
                        ? "revoked"
                        : cert.expirationDate < Math.floor(Date.now() / 1000)
                        ? "expired"
                        : "active";

                      return (
                        <div
                          key={cert.id}
                          className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                        >
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <p className="font-mono text-sm text-purple-400">
                                CERT-{cert.id.slice(0, 8)}
                              </p>
                              <Badge
                                variant={
                                  status === "active"
                                    ? "default"
                                    : status === "expired"
                                    ? "secondary"
                                    : "destructive"
                                }
                                className="text-xs"
                              >
                                {status}
                              </Badge>
                            </div>
                            <p className="text-white font-medium mt-1">
                              {cert.course}
                            </p>
                            <p className="text-slate-400 text-sm font-mono">
                              {cert.holder.slice(0, 6)}...
                              {cert.holder.slice(-4)}
                            </p>
                            <p className="text-slate-500 text-xs mt-1">
                              Issued: {issueDate}
                            </p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-slate-800/95 backdrop-blur-sm border-slate-700">
                              <DropdownMenuItem
                                onClick={() => handleViewCertificate(cert)}
                              >
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleEditCertificate(cert)}
                              >
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-400"
                                onClick={() => handleRevokeCertificate(cert)}
                              >
                                Revoke
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Certificates Tab */}
          <TabsContent value="certificates" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">
                Certificate Management
              </h2>
              <Button
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 hover:cursor-pointer"
                onClick={() => setIssueCertificateOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Issue Certificate
              </Button>
            </div>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search certificates..."
                      className="pl-10 bg-white/5 border-white/20 text-white"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loadingCertificates ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400" />
                  </div>
                ) : certificates.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white">
                      No Certificates Found
                    </h3>
                    <p className="text-slate-400 mt-2">
                      {searchQuery
                        ? "No certificates match your search"
                        : "You haven't issued any certificates yet"}
                    </p>
                    {!searchQuery && (
                      <Button
                        className="mt-4 bg-purple-600 hover:bg-purple-700 hover:cursor-pointer"
                        onClick={() => setIssueCertificateOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Issue Your First Certificate
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {certificates
                      .filter(
                        (cert) =>
                          cert.id
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()) ||
                          cert.holder
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()) ||
                          cert.metadataURI
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase())
                      )
                      .map((cert) => (
                        <div
                          key={cert.tokenId}
                          className={`flex items-center justify-between p-4 rounded-lg border ${
                            cert.isRevoked
                              ? "bg-red-900/20 border-red-400/30"
                              : "bg-white/5 border-white/10 hover:bg-white/10"
                          } transition-colors`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <p className="font-mono text-sm text-purple-400">
                                CERT-{cert.id.slice(0, 8)}
                              </p>
                              <Badge
                                variant={
                                  cert.isRevoked
                                    ? "destructive"
                                    : cert.isExpired
                                    ? "secondary"
                                    : "default"
                                }
                              >
                                {cert.isRevoked
                                  ? "Revoked"
                                  : cert.isExpired
                                  ? "Expired"
                                  : "Active"}
                              </Badge>
                            </div>
                            <p className="text-white font-medium mt-1">
                              {cert.course}
                            </p>
                            <div className="flex items-center space-x-4 mt-2">
                              <div>
                                <p className="text-slate-400 text-xs">Holder</p>
                                <p className="text-slate-300 text-sm font-mono">
                                  {cert.holder.slice(0, 6)}...
                                  {cert.holder.slice(-4)}
                                </p>
                              </div>
                              <div>
                                <p className="text-slate-400 text-xs">Issued</p>
                                <p className="text-slate-300 text-sm">
                                  {new Date(
                                    cert.issueDate * 1000
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                              {cert.expirationDate > 0 && (
                                <div>
                                  <p className="text-slate-400 text-xs">
                                    Expires
                                  </p>
                                  <p className="text-slate-300 text-sm">
                                    {new Date(
                                      cert.expirationDate * 1000
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-white/5 border-white/20 text-white hover:cursor-pointer"
                              onClick={() => {
                                handleViewCertificate(cert);
                              }}
                            >
                              View
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={cert.isRevoked}
                              onClick={() => handleRevokeCertificate(cert)}
                              className={
                                cert.isRevoked
                                  ? "opacity-50 cursor-not-allowed"
                                  : "hover:cursor-pointer"
                              }
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              {cert.isRevoked ? "Revoked" : "Revoke"}
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">User Management</h2>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    User Management
                  </h3>
                  <p className="text-slate-400">
                    User management features will be implemented here.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">System Settings</h2>
            </div>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <Settings className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    System Configuration
                  </h3>
                  <p className="text-slate-400">
                    System settings and configuration options will be available
                    here.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <CertificateModals
        issueCertificateOpen={issueCertificateOpen}
        setIssueCertificateOpen={setIssueCertificateOpen}
        viewCertificateOpen={viewCertificateOpen}
        setViewCertificateOpen={setViewCertificateOpen}
        editCertificateOpen={editCertificateOpen}
        setEditCertificateOpen={setEditCertificateOpen}
        revokeCertificateOpen={revokeCertificateOpen}
        setRevokeCertificateOpen={setRevokeCertificateOpen}
        selectedCertificate={selectedCertificate}
        issuerName={issuerName}
      />
    </div>
  );
}
