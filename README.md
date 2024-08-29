# AcmeSaas

👉👉👉 See live demo at **[acmesaas.vercel.app](https://acmesaas.vercel.app)**.

AcmeSaas is a minimalistic SaaS boilerplate (or starter kit) built 
using Typescript, Next.js, Prisma, Antd, etc. See a full list of used
libraries and tools below.

The goal of the project is to build *minimalistic* template. All dependencies
are optional and can be replaced with your favorite ones.

## The Stack

* [Next.js](https://nextjs.org) with [App Router](https://nextjs.org/docs/routing/introduction) and [Server Components](https://nextjs.org/docs/server-components/introduction) and TypeScript
* [NextAuth.js](https://next-auth.js.org) for Authentication (GitHub and Google)
* [Tailwind CSS](https://tailwindcss.com) for Styling
* [Prisma](https://www.prisma.io) for ORM
* [PostgreSQL](https://www.postgresql.org) (should work with MySQL too)
* [Ant Design](https://ant.design) for UI components.
    * Why Ant Design? Although it's pretty bloated and looks a little bit outdated, it still has the most complete set of components ready to use.
* [Stripe](https://stripe.com) for payments
* [Bun](https://bun.sh) for package management (with monorepo support!)

Other features:

 * Configurable terms of service and privacy policy (use at your own risk, consult a lawyer)

## How to use

```bash
bun install
cp .env.example .env
```

Fill in the `.env` file with your own following the comments in the file. 
The only required variable is `DATABASE_URL`, also one of `GITHUB_OAUTH_*` or `GOOGLE_OAUTH_*` for oauth
should be set

After env variables are set, run the following commands to create the database and seed it with some data:

```bash
bun prism db push
```

To run

```bash 
bun web:dev # for development
bun web:start # for prod
bun web:build # to build
```

# Customization

You can customize the project to your liking

## Colors

TODO

## Branding

TODO

