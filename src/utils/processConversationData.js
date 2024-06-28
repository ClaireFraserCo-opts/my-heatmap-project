// processConversationData.js

export function processConversationData(data) {
  try {
    console.log('Processing data:', data);

    if (!data || typeof data !== 'object') {
      throw new Error('Invalid data format: Expected an object');
    }

    if (Array.isArray(data.utterances)) {
      // Process data in utterances format
      return data.utterances.map((item, index) => {
        if (!item.text || item.start === undefined || item.end === undefined || item.confidence === undefined || !item.speaker) {
          throw new Error(`Invalid utterance item structure at index ${index}`);
        }
        return {
          text: item.text,
          start: item.start,
          end: item.end,
          confidence: item.confidence,
          speaker: item.speaker,
          frequency: item.word_count, // Assuming frequency is based on word count
        };
      });
    } else if (Array.isArray(data.words)) {
      // Process data in words format
      const utteranceMap = new Map();
      data.words.forEach((word) => {
        if (!word.text || word.start === undefined || word.end === undefined || word.confidence === undefined || !word.speaker) {
          throw new Error(`Invalid word item structure at word ${word.text}`);
        }
        if (!utteranceMap.has(word.speaker)) {
          utteranceMap.set(word.speaker, []);
        }
        utteranceMap.get(word.speaker).push(word);
      });

      // Combine words into utterances
      const processedData = [];
      utteranceMap.forEach((words, speaker) => {
        const combinedText = words.map(word => word.text).join(' ');
        const start = words[0].start;
        const end = words[words.length - 1].end;
        const confidence = words.reduce((acc, word) => acc + word.confidence, 0) / words.length;

        processedData.push({
          text: combinedText,
          start: start,
          end: end,
          confidence: confidence,
          speaker: speaker,
          frequency: words.length, // Assuming frequency is based on word count
        });
      });
      return processedData;
    } else {
      throw new Error('Unexpected data structure');
    }
  } catch (error) {
    console.error('Error processing conversation data:', error.message);
    throw error;
  }
}
