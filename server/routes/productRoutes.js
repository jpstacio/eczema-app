const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const { Product, UsageLog } = require('../models');

/* --------  PRODUCTS  -------- */

// GET /product – list all products for the logged-in user
router.get('/', authenticateToken, async (req, res) => {
  const products = await Product.findAll({ where: { userId: req.user.userId } });
  res.json(products);
  console.log('Decoded user in token:', req.user);
});

// POST /product – add a new product
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, type, frequency, startDate, endDate } = req.body;
    const product = await Product.create({
      userId: req.user.userId,
      name,
      type,
      frequency,
      startDate,
      endDate,
    });
    res.status(201).json(product);
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// PUT /product/:id – update a product
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [updated] = await Product.update(req.body, {
      where: { id, userId: req.user.userId },
    });

    if (updated === 0) {
      return res.status(404).json({ error: 'Product not found or not authorized' });
    }

    res.json({ message: 'Product updated' });
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE /product/:id – delete a product
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await Product.destroy({ where: { id, userId: req.user.userId } });

    if (deleted === 0) {
      return res.status(404).json({ error: 'Product not found or not authorized' });
    }

    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

/* --------  USAGE LOGS  -------- */

// POST /product/:id/log – add a usage log for a product
router.post('/:id/log', authenticateToken, async (req, res) => {
  const id = parseInt(req.params.id);
  const { notes, dateUsed = new Date() } = req.body;
  const product = await Product.findOne({ where: { id, userId: req.user.userId } });

  if (!product) return res.status(404).json({ error: 'Product not found' });

  const log = await UsageLog.create({ productId: id, dateUsed, notes });
  console.log('Created log for product ID:', id);
  res.status(201).json(log);
});

// GET /product/:id/logs – list all usage logs for a product
router.get('/:id/logs', authenticateToken, async (req, res) => {
  const id = parseInt(req.params.id);
  const product = await Product.findOne({ where: { id, userId: req.user.userId } });

  if (!product) return res.status(404).json({ error: 'Product not found' });

  const logs = await UsageLog.findAll({
    where: { productId: id },
    order: [['dateUsed', 'DESC']],
  });

  console.log('Fetched logs for product ID:', id);
  res.json(logs);
});

// GET /product/:id – fetch a single product by ID for the logged-in user
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const product = await Product.findOne({
      where: { id, userId: req.user.userId }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found or not authorized' });
    }

    res.json(product);
  } catch (err) {
    console.error('Error fetching product by ID:', err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// GET /product/:productId/logs/:logId – get a single log
router.get('/:productId/logs/:logId', authenticateToken, async (req, res) => {
  const { productId, logId } = req.params;

  const product = await Product.findOne({
    where: { id: productId, userId: req.user.userId },
  });
  if (!product) return res.status(404).json({ error: 'Product not found' });

  const log = await UsageLog.findOne({
    where: { id: logId, productId },
  });

  if (!log) return res.status(404).json({ error: 'Log not found' });

  res.json(log);
});

// PUT /product/:id/logs/:logId – update a usage log
router.put('/:id/logs/:logId', authenticateToken, async (req, res) => {
  const { id, logId } = req.params;
  const { notes, dateUsed, sideEffects } = req.body;

  const product = await Product.findOne({ where: { id, userId: req.user.userId } });
  if (!product) return res.status(404).json({ error: 'Product not found' });

  const log = await UsageLog.findOne({ where: { id: logId, productId: id } });
  if (!log) return res.status(404).json({ error: 'Usage log not found' });

  await log.update({ notes, dateUsed, sideEffects });
  res.json(log);
});



module.exports = router;
