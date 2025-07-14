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
    // 1. Upload certificate file
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileForm = new FormData();
    fileForm.append("file", new Blob([fileBuffer]), file.name);

    const fileRes = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      fileForm,
      {
        headers: {
          // Do not manually set Content-Type; let axios and FormData handle it
          pinata_api_key: apiKey,
          pinata_secret_api_key: apiSecret,
        },
      }
    );

    const fileHash = fileRes.data.IpfsHash;
    const fileIpfsUri = `ipfs://${fileHash}`;

    // 2. Create metadata
    const metadata = {
      name,
      description,
      issuer,
      issueDate,
      expiryDate,
      file: fileIpfsUri,
      attributes: [
        { trait_type: "Issuer", value: issuer },
        { trait_type: "Issue Date", value: issueDate },
        { trait_type: "Expiry Date", value: expiryDate },
      ],
    };

    const jsonRes = await axios.post(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      metadata,
      {
        headers: {
          pinata_api_key: apiKey,
          pinata_secret_api_key: apiSecret,
        },
      }
    );

    const metadataUri = `ipfs://${jsonRes.data.IpfsHash}`;
    return NextResponse.json({ metadataUri });
  } catch (err) {
    console.error("Pinata upload error:", err);
    return NextResponse.json(
      { error: "Failed to upload to Pinata" },
      { status: 500 }
    );
  }
}
