const express = require('express');
const app = express();
const OpenAI = require('openai');

app.use((req, res, next) => {
  console.log(`=== REQUEST: ${req.method} ${req.url} ===`);
  next();
});

app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log('Request from origin:', origin);
  
  if (!origin || 
      origin.includes('localhost') || 
      origin.includes('127.0.0.1') ||
      origin.includes('github.io')) {
    res.header('Access-Control-Allow-Origin', origin || '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    console.log('OPTIONS handled for:', origin);
    return res.sendStatus(200);
  }
  
  next();
});

app.use(express.json());

let storedData = {
  participants: [
    { name: 'Arnar', id: 0, keywords: '' },
    { name: 'Cassandra', id: 1, keywords: '' },
    { name: 'Costanza', id: 2, keywords: '' },
    { name: 'Diana', id: 3, keywords: '' },
    { name: 'Haotong', id: 4, keywords: '' },
    { name: 'Kosara', id: 5, keywords: '' },
    { name: 'Li', id: 6, keywords: '' },
    { name: 'Luca M', id: 7, keywords: '' },
    { name: 'Luca W', id: 8, keywords: '' },
    { name: 'Lucas G', id: 9, keywords: '' },
    { name: 'Martina', id: 10, keywords: '' },
    { name: 'Matteo', id: 11, keywords: '' },
    { name: 'Samuel', id: 12, keywords: '' },
    { name: 'Sergio', id: 13, keywords: '' },
    { name: 'Zhiyi', id: 14, keywords: '' }
  ],
  selectedParticipantId: 0,
  isRandomized: false,
  presentationOrder: [],
  lastUpdated: Date.now()
};

// Routes - in the exact working order
app.get('/', (req, res) => {
  console.log('GET / hit');
  res.json({ message: 'API working' });
});

app.get('/api/data', (req, res) => {
  console.log('GET /api/data hit');
  res.json(storedData);
});

app.post('/api/data', (req, res) => {
  console.log('POST /api/data hit - SUCCESS!');
  console.log('Body received:', req.body);
  
  try {
    storedData = { ...req.body, lastUpdated: Date.now() };
    console.log('Data updated successfully');
    res.json({ success: true, lastUpdated: storedData.lastUpdated });
  } catch (error) {
    console.error('POST error:', error);
    res.status(500).json({ error: error.message });
  }
});

let openai;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  console.log('OpenAI initialized');
} else {
  console.log('No OpenAI API key found');
}

app.post('/api/group-topics', async (req, res) => {
    try {
        console.log('received request to group topics');
        const { participants } = req.body;

        if (!participants || !Array.isArray(participants)) {
            return res.status(400).json({ error: 'Invalid participants data',
                message: 'Participants should be a non-empty array'    
            });
        }

        if (participants.length === 0) {
            return res.status(400).json({ error: 'Participants list is empty',
                message: 'Participants should be a non-empty array'
            });
        }

        const validParticipants = participants.filter(
            p => p.name && p.name.trim() && p.keywords && p.keywords.trim()
        );

        if (validParticipants.length === 0) {
            return res.status(400).json({
                error: 'No valid participants with keywords provided',
                message: 'Each participant must have a name and keywords'
            });
        }

    console.log(`Processing ${validParticipants.length} participants`);

    const prompt = `
    You are an expert in grouping thesis presentations by similar topics. Here are ${validParticipants.length} participants with their names and thesis keywords:

    ${validParticipants.map((p, i) => `${i + 1}. ${p.name}: ${p.keywords}`).join('\n')}

    Please group these participants by similar thesis topics/themes. Create 4 groups where participants with related research areas are together. 3 groups should have 4 participants, 1 group should have 3 participants.
    Return your response as a JSON object with this exact structure:
    {
    "groups": [
        {
        "theme": "Theme name describing the research area",
        "members": [
            {"name": "Participant Name", "keywords": "their keywords"},
            {"name": "Participant Name", "keywords": "their keywords"}
        ]
        }
    ]
    }

    Important rules:
    - Focus on grouping by research domain, methodology, or subject matter
    - Include ALL ${validParticipants.length} participants across the groups
    - Each participant should appear in exactly one group
    - Group names should be descriptive of the research themes
    - Return valid JSON only, no additional text`;

    const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            {
                role: 'system',
                content: "You are an academic advisor helping to organize thesis presentations by grouping similar research topics together. You must return valid JSON only."
            },
            {
                role: 'user',
                content: prompt
            }
        ],
        temperature: 0.3,
        max_tokens: 1500,
    });

    const responseText = completion.choices[0].message.content.trim();
    console.log('OpenAI response received');

    let groupData;
    try {
        groupData = JSON.parse(responseText);
    } catch (error) {
        console.error('Error parsing OpenAI response:', error);
        console.error('Response text:', responseText);
        return res.status(500).json({ 
            error: 'Failed to parse response from OpenAI',
            message: 'Failed to parse grouping results.'});
    }

    if (!groupData.groups || !Array.isArray(groupData.groups)) {
        return res.status(500).json({ 
            error: 'Invalid group data structure from OpenAI',
            message: 'Grouping results are in an unexpected format.' });
    }

    console.log(`Successfully grouped into ${groupData.groups.length} groups`);
    res.json(groupData);

    } catch (error) {
        console.error('Error with OpenAI API:', error);
        if (error.code === 'insufficient_quota') {
            return res.status(402).json({ 
                error: 'OpenAI API quota exceeded',
                message: 'The server has exceeded its OpenAI API quota. Please try again later.' 
            });
        }

        if (error.code === 'invalid_api_key') {
            return res.status(401).json({ 
                error: 'Invalid OpenAI API key',
                message: 'The server is misconfigured. Please contact the administrator.' 
            });
        }

        res.status(500).json({
            error: 'Failed to group topics',
            message: 'Internal server error'
        });
    }
});

app.delete('/api/data', (req, res) => {
  try {
    console.log('DELETE /api/data called - clearing all data');
    
    // Reset to default data with your student names
    storedData = {
      participants: [
        { name: 'Arnar', id: 0, keywords: '' },
        { name: 'Cassandra', id: 1, keywords: '' },
        { name: 'Costanza', id: 2, keywords: '' },
        { name: 'Diana', id: 3, keywords: '' },
        { name: 'Haotong', id: 4, keywords: '' },
        { name: 'Kosara', id: 5, keywords: '' },
        { name: 'Li', id: 6, keywords: '' },
        { name: 'Luca M', id: 7, keywords: '' },
        { name: 'Luca W', id: 8, keywords: '' },
        { name: 'Lucas G', id: 9, keywords: '' },
        { name: 'Martina', id: 10, keywords: '' },
        { name: 'Matteo', id: 11, keywords: '' },
        { name: 'Samuel', id: 12, keywords: '' },
        { name: 'Sergio', id: 13, keywords: '' },
        { name: 'Zhiyi', id: 14, keywords: '' }
      ],
      selectedParticipantId: 0,
      isRandomized: false,
      presentationOrder: [],
      lastUpdated: Date.now()
    };
    
    console.log('All data cleared successfully');
    res.json({ success: true, message: 'All data cleared' });
  } catch (error) {
    console.error('DELETE error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Catch-all route MUST be last
app.use('*', (req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Route not found' });
});

module.exports = app;