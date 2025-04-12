# FormulAi: AI-Powered Spreadsheet Assistant

FormulAi is a web application that allows users to interact with spreadsheets using natural language. The app connects to Google Sheets and uses AI to interpret user requests, generate formulas, create charts, and more.

**Official Website**: [getformulai.com](https://getformulai.com)

## Features

- **Google Sheets Integration**: Connect to your Google Sheets account via OAuth
- **Natural Language Processing**: Ask questions about your data in plain English
- **AI-Powered Analysis**: Generate formulas, charts, and insights automatically
- **Preview Changes**: See what will happen before applying changes to your spreadsheet
- **History & Undo**: Keep track of your queries and revert changes if needed
- **File Upload**: Support for uploading CSV and Excel files (coming soon)

## Tech Stack

- **Frontend**: React, Next.js, TailwindCSS, DaisyUI
- **Backend**: Next.js API Routes
- **Authentication**: NextAuth.js with Google OAuth
- **AI**: OpenAI API
- **APIs**: Google Sheets API

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- OpenAI API key
- Google Cloud Platform account with the Sheets API enabled

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/KeldrickD/formulai.git
   cd formulai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.local.example` to `.env.local`
   - Fill in the required API keys and configuration

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. Sign in with your Google account
2. Select a Google Sheet or upload a file
3. Type a natural language query such as:
   - "Show me monthly revenue trends"
   - "Calculate the average sales by product category"
   - "Create a pie chart of top 10 customers"
4. Review the AI-generated result and approve to apply changes

## Deployment

The application is deployed at [getformulai.com](https://getformulai.com).

## Project Structure

```
src/
├── app/               # Next.js App Router 
│   ├── api/           # API Routes
│   ├── auth/          # Authentication pages
│   ├── dashboard/     # Main application
│   └── page.tsx       # Landing page
├── components/        # Reusable components
├── hooks/             # Custom React hooks
├── lib/               # Utility functions
│   ├── auth/          # Authentication helpers
│   └── utils/         # General utilities
└── types/             # TypeScript type definitions
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
