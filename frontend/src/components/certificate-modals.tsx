"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { FileText, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { CertificateFilePreview } from "./certificate-file-preview";
import { CertificateFileUpload } from "./certificate-file-upload";
import { ethers } from "ethers";
import CertificateNFT from "@/contracts/CertificateNFT.json";
import { Toaster, toast } from "sonner";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;

interface Certificate {
  id: string;
  holder: string;
  course: string;
  issueDate: string;
  status: string;
  expiryDate?: string;
  issuer?: string;
  description?: string;
  ipfsHash?: string;
  isRevoked?: boolean;
  isExpired?: boolean;
}

interface CertificateModalsProps {
  issueCertificateOpen: boolean;
  setIssueCertificateOpen: (open: boolean) => void;
  viewCertificateOpen: boolean;
  setViewCertificateOpen: (open: boolean) => void;
  editCertificateOpen: boolean;
  setEditCertificateOpen: (open: boolean) => void;
  revokeCertificateOpen: boolean;
  setRevokeCertificateOpen: (open: boolean) => void;
  selectedCertificate: Certificate | null;
  issuerName?: string | null;
}

export function CertificateModals({
  issueCertificateOpen,
  setIssueCertificateOpen,
  viewCertificateOpen,
  setViewCertificateOpen,
  editCertificateOpen,
  setEditCertificateOpen,
  revokeCertificateOpen,
  setRevokeCertificateOpen,
  selectedCertificate,
  issuerName,
}: CertificateModalsProps) {
  // Issue Certificate Modal
  const IssueCertificateModal = () => {
    const [localFormData, setLocalFormData] = useState({
      holder: "",
      course: "",
      issuer: issuerName,
      issueDate: "",
      expiryDate: "",
      description: "",
    });

    // Reset form when modal opens
    useEffect(() => {
      if (issueCertificateOpen) {
        setLocalFormData({
          holder: "",
          course: "",
          issuer: issuerName,
          issueDate: "",
          expiryDate: "",
          description: "",
        });
      }
    }, [issueCertificateOpen, issuerName]);

    const handleLocalInputChange = (field: string, value: string) => {
      setLocalFormData((prev) => ({ ...prev, [field]: value }));
    };

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isIssuing, setIsIssuing] = useState(false);

    const handleSubmit = async () => {
      setIsIssuing(true);
      try {
        // Check if MetaMask is installed
        if (!window.ethereum) {
          alert("MetaMask not found!");
          return;
        }

        // Request account access if needed
        console.log("Requesting account access...");
        await window.ethereum.request({ method: "eth_requestAccounts" });

        console.log("Creating provider...");
        const provider = new ethers.BrowserProvider(window.ethereum);

        console.log("Getting signer...");
        const signer = await provider.getSigner();

        console.log("Signer address:", await signer.getAddress());

        if (!CONTRACT_ADDRESS) {
          alert("Smart contract address is not configured.");
          return;
        }

        console.log("Creating contract instance...");
        // Create contract instance
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          CertificateNFT.abi,
          signer
        );

        if (!selectedFile) {
          alert("Please upload a certificate file.");
          return;
        }

        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("name", localFormData.course);
        formData.append("issuer", localFormData.issuer ?? "");
        formData.append("description", localFormData.description);
        formData.append("issueDate", localFormData.issueDate);
        formData.append("expiryDate", localFormData.expiryDate || "");

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          alert("Failed to upload certificate file.");
          return;
        }

        const { metadataUri } = await uploadRes.json();
        console.log("✅ IPFS URI received:", metadataUri);

        const expirationTimestamp = localFormData.expiryDate
          ? Math.floor(new Date(localFormData.expiryDate).getTime() / 1000)
          : 0;

        const tx = await contract.mintCertificate(
          localFormData.holder,
          metadataUri,
          expirationTimestamp
        );

        await tx.wait();

        alert("✅ Certificate minted successfully!");
        setIssueCertificateOpen(false);
      } catch (err) {
        console.error("❌ Minting failed:", err);

        // More specific error handling
        if (typeof err === "object" && err !== null && "code" in err) {
          const code = (err as { code: number }).code;
          if (code === 4001) {
            alert("❌ Transaction rejected by user");
          } else if (code === -32002) {
            alert("❌ MetaMask request already pending");
          } else {
            alert(
              "❌ Failed to mint certificate: " +
                (err as { message?: string }).message
            );
          }
        } else {
          alert("❌ Failed to mint certificate: " + String(err));
        }
      } finally {
        setIsIssuing(false);
      }
    };

    return (
      <Dialog
        open={issueCertificateOpen}
        onOpenChange={setIssueCertificateOpen}
      >
        <DialogContent className="bg-slate-900/95 backdrop-blur-md border-slate-700 text-white max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-2xl">
              <FileText className="h-6 w-6 text-purple-400" />
              <span>Issue New Certificate</span>
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Create a new certificate on the blockchain. All fields are
              required.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="holder" className="text-slate-300">
                  Holder Wallet Address
                </Label>
                <Input
                  id="holder"
                  placeholder="0x..."
                  value={localFormData.holder}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleLocalInputChange("holder", e.target.value);
                  }}
                  className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="course" className="text-slate-300">
                  Course/Certificate Name
                </Label>
                <Input
                  id="course"
                  placeholder="e.g., Advanced Smart Contract Development"
                  value={localFormData.course}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleLocalInputChange("course", e.target.value);
                  }}
                  className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="issuer" className="text-slate-300">
                Issuer Name
              </Label>
              <Input
                id="issuer"
                value={localFormData.issuer ?? ""}
                disabled
                className="bg-slate-800/30 border-slate-600 text-slate-400 cursor-not-allowed"
              />
              <p className="text-xs text-slate-500"></p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="issueDate" className="text-slate-300">
                  Issue Date
                </Label>
                <Input
                  id="issueDate"
                  type="date"
                  value={localFormData.issueDate}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleLocalInputChange("issueDate", e.target.value);
                  }}
                  className="bg-slate-800/50 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiryDate" className="text-slate-300">
                  Expiry Date (Optional)
                </Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={localFormData.expiryDate}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleLocalInputChange("expiryDate", e.target.value);
                  }}
                  className="bg-slate-800/50 border-slate-600 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-slate-300">
                Description (Optional)
              </Label>
              <Textarea
                id="description"
                placeholder="Additional details about the certificate..."
                value={localFormData.description}
                onChange={(e) => {
                  e.stopPropagation();
                  handleLocalInputChange("description", e.target.value);
                }}
                className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500 min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="certificate-file" className="text-slate-300">
                Certificate File *
              </Label>
              <CertificateFileUpload
                value={selectedFile}
                onChange={(file) => setSelectedFile(file)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIssueCertificateOpen(false)}
              className="bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700 hover:cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 hover:cursor-pointer"
              disabled={
                !localFormData.holder ||
                !localFormData.course ||
                !localFormData.issuer ||
                !localFormData.issueDate ||
                !selectedFile
              }
            >
              {isIssuing ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Issuing...</span>
                </div>
              ) : (
                "Issue Certificate"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  // View Certificate Modal
  const ViewCertificateModal = () => (
    <Dialog open={viewCertificateOpen} onOpenChange={setViewCertificateOpen}>
      <DialogContent className="bg-slate-900/95 backdrop-blur-md border-slate-700 text-white max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-2xl">
            <FileText className="h-6 w-6 text-blue-400" />
            <span>Certificate Details</span>
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            View complete certificate information and blockchain details.
          </DialogDescription>
        </DialogHeader>

        {selectedCertificate && (
          <div className="space-y-6 py-4">
            <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-600">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  {selectedCertificate.course}
                </h3>
                <Badge
                  variant={
                    selectedCertificate.isRevoked
                      ? "destructive"
                      : selectedCertificate.isExpired
                      ? "secondary"
                      : "default"
                  }
                >
                  {selectedCertificate.isRevoked
                    ? "Revoked"
                    : selectedCertificate.isExpired
                    ? "Expired"
                    : "Active"}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-400">Certificate ID</p>
                  <p className="font-mono text-purple-400">
                    {selectedCertificate.id}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Token ID</p>
                  <p className="font-mono text-purple-400">
                    {selectedCertificate.id}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Issue Date</p>
                  <p className="text-white">
                    {new Date(
                      selectedCertificate.issueDate * 1000
                    ).toLocaleString()}
                  </p>
                </div>
                {selectedCertificate.expiryDate &&
                  !isNaN(Number(selectedCertificate.expiryDate)) &&
                  Number(selectedCertificate.expiryDate) > 0 && (
                    <div>
                      <p className="text-slate-400">Expiration Date</p>
                      <p className="text-white">
                        {new Date(
                          Number(selectedCertificate.expiryDate) * 1000
                        ).toLocaleString()}
                      </p>
                    </div>
                  )}
                <div className="md:col-span-2">
                  <p className="text-slate-400">Holder Address</p>
                  <p className="font-mono text-green-400 break-all">
                    {selectedCertificate.holder}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-slate-400">Metadata URI</p>
                  <p className="font-mono text-blue-400 break-all text-xs">
                    {selectedCertificate.metadataURI}
                  </p>
                </div>
              </div>
            </div>

            {/* Add IPFS preview component here */}
            <CertificateFilePreview ipfsHash={selectedCertificate.ipfsHash} />
          </div>
        )}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setViewCertificateOpen(false)}
            className="bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Edit Certificate Modal
  const EditCertificateModal = () => {
    const [localFormData, setLocalFormData] = useState({
      course: "",
      description: "",
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Initialize form with selected certificate data when modal opens
    useEffect(() => {
      if (editCertificateOpen && selectedCertificate) {
        setLocalFormData({
          course: selectedCertificate.course || "",
          description: selectedCertificate.description || "",
        });
        setSelectedFile(null);
      }
    }, [editCertificateOpen, selectedCertificate]);

    const handleLocalInputChange = (field: string, value: string) => {
      setLocalFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleEditCertificate = () => {
      // Handle certificate edit logic here
      console.log(
        "Editing certificate:",
        selectedCertificate?.id,
        localFormData
      );
      setEditCertificateOpen(false);
    };

    return (
      <Dialog open={editCertificateOpen} onOpenChange={setEditCertificateOpen}>
        <DialogContent className="bg-slate-900/95 backdrop-blur-md border-slate-700 text-white max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-2xl">
              <FileText className="h-6 w-6 text-yellow-400" />
              <span>Edit Certificate</span>
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Modify certificate details. Changes will be recorded on the
              blockchain.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="bg-yellow-900/20 border border-yellow-400/30 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-400" />
                <p className="text-yellow-300 text-sm">
                  Editing will create a new transaction on the blockchain.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-holder" className="text-slate-300">
                  Holder Wallet Address
                </Label>
                <Input
                  id="edit-holder"
                  value={selectedCertificate?.holder || ""}
                  disabled
                  className="bg-slate-800/30 border-slate-600 text-slate-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-course" className="text-slate-300">
                  Course/Certificate Name
                </Label>
                <Input
                  id="edit-course"
                  value={localFormData.course || ""}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleLocalInputChange("course", e.target.value);
                  }}
                  className="bg-slate-800/50 border-slate-600 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description" className="text-slate-300">
                Description
              </Label>
              <Textarea
                id="edit-description"
                value={localFormData.description}
                onChange={(e) => {
                  e.stopPropagation();
                  handleLocalInputChange("description", e.target.value);
                }}
                className="bg-slate-800/50 border-slate-600 text-white min-h-[100px]"
                placeholder="Update certificate description..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-certificate-file" className="text-slate-300">
                Certificate File
              </Label>
              <CertificateFileUpload
                value={selectedFile}
                onChange={(file) => setSelectedFile(file)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditCertificateOpen(false)}
              className="bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditCertificate}
              className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
            >
              Update Certificate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  // Revoke Certificate Modal
  const RevokeCertificateModal = () => {
    const [localRevokeReason, setLocalRevokeReason] = useState("");

    // Reset reason when modal opens
    useEffect(() => {
      if (revokeCertificateOpen) {
        setLocalRevokeReason("");
      }
    }, [revokeCertificateOpen]);

    const [isRevoking, setIsRevoking] = useState(false);
    const [txHash, setTxHash] = useState<string | null>(null);

    const handleRevokeCertificate = async () => {
      if (!selectedCertificate || !localRevokeReason.trim()) return;

      setIsRevoking(true);
      try {
        // Check Metamask
        if (!window.ethereum) {
          throw new Error("Metamask not found");
        }

        await window.ethereum.request({ method: "eth_requestAccounts" });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          CertificateNFT.abi,
          signer
        );

        const tx = await contract.revokeCertificate(selectedCertificate.id);
        setTxHash(tx.hash);

        await tx.wait();

        setRevokeCertificateOpen(false);

        toast.success("Certificate revoked successfully");
      } catch (error) {
        console.error("Revocation failed:", error);
        alert(
          `Failed to revoke certificate: ${
            error instanceof Error ? error.message : String(error)
          }}`
        );
      } finally {
        setIsRevoking(false);
      }
    };

    return (
      <Dialog
        open={revokeCertificateOpen}
        onOpenChange={setRevokeCertificateOpen}
      >
        <DialogContent className="bg-slate-900/95 backdrop-blur-md border-slate-700 text-white max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-2xl text-red-400">
              <XCircle className="h-6 w-6" />
              <span>Revoke Certificate</span>
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              This action cannot be undone. The certificate will be permanently
              revoked on the blockchain.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="bg-red-900/20 border border-red-400/30 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <h4 className="font-semibold text-red-300">Warning</h4>
              </div>
              <p className="text-red-200 text-sm">
                You are about to revoke certificate with tokenID:{" "}
                <span className="font-mono">{selectedCertificate?.id}</span>.
                This action is permanent and cannot be reversed.
              </p>
            </div>

            {selectedCertificate && (
              <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-600">
                <p className="text-slate-400 text-sm">Certificate Details:</p>
                <p className="text-white font-medium">
                  {selectedCertificate.course}
                </p>
                <p className="text-slate-400 text-sm">Holder:</p>
                <p className="text-slate-400 text-sm font-mono">
                  {selectedCertificate.holder}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="revoke-reason" className="text-slate-300">
                Reason for Revocation *
              </Label>
              <Textarea
                id="revoke-reason"
                value={localRevokeReason}
                onChange={(e) => {
                  e.stopPropagation();
                  setLocalRevokeReason(e.target.value);
                }}
                placeholder="Please provide a reason for revoking this certificate..."
                className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500 min-h-[80px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRevokeCertificateOpen(false)}
              className="bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRevokeCertificate}
              variant="destructive"
              disabled={!localRevokeReason.trim() || isRevoking}
              className="bg-red-600 hover:bg-red-700"
            >
              {isRevoking ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Revoking...</span>
                </div>
              ) : (
                "Revoke Certificate"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <>
      <IssueCertificateModal />
      <ViewCertificateModal />
      <EditCertificateModal />
      <RevokeCertificateModal />
      <Toaster position="top-right" />
    </>
  );
}
