import mongoose from 'mongoose';
import Settings from './src/models/Settings.js';

async function testMongooseStringId() {
  await mongoose.connect('mongodb://127.0.0.1:27017/dubaiblooms');
  console.log('Connected to DB');

  let settings = await Settings.findOne();
  
  // Simulate payload received from frontend via Express (JSON.parse converts ObjectId to string)
  const payloadStr = JSON.stringify(settings.homepage);
  const payload = JSON.parse(payloadStr);

  // Modify it
  payload.sections.forEach(s => {
    if (s.id === 'weekend-escapes') {
       s.title = 'Title From String ID Script';
    }
  });

  const updated = await Settings.findByIdAndUpdate(
    settings._id,
    { $set: { homepage: payload } },
    { new: true, runValidators: true }
  ).lean();

  console.log('Updated DB title:', updated.homepage.sections.find(s => s.id === 'weekend-escapes').title);
  process.exit(0);
}

testMongooseStringId().catch(console.error);
