<script>
import { onMount } from 'svelte';
import { browser, dev } from '$app/environment';

let participants = [
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
];

let isGenerating = false;
let allFieldsFilled = false;
let presentationOrder = [];
let groups = [];
let isRandomized = false;
let selectedParticipantId = 0;
let errorMessage = '';

const API_BASE_URL = dev 
    ? 'http://localhost:3000' 
    : 'https://randominfo.vercel.app';

$: allFieldsFilled = participants.every( p => p.keywords.trim() !== '' );

$: if (browser) {
    localStorage.setItem('participantsData', JSON.stringify(
        participants,
        isRandomized,
        presentationOrder,
        selectedParticipantId
    ));
}

$: selectedParticipant = participants.find( p => p.id === selectedParticipantId ) || participants[0];

onMount(() => {
    const saved = localStorage.getItem('participantsData');
    if (saved) {
        const data = JSON.parse(saved);
        participants = data.participants || participants;
        selectedParticipantId = data.selectedParticipantId ?? 0;
        isRandomized = data.isRandomized || false;
        presentationOrder = data.presentationOrder || [];
    }
})


function updateKeywords(event) {
    const updatedParticipants = participants.map( p => 
        p.id === selectedParticipant.id 
        ? { ...p, keywords: event.target.value } : p
    );
    participants = updatedParticipants;
}

async function generateRandomOrder(params) {
    if (!allFieldsFilled || isRandomized) return;

    isGenerating = true;

    try {
        console.log(`Calling API at ${API_BASE_URL}`);

        const validParticipants = participants
            .filter( p => p.keywords.trim() !== '' )
            .map( p => ({ name: p.name, keywords: p.keywords.trim()
        }));

        const response = await fetch(`${API_BASE_URL}/api/group-topics`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json',
                        'Accept': 'application/json'
             },
            body: JSON.stringify({ participants: validParticipants })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if(!data.groups || !Array.isArray(data.groups)) {
            throw new Error('Invalid response format from server');
        }

        console.log('Received data:', data);

        const shuffleGroups = shuffleArray([...data.groups]);
        const finalOrder = []

        shuffleGroups.forEach( group => {
            const shuffledGroupMembers = shuffleArray([...group.members]);
            finalOrder.push(...shuffledGroupMembers);
        });

        presentationOrder = finalOrder;
        groups = shuffleGroups;
        isRandomized = true;
    
    } catch (error) {
        console.error('Error generating order:', error);
        errorMessage = `Failed to generate order: ${error.message}`;

        if (error.message.includes('fetch')) {
            errorMessage = 'Cannot connect to the API server. Please check if the server is running.';
        }else if (error.message.includes('quota')) {
            errorMessage = 'API quota exceeded. Please try again later.';
        }else if (error.message.includes('API key')) {
            errorMessage = 'Invalid API key. Please check your configuration.';
        }
} finally {
        isGenerating = false;
    }
}


function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

$: completedCount = participants.filter( p => p.keywords.trim() !== '').length;

$: console.log(presentationOrder)

</script>

<div class="container"></div>
    <h1>Presentation randomizer</h1>

    <div class="input-section">
        <h2>Enter information</h2>    
        <p>All 15 participants must fill out their information before generating the order</p>

        <div class="participant-list">
            <div class="select-container">
                <select class="name-input" 
                    bind:value={selectedParticipantId}>
                    {#each participants as p}
                        <option value={p.id}>{p.name}</option>
                    {/each}
                </select>
            </div>

            <div class="keywords-container">
                <textarea 
                    class="keywords-input"
                    value={selectedParticipant.keywords}
                    on:input={updateKeywords}
                    placeholder="Keywords (comma separated)" 
                    rows="6"
                ></textarea>
            </div>
        </div>

        <div class="action-section">
            <button 
                class="generate-button" 
                on:click={generateRandomOrder}
                disabled={!allFieldsFilled || isGenerating}
                class:disabled={!allFieldsFilled || isGenerating}
            >Generate Order</button>
            {#if isGenerating}
                <p>Generating...</p>
            {/if}
        </div>

        <div class='results'>
            <h2>Presentation Order</h2>
            <div class="presentation-order">
                {#each presentationOrder as participant, index}
                    <div class="order-item">
                        <div class="position">#{index + 1}</div>
                        <div class="participant-info">
                            <div class="participant-name">{participant.name}</div>
                            <div class="participant-keywords">{participant.keywords}</div>
                        </div>
                    </div>
                {/each}
                {#if presentationOrder.length === 0}
                    <p>No order generated yet.</p>
                {/if}
            </div>
        </div>

    </div>