const express = require('express');
const router = express.Router();
const Section = require('../models/Section');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

// ─── GET all sections (public — homepage needs this) ───────────────────────
router.get('/', async (req, res) => {
    try {
        const sections = await Section.find().sort({ order: 1 });
        res.json(sections);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ─── POST add section (admin only — always appended at bottom) ─────────────
router.post('/', protect, authorize(['admin']), async (req, res) => {
    try {
        const { title } = req.body;
        if (!title || !title.trim()) {
            return res.status(400).json({ message: 'Section title is required.' });
        }

        // Find current max order value so new section goes to the bottom
        const last = await Section.findOne().sort({ order: -1 }).lean();
        const newOrder = last ? last.order + 1 : 1;

        const section = new Section({ title: title.trim(), order: newOrder });
        await section.save();

        res.status(201).json(section);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ─── DELETE section (admin only) ───────────────────────────────────────────
router.delete('/:id', protect, authorize(['admin']), async (req, res) => {
    try {
        const deleted = await Section.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Section not found.' });
        res.json({ success: true, message: 'Section deleted.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
