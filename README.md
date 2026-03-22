# 🏦 Fandi Bank

Being the "bank" for your friend group shouldn't be a headache. Fandi Bank is a custom full-stack web application designed to track shared expenses, manage IOUs, and streamline payments for my friends and roommates. 

Whenever I cover the cost of food, parties, or household bills, this app keeps everything organized so everyone knows exactly what they owe and exactly how to pay it back.

## ✨ Key Features

* **Role-Based Dashboards:** Separate, tailored views for the Admin (the "Bank") and standard Users (friends).
* **Clear Debt Tracking:** Users can log in to see their total pending debt, along with an itemized history of what they owe and what it was for.
* **Quick Pay Integration:** A seamless, one-click button that copies my *llave de bre-b* to their clipboard so they can jump straight to their banking app and pay.
* **Concert Ticket Benefit:** A built-in request system where friends can ask Fandi Bank to front the cost for presale concert tickets, allowing them to pay it back later.
* **Admin Management:** A central hub where I can manually add, edit, and clear debts, as well as approve or reject incoming ticket requests.

## 🛠️ Tech Stack

* **Frontend:** Next.js, React, Tailwind CSS
* **Backend, Database & Authentication:** Supabase

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
