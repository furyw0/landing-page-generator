# 🚀 AI Landing Page Generator

AI-powered automated landing page generator for casino/betting sites. Built with Next.js 14, OpenAI, and modern web technologies.

## ✨ Features

### Content Generation
- 🤖 **OpenAI Integration**: GPT-4o-mini (default) with model selection
- 📝 **Smart Content**: Auto-generates 2500+ words of unique, SEO-optimized content
- 🎯 **Keyword Derivation**: Automatically creates related keywords from seed keyword
- 🌐 **Dual URL System**: Main URL (canonical) + Hreflang URL for i18n

### Templates
- 🎨 **5 Unique Templates**: Each with distinct design philosophy
  - **Luxury Gold**: Serif fonts, sharp borders, VIP feel
  - **Modern Blue**: Clean sans-serif, rounded corners, tech-forward
  - **Neon Purple**: Monospace, angular design, cyberpunk vibe
  - **Classic Green**: Traditional casino, professional look
  - **Orange Red**: Energetic, bold, action-packed

### Security & Management
- 🔐 **NextAuth.js**: Email/password authentication
- 🔒 **Encrypted Storage**: User API keys encrypted with AES-256
- ⚡ **Async Processing**: Inngest for background content generation
- ☁️ **Blob Storage**: Vercel Blob for persistent HTML storage
- 📊 **Content Dashboard**: View, edit, download generated pages

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- MongoDB database
- OpenAI API key (per user)
- Vercel account (for Blob storage)
- Inngest account (for background jobs)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/landing-page-generator.git
cd landing-page-generator

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev

# Open browser
open http://localhost:3000
```

## 🔧 Environment Variables

Create a `.env.local` file in the root directory:

```bash
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/landing-page-generator

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-minimum-32-characters-long

# Encryption Key (exactly 32 characters for AES-256)
ENCRYPTION_KEY=your-32-character-encryption-key

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN=vercel_blob_token_here

# Inngest Configuration
INNGEST_EVENT_KEY=your-inngest-event-key
INNGEST_SIGNING_KEY=your-inngest-signing-key
```

### Getting API Keys

1. **MongoDB**: Create free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. **Vercel Blob**: Get token from [Vercel Dashboard](https://vercel.com/dashboard)
3. **Inngest**: Sign up at [Inngest.com](https://www.inngest.com/)
4. **NextAuth Secret**: Generate with `openssl rand -base64 32`
5. **Encryption Key**: Generate with `openssl rand -hex 16`

## 🎯 Usage

### 1. Register & Login
- Navigate to `/register` to create an account
- Login with your credentials

### 2. Configure OpenAI
- Go to **Settings** (`/settings`)
- Enter your OpenAI API key
- Select GPT model (default: gpt-4o-mini)

### 3. Generate Content
- Navigate to **Generate** page (`/generate`)
- Select a template (1-5)
- Enter keyword (e.g., "betmatik", "casino")
- Enter Main URL (for canonical, og:url)
- Enter Hreflang URL (for alternate language)
- Click **"Generate"**

### 4. Wait for Processing
- Background job runs for 30-60 seconds
- 7-step process:
  1. Fetch user config
  2. Initialize OpenAI
  3. Derive keywords
  4. Generate content (8 types)
  5. Build HTML
  6. Upload to Blob
  7. Save to database

### 5. View & Download
- Preview in iframe
- Edit content (coming soon)
- Download HTML file
- Use on your hosting

## 📊 Content Generated

Each landing page includes:
- **Meta Tags**: Title, description, keywords
- **Hero Section**: Title, subtitle, 3 feature badges
- **CTA Buttons**: Primary & secondary button texts
- **Security Section**: Title & description
- **Feature Cards**: 6 cards with titles & descriptions
- **Article**: Main title + 7-8 sections (2000+ words)
- **FAQs**: 6 questions & answers
- **Footer**: About text & copyright
- **Structured Data**: Organization, WebSite, FAQPage schemas

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI**: Radix UI components

### Backend
- **API**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Auth**: NextAuth.js
- **Storage**: Vercel Blob Storage
- **Jobs**: Inngest (async processing)

### AI & Content
- **AI Provider**: OpenAI (GPT-4o-mini, GPT-4, etc.)
- **HTML Parser**: Cheerio
- **Content**: SEO-optimized, keyword-rich

### Deployment
- **Platform**: Vercel
- **CI/CD**: Automatic deployment on push
- **Environment**: Serverless functions

## 📁 Project Structure

```
landing-page-generator/
├── src/
│   ├── app/                          # Next.js 14 App Router
│   │   ├── (auth)/                  # Auth pages
│   │   │   ├── login/               
│   │   │   └── register/            
│   │   ├── (dashboard)/             # Protected pages
│   │   │   ├── dashboard/           # Main dashboard
│   │   │   ├── settings/            # User settings
│   │   │   └── generate/            # Content generation
│   │   ├── api/                     # API Routes
│   │   │   ├── auth/                # NextAuth & register
│   │   │   ├── user/                # User settings
│   │   │   ├── generate/            # Trigger generation
│   │   │   ├── contents/            # CRUD operations
│   │   │   ├── download/            # Download HTML
│   │   │   └── inngest/             # Inngest webhook
│   │   ├── layout.tsx               # Root layout
│   │   └── page.tsx                 # Home page
│   ├── lib/
│   │   ├── models/                  # Mongoose schemas
│   │   │   ├── User.ts              
│   │   │   └── Content.ts           
│   │   ├── services/                # Business logic
│   │   │   ├── openai.service.ts    # OpenAI wrapper
│   │   │   ├── content-generator.service.ts
│   │   │   ├── html-builder.service.ts
│   │   │   └── blob.service.ts      
│   │   ├── inngest/                 # Background jobs
│   │   │   ├── client.ts            
│   │   │   └── functions/
│   │   │       └── generate-content.ts
│   │   ├── auth.ts                  # NextAuth config
│   │   ├── mongodb.ts               # DB connection
│   │   ├── crypto.ts                # Encryption utils
│   │   └── i18n/                    # Translations
│   │       └── tr.json              
│   └── middleware.ts                # Route protection
├── templates/                        # HTML templates
│   ├── template-1.html              # Luxury Gold
│   ├── template-2.html              # Modern Blue
│   ├── template-3.html              # Neon Purple
│   ├── template-4.html              # Classic Green
│   └── template-5.html              # Orange Red
├── public/                           # Static assets
├── .env.local                        # Environment variables
├── .gitignore                        # Git ignore rules
├── package.json                      # Dependencies
├── tsconfig.json                     # TypeScript config
├── tailwind.config.ts                # Tailwind config
├── next.config.ts                    # Next.js config
├── README.md                         # This file
├── DEPLOYMENT.md                     # Deployment guide
├── GITHUB_SETUP.md                   # GitHub setup guide
├── TEMPLATES_INFO.md                 # Template info
├── TEMPLATE_DIFFERENCES.md           # Template comparison
└── CONTENT_GENERATION_PROCESS.md     # How it works
```

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Import project to Vercel
3. Add environment variables
4. Deploy!

Detailed guide: [DEPLOYMENT.md](./DEPLOYMENT.md)

### GitHub Setup

Full instructions: [GITHUB_SETUP.md](./GITHUB_SETUP.md)

```bash
# Initialize Git (if not done)
git init
git add .
git commit -m "Initial commit"

# Add remote
git remote add origin https://github.com/yourusername/landing-page-generator.git
git branch -M main
git push -u origin main
```

## 📚 Documentation

- **[DEPLOYMENT.md](./DEPLOYMENT.md)**: Complete deployment guide
- **[GITHUB_SETUP.md](./GITHUB_SETUP.md)**: GitHub & Vercel setup
- **[TEMPLATES_INFO.md](./TEMPLATES_INFO.md)**: Template overview & specs
- **[TEMPLATE_DIFFERENCES.md](./TEMPLATE_DIFFERENCES.md)**: Detailed template comparison
- **[CONTENT_GENERATION_PROCESS.md](./CONTENT_GENERATION_PROCESS.md)**: How content generation works

## 🎨 Template Showcase

| Template | Theme | Font | Design | Best For |
|----------|-------|------|--------|----------|
| **T1: Luxury Gold** | Premium VIP | Georgia (Serif) | Sharp borders, heavy shadows | High-roller casinos |
| **T2: Modern Blue** | Tech-Forward | Inter (Sans) | Rounded corners, light shadows | Modern platforms |
| **T3: Neon Purple** | Cyberpunk | Orbitron (Mono) | Angular, neon glow | Esports betting |
| **T4: Classic Green** | Traditional | Lato (Sans) | Conservative, professional | Classic casinos |
| **T5: Orange Red** | Energetic | Segoe UI (Sans) | Smooth, vibrant | Action-packed sites |

Each template has unique:
- ✅ Typography (Serif, Sans-Serif, Monospace)
- ✅ Border radius strategy (0-32px range)
- ✅ Shadow effects (Heavy, Subtle, Neon glow)
- ✅ Spacing system (Tight, Balanced, Wide)
- ✅ Animation approach (Smooth, Dramatic, Energetic)

See [TEMPLATE_DIFFERENCES.md](./TEMPLATE_DIFFERENCES.md) for detailed comparison.

## 🔍 How It Works

### Content Generation Flow

1. **User Input** → Keyword + URLs + Template selection
2. **Inngest Job** → Triggered via API
3. **Keyword Derivation** → AI generates related keywords
4. **Content Generation** → 8 parallel AI calls:
   - Meta tags (title, description, keywords)
   - Hero section (title, subtitle, badges)
   - Buttons (primary, secondary)
   - Security section
   - Feature cards (6x)
   - Article (2000+ words, 7-8 sections)
   - FAQs (6x Q&A)
   - Footer (about, copyright)
5. **HTML Building** → Cheerio injects content into template
6. **URL Replacement** → Main URL & Hreflang URL
7. **Structured Data** → JSON-LD schemas
8. **Blob Upload** → HTML stored in Vercel Blob
9. **Database Save** → Metadata saved to MongoDB

Total time: **30-60 seconds**

See [CONTENT_GENERATION_PROCESS.md](./CONTENT_GENERATION_PROCESS.md) for detailed walkthrough.

## 🔐 Security

- ✅ **Encrypted API Keys**: User OpenAI keys encrypted with AES-256
- ✅ **NextAuth**: Secure authentication with bcrypt
- ✅ **Middleware**: Route protection for dashboard pages
- ✅ **Environment Variables**: Sensitive data in .env (never committed)
- ✅ **MongoDB**: Password-protected database
- ✅ **Vercel Blob**: Secure file storage with token auth

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/landing-page-generator/issues)
- **Documentation**: See docs folder
- **Email**: your.email@example.com

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [OpenAI](https://openai.com/) - AI API
- [Vercel](https://vercel.com/) - Hosting & Blob storage
- [Inngest](https://www.inngest.com/) - Background jobs
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [NextAuth.js](https://next-auth.js.org/) - Authentication

## 📊 Stats

- **Lines of Code**: 5,000+
- **Templates**: 5 unique designs
- **Content Types**: 8 different sections
- **Average Output**: 2,500+ words per page
- **Generation Time**: 30-60 seconds
- **SEO Score**: 95+ (Lighthouse)

## 🎯 Roadmap

- [ ] Monaco Editor integration for HTML editing
- [ ] TipTap WYSIWYG editor for content editing
- [ ] Bulk generation (multiple keywords)
- [ ] Template customization UI
- [ ] A/B testing features
- [ ] Analytics dashboard
- [ ] More templates (10+ total)
- [ ] Multi-language support
- [ ] Image generation (DALL-E integration)
- [ ] PDF export

---

**Made with ❤️ and AI**

Star ⭐ this repo if you find it helpful!
