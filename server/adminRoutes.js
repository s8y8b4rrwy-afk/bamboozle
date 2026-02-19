const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const ttsService = require('./ttsService');

// --- DATA SOURCE LOADING ---
// Only load these on demand to save memory if not admin
const loadPhrases = (lang) => {
    // We need to read the TS files. Since this is a JS server, we can't import TS directly easily.
    // However, the patterns are simple enough to regex or we can just read the compiled JS if available.
    // BETTER STRATEGY: The server doesn't have the i18n code. The CLIENT has it.
    // The Admin UI should send the list of phrases to generate.
    // WAIT: sending 3000 phrases over JSON is fine (approx 100KB).
    return [];
};


// --- JOB MANAGER ---
const jobState = {
    isRunning: false,
    jobId: null,
    type: null,
    total: 0,
    current: 0,
    success: 0,
    hits: 0,
    failed: 0,
    errors: [], // { text, error }
    startTime: null
};

const FAILED_LOG_PATH = path.join(__dirname, 'data', 'failed_generations.json');

// Ensure data dir exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'));
}

const saveFailures = (failures) => {
    let existing = [];
    if (fs.existsSync(FAILED_LOG_PATH)) {
        try {
            existing = JSON.parse(fs.readFileSync(FAILED_LOG_PATH));
        } catch (e) { }
    }
    // Merge new failures
    const merged = [...existing, ...failures];
    // Deduplicate by text+language
    const unique = Array.from(new Map(merged.map(item => [item.text + item.language, item])).values());

    fs.writeFileSync(FAILED_LOG_PATH, JSON.stringify(unique, null, 2));
};

const processBatch = async (items, language) => {
    console.log(`[Admin] Starting job: ${items.length} items`);
    jobState.isRunning = true;
    jobState.startTime = Date.now();
    jobState.total = items.length;
    jobState.current = 0;
    jobState.success = 0;
    jobState.hits = 0;
    jobState.failed = 0;
    jobState.errors = [];

    // Process in chunks of 5
    const CHUNK_SIZE = 5;
    for (let i = 0; i < items.length; i += CHUNK_SIZE) {
        const chunk = items.slice(i, i + CHUNK_SIZE);
        if (i % 25 === 0) console.log(`[Admin] Processing item ${i}...`);

        await Promise.all(chunk.map(async (item) => {
            const text = typeof item === 'string' ? item : item.text;
            // Skip placeholders
            if (text.includes('{')) {
                jobState.current++;
                return;
            }

            try {
                // Determine language (override if item has specific language)
                const lang = item.language || language || 'en';

                const result = await ttsService.getAudio(text, lang, 'admin-job');
                if (result.isHit) {
                    jobState.hits++;
                } else {
                    jobState.success++;
                }
            } catch (e) {
                console.error(`[Admin] Failed item: "${text.substring(0, 20)}..." - ${e.message}`);
                jobState.failed++;
                jobState.errors.push({
                    text,
                    language: item.language || language || 'en',
                    error: e.message
                });
            } finally {
                jobState.current++;
            }
        }));

        // Small delay to be nice to API
        await new Promise(r => setTimeout(r, 100));

        // Stop if cancelled (not implemented yet, but good practice)
    }

    console.log(`[Admin] Job finished. Success: ${jobState.success}, Failed: ${jobState.failed}`);
    // Save failures to disk
    if (jobState.errors.length > 0) {
        saveFailures(jobState.errors);
    }

    jobState.isRunning = false;
};

// --- ROUTES ---

// GET /api/admin/status
router.get('/status', (req, res) => {
    res.json(jobState);
});

// POST /api/admin/generate
// Body: { items: string[], language: 'en' }
router.post('/generate', (req, res) => {
    if (jobState.isRunning) {
        return res.status(409).json({ error: 'Job already running' });
    }

    const { items, language } = req.body;
    if (!items || !Array.isArray(items)) {
        return res.status(400).json({ error: 'Items array required' });
    }

    // Start background job
    processBatch(items, language);

    res.json({ message: 'Job started', total: items.length });
});

// GET /api/admin/failures
router.get('/failures', (req, res) => {
    if (fs.existsSync(FAILED_LOG_PATH)) {
        const data = fs.readFileSync(FAILED_LOG_PATH);
        res.json(JSON.parse(data));
    } else {
        res.json([]);
    }
});

// POST /api/admin/retry
// Body: { items?: [] } -> if empty, retry all from file
router.post('/retry', (req, res) => {
    if (jobState.isRunning) {
        return res.status(409).json({ error: 'Job already running' });
    }

    let itemsToRetry = req.body.items;

    if (!itemsToRetry) {
        // Load from file
        if (fs.existsSync(FAILED_LOG_PATH)) {
            itemsToRetry = JSON.parse(fs.readFileSync(FAILED_LOG_PATH));
        } else {
            return res.status(400).json({ error: 'No failures to retry' });
        }
    }

    // Clear the failure file if we are retrying everything (optimistic)
    // Actually, better to keep it and remove only successful ones?
    // For simplicity: We will clear the file and let the job re-populate it if they fail again.
    if (!req.body.items) {
        fs.writeFileSync(FAILED_LOG_PATH, '[]');
    }

    processBatch(itemsToRetry, null); // items in file have language property

    res.json({ message: 'Retry job started', total: itemsToRetry.length });
});

// POST /api/admin/clear-failures
router.post('/clear-failures', (req, res) => {
    try {
        if (fs.existsSync(FAILED_LOG_PATH)) {
            fs.writeFileSync(FAILED_LOG_PATH, '[]');
        }
        res.json({ message: 'Failures cleared' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
