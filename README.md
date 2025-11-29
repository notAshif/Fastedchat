Fasted Chat — Real-Time Chat UI (Next.js + Supabase)

Fasted Chat is a clean and fast real-time chat interface built using Next.js, Supabase, and Tailwind CSS.
It focuses on instant messaging, a minimal UI, and smooth responsiveness across all devices.

🛠️ Tech Stack
<p align="left"> <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" /> <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" /> <img src="https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white" /> <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" /> <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" /> </p>
✨ Features

Real-time messaging powered by Supabase Realtime

Minimal, clean, and modern UI

Smooth responsiveness across all device sizes

Fast rendering with Next.js App Router

Clean and modular component structure

TypeScript for safety and scalability

📂 Project Structure
app/
  ├─ layout.tsx          # Root layout
  ├─ page.tsx            # Main Chat UI
components/
  ├─ Message.tsx         # Individual chat message
  ├─ InputBox.tsx        # Chat input field
lib/
  ├─ supabaseClient.ts   # Supabase configuration
public/
  ├─ assets/             # Icons / images

🔧 Getting Started
1. Clone the repository
git clone https://github.com/your-username/fasted-chat.git
cd fasted-chat

2. Install dependencies
npm install
# or
yarn install
# or
pnpm install

3. Add environment variables

Create a .env.local file in the project root:

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

4. Start the development server
npm run dev


Now open http://localhost:3000
 in your browser.

⚙️ Supabase Setup

Create a new project on https://supabase.com/

Go to Table Editor → Create Table

Add a table named messages with fields:

Column	Type	Default
id	bigint	auto increment
text	text	—
created_at	timestamp	now()
user	text	—

Enable Realtime for the messages table

Copy your project URL + anon key → paste into your .env.local

That's it — messaging should now work live!

📦 Deployment

The project is fully optimized for Vercel.

Steps:

Push your code to GitHub

Import the repo into Vercel

Add your environment variables

Deploy instantly

📚 Additional Resources

https://nextjs.org/docs

https://supabase.com/docs

https://tailwindcss.com/docs

⭐ Feedback / Contributions

Feel free to open issues or submit PRs if you want to improve the project!
