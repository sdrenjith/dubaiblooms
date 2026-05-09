import mongoose from 'mongoose';
import Settings from './src/models/Settings.js';

async function testMongooseUpdate() {
  await mongoose.connect('mongodb://127.0.0.1:27017/dubaiblooms');
  console.log('Connected to DB');

  let settings = await Settings.findOne();
  if (!settings) {
     settings = await Settings.create({});
  }

  // Simulate payload received from frontend, exactly like normalizeHomepagePayload produces
  const payload = {
    ...settings.homepage?.toObject(),
    sections: settings.homepage?.sections.map(s => {
      const obj = s.toObject();
      if (obj.id === 'weekend-escapes') {
         obj.title = 'Title From Mongoose Script';
         obj.limit = 99;
      }
      return obj;
    })
  };

  console.log('Payload title:', payload.sections.find(s => s.id === 'weekend-escapes').title);

  // This is EXACTLY what the controller does
  const updated = await Settings.findByIdAndUpdate(
    settings._id,
    { $set: { homepage: payload } },
    { new: true, runValidators: true }
  ).lean();

  console.log('Updated DB title:', updated.homepage.sections.find(s => s.id === 'weekend-escapes').title);
  process.exit(0);
}

testMongooseUpdate().catch(console.error);
