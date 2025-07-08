"use client";

import { createConfig, http } from "wagmi";
import { hardhat } from "wagmi/chains";
import { getDefaultConfig } from "connectkit";

export const config = createConfig(
  getDefaultConfig({
    appName: "Blockchain Certificate System",
    chains: [hardhat],
    transports: {
      [hardhat.id]: http(),
    },
    walletConnectProjectId: "06072025-1b2c-4f3d-8e5a-9f0c1d2e3f4g",
  })
);
