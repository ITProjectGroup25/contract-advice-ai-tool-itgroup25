# Installation Guide

## 🚀 Quick Start

Follow these steps to get the project running:

### 1. Install Dependencies

```bash
# Install all workspace dependencies
npm install

# Or install frontend dependencies specifically
cd frontend
npm install
```

### 2. Install EmailJS (Optional)

If you want to enable email functionality:

```bash
# In the frontend directory
npm install @emailjs/browser
```

Then uncomment the EmailJS imports in `frontend/src/lib/emailService.ts`:

```typescript
// Change this:
// import emailjs from '@emailjs/browser';

// To this:
import emailjs from '@emailjs/browser';
```

### 3. Environment Configuration

Copy the environment example file:

```bash
# In the frontend directory
cp env.example .env.local
```

Configure your EmailJS settings in `.env.local`:

```env
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key
NEXT_PUBLIC_EMAILJS_GRANT_TEAM_TEMPLATE_ID=grant_team_template_id
```

### 4. Start Development Server

```bash
# From the project root
npm run dev
```

The application will be available at:
- **Main App**: http://localhost:3000
- **Dynamic Form**: http://localhost:3000/dynamic-form
- **Admin Panel**: http://localhost:3000/admin (password: admin123)

## 🔧 Troubleshooting

### Module Not Found Errors

If you see errors like "Module not found: Can't resolve '@emailjs/browser'":

1. Make sure you've run `npm install` in both the root and frontend directories
2. Install EmailJS specifically: `npm install @emailjs/browser`
3. Restart the development server

### TypeScript Errors

The project includes some TypeScript warnings that don't affect functionality:
- `'question.conditional' is possibly 'undefined'` - This is handled safely in the code
- Schema loading warnings - These don't affect the application

### EmailJS Not Working

If emails aren't being sent:
1. Check that EmailJS is properly installed
2. Verify your EmailJS configuration in `.env.local`
3. Check the browser console for EmailJS initialization messages

## 📦 Project Structure

```
contract-advice-ai-tool-itgroup25/
├── frontend/          # Next.js application
├── backend/           # Database and API logic
└── shared/            # Shared types and utilities
```

## 🎯 Available Features

- **Static Form**: Original referral form at `/single-form`
- **Dynamic Form**: Configurable form at `/dynamic-form`
- **Admin Panel**: Form management at `/admin`
- **Email Integration**: Automatic notifications (when configured)

## 🔄 Development Workflow

1. Make changes to the code
2. The development server will automatically reload
3. Test your changes in the browser
4. Use the admin panel to configure forms dynamically

For production deployment, run:

```bash
npm run build
npm run start
```
