import express from 'express';
import fs from 'fs/promises';
import path from 'path';

const app = express();
app.use(express.json());

app.post('/api/updateJSONL', async (req, res) => {
  try {
    const { filePath, index, updates } = req.body;
    
    const fullPath = path.join(process.cwd(), 'public', filePath);
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
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating JSONL:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});