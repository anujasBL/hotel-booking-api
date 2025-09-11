import { Router } from 'express';
import { generateAllEmbeddings, checkEmbeddingStatus, testRagSearch } from '../controllers/testController';

const router = Router();

/**
 * @swagger
 * /api/v1/test/generate-embeddings:
 *   post:
 *     summary: Generate embeddings for all hotels (Test endpoint)
 *     tags: [Test]
 *     responses:
 *       200:
 *         description: Embeddings generated successfully
 */
router.post('/generate-embeddings', generateAllEmbeddings);

/**
 * @swagger
 * /api/v1/test/embedding-status:
 *   get:
 *     summary: Check which hotels have embeddings
 *     tags: [Test]
 *     responses:
 *       200:
 *         description: Embedding status retrieved
 */
router.get('/embedding-status', checkEmbeddingStatus);

/**
 * @swagger
 * /api/v1/test/rag-search:
 *   post:
 *     summary: Test RAG search with custom query
 *     tags: [Test]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               query:
 *                 type: string
 *                 example: "I need a room from Kandy today"
 *     responses:
 *       200:
 *         description: RAG search results
 */
router.post('/rag-search', testRagSearch);

export default router;
