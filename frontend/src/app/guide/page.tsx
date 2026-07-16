import React from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Settings, Wallet, Search } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-950 to-slate-950 text-slate-200 py-12 px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header & Back Button */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
          <div>
            <Link href="/">
              <Button
                variant="ghost"
                className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/50 mb-4 -ml-4 hover:cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Main Page
              </Button>
            </Link>
            <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              Sealchain User Guide
            </h1>
            <p className="text-slate-400 mt-2 text-lg">
              Welcome to the Sealchain testing environment. To interact with the
              blockchain certificate system, you will need to configure your
              MetaMask wallet and import the provided testing accounts. Follow
              the steps below to get started.
            </p>
          </div>
          <Badge
            variant="outline"
            className="border-indigo-500/30 text-indigo-300 px-4 py-1 text-sm bg-indigo-500/10 backdrop-blur-sm w-fit"
          >
            Testnet Environment
          </Badge>
        </div>

        {/* Step 1 */}
        <Card className="bg-slate-900/50 border-indigo-500/20 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl text-indigo-100">
              <Settings className="w-6 h-6 mr-3 text-indigo-400" />
              1. Configure the MetaMask RPC
            </CardTitle>
            <CardDescription className="text-slate-400 text-base">
              <p>
                First, you need to connect your wallet to the custom Sealchain
                network.
              </p>
            </CardDescription>
          </CardHeader>
          <CardContent className="text-slate-300 space-y-4">
            <p>
              Open your <strong>MetaMask</strong> extension, Click the{" "}
              <strong>three-dash symbol</strong> in the top-right corner{" "}
              <strong>&gt;</strong>
              navigate to <strong>Networks &gt; Add a custom network</strong>,
              and enter the following:
            </p>
            <div className="bg-slate-950 rounded-lg p-4 border border-slate-800 font-mono text-sm space-y-2 text-indigo-200">
              <p>
                <span className="text-slate-500">Network Name:</span> Sealchain
              </p>
              <p>
                <span className="text-slate-500">New RPC URL:</span>{" "}
                https://rpc.rifqirr.com
              </p>
              <p>
                <span className="text-slate-500">Chain ID:</span> 31337
              </p>
              <p>
                <span className="text-slate-500">Currency Symbol:</span> ETH
              </p>
              <p>
                <span className="text-slate-500">Block Explorer URL:</span>
                <i>(Leave this empty)</i>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Step 2 */}
        <Card className="bg-slate-900/50 border-purple-500/20 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl text-purple-100">
              <Wallet className="w-6 h-6 mr-3 text-purple-400" />
              2. Import a Test Account
            </CardTitle>
            <CardDescription className="text-slate-400 text-base">
              <p>
                Because this is a private testnet, Sealchain have pre-generated
                20 testing accounts, each loaded with 10,000 test ETH for gas
                fees.
              </p>
              <ol className="list-decimal list-inside space-y-2 mt-4 ml-4">
                <li>
                  Click the <strong>Account Dropdown</strong> on the top-left
                  corner of MetaMask.
                </li>
                <li>
                  Click <strong>Add Wallet</strong> &gt;{" "}
                  <strong>Import an account</strong>.
                </li>
                <li>
                  Copy and paste one of the <strong>Private Keys</strong> from
                  the table below and click <strong>Import</strong>.
                </li>
              </ol>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border border-slate-800">
              <table className="min-w-full text-sm text-left border-collapse">
                <thead className="bg-slate-950 text-slate-300">
                  <tr>
                    <th className="px-4 py-4 border-b border-slate-800">
                      Role
                    </th>
                    <th className="px-4 py-4 border-b border-slate-800">
                      Wallet Address
                    </th>
                    <th className="px-4 py-4 border-b border-slate-800">
                      Private Key (Import)
                    </th>
                  </tr>
                </thead>
                <tbody className="font-mono text-xs text-slate-400 bg-slate-900/30">
                  <tr className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 border-b border-slate-800 font-bold text-indigo-400">
                      Admin #1
                    </td>
                    <td className="px-4 py-3 border-b border-slate-800">
                      0x70997...79C8
                    </td>
                    <td className="px-4 py-3 border-b border-slate-800">
                      0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 border-b border-slate-800 font-bold text-indigo-400">
                      Admin #2
                    </td>
                    <td className="px-4 py-3 border-b border-slate-800">
                      0x3C44C...93BC
                    </td>
                    <td className="px-4 py-3 border-b border-slate-800">
                      0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 border-b border-slate-800 text-slate-300">
                      User 1
                    </td>
                    <td className="px-4 py-3 border-b border-slate-800">
                      0x90F79...b906
                    </td>
                    <td className="px-4 py-3 border-b border-slate-800">
                      0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 border-b border-slate-800 text-slate-300">
                      User 2
                    </td>
                    <td className="px-4 py-3 border-b border-slate-800">
                      0x15d34...6A65
                    </td>
                    <td className="px-4 py-3 border-b border-slate-800">
                      0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Info Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="bg-slate-900/50 border-indigo-500/20 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-xl text-indigo-100">
                Minting & Viewing
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300 space-y-4">
              <p>
                <strong>Admins Only:</strong> Connect as Admin #1 or #2 and
                navigate to the <code>/admin</code> page to issue a new
                blockchain certificate.
              </p>
              <p>
                <strong>Users:</strong> Connect as a standard user and navigate
                to the <code>/user</code> page to verify certificates tied to
                your address.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-purple-500/20 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="flex items-center text-xl text-purple-100">
                <Search className="w-5 h-5 mr-2" />
                Track Transactions
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300 space-y-4">
              <p>
                Because Sealchain operates as an independent network, Sealchain
                utilize a dedicated block explorer to track all live blocks,
                contract deployments, and minting events.
              </p>
              <p>
                To monitor network activity in real-time, visit the public
                explorer dashboard:
              </p>
              <a
                href="https://sealchain-public.tryethernal.com/transactions"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white hover:cursor-pointer">
                  <BookOpen className="w-4 h-4 mr-2" />
                  View Block Explorer
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
