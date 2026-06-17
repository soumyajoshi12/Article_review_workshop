**EasySLR Article Review Workspace**
A specialized, self-contained product slice designed for researchers to manage systematic literature reviews. This workspace allows users to organize within organizations and projects, import research articles via Excel files, and run a streamlined screening workflow using a robust, table-driven interface.

**🛠️ Tech Stack & Architecture**
This project is built using a modern, type-safe full-stack JavaScript architecture:

Framework: Next.js (App Router) with React and TypeScript for unified client-server routing and rendering.

Styling: Tailwind CSS for a clean, highly scannable, and accessible interface.

Database & ORM: PostgreSQL managed through Prisma ORM for type-safe schema modeling and queries.

API Layer: tRPC / Server Actions ensuring end-to-end type safety from the database layer straight to the React components.

Authentication: NextAuth.js (Auth.js) managing session states and scoping user context.

**📖 Product Judgment & Review Workflow**
Instead of a generic CRUD table, this workspace implements a focused Dual-Stage Screening Workflow standard in systematic literature reviews:

Title/Abstract Screening:  Reviewers can quickly flag them as INCLUDE, EXCLUDE, or MAYBE.

Enrichment & Context: Reviewers can attach custom labels (e.g., Methodology Gap, Clinical Trial) and persist structured reviewer notes directly from the workspace view.

Conflict Resolution: If multiple users review an article (or for tracking solo reviews), statuses are tracked dynamically via an ArticleReview junction table to ensure multi-tenant collaboration capabilities.

**📊 Domain Model & Authorization Boundaries**
The data architecture strictly enforces multi-tenant boundary isolation.

Prisma Schema Design
Code snippet
model Organization {
  id        String    @id @default(cuid())
  name      String
  projects  Project[]
  users     User[]
}

model Project {
  id             String    @id @default(cuid())
  name           String
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  articles       Article[]
  users          User[]
}

model Article {
  id              String          @id @default(cuid())
  pmid            String?
  doi             String?
  title           String
  authors         String?
  journal         String?
  publicationYear Int?
  projectId       String
  project         Project         @relation(fields: [projectId], references: [id])
  reviews         ArticleReview[]
  
  @@unique([projectId, pmid], name: "project_pmid_idx") // Scoped duplicate prevention
}

model ArticleReview {
  id        String   @id @default(cuid())
  articleId String
  userId    String
  status    Status   // PENDING, INCLUDE, EXCLUDE, MAYBE
  notes     String?
  article   Article  @relation(fields: [articleId], references: [id])
  user      User     @relation(fields: [userId], references: [id])
}
Server-Side Authorization Boundaries
Security is not merely handled by hiding UI components. Every tRPC/Server Action mutation and query implements a multi-step verification:

The system checks the authenticated session.user.

It verifies that the user belongs to the active Organization.

It explicitly guarantees that the requested projectId belongs to the user's authorized scopes before returning any article payloads or accepting status changes.

**📥 Import Validation & Duplicate Strategy**
The import system processes PubMed-style data structuralized from the provided sample Excel layouts via xlsx.

Validation Rules: Rows lacking a Title are instantly skipped. Invalid formats in Publication Year or identifiers are sanitized or set to null to avoid breaking database constraints.

Duplicate Strategy: Duplicate handling is strictly scoped by Project. An article can exist across different projects, but within the same project, rows sharing an identical PMID or DOI trigger an Upsert / Skip operation (the existing record is preserved or enriched with missing data without creating noisy clutter).

User Feedback: The UI displays a post-import summary modal detailing the exact number of rows successfully processed, rows updated, and rows rejected due to parsing failures.

⚙️ Local Setup Guide
Follow these steps to spin up the local development environment:

1. Clone & Install Dependencies
Bash
git clone url
cd easyslr-review-workspace
npm install
2. Configure Environment Variables
Create a .env file in the root directory:

Code snippet

AUTH_SECRET="332fc611f68ebec4780fb63dc19a12dc3f626a753db9aec378df7db787a47495"
DATABASE_URL="postgresql://neondb_owner:npg_9mvOt6cwuIKf@ep-snowy-resonance-ateuagme-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
AUTH_GOOGLE_ID="803949669296-6l4e7a8u007dkiq4s766o4e6k7p886qo.apps.googleusercontent.com"
AUTH_GOOGLE_SECRET="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"

AUTH_URL=http://localhost:3000
3. Initialize Database
Ensure you have a local PostgreSQL instance running (or use Docker: docker run --name easyslr-db -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres).

Bash
npx prisma migrate dev --name init
npx prisma db seed
4. Run the Development Server
Bash
npm run dev
Open http://localhost:3000 to interact with the application.

**🧠 AI Usage Disclosure & Engineering Tradeoffs**
AI Tool Usage
Tools Used: Claude / Chatgpt

Assisted Parts: Rapid scaffolding of the Tailwind data table structure, generating mock Excel row arrays for unit testing.

Personally Verified: Hand-wrote all Prisma query relations, authorization middleware checks, and the server-side deduplication core login.

AI Correction Example: The AI originally suggested a global unique constraint on PMID for the Article model. I rejected this because systematic reviews require isolated workflows across different projects; instead, I refactored it into a compound index scoped to @@unique([projectId, pmid]).

Tradeoffs & Known Gaps
In-Memory File Parsing: For the scale of this timebox, file parsing occurs in server runtime memory. For production scale with massive 50k+ row exports, this would be refactored to stream files directly into an AWS S3 bucket and parse via an asynchronous background worker (AWS Lambda).

Approximate Time Spent
Total Time: ~10 hours.
