import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const file = formData.get("file") as File;
  const name = formData.get("name")?.toString() || "Untitled";
  const description = formData.get("description")?.toString() || "";
  const issuer = formData.get("issuer")?.toString() || "Unknown";
  const issueDate = formData.get("issueDate")?.toString() || "";
  const expiryDate = formData.get("expiryDate")?.toString() || "";

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const apiKey = process.env.PINATA_API_KEY;
  const apiSecret = process.env.PINATA_API_SECRET;

  try {
    // Upload certificate file
    const cleanFileName = `${name.replace(
      /[^a-zA-Z0-9\s]/g,
      "_"
    )}_certificate.${file.name.split(".").pop()}`;
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileForm = new FormData();
    fileForm.append("file", new Blob([fileBuffer]), cleanFileName);

    const fileRes = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      fileForm,
      {
        headers: {
          pinata_api_key: apiKey,
          pinata_secret_api_key: apiSecret,
        },
      }
    );

    // Calculate hash
    const hashArray = Array.from(
      new Uint8Array(
        await crypto.subtle.digest("SHA-256", await file.arrayBuffer())
      )
    );
    const fileHash = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const fileIpfsHash = fileRes.data.IpfsHash;
    const fileIpfsUri = `ipfs://${fileIpfsHash}`;

    // Create metadata
    const metadata = {
      name,
      description,
      issuer,
      issueDate,
      expiryDate,
      file: fileIpfsUri,
      fileHash: `sha256:${fileHash}`,
      attributes: [
        { trait_type: "Issuer", value: issuer },
        { trait_type: "Issue Date", value: issueDate },
        { trait_type: "Expiry Date", value: expiryDate },
      ],
    };

    const metadataFileName = `${name.replace(
      /[^a-zA-Z0-9\s]/g,
      "_"
    )}_metadata.json`;

    const jsonRes = await axios.post(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      {
        pinataContent: metadata,
        pinataMetadata: {
          name: metadataFileName,
        },
      },
      {
        headers: {
          pinata_api_key: apiKey,
          pinata_secret_api_key: apiSecret,
        },
      }
    );

    const metadataUri = `ipfs://${jsonRes.data.IpfsHash}`;
    return NextResponse.json({ metadataUri, fileHash });
  } catch (err) {
    console.error("Pinata upload error:", err);
    return NextResponse.json(
      { error: "Failed to upload to Pinata" },
      { status: 500 }
    );
  }
}
