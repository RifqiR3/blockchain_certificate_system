"use client";

import type React from "react";

import { useState } from "react";
import {
  Shield,
  User,
  Wallet,
  Building2,
  Mail,
  MapPin,
  FileText,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Globe,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAccount } from "wagmi";
import { ConnectKitButton } from "connectkit";
import { toast } from "sonner";
import { ethers } from "ethers";
import CertificateNFT from "@/contracts/CertificateNFT.json";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;
const SUPERADMIN_WALLET =
  "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266".toLowerCase();

const mockIssuers = [
  {
    id: "issuer-001",
    organizationName: "Blockchain University",
    adminWalletAddress: "0x742d35Cc6634C0532925a3b8D404d3aABe09e3b1",
    contactEmail: "admin@blockchain-university.edu",
    contactPhone: "+1 (555) 123-4567",
    website: "https://blockchain-university.edu",
    description:
      "Leading institution in blockchain education and certification",
    address: "123 Tech Street",
    city: "San Francisco",
    country: "United States",
    logoUrl: "/placeholder.svg?height=64&width=64",
    status: "active",
    registeredDate: "2024-01-15",
    certificatesIssued: 1247,
  },
  {
    id: "issuer-002",
    organizationName: "DeFi Academy",
    adminWalletAddress: "0x8ba1f109551bD432803012645Hac136c22C501e",
    contactEmail: "contact@defi-academy.com",
    contactPhone: "+44 20 7946 0958",
    website: "https://defi-academy.com",
    description:
      "Specialized training in decentralized finance protocols and development",
    address: "456 Finance Ave",
    city: "London",
    country: "United Kingdom",
    logoUrl: "/placeholder.svg?height=64&width=64",
    status: "active",
    registeredDate: "2024-02-20",
    certificatesIssued: 892,
  },
  {
    id: "issuer-003",
    organizationName: "Web3 Institute",
    adminWalletAddress: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
    contactEmail: "info@web3-institute.org",
    contactPhone: "+49 30 12345678",
    website: "https://web3-institute.org",
    description: "Comprehensive Web3 development and NFT creation courses",
    address: "789 Innovation Blvd",
    city: "Berlin",
    country: "Germany",
    logoUrl: "/placeholder.svg?height=64&width=64",
    status: "revoked",
    registeredDate: "2023-12-10",
    certificatesIssued: 543,
  },
  {
    id: "issuer-004",
    organizationName: "Security Labs",
    adminWalletAddress: "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE",
    contactEmail: "security@security-labs.io",
    contactPhone: "+1 (555) 987-6543",
    website: "https://security-labs.io",
    description:
      "Professional smart contract security auditing and certification",
    address: "321 Security Plaza",
    city: "Austin",
    country: "United States",
    logoUrl: "/placeholder.svg?height=64&width=64",
    status: "active",
    registeredDate: "2024-03-01",
    certificatesIssued: 234,
  },
];

export default function RegisterIssuer() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState("register");
  const isSuperAdmin = address?.toLowerCase() === SUPERADMIN_WALLET;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [issuers, setIssuers] = useState(mockIssuers);
  const [formData, setFormData] = useState({
    organizationName: "",
    adminWalletAddress: "",
    contactEmail: "",
    contactPhone: "",
    website: "",
    description: "",
    address: "",
    city: "",
    country: "",
    logoUrl: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [revokedModalOpen, setRevokeModalOpen] = useState(false);
  const [selectedIssuer, setSelectedIssuer] = useState<any>(null);
  const [revokeReason, setRevokeReason] = useState("");

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.organizationName.trim()) {
      newErrors.organizationName = "Organization name is required";
    }

    if (!formData.adminWalletAddress.trim()) {
      newErrors.adminWalletAddress = "Admin wallet address is required";
    } else if (!formData.adminWalletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      newErrors.adminWalletAddress = "Invalid wallet address format";
    }

    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = "Contact email is required";
    } else if (!formData.contactEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.contactEmail = "Invalid email format";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Organization description is required";
    }

    if (!formData.country.trim()) {
      newErrors.country = "Country is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CertificateNFT.abi,
        signer
      );

      const tx = await contract.registerIssuer(
        formData.adminWalletAddress,
        formData.organizationName
      );
      await tx.wait();

      toast.success("Issuer registered successfully");

      // Reset form
      setFormData({
        organizationName: "",
        adminWalletAddress: "",
        contactEmail: "",
        contactPhone: "",
        website: "",
        description: "",
        address: "",
        city: "",
        country: "",
        logoUrl: "",
      });
    } catch (error) {
      console.error("Failed to register issuer", error);
      toast.error("Failed to register issuer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevokeIssuer = async (issuer: any) => {
    setSelectedIssuer(issuer);
    setRevokeModalOpen(true);
  };

  const confirmRevokeIssuer = async () => {
    if (!selectedIssuer || !revokeReason.trim()) return;

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setIssuers((prev) =>
        prev.map((i) =>
          i.id === selectedIssuer.id ? { ...i, status: "revoked" } : i
        )
      );

      toast.success(
        `${selectedIssuer.organizationName} has been revoked successfully`
      );
      setRevokeModalOpen(false);
      setRevokeReason("");
      setSelectedIssuer(null);
    } catch (error) {
      toast.error("Failed to revoke issuer. Please try again");
      console.error("Failed to revoke issuer", error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-600/20 text-green-300 border-green-400/30">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
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
          <Badge className="bg-gray-600/20 text-gray-300 border-gray-400/30">
            Unknown
          </Badge>
        );
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
              <h1 className="text-2xl font-bold text-white">
                Issuer Management
              </h1>
              <p className="text-slate-400 text-sm">
                Superadmin - Manage certificate issuers
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
                        className="w-full bg-transparent flex items-center space-x-2 px-3 py-2 hover:cursor-pointer"
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
            <Card className="bg-white/10 backdrop-blur-md border-orange-400/30 shadow-2xl">
              <CardContent className="p-12 text-center">
                <div className="space-y-6">
                  <div className="bg-orange-600/20 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                    <Wallet className="h-10 w-10 text-orange-400" />
                  </div>

                  <div className="space-y-3">
                    <h2 className="text-3xl font-bold text-white">
                      Superadmin Access Required
                    </h2>
                    <p className="text-xl text-slate-300 max-w-md mx-auto">
                      Connect your superadmin wallet to register manage
                      certificate issuers
                    </p>
                  </div>

                  <div className="bg-orange-900/20 border border-orange-400/30 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="h-5 w-5 text-orange-400 flex-shrink-0" />
                      <p className="text-orange-300 text-sm">
                        Only authorized superadmin wallets can manage
                        certificate issuers
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
                            Connect Superadmin Wallet
                          </Button>
                        );
                      }}
                    </ConnectKitButton.Custom>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center mb-4">
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                <Building2 className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                <h3 className="text-white font-semibold mb-1">
                  Register Organizations
                </h3>
                <p className="text-slate-400 text-sm">
                  Add new certificate issuers
                </p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                <Shield className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                <h3 className="text-white font-semibold mb-1">
                  Manage Acccess
                </h3>
                <p className="text-slate-400 text-sm">
                  Register or revoke issuers
                </p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                <FileText className="h-8 w-8 text-green-400 mx-auto mb-2" />
                <h3 className="text-white font-semibold mb-1">
                  Manage Permissions
                </h3>
                <p className="text-slate-400 text-sm">
                  Control issuer capabilities
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  //   Connected State - But not superadmin
  if (isConnected && !isSuperAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-black text-white px-6">
        <div className="max-w-md text-center space-y-6">
          <Shield className="w-12 h-12 mx-auto text-red-500" />
          <h2 className="text-2xl font-bold">Access Denied</h2>
          <Button
            onClick={() => (window.location.href = "/")}
            variant="outline"
            className="text-black hover:cursor-pointer"
          >
            Back
          </Button>
        </div>
      </div>
    );
  }

  // Connected State - Registration Form
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
            <h1 className="text-2xl font-bold text-white">Issuer Management</h1>
            <p className="text-slate-400 text-sm">
              Superadmin - Manage certificate issuers
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Connected Wallet Info */}
          <div className="hidden md:flex items-center space-x-2 bg-orange-600/20 px-3 py-2 rounded-full border border-orange-400/30">
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
            <span className="text-orange-300 text-sm font-mono">
              {address
                ? `${address.slice(0, 6)}...${address.slice(-4)}`
                : "Superadmin"}
            </span>
          </div>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-12 w-12 rounded-full"
              >
                <Avatar className="h-12 w-12 border-2 border-orange-400/50 hover:border-orange-400 transition-colors">
                  <AvatarImage
                    src="/placeholder.svg?height=48&width=48"
                    alt="Superadmin Profile"
                  />
                  <AvatarFallback className="bg-orange-600 text-white">
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
        <div className="max-w-6xl mx-auto">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 bg-white/10 backdrop-blur-md border-white/20 mb-8">
              <TabsTrigger
                value="register"
                className="data-[state=active]:bg-orange-600 data-[state=active]:text-white hover:cursor-pointer"
              >
                <Building2 className="h-4 w-4 mr-2" />
                Register Issuer
              </TabsTrigger>
              <TabsTrigger
                value="manage"
                className="data-[state=active]:bg-orange-600 data-[state=active]:text-white hover:cursor-pointer"
              >
                <Shield className="h-4 w-4 mr-2" />
                Manage Issuers
              </TabsTrigger>
            </TabsList>

            <TabsContent value="register">
              <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2 text-2xl">
                    <Building2 className="h-6 w-6 text-purple-400" />
                    <span>Register New Issuer Organization</span>
                  </CardTitle>
                  <p className="text-slate-400">
                    Fill in the details below to register a new certificate
                    issuer organization.
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Organization Information */}
                    <div className="space-y-6">
                      <div className="flex items-center space-x-2 mb-4">
                        <Building2 className="h-5 w-5 text-purple-400" />
                        <h3 className="text-lg font-semibold text-white">
                          Organization Information
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label
                            htmlFor="organizationName"
                            className="text-slate-300"
                          >
                            Organization Name *
                          </Label>
                          <Input
                            id="organizationName"
                            placeholder="e.g., Blockchain University"
                            value={formData.organizationName}
                            onChange={(e) =>
                              handleInputChange(
                                "organizationName",
                                e.target.value
                              )
                            }
                            className={`bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500 ${
                              errors.organizationName ? "border-red-400" : ""
                            }`}
                          />
                          {errors.organizationName && (
                            <p className="text-red-400 text-sm">
                              {errors.organizationName}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="adminWalletAddress"
                            className="text-slate-300"
                          >
                            Admin Wallet Address *
                          </Label>
                          <Input
                            id="adminWalletAddress"
                            placeholder="0x..."
                            value={formData.adminWalletAddress}
                            onChange={(e) =>
                              handleInputChange(
                                "adminWalletAddress",
                                e.target.value
                              )
                            }
                            className={`bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500 font-mono ${
                              errors.adminWalletAddress ? "border-red-400" : ""
                            }`}
                          />
                          {errors.adminWalletAddress && (
                            <p className="text-red-400 text-sm">
                              {errors.adminWalletAddress}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="logoUrl" className="text-slate-300">
                            Logo URL (Optional)
                          </Label>
                          <Input
                            id="logoUrl"
                            placeholder="https://example.com/logo.png"
                            value={formData.logoUrl}
                            onChange={(e) =>
                              handleInputChange("logoUrl", e.target.value)
                            }
                            className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="website" className="text-slate-300">
                            Website (Optional)
                          </Label>
                          <Input
                            id="website"
                            placeholder="https://example.com"
                            value={formData.website}
                            onChange={(e) =>
                              handleInputChange("website", e.target.value)
                            }
                            className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-slate-300">
                          Organization Description *
                        </Label>
                        <Textarea
                          id="description"
                          placeholder="Describe the organization and its mission..."
                          value={formData.description}
                          onChange={(e) =>
                            handleInputChange("description", e.target.value)
                          }
                          className={`bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500 min-h-[100px] ${
                            errors.description ? "border-red-400" : ""
                          }`}
                        />
                        {errors.description && (
                          <p className="text-red-400 text-sm">
                            {errors.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-6">
                      <div className="flex items-center space-x-2 mb-4">
                        <Mail className="h-5 w-5 text-blue-400" />
                        <h3 className="text-lg font-semibold text-white">
                          Contact Information
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label
                            htmlFor="contactEmail"
                            className="text-slate-300"
                          >
                            Contact Email *
                          </Label>
                          <Input
                            id="contactEmail"
                            type="email"
                            placeholder="admin@example.com"
                            value={formData.contactEmail}
                            onChange={(e) =>
                              handleInputChange("contactEmail", e.target.value)
                            }
                            className={`bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500 ${
                              errors.contactEmail ? "border-red-400" : ""
                            }`}
                          />
                          {errors.contactEmail && (
                            <p className="text-red-400 text-sm">
                              {errors.contactEmail}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="contactPhone"
                            className="text-slate-300"
                          >
                            Contact Phone (Optional)
                          </Label>
                          <Input
                            id="contactPhone"
                            placeholder="+1 (555) 123-4567"
                            value={formData.contactPhone}
                            onChange={(e) =>
                              handleInputChange("contactPhone", e.target.value)
                            }
                            className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Address Information */}
                    <div className="space-y-6">
                      <div className="flex items-center space-x-2 mb-4">
                        <MapPin className="h-5 w-5 text-green-400" />
                        <h3 className="text-lg font-semibold text-white">
                          Address Information
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="address" className="text-slate-300">
                            Street Address (Optional)
                          </Label>
                          <Input
                            id="address"
                            placeholder="123 Main Street"
                            value={formData.address}
                            onChange={(e) =>
                              handleInputChange("address", e.target.value)
                            }
                            className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="city" className="text-slate-300">
                            City (Optional)
                          </Label>
                          <Input
                            id="city"
                            placeholder="New York"
                            value={formData.city}
                            onChange={(e) =>
                              handleInputChange("city", e.target.value)
                            }
                            className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="country" className="text-slate-300">
                            Country *
                          </Label>
                          <Input
                            id="country"
                            placeholder="United States"
                            value={formData.country}
                            onChange={(e) =>
                              handleInputChange("country", e.target.value)
                            }
                            className={`bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500 ${
                              errors.country ? "border-red-400" : ""
                            }`}
                          />
                          {errors.country && (
                            <p className="text-red-400 text-sm">
                              {errors.country}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Success Info */}
                    <div className="bg-green-900/20 border border-green-400/30 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-green-400" />
                        <h4 className="font-semibold text-green-300">
                          Registration Process
                        </h4>
                      </div>
                      <p className="text-green-200 text-sm">
                        Once registered, the organization will be able to issue
                        certificates using their admin wallet address. They will
                        have access to the admin dashboard to manage their
                        certificates.
                      </p>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end space-x-4 pt-6">
                      <Button
                        type="button"
                        variant="outline"
                        className="bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700"
                        onClick={() => {
                          setFormData({
                            organizationName: "",
                            adminWalletAddress: "",
                            contactEmail: "",
                            contactPhone: "",
                            website: "",
                            description: "",
                            address: "",
                            city: "",
                            country: "",
                            logoUrl: "",
                          });
                          setErrors({});
                        }}
                      >
                        Reset Form
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-8"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Registering...</span>
                          </div>
                        ) : (
                          <>
                            <Building2 className="h-4 w-4 mr-2" />
                            Register Issuer
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Manage Tab */}
            <TabsContent value="manage">
              <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-6 w-6 text-orange-400" />
                      <span>Registered Issuers</span>
                      <Badge
                        variant="outline"
                        className="bg-orange-600/20 text-orange-300 border-orange-400/30"
                      >
                        {issuers.length} Total
                      </Badge>
                    </div>
                  </CardTitle>
                  <p className="text-slate-400">
                    Manage all registered certificate issuer organizations.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {issuers.map((issuer) => (
                      <Card
                        key={issuer.id}
                        className="bg-slate-800/30 border-slate-600 hover:bg-slate-800/50 transition-all duration-200"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4 flex-1">
                              {/* Logo */}
                              <Avatar className="h-16 w-16 border-2 border-slate-600">
                                <AvatarImage
                                  src={issuer.logoUrl || "/placeholder.svg"}
                                  alt={issuer.organizationName}
                                />
                                <AvatarFallback className="bg-slate-700 text-white text-lg">
                                  {issuer.organizationName.charAt(0)}
                                </AvatarFallback>
                              </Avatar>

                              {/* Organization Details */}
                              <div className="flex-1 space-y-3">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h3 className="text-xl font-semibold text-white">
                                      {issuer.organizationName}
                                    </h3>
                                    <p className="text-slate-400 text-sm">
                                      {issuer.description}
                                    </p>
                                  </div>
                                  {getStatusBadge(issuer.status)}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                                  <div className="flex items-center space-x-2">
                                    <Wallet className="h-4 w-4 text-purple-400" />
                                    <div>
                                      <p className="text-slate-400">
                                        Admin Wallet
                                      </p>
                                      <p className="text-white font-mono text-xs">
                                        {issuer.adminWalletAddress.slice(0, 6)}
                                        ...{issuer.adminWalletAddress.slice(-4)}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center space-x-2">
                                    <Mail className="h-4 w-4 text-blue-400" />
                                    <div>
                                      <p className="text-slate-400">Contact</p>
                                      <p className="text-white">
                                        {issuer.contactEmail}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center space-x-2">
                                    <MapPin className="h-4 w-4 text-green-400" />
                                    <div>
                                      <p className="text-slate-400">Location</p>
                                      <p className="text-white">
                                        {issuer.city}, {issuer.country}
                                      </p>
                                    </div>
                                  </div>

                                  {issuer.website && (
                                    <div className="flex items-center space-x-2">
                                      <Globe className="h-4 w-4 text-cyan-400" />
                                      <div>
                                        <p className="text-slate-400">
                                          Website
                                        </p>
                                        <a
                                          href={issuer.website}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-cyan-300 hover:text-cyan-200 text-sm"
                                        >
                                          Visit Site
                                        </a>
                                      </div>
                                    </div>
                                  )}

                                  {issuer.contactPhone && (
                                    <div className="flex items-center space-x-2">
                                      <Phone className="h-4 w-4 text-yellow-400" />
                                      <div>
                                        <p className="text-slate-400">Phone</p>
                                        <p className="text-white">
                                          {issuer.contactPhone}
                                        </p>
                                      </div>
                                    </div>
                                  )}

                                  <div className="flex items-center space-x-2">
                                    <FileText className="h-4 w-4 text-orange-400" />
                                    <div>
                                      <p className="text-slate-400">
                                        Certificates
                                      </p>
                                      <p className="text-white">
                                        {issuer.certificatesIssued.toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                  <p className="text-slate-500 text-xs">
                                    Registered: {issuer.registeredDate}
                                  </p>

                                  <div className="flex items-center space-x-2">
                                    {issuer.status === "active" ? (
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() =>
                                          handleRevokeIssuer(issuer)
                                        }
                                        className="bg-red-600 hover:bg-red-700 hover:cursor-pointer"
                                      >
                                        <XCircle className="h-4 w-4 mr-1" />
                                        Revoke Access
                                      </Button>
                                    ) : (
                                      <div className="flex items-center space-x-2 text-red-400">
                                        <XCircle className="h-4 w-4" />
                                        <span className="text-sm">
                                          Permanently Revoked
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Revoke Confirmation Modal */}
      <Dialog open={revokedModalOpen} onOpenChange={setRevokeModalOpen}>
        <DialogContent className="bg-slate-900/95 backdrop-blur-md border-slate-700 text-white max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-2xl text-red-400">
              <XCircle className="h-6 w-6" />
              <span>Revoke Issuer Access</span>
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              This action is permanent and cannot be undone. The issuer will
              lose all access to the system.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="bg-red-900/20 border border-red-400/30 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <h4 className="font-semibold text-red-300">Warning</h4>
              </div>
              <p className="text-red-200 text-sm">
                You are about to permanently revoke access for{" "}
                <span className="font-semibold">
                  {selectedIssuer?.organizationName}
                </span>
                . This will:
              </p>
              <ul className="text-red-200 text-sm mt-2 ml-4 space-y-1">
                <li>• Prevent them from issuing new certificates</li>
                <li>• Disable their admin dashboard access</li>
                <li>• Mark their organization as permanently revoked</li>
                <li>• Cannot be reversed or reactivated</li>
              </ul>
            </div>

            {selectedIssuer && (
              <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-600">
                <div className="flex items-center space-x-3 mb-3">
                  <Avatar className="h-12 w-12 border-2 border-slate-600">
                    <AvatarImage
                      src={selectedIssuer.logoUrl || "/placeholder.svg"}
                      alt={selectedIssuer.organizationName}
                    />
                    <AvatarFallback className="bg-slate-700 text-white">
                      {selectedIssuer.organizationName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-white font-semibold">
                      {selectedIssuer.organizationName}
                    </p>
                    <p className="text-slate-400 text-sm font-mono">
                      {selectedIssuer.adminWalletAddress}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-400">Certificates Issued</p>
                    <p className="text-white">
                      {selectedIssuer.certificatesIssued?.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">Registered</p>
                    <p className="text-white">
                      {selectedIssuer.registeredDate}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="revoke-reason" className="text-slate-300">
                Reason for Revocation *
              </Label>
              <Textarea
                id="revoke-reason"
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                placeholder="Please provide a detailed reason for revoking this issuer's access..."
                className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500 min-h-[100px]"
              />
              <p className="text-slate-500 text-xs">
                This reason will be recorded in the audit log.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRevokeModalOpen(false);
                setRevokeReason("");
                setSelectedIssuer(null);
              }}
              className="bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmRevokeIssuer}
              variant="destructive"
              disabled={!revokeReason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Permanently Revoke Access
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
