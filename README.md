# De-Docs

A real-time collaborative text editor built with operational transformation (OT) algorithm, enabling multiple users to simultaneously edit documents with conflict-free synchronization.

## How does it work?

De-Docs implements a sophisticated real-time collaborative editing system using the Operational Transformation (OT) algorithm. Here's a deep dive into the architecture:

### System Architecture

### Core Components

#### Operational Transformation Algorithm

The OT algorithm ensures that concurrent edits from multiple users converge to the same final state without conflicts.

**How Operations Work:**

Every edit is converted to an **Operation** object:

```typescript
{
  type: 'insert' | 'delete' | 'replace',
  start: number,        // position in document
  end: number,
  inserted?: string,    // for insert/replace
  deleted?: string      // for delete/replace
}
```

**The Transformation Process:**

```mermaid
graph LR
    A[User 1 Edits at v5] --> B[Generate Ops]
    B --> C[Send to Server with v5]
    D[User 2 Already Made v6] --> E[Server has v6, v7]
    C --> F{Transform Operations}
    F --> G[Adjust positions based on v6, v7]
    G --> H[Apply at v8]
    H --> I[Broadcast v8 to all]
```

</br>

**Transformation Logic:**

When operations arrive at the server, they reference an old version. The server transforms these operations by:

1. **Finding the version gap**: Locate all operations between the client's version and current version
2. **Calculating offsets**: For each intermediate operation:
   - If it was an `insert` at position X → offset = +length
   - If it was a `delete` at position X → offset = -length
3. **Adjusting positions**: If incoming operation's position >= intermediate operation's position, apply the offset


#### Document Edit Flow

```mermaid
sequenceDiagram
    participant U1 as User 1
    participant C1 as Client 1
    participant S as Server
    participant C2 as Client 2
    participant U2 as User 2
    
    U1->>C1: Types "hello"
    C1->>C1: Calculate Diff (Myers algorithm)
    C1->>C1: Debounce 500ms
    C1->>S: Send Ops + Version 5
    S->>S: Transform Ops (v5 → v8)
    S->>S: Apply to Document
    S->>S: Create Version 8
    S->>C1: Broadcast Ops + Version 8
    S->>C2: Broadcast Ops + Version 8
    C1->>C1: Apply Operations
    C2->>C2: Apply Operations
    C2->>U2: Update Editor
```

**Detailed Flow:**

1. **Change Detection**: 
   - Uses Myers diff algorithm to detect character-level changes
   - Converts changes to operations (insert/delete/replace)
   - Debounces for 500ms to batch rapid edits

2. **Sending Changes**:
   - Sends operations array + current version ID + session ID
   - WebSocket ensures low-latency transmission

3. **Server Processing**:
   - Validates the operations
   - Transforms based on version gap
   - Applies to in-memory document
   - Increments version counter
   - Broadcasts to ALL clients (including sender for confirmation)

4. **Client Reception**:
   - Receives operations + new version
   - Checks if sender is self (skip if local changes)
   - Applies operations to local content
   - Adjusts cursor position if needed


**Key Design Decisions:**

1. **In-Memory Cache**: Active documents are kept in RAM for instant access
2. **Hash-based Change Detection**: Uses blake3 to detect actual changes before syncing
3. **Lazy Persistence**: Only syncs when content actually changes
4. **Graceful Cleanup**: On disconnect, documents are synced then removed from memory if no active sessions


#### Conflict Resolution Example

Let's see how OT resolves conflicts:

**Initial State** (Version 0):
```
"Hello world"
```

**Scenario**:
- User A (at v0): Inserts "beautiful " at position 6
- User B (at v0): Deletes "world" (positions 6-11)

**Traformation**

1. User A's operation arrives first → Version 1
   ```
   "Hello beautiful world"
   ```

2. User B's operation arrives (still references v0)
   - Server detects: User B is at v0, but current is v1
   - Transforms User B's operation:
     - Original: delete at position 6-11
     - v1 inserted 10 chars at position 6
     - Adjusted: delete at position 16-21
   - Applied → Version 2
   ```
   "Hello beautiful "
   ```

3. Both users converge to: `"Hello beautiful "`


## Running Locally

### 1. Clone the Repository

```bash
git clone <repository-url>
cd docs
```

### 2. Backend Setup

#### Install Dependencies

```bash
cd backend
bun install
```

#### Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dedocs"
SHADOW_DATABASE_URL="postgresql://user:password@localhost:5432/dedocs_shadow"

# JWT
JWT_SECRET="your-jwt-secret-key"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_SECRET="your-jwt-refresh-secret-key"
JWT_REFRESH_EXPIRES_IN="30d"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# AWS S3
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="us-east-1"
AWS_BUCKET_NAME="your-bucket-name"

# Server
PORT=3001
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
```

#### Database Setup

```bash
# Generate Prisma client
bunx prisma generate

# Run migrations
bunx prisma migrate deploy
```

#### Start Backend Server

```bash
bun run src/index.ts
```

The backend server will start on `http://localhost:3001`

### 3. Frontend Setup

#### Install Dependencies

```bash
cd frontend
npm install
# or
bun install
```

#### Environment Variables

Create a `.env.local` file in the `frontend` directory:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your-google-client-id"
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_WS_URL="ws://localhost:3001"
```

#### Start Frontend Server

```bash
npm run dev
# or
bun dev
```

The frontend will start on `http://localhost:3000`

## 🐳 Docker Deployment

### Backend Docker Build

```bash
cd backend
docker build -t dedocs-backend .
docker run -p 3001:3000 --env-file .env dedocs-backend
```

## 📁 Project Structure

```
docs/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema
│   │   └── migrations/            # Database migration files
│   ├── src/
│   │   ├── config/                # Configuration files
│   │   ├── controller/            # Route controllers
│   │   │   ├── doc.controller.ts
│   │   │   ├── socket.controller.ts
│   │   │   └── user.controller.ts
│   │   ├── lib/                   # Core libraries
│   │   │   ├── aws.ts             # AWS S3 integration
│   │   │   └── operational-transform.ts  # OT algorithm
│   │   ├── middleware/            # Express middlewares
│   │   ├── routes/                # API routes
│   │   ├── schema/                # Zod validation schemas
│   │   ├── memory/                # In-memory document cache
│   │   └── index.ts               # Application entry point
│   └── Dockerfile
│
└── frontend/
    ├── src/
    │   ├── app/                   # Next.js app directory
    │   │   ├── docs/              # Document editor pages
    │   │   └── page.tsx           # Landing page
    │   ├── components/            # React components
    │   │   ├── editor/            # Editor components
    │   │   ├── home/              # Landing page components
    │   │   └── ui/                # Reusable UI components
    │   ├── hooks/                 # Custom React hooks
    │   │   ├── useCollaborativeEditor.ts
    │   │   ├── useCursors.ts
    │   │   ├── useDocSocket.ts
    │   │   └── useDiffCalculator.ts
    │   ├── lib/                   # Utility libraries
    │   │   ├── api-client.ts
    │   │   ├── operations.ts
    │   │   └── diff-calculator.ts
    │   └── store/                 # Zustand stores
    └── next.config.ts
```



### Running Database Migrations

```bash
cd backend
bunx prisma migrate dev --name migration_name
```

### Viewing Database

```bash
bunx prisma studio
```

### Generating Prisma Client

```bash
bunx prisma generate
```

### Frontend Build

```bash
cd frontend
npm run build
npm start
```
