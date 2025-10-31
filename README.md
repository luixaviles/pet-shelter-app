<div align="center">
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Angular](https://img.shields.io/badge/Angular-DD0031?style=flat&logo=angular&logoColor=white)](https://angular.io/)
  [![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
  [![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat&logo=firebase&logoColor=black)](https://firebase.google.com/)
  [![Chrome](https://img.shields.io/badge/Chrome-4285F4?style=flat&logo=googlechrome&logoColor=white)](https://www.google.com/chrome/)
</div>

# Pet Shelter App

A full-stack web application for managing and showcasing adoptable pets at animal shelters. Built with Angular and Express.js, featuring AI-powered assistance for pet profile creation using Chrome's native AI APIs: Prompt API, Writer API, Proofreader API, and Translator API.

## Overview

The Pet Shelter App provides a modern, user-friendly platform for shelters to display their available pets. The application enables staff to easily add new pets with photos, automatically extract information from images using AI, and create compelling adoption descriptions. Potential adopters can browse through listings and view detailed information about each pet.

## Features

- **Pet Listings**: Browse all available pets in an intuitive grid layout
- **Pet Details**: View comprehensive information about individual pets including photos, breed, age, location, and adoption details
- **Add New Pets**: Create new pet profiles with image uploads
- **AI-Powered Image Analysis (Prompt API)**: Automatically extract pet information from uploaded images using multimodal input (image + text) with Chrome's [Prompt API](https://developer.chrome.com/docs/ai/prompt-api)
- **AI-Assisted Writing (Writer API)**: Generate creative and compelling pet descriptions using Chrome's [Writer API](https://developer.chrome.com/docs/ai/writer-api)
- **Grammar & Spelling Correction (Proofreader API)**: Review and correct errors in grammar, spelling, and punctuation using Chrome's [Proofreader API](https://developer.chrome.com/docs/ai/proofreader-api)
- **Multilingual Support (Translator API)**: Translate pet descriptions in the browser using Chrome's [Translator API](https://developer.chrome.com/docs/ai/translator-api) (supports English, Spanish, French)
- **Responsive Design**: Fully responsive UI built with Tailwind CSS

## Technology Stack

### Frontend
- **Angular** 20.0.0 - Modern web framework
- **Tailwind CSS** 3.4.18 - Utility-first CSS framework
- **TypeScript** 5.8.2 - Type-safe JavaScript
- **RxJS** 7.8.1 - Reactive programming

### Backend
- **Node.js** 22.20.0+ - JavaScript runtime
- **Express.js** 4.18.2 - Web application framework
- **TypeScript** 5.3.3 - Type-safe JavaScript
- **Firebase Admin SDK** 13.5.0 - Backend Firebase services
- **Multer** 2.0.2 - File upload handling

### Infrastructure
- **Firebase Storage** - Image hosting and storage
- **Firebase Hosting** - Frontend deployment
- **Google Cloud Run** - Backend API deployment
- **Docker** - Containerization

## Project Structure

```
pet-shelter-app/
├── client/                    # Angular frontend application
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/    # Angular components
│   │   │   ├── services/      # Frontend services
│   │   │   ├── models/        # TypeScript models
│   │   │   └── pipes/         # Custom pipes
│   │   ├── assets/            # Static assets
│   │   └── environments/      # Environment configurations
│   ├── angular.json           # Angular configuration
│   ├── tailwind.config.js     # Tailwind CSS configuration
│   └── package.json           # Frontend dependencies
├── server/                    # Express backend API
    ├── src/
    │   ├── config/            # Configuration files
    │   ├── controllers/       # Request handlers
    │   ├── middleware/        # Express middleware
    │   ├── models/            # Data models
    │   ├── routes/            # API routes
    │   ├── services/          # Business logic
    │   └── server.ts          # Application entry point
    ├── data/                  # JSON data storage
    ├── Dockerfile             # Docker configuration
    └── package.json           # Backend dependencies
```

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 22.20.0 or higher ([Download](https://nodejs.org/))
- **npm** (comes with Node.js) or compatible package manager
- **Firebase project** with Storage bucket configured
- **Google Cloud account** (for server deployment)
- **Chrome browser** with built-in AI APIs enabled:
  - [Prompt API](https://developer.chrome.com/docs/ai/prompt-api) (for image analysis)
  - [Writer API](https://developer.chrome.com/docs/ai/writer-api) (for description generation)
  - [Proofreader API](https://developer.chrome.com/docs/ai/proofreader-api) (for grammar correction)
  - [Translator API](https://developer.chrome.com/docs/ai/translator-api) (for multilingual support)
- **Hardware Requirements** (for AI features):
  - **Operating System**: Windows 10/11, macOS 13+ (Ventura), Linux, or ChromeOS (on Chromebook Plus)
  - **Storage**: At least 22 GB of free space for AI models
  - **GPU**: More than 4 GB VRAM, or
  - **CPU**: 16 GB RAM and 4+ CPU cores
  - **Network**: Internet connection for initial model downloads

## Installation & Setup

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Set up Firebase service account:
   - Create a Firebase project and enable Storage
   - Download the service account JSON file
   - Place it in the `server` directory as `serviceAccount.json`

4. Create a `.env` file in the `server` directory (or set environment variables):
```env
GOOGLE_APPLICATION_CREDENTIALS=serviceAccount.json
FIREBASE_STORAGE_BUCKET=your-firebase-storage-bucket.appspot.com
PORT=3000
NODE_ENV=development
```

5. Build the TypeScript code:
```bash
npm run build
```

6. Start the server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will run on `http://localhost:3000` by default.

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Configure the API endpoint in environment files:
   - Development: `src/environments/environment.development.ts`
   - Production: `src/environments/environment.production.ts`

   Update the `apiUrl` to match your backend server:
```typescript
export const environment = {
  apiUrl: 'http://localhost:3000/api', // Development
  // apiUrl: 'https://your-api-url.com/api', // Production
};
```

4. Start the development server:
```bash
npm start
```

The application will open at `http://localhost:4200` and automatically reload when you make changes.

5. Build for production:
```bash
npm run build
```

The production build will be in `dist/demo/browser`.

## AI Features

The Pet Shelter App leverages Chrome's built-in AI APIs powered by Gemini Nano to provide intelligent assistance throughout the pet profile creation and viewing experience. All AI features run entirely client-side, ensuring privacy and offline capability after initial model downloads.

### Prompt API - Multimodal Image Analysis

The application uses Chrome's [Prompt API](https://developer.chrome.com/docs/ai/prompt-api) with **multimodal capabilities** to analyze uploaded pet images. This API accepts both an image and a text prompt as input, enabling precise image understanding.

**Usage in the Application:**
- Used in the "Add Pet" form to automatically extract information from uploaded pet photos
- Combines the uploaded image with a text prompt to analyze the pet's characteristics

**Extracted Information:**
- Animal type (cat or dog)
- Breed identification
- Gender detection
- Age estimation (years and months)
- Suggested name
- Descriptive text about the pet

**Implementation Details:**
- Sends multimodal prompt containing both text instructions and the image element
- Returns structured JSON with all extracted information for auto-filling form fields
- Gracefully handles cases where the API is unavailable

### Writer API - Creative Description Generation

Chrome's [Writer API](https://developer.chrome.com/docs/ai/writer-api) is used to enhance pet descriptions, making them more compelling and engaging for potential adopters.

**Usage in the Application:**
- Improves existing pet descriptions entered by shelter staff
- Generates warm, vivid, and persuasive descriptions suitable for pet shelter listings
- Used before submitting the pet profile to ensure maximum appeal

**Features:**
- **Tone**: Friendly-neutral tone optimized for adoption listings
- **Format**: Plain text output
- **Length**: Medium length (2-4 sentences)
- **Streaming**: Uses streaming capabilities for responsive user experience
- **Context-aware**: Can incorporate additional context about the pet

**Implementation Details:**
- Checks API availability before use
- Uses streaming API for real-time text generation
- Handles model download progress tracking
- Falls back gracefully when the API is unavailable

**Location:** Used in `AddPetComponent` via `WriterAssistService`

### Proofreader API - Grammar & Spelling Correction

Chrome's [Proofreader API](https://developer.chrome.com/docs/ai/proofreader-api) corrects errors in grammar, spelling, and punctuation in pet descriptions.

**Usage in the Application:**
- Used when creating or editing pet descriptions
- Provides real-time correction suggestions
- Labels corrections by error type (grammar, spelling, punctuation)
- Explains corrections in plain language

**Features:**
- **Correction**: Automatically corrects user input
- **Labeling**: Categorizes errors by type
- **Explanation**: Provides context for corrections
- **Progress Tracking**: Monitors model download progress with visual feedback

**Implementation Details:**
- Checks availability before attempting proofreading
- Supports English language input (`expectedInputLanguages: ['en']`)
- Caches proofreader instances for performance
- Handles downloadable models with progress monitoring
- Returns corrected text ready for use

**Location:** Used in `AddPetComponent` via `ProofreaderService`

### Translator API - Multilingual Description Support

Chrome's [Translator API](https://developer.chrome.com/docs/ai/translator-api) enables in-browser translation of pet descriptions, allowing users to view content in their preferred language.

**Usage in the Application:**
- Used in the pet detail view to translate descriptions
- Supports multiple language pairs
- Provides seamless translation experience without server requests

**Supported Languages:**
- **English** (en) - Default source language
- **Spanish** (es) - Available for translation
- **French** (fr) - Available for translation

**Features:**
- **Client-side Translation**: All translation happens in the browser
- **Progress Tracking**: Visual feedback during model download
- **Instance Caching**: Cached translator instances for improved performance
- **Language Selection**: Easy language switching via dropdown in pet detail view

**Implementation Details:**
- Checks translation availability for specific language pairs
- Creates translator instances with source and target languages
- Monitors download progress for downloadable models
- Caches translator instances by language pair
- Falls back to original description if translation fails

**Location:** Used in `PetDetailComponent` via `TranslatorService`

### AI Features Availability & Requirements

**Browser Requirements:**
- Chrome browser with built-in AI APIs enabled
- APIs must be available in the current browser context
- Origin trial registration may be required for some APIs

**Hardware Requirements:**
- **Storage**: At least 22 GB free space (models are removed if space falls below 10 GB)
- **GPU**: More than 4 GB VRAM, or
- **CPU**: 16 GB RAM and 4+ CPU cores
- **Operating System**: Windows 10/11, macOS 13+, Linux, or ChromeOS (Chromebook Plus)

**Model Management:**
- Models download automatically when first used
- Download progress is tracked and displayed to users
- Models are cached for subsequent use
- Models are removed if storage space becomes limited

**Graceful Degradation:**
The application gracefully handles cases where AI APIs are unavailable:
- Feature buttons are disabled when APIs are not available
- Error messages provide clear feedback to users
- Users can still manually fill in all information
- No functionality is lost when AI features are unavailable

**Privacy & Security:**
- All AI processing happens client-side in the browser
- No data is sent to external servers for AI processing
- Models run locally using Gemini Nano
- User data remains private and secure

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Additional Resources

### Chrome AI APIs Documentation
- [Prompt API](https://developer.chrome.com/docs/ai/prompt-api) - Multimodal image and text analysis
- [Writer API](https://developer.chrome.com/docs/ai/writer-api) - Creative text generation
- [Proofreader API](https://developer.chrome.com/docs/ai/proofreader-api) - Grammar and spelling correction
- [Translator API](https://developer.chrome.com/docs/ai/translator-api) - Browser-based translation
- [Chrome Built-in AI Overview](https://developer.chrome.com/docs/ai) - Complete AI on Chrome documentation

## Support

For issues, questions, or contributions, please open an issue on the GitHub repository.

