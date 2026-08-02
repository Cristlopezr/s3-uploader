# ☁️ S3 File Uploader (Monorepo)

A production-ready, event-driven file uploading web application built with a modern **pnpm monorepo** architecture. 

It features direct-to-S3 file uploads using AWS S3 Presigned URLs, backend status tracking with NestJS & MongoDB, serverless file validation with AWS Lambda triggered by S3 `ObjectCreated` events, automated infrastructure provisioned with AWS CDK, and an interactive React frontend with real-time status polling.

---

## 🚀 Key Features

- **Direct-to-S3 Uploads**: Files upload directly from the browser to AWS S3 using S3 Presigned URLs, avoiding backend server bottlenecks.
- **Event-Driven Validation**: Upon upload completion, AWS S3 triggers an AWS Lambda function that validates:
  - **File Size**: Rejects files exceeding 10 MB limit (`MAX_SIZE_EXCEEDED`).
  - **File MIME/Type Verification**: Reads magic numbers / binary header bytes to verify actual file signatures (`INVALID_FILE_TYPE`).
  - Automatically deletes invalid or oversized files from the S3 bucket.
- **Real-Time Status Tracking**: Upload records are tracked in MongoDB with status states: `PENDING` ➔ `ACTIVE` or `FAILED`.
- **Secure Download/View**: Provides temporary presigned GET URLs for viewing or downloading active files.
- **Unified Monorepo Architecture**: Clean separation of concerns across frontend, backend, and infrastructure stacks using `pnpm` workspaces.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend App** (`apps/web`) | React 19, Vite, TailwindCSS v4, Lucide Icons, TypeScript |
| **Backend API** (`apps/api`) | NestJS, Mongoose (MongoDB), AWS SDK v3, Joi, Class Validator |
| **Infrastructure** (`infra/cdk`) | AWS CDK (TypeScript), AWS S3, AWS Lambda (Node.js 24 runtime) |
| **Database** | MongoDB 8.3 (Dockerized locally) |
| **Package Manager** | `pnpm` v11 (Monorepo Workspaces) |

---

## 📁 Repository Structure

```text
s3-file-upload/
├── apps/
│   ├── api/             # NestJS Backend API service
│   │   ├── src/
│   │   │   ├── storage/ # Storage controller, service, DTOs & Mongoose schema
│   │   │   └── config/  # Joi environment validation schema
│   │   ├── .env.example # Environment variable template for API
│   │   └── package.json
│   │
│   └── web/             # React + Vite Frontend application
│       ├── src/
│       │   ├── components/ # UploadZone, FileList, Navbar components
│       │   └── types/      # Frontend TypeScript interfaces
│       ├── .env.example    # Environment variable template for Web
│       └── package.json
│
├── infra/
│   └── cdk/             # AWS CDK Infrastructure code
│       ├── src/
│       │   ├── infra/   # CDK StorageStack (S3 Bucket & Lambda trigger)
│       │   └── lambdas/ # validate-file Lambda function code
│       ├── .env.example # Environment variable template for CDK
│       └── package.json
│
├── docker-compose.yml   # Docker setup for local MongoDB database
├── package.json         # Monorepo root configuration & scripts
└── pnpm-workspace.yaml  # Workspace definitions
```

---

## 🔄 How It Works (Architecture Flow)

1. **Upload Initiation**: The React client (`apps/web`) sends a `POST /api/storage/files/upload-url` request with file metadata (`fileName`, `size`, `contentType`).
2. **Pending Record & Presigned URL**: NestJS (`apps/api`) creates a record in MongoDB with `status: PENDING` and requests an AWS S3 presigned `PUT` URL.
3. **Direct S3 Upload**: The frontend uploads the file directly to the AWS S3 Bucket via the presigned URL.
4. **S3 Event Trigger**: Uploading to S3 fires an `ObjectCreated` event notification that invokes an AWS Lambda function (`validate-file`).
5. **Serverless Validation**: The Lambda function checks:
   - **File Size**: Ensures the file is $\le$ 10 MB.
   - **Magic Numbers**: Reads the first 512 bytes to inspect binary headers and verify authentic file type signatures.
6. **Status Update & Cleanup**:
   - **If Valid**: Lambda updates the database record status to `ACTIVE`.
   - **If Invalid**: Lambda sets the status to `FAILED` (with `failedReason`) and deletes the invalid object from S3.
7. **Client Polling**: The React frontend polls `GET /api/storage/files/:id` until status updates to `ACTIVE` or `FAILED`.

---


## 📋 Prerequisites

Before running the project locally, ensure you have installed:

- **Node.js**: `v20.x` or higher
- **pnpm**: `v11.x` (`npm install -g pnpm`)
- **Docker** & **Docker Desktop**: Running for local MongoDB database
- **AWS CLI** & **AWS Credentials**: Configured (`aws configure`) with access to S3 and CDK deployment permissions if deploying to AWS.

---

## ⚙️ Step-by-Step Setup Guide

### 1. Clone the Repository & Install Dependencies

```bash
git clone https://github.com/Cristlopezr/s3-uploader
cd s3-file-upload
pnpm install
```

---

### 2. Environment Variables Configuration

Copy `.env.example` to `.env` in all three packages (`apps/api`, `apps/web`, and `infra/cdk`).

#### A. Backend API (`apps/api/.env`)
```bash
cp apps/api/.env.example apps/api/.env
```
Fill in your environment variables:
```env
PORT=3000
BUCKET_REGION=us-east-1
BUCKET_NAME=your-aws-s3-bucket-name
FILE_KEY_BASE=uploads
PRESIGNED_URL_EXPIRES_IN=300
MONGO_URI=mongodb://root:123456@localhost:27017/s3_uploader_db?authSource=admin
ALLOWED_ORIGINS=http://localhost:5173
```
*Note: Make sure your environment has valid AWS credentials (`AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`) or local AWS profile configured.*

#### B. Frontend Web (`apps/web/.env`)
```bash
cp apps/web/.env.example apps/web/.env
```
```env
VITE_BACKEND_URL=http://localhost:3000
```

#### C. CDK Infrastructure (`infra/cdk/.env`)
```bash
cp infra/cdk/.env.example infra/cdk/.env
```
```env
DB_URL=mongodb://root:123456@localhost:27017/s3_uploader_db?authSource=admin
STAGE=dev
BUCKET_ALLOWED_ORIGINGS=http://localhost:5173
DB_NAME=s3_uploader_db
```

---

### 3. Start Local Database (MongoDB)

Launch the MongoDB database container using Docker Compose:

```bash
docker compose up -d
```

This will run MongoDB on port `27017` with root credentials (`root` / `123456`).

---

### 4. Deploy Infrastructure (AWS CDK)

If you are setting up AWS resources (S3 Bucket & Validation Lambda), deploy using CDK:

```bash
# Synthesize CloudFormation template
pnpm infra:synth

# Deploy resources to your AWS Account
pnpm infra:deploy
```

---

### 5. Run the Application locally

Start both the backend API and frontend React app in parallel mode:

```bash
pnpm dev
```

The services will be available at:
- 🌐 **Frontend (Web App)**: [http://localhost:5173](http://localhost:5173)
- ⚙️ **Backend API**: [http://localhost:3000](http://localhost:3000)

---

## 🔌 API Endpoints Reference

Base URL: `http://localhost:3000/api`

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/storage/files/upload-url` | Requests a presigned S3 upload URL and creates a `PENDING` file record |
| `GET` | `/storage/files` | Retrieves all active uploaded files (`status: ACTIVE`) |
| `GET` | `/storage/files/:id` | Retrieves single file metadata (used for status polling) |
| `GET` | `/storage/files/:id/download-url` | Generates a temporary presigned download/view URL for an active file |

---

## 📜 Monorepo Scripts Reference

Run these scripts from the monorepo root:

| Command | Action |
| :--- | :--- |
| `pnpm dev` | Starts all apps in parallel development mode |
| `pnpm build` | Builds all apps and workspace packages |
| `pnpm lint` | Runs linter across all projects |
| `pnpm infra:synth` | Synthesizes AWS CDK stack |
| `pnpm infra:deploy` | Deploys CDK stack to AWS |
| `pnpm infra:diff` | Displays CloudFormation diff for CDK stack |
| `pnpm infra:destroy` | Destroys deployed AWS resources |

---