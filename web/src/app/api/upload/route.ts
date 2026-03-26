import { DefaultAzureCredential } from "@azure/identity";
import { BlobServiceClient } from "@azure/storage-blob";
import { QueueClient } from "@azure/storage-queue";
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

const MAX_BYTES = 25 * 1024 * 1024;
const FALLBACK_CONTAINER = "benchmark-uploads";

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }

    if (file.size === 0) {
      return NextResponse.json({ error: "file is empty" }, { status: 400 });
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "file too large; must be under 25 MB" },
        { status: 413 },
      );
    }

    const storageAccountUrl = getEnv("AZURE_STORAGE_ACCOUNT_URL");
    const storageAccountName = getEnv("AZURE_STORAGE_ACCOUNT_NAME");
    const queueName = getEnv("AZURE_STORAGE_QUEUE_NAME");
    const containerName =
      process.env.AZURE_STORAGE_CONTAINER_NAME || FALLBACK_CONTAINER;

    const credential = new DefaultAzureCredential();
    const blobServiceClient = new BlobServiceClient(storageAccountUrl, credential);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    await containerClient.createIfNotExists();

    const blobName = `${Date.now()}-${randomUUID()}.xlsx`;
    const contentType =
      file.type ||
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    const buffer = Buffer.from(await file.arrayBuffer());
    await containerClient.getBlockBlobClient(blobName).uploadData(buffer, {
      blobHTTPHeaders: { blobContentType: contentType },
    });

    const queueUrl = `https://${storageAccountName}.queue.core.windows.net/${queueName}`;
    const queueClient = new QueueClient(queueUrl, credential);
    await queueClient.createIfNotExists();

    const messageBody = {
      blobName,
      containerName,
      originalFileName: file.name,
      uploadedAt: new Date().toISOString(),
    };
    await queueClient.sendMessage(
      Buffer.from(JSON.stringify(messageBody)).toString("base64"),
    );

    return NextResponse.json({
      blobName,
      containerName,
      queued: true,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Upload failed unexpectedly";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
