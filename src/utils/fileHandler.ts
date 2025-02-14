import type { FeedbackEntry } from '../types';

export async function readJSONLFile(filePath: string): Promise<FeedbackEntry[]> {
  try {
    const response = await fetch(filePath);
    const text = await response.text();
    const lines = text.trim().split('\n');
    return lines.map(line => JSON.parse(line));
  } catch (error) {
    console.error('Error reading JSONL file:', error);
    return [];
  }
}

export async function updateEntry(
  filePath: string,
  index: number,
  updates: Partial<FeedbackEntry>
): Promise<void> {
  try {
    const response = await fetch('/api/updateJSONL', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filePath,
        index,
        updates,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update entry: ${response.statusText}`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to update entry');
    }
  } catch (error) {
    console.error('Error updating entry:', error);
    throw error;
  }
}