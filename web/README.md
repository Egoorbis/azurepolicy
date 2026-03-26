# CIS Benchmark Web App (Next.js)

Next.js 14 (App Router, TypeScript, Tailwind) portal for uploading CIS Benchmark XLSX files, queueing parse jobs, and displaying assignment/compliance placeholders. Backend operations use Azure Managed Identity (no keys) for Storage Blob/Queue.

## Prerequisites
- Node 20+
- Azure resources from the Terraform in `/tf` (web app, storage account, queue, container).
- Managed Identity with `Storage Blob Data Contributor` and `Storage Queue Data Contributor` on the storage account.

## Setup
1) Copy environment template:
   ```bash
   cp .env.example .env.local
   ```
   Set:
   - `AZURE_STORAGE_ACCOUNT_NAME`
   - `AZURE_STORAGE_ACCOUNT_URL`
   - `AZURE_STORAGE_QUEUE_NAME`
   - `AZURE_STORAGE_CONTAINER_NAME` (defaults to `benchmark-uploads`)
   - Optional: `NEXT_PUBLIC_APP_NAME`

2) Install and run:
   ```bash
   npm install
   npm run dev
   ```
   Open http://localhost:3000.

## API
- `POST /api/upload` (multipart form-data with `file`):
  - Validates XLSX, size <= 25 MB.
  - Uploads to blob container (private).
  - Enqueues parse job message to the storage queue.

## Security defaults
- Managed Identity for Storage (no keys).
- HTTPS-only, TLS 1.2+, FTPS disabled (per Terraform).
- Private uploads container, queue-based processing.
- Input validation: type/size guard for uploads.

## Scripts
- `npm run dev` – local dev
- `npm run lint` – lint
- `npm run build` / `npm run start` – production build/start
