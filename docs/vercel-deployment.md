# Deploying FormulAi to Vercel

This guide will help you deploy FormulAi to Vercel and set up all necessary environment variables.

## Prerequisites

1. A Vercel account
2. An OpenAI API key
3. Google OAuth credentials (Client ID and Secret)

## Deployment Steps

### 1. Fork or Clone the Repository

Fork or clone the FormulAi repository to your GitHub account.

### 2. Create a New Vercel Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." > "Project"
3. Import your GitHub repository
4. Configure project settings as needed
5. Click "Deploy"

### 3. Set Up Environment Variables

After the initial deployment (which might fail due to missing environment variables), you need to set up the following environment variables in your Vercel project settings:

1. Go to your project in Vercel Dashboard
2. Click on "Settings" > "Environment Variables"
3. Add the following variables:

#### Required Environment Variables

| Name | Description | Example |
|------|-------------|---------|
| `OPENAI_API_KEY` | Your OpenAI API key | `sk-...` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | `123456789-abcdefg.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | `GOCSPX-...` |
| `NEXTAUTH_SECRET` | A secret for NextAuth (can be any random string) | `your-random-secret-key` |
| `NEXTAUTH_URL` | Your production URL | `https://getformulai.com` |

#### Optional Environment Variables

| Name | Description | Default |
|------|-------------|---------|
| `NEXT_PUBLIC_APP_URL` | Your production URL | `https://getformulai.com` |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics ID | - |
| `NEXT_PUBLIC_ENABLE_ANALYTICS` | Enable analytics | `false` |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN | - |
| `NEXT_PUBLIC_ENABLE_SENTRY` | Enable Sentry | `false` |
| `NEXT_PUBLIC_APP_VERSION` | App version | `0.1.0` |

### 4. Redeploy the Project

After setting up all the environment variables:

1. Go to the "Deployments" section
2. Find your latest deployment
3. Click on the three dots menu (...)
4. Select "Redeploy"

## Domain Setup

1. Go to "Settings" > "Domains"
2. Add your custom domain (e.g., `getformulai.com`)
3. Follow the DNS configuration instructions

## Troubleshooting

### OpenAI API Key Issues

If you encounter errors related to the OpenAI API:

1. Check that your API key is correct and not expired
2. Ensure you have sufficient credit in your OpenAI account
3. Verify the API key has permission for the models you're using (e.g., GPT-4)

### Google OAuth Issues

If you have problems with Google authentication:

1. Verify your Google OAuth credentials
2. Make sure you've added the correct redirect URI in the Google Cloud Console:
   - `https://getformulai.com/api/auth/callback/google`
3. Ensure you've enabled the necessary Google APIs:
   - Google Sheets API
   - Google Drive API
   - Google OAuth2 API

## Getting Help

If you encounter any other issues, check the [GitHub repository](https://github.com/KeldrickD/FormulAi) for more information or open an issue for assistance. 