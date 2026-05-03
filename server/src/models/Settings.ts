import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  siteName: string;
  logo: string;
  tagline: string;
  contactInfo: {
    email: string;
    phone: string;
    address: string;
  };
  socialLinks: {
    facebook: string;
    twitter: string;
    instagram: string;
    linkedin: string;
  };
  footerText: string;
}

const settingsSchema = new Schema<ISettings>(
  {
    siteName: { type: String, default: 'Dubai Blooms' },
    logo: { type: String, default: '' },
    tagline: { type: String, default: 'The Pulse of Dubai' },
    contactInfo: {
      email: { type: String, default: 'hello@dubaiblooms.com' },
      phone: { type: String, default: '+971 4 000 0000' },
      address: { type: String, default: 'Dubai, United Arab Emirates' },
    },
    socialLinks: {
      facebook: { type: String, default: '' },
      twitter: { type: String, default: '' },
      instagram: { type: String, default: '' },
      linkedin: { type: String, default: '' },
    },
    footerText: { type: String, default: '© 2024 Dubai Blooms. All rights reserved.' },
  },
  { timestamps: true }
);

const Settings = mongoose.model<ISettings>('Settings', settingsSchema);
export default Settings;
