import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CORS headers 
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use(express.json());

app.post('/api/updateJSONL', async (req, res) => {
  try {
    const { filePath, index, updates } = req.body;
    
    // Construct the full path using __dirname
    const fullPath = path.join(__dirname, 'public', filePath);
    console.log('Updating file:', fullPath);
    console.log('Updates:', updates);
    
    const fileContent = await fs.readFile(fullPath, 'utf8');
    const lines = fileContent.trim().split('\n');
    
    // Parse the line we want to update
    const entry = JSON.parse(lines[index]);
    
    // Update the entry with new values
    const updatedEntry = {
      ...entry,
      ...updates
    };
    
    // Replace the line in the array
    lines[index] = JSON.stringify(updatedEntry);
    
    // Write back to file
    await fs.writeFile(fullPath, lines.join('\n') + '\n');
    
    console.log('Successfully updated entry');
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating JSONL:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

const PORT = 3001;  // Prevent vite conflicts 
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});