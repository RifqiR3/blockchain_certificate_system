"use client";

import { createConfig, http } from "wagmi";
import { hardhat } from "wagmi/chains";
import { getDefaultConfig } from "connectkit";

export const config = createConfig(
  getDefaultConfig({
    appName: "Blockchain Certificate System",
    chains: [hardhat],
    transports: {
      [hardhat.id]: http("http://127.0.0.1:8545"), // Explicitly specify Hardhat RPC URL
    },
    walletConnectProjectId: "06072025-1b2c-4f3d-8e5a-9f0c1d2e3f4g",
  })
);
