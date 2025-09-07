# Contract Advice Assistant - Prototype

A demonstration prototype of an AI-powered contract advice tool developed for COMP30022 IT Project at the University of Melbourne.

## Overview

This prototype demonstrates the core functionality of a contract advice system designed to streamline internal support requests and reduce unnecessary referrals through intelligent information capture and routing.

## Demo Features

### Dynamic Form System
- Configurable question sets with conditional logic
- Form validation and mandatory field enforcement
- Simple vs Complex query routing

### User Interface Components
- Responsive form rendering based on question configuration
- Interactive chatbot interface for simple queries
- Success page with submission confirmation

### Administrative Interface
- Question management system (UI demonstration)
- Form structure configuration
- Export functionality (frontend only)

## Technical Implementation

- **Frontend**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 6.3.5
- **UI Framework**: Radix UI components with Tailwind CSS
- **Form Handling**: React Hook Form
- **State Management**: React hooks

## Local Development

```bash
npm install
npm run dev
```

Access the application at `http://localhost:3000`

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Base UI components
│   ├── AdminInterface.tsx
│   ├── ChatBot.tsx
│   └── DynamicFormRenderer.tsx
├── data/               # Configuration data
└── App.tsx            # Main application
```

## Note

This is a demonstration prototype. Backend integration and data persistence are not implemented in this version.

