const fs = require('fs');
const path = require('path');
const md5 = require('md5');
const util = require('util');
const textToSpeech = require('@google-cloud/text-to-speech');
const { Storage } = require('@google-cloud/storage');

// Initialize Google Cloud Clients
const googleConfig = {};
const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || process.env.GOOGLE_CREDENTIALS_JSON;

if (credentialsJson) {
    try {
        googleConfig.credentials = JSON.parse(credentialsJson);
        console.log('[TTS] Using credentials from environment variable.');
    } catch (e) {
        console.error('[TTS] Failed to parse GOOGLE_CREDENTIALS:', e.message);
    }
}

const ttsClient = new textToSpeech.TextToSpeechClient(googleConfig);
const storage = new Storage(googleConfig);

// We default to a bucket, but this should be set in .env
const BUCKET_NAME = process.env.GCS_BUCKET_NAME || 'bamboozle-audio-assets';

// Determine Voice Configuration
const VOICE_CONFIG = {
    'en': { languageCode: 'en-US', name: 'en-US-Neural2-F', ssmlGender: 'FEMALE' },
    'el': { languageCode: 'el-GR', name: 'el-GR-Wavenet-A', ssmlGender: 'FEMALE' }
};

const getVoiceConfig = (lang) => {
    return VOICE_CONFIG[lang] || VOICE_CONFIG['en'];
};

// Memory Cache for Hit Tracking (optional, resets on restart)
const stats = {
    generated: 0,
    servedFromCache: 0,
    errors: 0
};

const ttsService = {
    /**
     * Generates audio for the given text, uploads to GCS, and returns the public URL.
     * Checks GCS first to avoid regeneration.
     * @param {string} text - The text to speak
     * @param {string} language - Language code
     * @param {string} roomCode - (Deprecated for storage, used for logging)
     * @returns {Promise<{url: string, isHit: boolean}>}
     */
    getAudio: async (text, language, roomCode) => {
        try {
            if (!text) throw new Error('Text is required');

            // 1. Generate Consistent Hash
            const hash = md5(`${text}-${language}`);
            const filename = `${hash}.mp3`;
            const bucket = storage.bucket(BUCKET_NAME);
            const file = bucket.file(filename);
            const publicUrl = `https://storage.googleapis.com/${BUCKET_NAME}/${filename}`;

            // 2. Check GCS Cache (Optimistic check via metadata/exists)
            const [exists] = await file.exists();
            if (exists) {
                console.log(`[TTS] CACHE HIT: "${text.substring(0, 30)}..."`);
                stats.servedFromCache++;
                return { file: filename, url: publicUrl, isHit: true };
            }

            console.log(`[TTS] GENERATING: "${text.substring(0, 30)}..."`);
            stats.generated++;

            // 3. Generate Audio via Google TTS
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
                    speakingRate: 1.1
                },
            };

            const [response] = await ttsClient.synthesizeSpeech(request);

            // 4. Upload to GCS
            await file.save(response.audioContent, {
                metadata: {
                    contentType: 'audio/mpeg',
                    cacheControl: 'public, max-age=31536000', // Cache for 1 year
                },
                resumable: false
            });

            // Make it public? 
            // If the bucket is not uniformly public, we might need:
            // await file.makePublic(); 
            // BUT for performance, we assume the bucket is configured as public readable.

            return { file: filename, url: publicUrl, isHit: false };

        } catch (error) {
            console.error('[TTS] Error generating/uploading speech:', error);
            stats.errors++;
            throw error;
        }
    },

    /**
     * Returns current usage stats.
     */
    getStats: () => {
        return stats;
    },

    /**
     * Deletes the cache (Dangerous).
     */
    clearCache: async () => {
        try {
            const [files] = await storage.bucket(BUCKET_NAME).getFiles();
            // Delete in parallel chunks (limit concurrency if needed, but GCS handles it well)
            // For simplicity:
            const deletePromises = files.map(f => f.delete());
            await Promise.all(deletePromises);

            console.log(`[TTS] Cleared ${files.length} files from GCS.`);
            return { deleted: files.length };
        } catch (e) {
            console.error('[TTS] Failed to clear cache:', e);
            throw e;
        }
    }
};

module.exports = ttsService;
