"use client";

import { useState } from "react";
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

// Mock data
const dashboardStats = {
  totalCertificates: 1247,
  activeCertificates: 1089,
  revokedCertificates: 158,
  totalUsers: 892,
  monthlyGrowth: 12.5,
};

const recentCertificates = [
  {
    id: "CERT-2024-001",
    holder: "0x742d35Cc6634C0532925a3b8D404d3aABe09e3b1",
    course: "Advanced Smart Contract Development",
    issueDate: "2024-01-15",
    status: "active",
    ipfsHash: "QmExampleHash1234567890abcdef",
  },
  {
    id: "CERT-2024-002",
    holder: "0x8ba1f109551bD432803012645Hac136c22C501e",
    course: "DeFi Protocol Design",
    issueDate: "2024-01-14",
    status: "active",
    ipfsHash: "QmExampleHash0987654321fedcba",
  },
  {
    id: "CERT-2024-003",
    holder: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
    course: "NFT Development Fundamentals",
    issueDate: "2024-01-13",
    status: "revoked",
    ipfsHash: "QmExampleHashRevoked111222333",
  },
];

export default function AdminDashboard() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");

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

  const handleViewCertificate = (cert: any) => {
    setSelectedCertificate(cert);
    setViewCertificateOpen(true);
  };

  const handleEditCertificate = (cert: any) => {
    setSelectedCertificate(cert);
    setEditCertificateOpen(true);
  };

  const handleRevokeCertificate = (cert: any) => {
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
              <h1 className="text-2xl font-bold text-white">
                CertifyChain Admin
              </h1>
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
            <h1 className="text-2xl font-bold text-white">
              CertifyChain Admin
            </h1>
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
          <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-md border-white/20 mb-8">
            <TabsTrigger
              value="dashboard"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger
              value="certificates"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              <FileText className="h-4 w-4 mr-2" />
              Certificates
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
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
                value={dashboardStats.totalCertificates.toLocaleString()}
                icon={FileText}
                trend="up"
                trendValue="+12.5%"
              />
              <StatCard
                title="Active Certificates"
                value={dashboardStats.activeCertificates.toLocaleString()}
                icon={CheckCircle}
              />
              <StatCard
                title="Revoked Certificates"
                value={dashboardStats.revokedCertificates}
                icon={XCircle}
              />
              <StatCard
                title="Total Users"
                value={dashboardStats.totalUsers.toLocaleString()}
                icon={Users}
                trend="up"
                trendValue="+8.2%"
              />
            </div>

            {/* Recent Activity */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  Recent Certificate Activity
                  <Button
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={() => setIssueCertificateOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Issue New
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentCertificates.map((cert) => (
                    <div
                      key={cert.id}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <p className="font-mono text-sm text-purple-400">
                            {cert.id}
                          </p>
                          <Badge
                            variant={
                              cert.status === "active"
                                ? "default"
                                : "destructive"
                            }
                            className="text-xs"
                          >
                            {cert.status}
                          </Badge>
                        </div>
                        <p className="text-white font-medium mt-1">
                          {cert.course}
                        </p>
                        <p className="text-slate-400 text-sm font-mono">
                          {cert.holder}
                        </p>
                        <p className="text-slate-500 text-xs mt-1">
                          Issued: {cert.issueDate}
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
                  ))}
                </div>
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
                className="bg-purple-600 hover:bg-purple-700"
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
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search certificates..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-slate-400"
                    />
                  </div>
                  <Button
                    variant="outline"
                    className="bg-white/5 border-white/20 text-white"
                  >
                    Filter
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentCertificates.map((cert) => (
                    <div
                      key={cert.id}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <p className="font-mono text-sm text-purple-400">
                            {cert.id}
                          </p>
                          <Badge
                            variant={
                              cert.status === "active"
                                ? "default"
                                : "destructive"
                            }
                          >
                            {cert.status}
                          </Badge>
                        </div>
                        <p className="text-white font-medium mt-1">
                          {cert.course}
                        </p>
                        <p className="text-slate-400 text-sm font-mono">
                          {cert.holder}
                        </p>
                        <p className="text-slate-500 text-xs mt-1">
                          Issued: {cert.issueDate}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-white/5 border-white/20 text-white"
                          onClick={() => handleViewCertificate(cert)}
                        >
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-white/5 border-white/20 text-white"
                          onClick={() => handleEditCertificate(cert)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRevokeCertificate(cert)}
                        >
                          Revoke
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
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
      />
    </div>
  );
}
