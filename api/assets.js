const mongoose = require('mongoose');

const AssetSchema = new mongoose.Schema({
    name: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, default: 'file' }, // image, pdf, etc.
    size: Number,
    createdAt: { type: Date, default: Date.now }
});

const Asset = mongoose.model('Asset', AssetSchema);

module.exports = (router) => {
    // GET all assets
    router.get('/assets', async (req, res) => {
        try {
            const assets = await Asset.find().sort({ createdAt: -1 });
            res.json(assets);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // POST new asset (file upload handled by middleware in server.js usually, but here we expect base64)
    router.post('/assets', async (req, res) => {
        try {
            const asset = new Asset(req.body);
            await asset.save();
            res.status(201).json(asset);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    });

    // DELETE asset
    router.delete('/assets/:id', async (req, res) => {
        try {
            await Asset.findByIdAndDelete(req.params.id);
            res.json({ message: 'Asset deleted' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });
};
