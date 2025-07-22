"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Shield,
  User,
  Wallet,
  Building2,
  FileText,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
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
import { Toaster, toast } from "sonner";
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

interface Issuer {
  address: string;
  name: string;
  isActive: boolean;
}

export default function RegisterIssuer() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState("register");
  const isSuperAdmin = address?.toLowerCase() === SUPERADMIN_WALLET;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [issuers, setIssuers] = useState<Issuer[]>([]);
  const [isLoadingIssuers, setIsLoadingIssuers] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [revokedModalOpen, setRevokeModalOpen] = useState(false);
  const [selectedIssuer, setSelectedIssuer] = useState<Issuer | null>(null);
  const [revokeReason, setRevokeReason] = useState("");

  useEffect(() => {
    if (isConnected && isSuperAdmin) {
      fetchIssuers();
    }
  }, [isConnected, isSuperAdmin]);

  const fetchIssuers = async () => {
    setIsLoadingIssuers(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CertificateNFT.abi,
        provider
      );

      const fetchedIssuers: Issuer[] = [];

      try {
        const events = await contract.queryFilter(
          contract.filters.IssuerRegistered()
        );
        for (const event of events) {
          if ("args" in event && event.args) {
            const issuerAddress = event.args.issuer;
            const isActive = await contract.isRegisteredIssuer(issuerAddress);
            const name = await contract.issuerNames(issuerAddress);

            if (name) {
              fetchedIssuers.push({
                address: issuerAddress,
                name,
                isActive,
              });
            }
          }
        }
      } catch (error) {
        console.error("Couldn't fetch from events", error);
      }

      setIssuers(fetchedIssuers);
    } catch (error) {
      console.error("Failed to fetch issuers", error);
      toast.error("Failed to fetch issuers");
    } finally {
      setIsLoadingIssuers(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Issuer name is required";
    }

    if (!formData.address.trim()) {
      newErrors.name = "Wallet address is required";
    } else if (!formData.address.match(/^0x[a-fA-F0-9]{40}$/)) {
      newErrors.address = "Invalid wallet address format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const parseEthereumError = (error: any): string => {
    // Check for revert reason
    if (error.reason) return error.reason;

    // Check for error data
    if (error.data?.message) {
      try {
        const revertReason = error.data.message.match(
          /reverted with reason string '(.+?)'/
        );
        if (revertReason) return revertReason[1];
      } catch (e) {
        console.warn("Couldn't parse error data", e);
      }
    }

    // Check for JSON-RPC error
    if (error.error?.data?.message) {
      return error.error.data.message;
    }

    // Fallback to general error message
    return error.message || "Unknown error occurred";
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

      const tx = await contract.registerIssuer(formData.address, formData.name);
      await tx.wait();

      toast.success("Issuer registered successfully");

      // Reset form
      setFormData({
        name: "",
        address: "",
      });
    } catch (error) {
      console.error("Failed to register issuer", error);
      const errorMessage = parseEthereumError(error);
      toast.error(`Failed to register issuer: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevokeIssuer = async (issuer: Issuer) => {
    setSelectedIssuer(issuer);
    setRevokeModalOpen(true);
  };

  const confirmRevokeIssuer = async () => {
    if (!selectedIssuer || !revokeReason.trim()) return;

    try {
      setIsSubmitting(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CertificateNFT.abi,
        signer
      );

      const tx = await contract.revokeIssuer(selectedIssuer.address);
      await tx.wait();

      toast.success(`${selectedIssuer.name} has been revoked successfully`);
      fetchIssuers();
      setRevokeModalOpen(false);
      setRevokeReason("");
      setSelectedIssuer(null);
    } catch (error) {
      console.error("Failed to revoke issuer", error);
      toast.error("Failed to revoke issuer. Please try again");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return (
        <Badge className="bg-green-600/20 text-green-300 border-green-400/30">
          <CheckCircle className="h-3 w-3 mr-1" />
          Active
        </Badge>
      );
    }
    return (
      <Badge className="bg-red-600/20 text-red-300 border-red-400/30">
        <XCircle className="h-3 w-3 mr-1" />
        Revoked
      </Badge>
    );
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
                        className="w-full bg-transparent flex items-center space-x-2 px-3 py-2 hover:cursor-pointer"
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
                    <span>Register New Issuer</span>
                  </CardTitle>
                  <p className="text-slate-400">
                    Register a new certificate issuer by providing their name
                    and wallet address.
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-slate-300">
                            Issuer Name *
                          </Label>
                          <Input
                            id="name"
                            placeholder="e.g., Blockchain University"
                            value={formData.name}
                            onChange={(e) =>
                              handleInputChange("name", e.target.value)
                            }
                            className={`bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500 ${
                              errors.name ? "border-red-400" : ""
                            }`}
                          />
                          {errors.name && (
                            <p className="text-red-400 text-sm">
                              {errors.name}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="address" className="text-slate-300">
                            Wallet Address *
                          </Label>
                          <Input
                            id="address"
                            placeholder="0x..."
                            value={formData.address}
                            onChange={(e) =>
                              handleInputChange("address", e.target.value)
                            }
                            className={`bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500 font-mono ${
                              errors.address ? "border-red-400" : ""
                            }`}
                          />
                          {errors.address && (
                            <p className="text-red-400 text-sm">
                              {errors.address}
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
                        Once registered, the issuer will be able to issue
                        certificates using their wallet address.
                      </p>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end space-x-4 pt-6">
                      <Button
                        type="button"
                        variant="outline"
                        className="bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700 hover:cursor-pointer"
                        onClick={() => {
                          setFormData({
                            name: "",
                            address: "",
                          });
                          setErrors({});
                        }}
                      >
                        Reset Form
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-8 hover:cursor-pointer"
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={fetchIssuers}
                      disabled={isLoadingIssuers}
                      className="bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700 hover:cursor-pointer"
                    >
                      {isLoadingIssuers ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                          <span>Refreshing...</span>
                        </div>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Refresh
                        </>
                      )}
                    </Button>
                  </CardTitle>
                  <p className="text-slate-400">
                    Manage all registered certificate issuers.
                  </p>
                </CardHeader>
                <CardContent>
                  {isLoadingIssuers ? (
                    <div className="flex justify-center items-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                  ) : issuers.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      No issuers registered yet.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {issuers.map((issuer, index) => (
                        <Card
                          key={index}
                          className="bg-slate-800/30 border-slate-600 hover:bg-slate-800/50 transition-all duration-200"
                        >
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-4 flex-1">
                                <Avatar className="h-16 w-16 border-2 border-slate-600">
                                  <AvatarFallback className="bg-slate-700 text-white text-lg">
                                    {issuer.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>

                                <div className="flex-1 space-y-3">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h3 className="text-xl font-semibold text-white">
                                        {issuer.name}
                                      </h3>
                                    </div>
                                    {getStatusBadge(issuer.isActive)}
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div className="flex items-center space-x-2">
                                      <Wallet className="h-4 w-4 text-purple-400" />
                                      <div>
                                        <p className="text-slate-400">
                                          Wallet Address
                                        </p>
                                        <p className="text-white font-mono text-xs">
                                          {issuer.address.slice(0, 6)}...
                                          {issuer.address.slice(-4)}
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between pt-2">
                                    <div className="flex items-center space-x-2">
                                      {issuer.isActive ? (
                                        <Button
                                          variant="destructive"
                                          size="sm"
                                          onClick={() =>
                                            handleRevokeIssuer(issuer)
                                          }
                                          className="bg-red-900/100 border border-red-400/30 hover:bg-red-700 hover:cursor-pointer"
                                        >
                                          <XCircle className="h-4 w-4 mr-1" />
                                          Revoke Access
                                        </Button>
                                      ) : (
                                        <div className="flex items-center space-x-2 text-red-400">
                                          <XCircle className="h-4 w-4" />
                                          <span className="text-sm">
                                            Revoked
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
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Toaster position="top-right" />

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
                <span className="font-semibold">{selectedIssuer?.name}</span>.
                This will:
              </p>
              <ul className="text-red-200 text-sm mt-2 ml-4 space-y-1">
                <li>• Prevent them from issuing new certificates</li>
                <li>• Disable their admin dashboard access</li>
                <li>• Cannot be reversed or reactivated</li>
              </ul>
            </div>

            {selectedIssuer && (
              <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-600">
                <div className="flex items-center space-x-3 mb-3">
                  <Avatar className="h-12 w-12 border-2 border-slate-600">
                    <AvatarFallback className="bg-slate-700 text-white">
                      {selectedIssuer.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-white font-semibold">
                      {selectedIssuer.name}
                    </p>
                    <p className="text-slate-400 text-sm font-mono">
                      {selectedIssuer.address}
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
              disabled={!revokeReason.trim() || isSubmitting}
              className="bg-red-900/20 border border-red-400/30 hover:bg-red-700 hover:cursor-pointer"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Revoking...</span>
                </div>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Permanently Revoke Access
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
