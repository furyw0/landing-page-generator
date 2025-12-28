import mongoose, { Schema, Document, Model } from 'mongoose';

interface IGeneratedContent {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  heroTitle: string;
  heroSubtitle: string;
  heroBadges: string[];
  primaryButtonText: string;
  secondaryButtonText: string;
  features: Array<{
    title: string;
    description: string;
  }>;
  securityTitle: string;
  securityDescription: string;
  article: {
    mainTitle: string;
    sections: Array<{
      h3: string;
      paragraphs: string[];
    }>;
  };
  faqs: Array<{
    question: string;
    answer: string;
  }>;
  footerAbout: string;
  footerCopyright: string;
}

export interface IContent extends Document {
  userId: mongoose.Types.ObjectId;
  keyword: string;
  derivedKeywords: string[];
  mainUrl: string;
  hreflangUrl: string;
  templateId: string;
  generatedContent?: IGeneratedContent;
  blobUrl?: string;
  blobFilename?: string;
  status: 'generating' | 'completed' | 'failed';
  error?: string;
  createdAt: Date;
  completedAt?: Date;
  updatedAt: Date;
}

const ContentSchema = new Schema<IContent>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    keyword: {
      type: String,
      required: true,
    },
    derivedKeywords: [{
      type: String,
    }],
    mainUrl: {
      type: String,
      required: true,
    },
    hreflangUrl: {
      type: String,
      required: true,
    },
    templateId: {
      type: String,
      required: true,
    },
    generatedContent: {
      type: Schema.Types.Mixed,
    },
    blobUrl: {
      type: String,
    },
    blobFilename: {
      type: String,
    },
    status: {
      type: String,
      enum: ['generating', 'completed', 'failed'],
      default: 'generating',
    },
    error: {
      type: String,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
ContentSchema.index({ userId: 1, createdAt: -1 });
ContentSchema.index({ status: 1 });

const Content: Model<IContent> = mongoose.models.Content || mongoose.model<IContent>('Content', ContentSchema);

export default Content;

