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
                19 testing accounts, each loaded with 10,000 test ETH for gas
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
                  <tr className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 border-b border-slate-800 text-slate-300">
                      User 3
                    </td>
                    <td className="px-4 py-3 border-b border-slate-800">
                      0x99655...A4dc
                    </td>
                    <td className="px-4 py-3 border-b border-slate-800">
                      0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 border-b border-slate-800 text-slate-300">
                      User 4
                    </td>
                    <td className="px-4 py-3 border-b border-slate-800">
                      0x976EA...0aa9
                    </td>
                    <td className="px-4 py-3 border-b border-slate-800">
                      0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 border-b border-slate-800 text-slate-300">
                      User 5
                    </td>
                    <td className="px-4 py-3 border-b border-slate-800">
                      0x14dC7...9955
                    </td>
                    <td className="px-4 py-3 border-b border-slate-800">
                      0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 border-b border-slate-800 text-slate-300">
                      User 6
                    </td>
                    <td className="px-4 py-3 border-b border-slate-800">
                      0x23618...1E8f
                    </td>
                    <td className="px-4 py-3 border-b border-slate-800">
                      0xdbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 border-b border-slate-800 text-slate-300">
                      User 7
                    </td>
                    <td className="px-4 py-3 border-b border-slate-800">
                      0xa0Ee7...9720
                    </td>
                    <td className="px-4 py-3 border-b border-slate-800">
                      0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 border-b border-slate-800 text-slate-300">
                      User 8
                    </td>
                    <td className="px-4 py-3 border-b border-slate-800">
                      0xBcd40...4096
                    </td>
                    <td className="px-4 py-3 border-b border-slate-800">
                      0xf214f2b2cd398c806f84e317254e0f0b801d0643303237d97a22a48e01628897
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 border-b border-slate-800 text-slate-300">
                      User 9
                    </td>
                    <td className="px-4 py-3 border-b border-slate-800">
                      0x71bE6...5788
                    </td>
                    <td className="px-4 py-3 border-b border-slate-800">
                      0x701b615bbdfb9de65240bc28bd21bbc0d996645a3dd57e7b12bc2bdf6f192c82
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 border-b border-slate-800 text-slate-300">
                      User 10
                    </td>
                    <td className="px-4 py-3 border-b border-slate-800">
                      0xFABB0...694a
                    </td>
                    <td className="px-4 py-3 border-b border-slate-800">
                      0xa267530f49f8280200edf313ee7af6b827f2a8bce2897751d06a843f644967b1
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 border-b border-slate-800 text-slate-300">
                      User 11
                    </td>
                    <td className="px-4 py-3 border-b border-slate-800">
                      0x1CBd3...C9Ec
                    </td>
                    <td className="px-4 py-3 border-b border-slate-800">
                      0x47c99abed3324a2707c28affff1267e45918ec8c3f20b8aa892e8b065d2942dd
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 border-b border-slate-800 text-slate-300">
                      User 12
                    </td>
                    <td className="px-4 py-3 border-b border-slate-800">
                      0xdF3e1...7097
                    </td>
                    <td className="px-4 py-3 border-b border-slate-800">
                      0xc526ee95bf44d8fc405a158bb884d9d1238d99f0612e9f33d006bb0789009aaa
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 border-b border-slate-800 text-slate-300">
                      User 13
                    </td>
                    <td className="px-4 py-3 border-b border-slate-800">
                      0xcd3B7...ce71
                    </td>
                    <td className="px-4 py-3 border-b border-slate-800">
                      0x8166f546bab6da521a8369cab06c5d2b9e46670292d85c875ee9ec20e84ffb61
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 border-b border-slate-800 text-slate-300">
                      User 14
                    </td>
                    <td className="px-4 py-3 border-b border-slate-800">
                      0x2546B...Ec30
                    </td>
                    <td className="px-4 py-3 border-b border-slate-800">
                      0xea6c44ac03bff858b476bba40716402b03e41b8e97e276d1baec7c37d42484a0
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 border-b border-slate-800 text-slate-300">
                      User 15
                    </td>
                    <td className="px-4 py-3 border-b border-slate-800">
                      0xbDA57...197E
                    </td>
                    <td className="px-4 py-3 border-b border-slate-800">
                      0x689af8efa8c651a91ad287602527f3af2fe9f6501a7ac4b061667b5a93e037fd
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 border-b border-slate-800 text-slate-300">
                      User 16
                    </td>
                    <td className="px-4 py-3 border-b border-slate-800">
                      0xdD2FD...44C0
                    </td>
                    <td className="px-4 py-3 border-b border-slate-800">
                      0xde9be858da4a475276426320d5e9262ecfc3ba460bfac56360bfa6c4c28b4ee0
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 border-b border-slate-800 text-slate-300">
                      User 17
                    </td>
                    <td className="px-4 py-3 border-b border-slate-800">
                      0x8626f...1199
                    </td>
                    <td className="px-4 py-3 border-b border-slate-800">
                      0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e
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
