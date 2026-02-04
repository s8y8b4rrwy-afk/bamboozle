const fs = require('fs');
const path = require('path');
const md5 = require('md5');
const textToSpeech = require('@google-cloud/text-to-speech');

// Initialize Google Cloud TTS Client
// Credentials should be set via GOOGLE_APPLICATION_CREDENTIALS env var
const client = new textToSpeech.TextToSpeechClient();

const CACHE_DIR = '/tmp/bamboozle_audio_cache';

// Ensure base cache dir exists
if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
}

// Voice Configuration Map
// Strategy: Use Wavenet for balance of quality, speed, and cost.
const VOICE_CONFIG = {
    'en': { languageCode: 'en-US', name: 'en-US-Wavenet-F', ssmlGender: 'FEMALE' },
    'el': { languageCode: 'el-GR', name: 'el-GR-Wavenet-A', ssmlGender: 'FEMALE' }
    // Add more languages here (e.g., 'es', 'fr')
};

const getVoiceConfig = (lang) => {
    return VOICE_CONFIG[lang] || VOICE_CONFIG['en'];
};

const ttsService = {
    /**
     * Generates audio for the given text, caches it in the room folder, and returns the URL path.
     * @param {string} text - The text to speak
     * @param {string} language - Language code (e.g., 'en', 'el')
     * @param {string} roomCode - The room code for isolation
     * @returns {Promise<{file: string, isHit: boolean}>}
     */
    getAudio: async (text, language, roomCode) => {
        try {
            if (!text || !roomCode) throw new Error('Text and RoomCode are required');

            // 1. Create room directory if needed
            const roomDir = path.join(CACHE_DIR, roomCode);
            if (!fs.existsSync(roomDir)) {
                fs.mkdirSync(roomDir, { recursive: true });
            }

            // 2. Generate Hash
            const hash = md5(`${text}-${language}`);
            const filename = `${hash}.mp3`;
            const filePath = path.join(roomDir, filename);

            // 3. Check Cache
            if (fs.existsSync(filePath)) {
                console.log(`[TTS] Cache HIT for "${text}" in room ${roomCode}`);
                return { file: filename, isHit: true };
            }

            console.log(`[TTS] Cache MISS for "${text}" in room ${roomCode}. Calling Google...`);

            // 4. API Call
            const voiceConfig = getVoiceConfig(language);
            const request = {
                input: { text: text },
                voice: {
                    languageCode: voiceConfig.languageCode,
                    name: voiceConfig.name,
                    ssmlGender: voiceConfig.ssmlGender
                },
                audioConfig: {
                    audioEncoding: 'MP3',
                    pitch: 0,
                    speakingRate: 1.1 // Slightly faster for a more energetic feel
                },
            };

            const [response] = await client.synthesizeSpeech(request);

            // 5. Write to File
            const writeFile = util.promisify(fs.writeFile);
            await writeFile(filePath, response.audioContent, 'binary');

            return { file: filename, isHit: false };

        } catch (error) {
            console.error('[TTS] Error generating speech:', error);
            throw error;
        }
    },

    /**
     * Deletes the cache folder for a specific room.
     * @param {string} roomCode 
     */
    cleanupRoom: (roomCode) => {
        try {
            const roomDir = path.join(CACHE_DIR, roomCode);
            if (fs.existsSync(roomDir)) {
                fs.rmSync(roomDir, { recursive: true, force: true });
                console.log(`[TTS] Cleaned up cache for room ${roomCode}`);
            }
        } catch (e) {
            console.error(`[TTS] Failed to cleanup room ${roomCode}:`, e);
        }
    }
};

const util = require('util');

module.exports = ttsService;
