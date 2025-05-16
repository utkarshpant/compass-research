import { QdrantClient } from '@qdrant/js-client-rest';

export const qdrant = new QdrantClient({
	url: process.env.QDRANT_URL,
});

const COLLECTION = 'resources';
const VECTOR_SIZE = 1536; // OpenAI's embedding size

(async function ensureCollectionExists() {
    const collectionExists = await qdrant
		.getCollections()
		.then((result) => result.collections.some((collection) => collection.name === COLLECTION));
	if (!collectionExists) {
		await qdrant.createCollection(COLLECTION, {
			vectors: {
				size: VECTOR_SIZE,
				distance: 'Cosine',
			},
			optimizers_config: {
				default_segment_number: 0,
			},
		});
	}
})();
