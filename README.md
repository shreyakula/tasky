# tasky♥
### *the calendar that thinks ahead*

🌐 **Live Demo:** [taskycal.vercel.app](https://taskycal.vercel.app)

<img width="1024" height="1024" alt="tasky" src="https://github.com/user-attachments/assets/a3e8ccf9-2218-48f7-9d04-d0c261ad8436" />


---

## Overview

**tasky** is a full-stack AI-powered calendar application built with React. It combines a beautifully animated, dreamy UI with real productivity features — letting users manage their week through natural conversation with an AI assistant.

---

## Features

**AI Chatbot Assistant**
- Understands natural language commands like *"add gym tomorrow at 7am"* or *"am I free Friday at 3pm?"*
- Can add, update, and delete calendar events through conversation
- Powered by Groq (LLaMA 3.3 70B)

**Calendar**
- Full 24-hour weekly view with smooth vertical scrolling
- Click any time slot to add an event with title, date range, time, category, location, and link
- Events persist across sessions via Supabase

**Authentication**
- Secure email and password sign up and login via Supabase Auth
- Each user's events are private and protected with row-level security

**Design**
- Dreamy animated pastel sky background with floating dandelion seeds and glowing particles
- Kawaii sun and moon mascots that peek from behind the calendar
- Dark mode with a deep navy night sky, gold stars, and glowing mushrooms
- Fully responsive glassmorphism UI

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite |
| Styling | Custom CSS, Glassmorphism, Canvas API |
| Auth + Database | Supabase |
| AI | Groq API (LLaMA 3.3 70B) |
| Animations | HTML5 Canvas, CSS animations |
| Deployment | Vercel |

---

## Running Locally

```bash
git clone https://github.com/shreyakula/tasky.git
cd tasky
npm install
```

Create a `.env` file in the root:
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GROQ_API_KEY=your_groq_api_key

```bash
npm run dev
```

---

## Database Setup

Run this in Supabase SQL Editor:

```sql
create table events (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  event_key text not null,
  title text not null,
  start_date text,
  end_date text,
  start_time text,
  end_time text,
  location text,
  link text,
  color text,
  category text,
  created_at timestamp default now()
);

alter table events enable row level security;

create policy "Users can only access their own events"
on events for all
using (auth.uid() = user_id);

alter table events add constraint events_user_event_unique unique (user_id, event_key);
```

---

## What I Learned

- Building a full-stack app from scratch with React and Supabase
- Implementing secure user authentication with row-level security
- Integrating AI APIs to create a natural language calendar assistant
- Creating complex canvas-based animations and particle systems
- Deploying a production app with environment variable management

---

*Built with love by Shreya* 🌸
