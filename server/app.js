const express = require('express');
const OpenAI = require('openai');
const cors = require('cors');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

const DATA_FILE = path.join(__dirname, 'data.json');

const defaultData = {
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
    groups: [],
    lastUpdated: Date.now()
};

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    });s

app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? 'https://dianayukari.github.io/randominfo'
        : ['http://localhost:5173', 'http://localhost:4173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
    optionsSuccessStatus: 200
}));


app.use(express.json({ limit: '1mb' }));

async function loadData() {
    try {
        const data = await fs.promises.readFile(DATA_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading data:', error);
        await writeData(defaultData);
        return defaultData;
    }
}

async function writeData(data) {
    try {
        await fs.promises.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
        console.log('Data saved successfully');
    } catch (error) {
        console.error('Error saving data:', error);
    }
}

app.get('/', (req, res) => {
    res.json({ message: 'API is running',
        version: '1.0.0',
        status: 'healthy' 
    });
});

app.get('/api/data', async (req, res) => {
    try {
        const data = await loadData();
        res.json(data);
    } catch (error) {
        console.error('Error in /api/data:', error);
        res.status(500).json({ error: 'Failed to load data' });
    }
});

app.post('/api/data', async (req, res) => {
    try {
        console.log('📝 Received POST to /api/data');
        console.log('📝 Request body:', JSON.stringify(req.body, null, 2));
        
        const { participants, selectedParticipantId, isRandomized, presentationOrder, groups} = req.body;
        const currentData = await loadData();

        const newData = {
            ...currentData,
            participants: participants || currentData.participants,
            selectedParticipantId: selectedParticipantId ?? currentData.selectedParticipantId,
            isRandomized: isRandomized ?? currentData.isRandomized,
            presentationOrder: presentationOrder || currentData.presentationOrder,
            groups: groups || currentData.groups || [],
            lastUpdated: Date.now()
        }

        console.log('📝 Saving new data:', JSON.stringify(newData, null, 2));
        await writeData(newData);
        console.log('📝 Data saved successfully');
        res.json(newData);
    } catch (error) {
        console.error('Error in /api/data:', error);
        res.status(500).json({ error: 'Failed to update data' });
    }
});

app.delete('/api/data', async (req, res) => {
    try {
        const freshData = { ...defaultData, lastUpdated: Date.now() };
        await writeData(freshData);
        res.json(freshData);
    } catch (error) {
        console.error('Error in DELETE /api/data:', error);
        res.status(500).json({ error: 'Failed to reset data' });
    }
});

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

app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: 'Something went wrong'
  });
});

app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: 'The requested endpoint does not exist'
  });
});

app.listen(port, () => {
  console.log(`Thesis randomizer API listening on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
    
module.exports = app;