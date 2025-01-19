// DOM Elements
const generateBtn = document.getElementById('generateBtn');
const promptInput = document.getElementById('storyPrompt');
const storyContainer = document.querySelector('.story-container');
const languageSelect = document.getElementById('language');
const addMoralCheckbox = document.getElementById('addMoral');
const addTitleCheckbox = document.getElementById('addTitle');

// Genre-based image mapping
const genreImages = {
    'adventure': [
        'https://images.unsplash.com/photo-1519681393784-d120267933ba',
        'https://images.unsplash.com/photo-1501785888041-af3ef285b470',
        'https://images.unsplash.com/photo-1486870591958-9b9d1d1dda99'
    ],
    'mystery': [
        'https://images.unsplash.com/photo-1509248961158-e54f6934749c',
        'https://images.unsplash.com/photo-1536599018102-9f803c140fc1',
        'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0'
    ],
    'fantasy': [
        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23',
        'https://images.unsplash.com/photo-1510279770292-4b34de9f5c23',
        'https://images.unsplash.com/photo-1534447677768-be436bb09401'
    ],
    'horror': [
        'https://images.unsplash.com/photo-1509248961158-e54f6934749c',
        'https://images.unsplash.com/photo-1526314114033-349ef6f72220',
        'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1'
    ],
    'romance': [
        'https://images.unsplash.com/photo-1518895949257-7621c3c786d7',
        'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2',
        'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e'
    ]
};

// Function to get unique random image
function getUniqueRandomImage(genre, usedImages) {
    const images = genreImages[genre.toLowerCase()] || genreImages['adventure'];
    const filteredImages = images.filter(img => !usedImages.includes(img));
    if (filteredImages.length === 0) {
        return null; // No unique image available
    }
    const randomIndex = Math.floor(Math.random() * filteredImages.length);
    return filteredImages[randomIndex];
}

// Function to get story image based on genre
function getStoryImage(genre) {
    const defaultImages = genreImages['adventure']; // Default to adventure if genre not found
    const images = genreImages[genre.toLowerCase()] || defaultImages;
    const randomIndex = Math.floor(Math.random() * images.length);
    return images[randomIndex];
}

// Variables to control narration
let currentUtterance = null;
let usedImages = [];

// Function to display story
function displayStory(story) {
    const currentGenre = document.querySelector('button[data-type="genre"].selected')?.dataset.value;
    const imageUrl = getUniqueRandomImage(currentGenre, usedImages);
    if (imageUrl) {
        usedImages.push(imageUrl); // Add to used images
    }

    storyContainer.innerHTML = `
        <div class="story-image">
            <img src="${imageUrl || getStoryImage(currentGenre)}" alt="Story illustration" 
                 onerror="this.src='https://images.unsplash.com/photo-1519681393784-d120267933ba'"
                 style="width: 100%; max-height: 300px; object-fit: cover; border-radius: 8px; margin-bottom: 20px;">
        </div>
        <div class="story-text">${story}</div>
        <div class="share-buttons">
            <button class="share-btn download-btn" onclick="downloadStory()">
                <i class="fas fa-download"></i> Download Story
            </button>
            <button class="share-btn copy-btn" onclick="copyStory()">
                <i class="fas fa-copy"></i> Copy Story
            </button>
            <button class="share-btn narrate-btn" onclick="playNarration('${story.replace(/'/g, '\\' + '\' + ')}')">
                <i class="fas fa-volume-up"></i> Play Narration
            </button>
        </div>
    `;
    
    storyContainer.style.display = 'block';
}

// Function to generate story using Google Gemini API
async function generateStory(prompt, genre, tone, length, language, addMoral, addTitle) {
    const API_KEY = 'AIzaSyA0DvdhlFLvVWKkwKqHADHZPqbN3bVxbYQ';
    const API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent';

    let storyPrompt = `Write a ${length} ${tone} ${genre} story`;
    
    if (addTitle) {
        storyPrompt += ' with a creative title';
    }
    
    if (addMoral) {
        storyPrompt += ' and a moral lesson';
    }

    if (language === 'hindi') {
        storyPrompt += ' in Hindi language';
    } else if (language === 'hinglish') {
        storyPrompt += ' in Hinglish (Hindi written in English)';
    }

    storyPrompt += ` based on this idea: ${prompt}`;

    // Validate prompt length
    if (prompt.length < 5) {
        throw new Error('Please Enter Valid Prompt Your Prompt Is Very Short');
    }

    try {
        console.log('Sending request with prompt:', storyPrompt); // Debug log

        const response = await fetch(`${API_URL}?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: storyPrompt
                    }]
                }]
            })
        });

        const data = await response.json();
        console.log('API Response:', data); // Log the API response

        if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
            console.error('Invalid API Response Structure:', data); // Debug log
            throw new Error('Invalid story content received from API');
        }

        const storyText = data.candidates[0].content.parts[0].text.trim();
        
        if (!storyText) {
            throw new Error('Empty story received from API');
        }

        return storyText;
    } catch (error) {
        console.error('Story Generation Error:', error); // Debug log
        showError(error.message || 'Failed to generate story. Please try again.');
        throw error;
    }
}

// Function to play narration of the story
function playNarration(story) {
    if (currentUtterance) {
        speechSynthesis.cancel(); // Stop any ongoing narration
    }
    
    const selectedLanguage = document.getElementById('language').value;
    const utterance = new SpeechSynthesisUtterance(story);
    
    // Set language based on selection
    if (selectedLanguage === 'hindi') {
        utterance.lang = 'hi-IN'; // Hindi
        utterance.rate = 0.9; // Slightly slower rate for Hindi
    } else if (selectedLanguage === 'hinglish') {
        utterance.lang = 'hi-IN'; // Use Hindi voice for Hinglish
        utterance.rate = 0.9;
    } else {
        utterance.lang = 'en-US'; // English
    }
    
    // Get available voices
    const voices = speechSynthesis.getVoices();
    
    // Try to find a voice for the selected language
    const voice = voices.find(v => v.lang.startsWith(utterance.lang)) || voices[0];
    if (voice) {
        utterance.voice = voice;
    }
    
    utterance.onstart = () => console.log('Narration started');
    utterance.onend = () => {
        console.log('Narration ended');
        currentUtterance = null;
    };
    utterance.onerror = (event) => console.error('Speech synthesis error:', event);
    
    currentUtterance = utterance;
    speechSynthesis.speak(utterance);
}

// Function to pause narration
function pauseNarration() {
    if (currentUtterance) {
        speechSynthesis.pause();
        console.log('Narration paused'); // Debug log
    }
}

// Function to stop narration
function stopNarration() {
    if (currentUtterance) {
        speechSynthesis.cancel();
        console.log('Narration stopped'); // Debug log
        currentUtterance = null; // Clear current utterance
    }
}

// Event listeners for control buttons
document.getElementById('playBtn').addEventListener('click', () => {
    const story = document.querySelector('.story-text').innerText;
    playNarration(story);
});

document.getElementById('pauseBtn').addEventListener('click', pauseNarration);

document.getElementById('stopBtn').addEventListener('click', stopNarration);

// Function to check if Speech Synthesis API is available
function checkSpeechSynthesisAvailability() {
    if ('speechSynthesis' in window) {
        console.log('Speech Synthesis API is available.');
        // Play a simple test phrase
        const testText = 'welocome to STORY FORGE BY Utsav Raj.';
        const utterance = new SpeechSynthesisUtterance(testText);
        utterance.lang = 'en-US';
        utterance.onstart = () => console.log('Test narration started');
        utterance.onend = () => console.log('Test narration ended');
        utterance.onerror = (event) => console.error('Speech synthesis error:', event);
        speechSynthesis.speak(utterance);
    } else {
        console.error('Speech Synthesis API is not supported in this browser.');
        showError('Speech Synthesis API is not supported in this browser.');
    }
}

// Call the check function on script load
checkSpeechSynthesisAvailability();

// Function to show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        background-color: #ffebee;
        color: #c62828;
        padding: 15px;
        margin: 10px 0;
        border-radius: 5px;
        border-left: 5px solid #c62828;
        font-size: 14px;
    `;
    
    // Remove any existing error messages
    const existingError = document.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Insert error message before the story container
    storyContainer.parentNode.insertBefore(errorDiv, storyContainer);
    
    // Auto-remove error after 5 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Function to show loading state
function showLoading() {
    generateBtn.disabled = true; // Disable the button while loading
    storyContainer.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Creating your story...</p>
        </div>
    `;
    storyContainer.style.display = 'block';
}

// Function to hide loading state
function hideLoading() {
    generateBtn.disabled = false; // Re-enable the button after loading
}

// Event listener for generate button
generateBtn.addEventListener('click', async () => {
    const prompt = promptInput.value.trim();
    const selectedGenre = document.querySelector('button[data-type="genre"].selected')?.dataset.value;
    const selectedTone = document.querySelector('button[data-type="tone"].selected')?.dataset.value;
    const selectedLength = document.querySelector('button[data-type="length"].selected')?.dataset.value;
    const selectedLanguage = languageSelect.value;
    const includeMoral = document.getElementById('addMoral').value === 'true';
    const includeTitle = document.getElementById('addTitle').value === 'true';

    console.log('Include Moral:', includeMoral); // Debug log
    console.log('Include Title:', includeTitle); // Debug log

    if (!prompt) {
        showError('Please enter a story prompt');
        return;
    }

    if (!selectedGenre || !selectedTone || !selectedLength) {
        showError('Please select genre, tone, and length');
        return;
    }

    showLoading(); // Show loading state before generating the story

    try {
        const story = await generateStory(prompt, selectedGenre, selectedTone, selectedLength, selectedLanguage, includeMoral, includeTitle);
        displayStory(story);
    } catch (error) {
        showError(error.message || 'Failed to generate story. Please try again.');
    } finally {
        hideLoading(); // Hide loading state after generating the story
    }
});

// Event listeners for buttons
document.querySelectorAll('button[data-type]').forEach(button => {
    button.addEventListener('click', () => {
        const type = button.dataset.type;
        document.querySelectorAll(`button[data-type="${type}"]`).forEach(btn => {
            btn.classList.remove('selected');
        });
        button.classList.add('selected');
    });
});

// Download story function
function downloadStory() {
    const storyText = document.querySelector('.story-text').textContent;
    const blob = new Blob([storyText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my_story.txt';
    a.click();
    window.URL.revokeObjectURL(url);
}

// Copy story function
function copyStory() {
    const storyText = document.querySelector('.story-text').textContent;
    try {
        navigator.clipboard.writeText(storyText);
        alert('Story copied to clipboard!');
    } catch (err) {
        console.error('Failed to copy text: ', err);
    }
}

// Add styles for story image
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    .story-image {
        width: 100%;
        max-height: 300px;
        overflow: hidden;
        border-radius: 10px;
        margin-bottom: 1rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .story-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
    }

    .story-image img:hover {
        transform: scale(1.05);
    }
`;
document.head.appendChild(styleSheet);
