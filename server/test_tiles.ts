import mongoose from 'mongoose';
import Settings from './src/models/Settings.js';

async function testTiles() {
  await mongoose.connect('mongodb://127.0.0.1:27017/dubaiblooms');
  console.log('Connected to DB');

  let doc = await Settings.findOne();
  
  const payloadStr = JSON.stringify(doc.homepage);
  const payload = JSON.parse(payloadStr);

  payload.categoryTiles[0].title = 'Testing Tiles 1000';

  // Exactly what settingsController does:
  doc.set('homepage', payload);
  const updatedDoc = await doc.save();
  
  console.log('Updated DB tile title:', updatedDoc.homepage.categoryTiles[0].title);
  process.exit(0);
}

testTiles().catch(console.error);
