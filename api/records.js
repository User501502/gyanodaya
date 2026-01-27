const mongoose = require('mongoose');

// A generic record schema for Calendar events, Fee rows, Book entries, etc.
const RecordSchema = new mongoose.Schema({
    category: { type: String, required: true }, // "fees", "books", "calendar"
    col1: String, // e.g. Class name / Date
    col2: String, // e.g. Fee amount / Event Title
    col3: String, // e.g. Frequency / Description
    col4: String, // Optional 4th column
    position: { type: Number, default: Date.now },
    createdAt: { type: Date, default: Date.now }
});

const Record = mongoose.model('Record', RecordSchema);

module.exports = (router) => {
    router.get('/records', async (req, res) => {
        try {
            const { category } = req.query;
            const query = category ? { category } : {};
            const records = await Record.find(query).sort({ position: 1 });
            res.json(records);
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

    router.post('/records', async (req, res) => {
        try {
            const record = new Record(req.body);
            await record.save();
            res.status(201).json(record);
        } catch (err) { res.status(400).json({ error: err.message }); }
    });

    router.put('/records/:id', async (req, res) => {
        try {
            const record = await Record.findByIdAndUpdate(req.params.id, req.body, { new: true });
            res.json(record);
        } catch (err) { res.status(400).json({ error: err.message }); }
    });

    router.delete('/records/:id', async (req, res) => {
        try {
            await Record.findByIdAndDelete(req.params.id);
            res.json({ message: 'Record deleted' });
        } catch (err) { res.status(500).json({ error: err.message }); }
    });
};
