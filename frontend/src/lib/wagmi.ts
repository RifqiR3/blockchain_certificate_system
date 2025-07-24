"use client";

import { createConfig, http } from "wagmi";
import { hardhat } from "wagmi/chains";
import { getDefaultConfig } from "connectkit";

export const config = createConfig(
  getDefaultConfig({
    appName: "Blockchain Certificate System",
    chains: [hardhat],
    ssr: false,
    transports: {
      [hardhat.id]: http("http://127.0.0.1:8545"),
    },
    walletConnectProjectId:
      process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ?? "",
  })
);
