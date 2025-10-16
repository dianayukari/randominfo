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
let simpleOrder = []; // Store the simple shuffled order
let groups = [];
let isRandomized = false;
let selectedParticipantId = 0;
let errorMessage = '';
let isLoading = true;
let isSaving = false;
let showGroupedView = true; // Toggle for grouped vs simple view

const API_BASE_URL = dev 
    ? 'https://randominfo.vercel.app'
    : 'https://randominfo.vercel.app';

$: allFieldsFilled = participants.every( p => p.keywords.trim() !== '' );

$: selectedParticipant = participants.find( p => p.id === selectedParticipantId ) || participants[0];

onMount(async () => {
   await loadData();
   isLoading = false;
})

async function loadData() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/data`);
        if (response.ok) {
            const data = await response.json();
            participants = data.participants || participants;
            selectedParticipantId = data.selectedParticipantId ?? 0;
            isRandomized = data.isRandomized || false;
            presentationOrder = data.presentationOrder || [];
            simpleOrder = data.simpleOrder || [];
            groups = data.groups || [];
        }
    }   catch (error) {
        console.error('Error loading data:', error);
    }
}

  async function saveData() {
    if (isSaving) return;
    
    isSaving = true;

    try {
        const response = await fetch(`${API_BASE_URL}/api/data`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
            participants,
            selectedParticipantId,
            isRandomized,
            presentationOrder,
            simpleOrder,
            groups
            })
        });
      
        if (!response.ok) {
        console.error('Failed to save data');
        }

    } catch (error) {
        console.error('Error saving data:', error);
    } finally {
        isSaving = false;
    }
  }


function updateKeywords(event) {
    
    const updatedParticipants = participants.map( p => 
        p.id === selectedParticipant.id 
        ? { ...p, keywords: event.target.value } : p
    );
    
    participants = updatedParticipants;
}

async function clearAllData() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/data`, {
            method: 'DELETE'
        });

        if (response.ok) {
            participants = participants.map( p => ({ ...p, keywords: '' }) );
            isRandomized = false;
            presentationOrder = [];
            simpleOrder = [];
            groups = [];
            selectedParticipantId = 0;
        } else {
            console.error('Failed to clear data');
        }
    } catch (error) {
        console.error('Error clearing data:', error);
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


function getValidParticipants() {
    return participants
        .filter( p => p.keywords.trim() !== '' )
        .map( p => ({ name: p.name, keywords: p.keywords.trim() }));
}

async function generateRandomOrder() {
    if (!allFieldsFilled || isRandomized) return;

    isGenerating = true;

    try {
        console.log(`Calling API at ${API_BASE_URL}`);

        const validParticipants = getValidParticipants();

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
            shuffledGroupMembers.forEach(member => {
                finalOrder.push({
                    ...member,
                    theme: group.theme
                });
            });
        });

        presentationOrder = finalOrder;
        groups = shuffleGroups;
        
        // Also generate simple shuffled order
        simpleOrder = shuffleArray([...getValidParticipants()]);
        
        isRandomized = true;
        
        await saveData();
    
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

$: completedCount = participants.filter( p => p.keywords.trim() !== '').length;

$: groupedParticipants = presentationOrder.reduce((acc, participant, index) => {
    const theme = participant.theme;
    if (!acc[theme]) {
        acc[theme] = [];
    }
    acc[theme].push({ ...participant, position: index + 1 });
    return acc;
}, {});


</script>
<div class="main">

    {#if isRandomized && presentationOrder.length > 0}
        <!-- Show results screen when presentation order has been generated -->

        <div class="order-titles">
            <h2 class="title-order">Grouped order</h2>
            <h2 class="title-order simple">Simple order</h2>
        </div>

        <div class='results'>
    <!-- Grouped order -->
            <div class="grouped-view">
                {#each Object.entries(groupedParticipants) as [theme, participants]}
                    <div class="theme-group">
                        <h3 class="theme-title">{theme}</h3>
                        <div class="theme-participants">
                            {#each participants as participant}
                                <div class="participant-item">
                                    <div class="position">{participant.position}.</div>
                                    <div class="participant-name">{participant.name}</div>
                                </div>
                            {/each}
                        </div>
                    </div>
                {/each}
            </div>
                <!-- Simple list view -->

            <div class="simple-view">
                {#each simpleOrder as participant, index}
                    <div class="participant-item">
                        <div class="position">{index + 1}.</div>
                        <div class="participant-info">
                            <div class="participant-name">{participant.name}</div>
                        </div>
                    </div>
                {/each}
            </div>
            
            {#if presentationOrder.length === 0}
                <p>No order generated yet.</p>
            {/if}
        </div>
        <div class="results-actions">
            <button on:click={clearAllData} class="clear-button">
                Clear All Data
            </button>
        </div>
    {:else}
        <!-- Show input screen only when no results exist -->
            <div class="input-section">
                <div class="participant-list">
                    <div class="select-container">
                        <p>Who are you?</p>
                        <select class="name-input" 
                            bind:value={selectedParticipantId}>
                            {#each participants as p}
                                <option value={p.id}>{p.name}</option>
                            {/each}
                        </select>
                    </div>
                <div class="rabbit1">
                    <img src="/rabbit1.png" alt="Rabbit illustration" width="120" />
                </div>
            </div>
                    <div class="keywords-container">
                        <p>What are you up to?</p>
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
                <button class="save-button" on:click={() => {saveData();}}>Save</button>
                <button 
                    class="generate-button" 
                    on:click={generateRandomOrder}
                    disabled={!allFieldsFilled || isGenerating}
                    class:disabled={!allFieldsFilled || isGenerating}
                >
                {#if isGenerating}
                    <p>Generating...</p>
                {:else if !allFieldsFilled}
                    Waiting for everyone ({participants.filter(p => p.name.trim() && p.keywords.trim()).length}/15)
                {:else}
                    Generate Presentation Order
                {/if}
                </button>

            </div>

            <button on:click={clearAllData} class="clear-button">
                    Clear All Data
            </button>
            
    {/if}
</div>

<style>

    @import url("https://use.typekit.net/zqr6qan.css");

    :global(body) {
        font-family: "hoss-round", sans-serif;
        font-size: 14px;
        background-color: #F8E2EF;
    }

    .main {
        margin-top: 50px;
        max-width: 320px;
    }

    .input-section {
        display: flex;
        gap: 30px;
    }

    .results {
        display: flex;
        max-width: 600px;
        margin: 0 auto;
        gap: 50px;
    }

    .title-order {
        font-size: 1.2em;
        flex: 1;
        gap: 20px;
    }

    .order-titles {
        display: flex;
        justify-content: space-between;
    }

    .theme-title {
        font-size: 1em;
        margin: 20px 0 10px 0;
        font-weight: 300;
    }

    .simple-view {
        margin-top: 25px;
    }

    .participant-item {
        display: flex;
        gap: 20px;
        align-items: center;
        margin-bottom: 8px;
        width: fit-content;
    }

    .position {
        font-weight: bold;
        text-align: right;
        width: 20px;
    }

    .input-section {
        display: flex;
        flex-direction: column;
        gap: 0;
    }

    .select-container p {
        margin: 40px 0 5px 0;
    }

    .name-input {
        font-family: "hoss-round", sans-serif;
        height: 30px;
        width: fit-content;
    }

    .participant-list {
        display: flex;
        gap: 50px;
    }

    .name-input {
        font-family: "hoss-round", sans-serif;
        height: 30px;
        width: fit-content;
        border: none;
        border-radius: 5px;
        background-color: #FEFFF7;
    }

    .keywords-container {
        padding: 10px 0;
        font-size: 14px;
    }

    .keywords-container p {
        margin: 0 0 5px 0;
    }

    .keywords-input {
        font-family: "hoss-round", sans-serif;
        font-size: 14px;
        height: 30px;
        width: 250px;
        border: none;
        border-radius: 5px;
        background-color: #FEFFF7;

    }

    .save-button {
        background-color: #64A5FB;
        font-weight: 700;
        color: #FFF;
        padding: 10px 10px;
        margin-right: 10px;
        cursor: pointer;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(100, 165, 251, 0.3);
        transform: translateY(0);
        position: relative;
        overflow: hidden;
    }

    .save-button:hover {
        background-color: #4D8EE8;
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(100, 165, 251, 0.4);
    }

    .save-button:active {
        transform: translateY(0);
        box-shadow: 0 2px 8px rgba(100, 165, 251, 0.3);
    }

    /* Ripple effect for save button */
    .save-button::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: translate(-50%, -50%);
        transition: width 0.3s, height 0.3s;
    }

    .save-button:active::before {
        width: 300px;
        height: 300px;
    }


    .generate-button {
        background-color: #FF61A6;
        font-weight: 700;
        color: #FFF;
        padding: 10px 15px;
        cursor: pointer;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(255, 97, 166, 0.3);
        transform: translateY(0);
        position: relative;
        overflow: hidden;
    }

    .generate-button:hover:not(:disabled) {
        background-color: #FF4D99;
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(255, 97, 166, 0.4);
    }

    .generate-button:active:not(:disabled) {
        transform: translateY(0);
        box-shadow: 0 2px 8px rgba(255, 97, 166, 0.3);
    }

    .generate-button:disabled {
        background-color: #FEFFF7;
        cursor: not-allowed;
        color: #A3CAFD;
        transform: translateY(0);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
        opacity: 0.7;
    }

    /* Ripple effect */
    .generate-button:not(:disabled)::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: translate(-50%, -50%);
        transition: width 0.3s, height 0.3s;
    }

    .generate-button:not(:disabled):active::before {
        width: 300px;
        height: 300px;
    }

    button {
        font-family: 'hoss-round', sans-serif;
        border: none;
        border-radius: 5px;
    }



</style>