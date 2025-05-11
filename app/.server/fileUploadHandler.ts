// MinioFileStorage.ts
import { Client as MinioClient } from 'minio';
import type { FileStorage } from '@mjackson/file-storage';
import { type FileUpload } from '@mjackson/form-data-parser';
import { Readable } from 'stream';

const {
	MINIO_ROOT_USER,
	MINIO_ROOT_PASSWORD,
	MINIO_ENDPOINT = 'localhost',
	MINIO_PORT = '9000',
	MINIO_USE_SSL = 'false',
	MINIO_BUCKET = 'compass-pdfs',
} = process.env;

export const minio = new MinioClient({
	endPoint: 'localhost',
	port: Number(MINIO_PORT),
	useSSL: false,
	accessKey: MINIO_ROOT_USER,
	secretKey: MINIO_ROOT_PASSWORD,
});

// — Ensure bucket exists once at start‑up (idempotent)
(async () => {
	const exists = await minio.bucketExists(MINIO_BUCKET).catch(() => false);
	if (!exists) await minio.makeBucket(MINIO_BUCKET, '');
})();

export class MinioFileStorage implements FileStorage {
	async set(key: string, file: File): Promise<void> {
		const meta = {
			'Content-Type': file.type || 'application/octet-stream',
			'Original-Name': file.name,
		};
		const readableStream = Readable.fromWeb(file.stream());
		await minio.putObject(MINIO_BUCKET, key, readableStream, undefined, meta);
	}

	async get(key: string): Promise<File | null> {
		try {
			const stat = await minio.statObject(MINIO_BUCKET, key);
			const stream = await minio.getObject(MINIO_BUCKET, key);

			// Convert the stream back to a Web File so form‑data‑parser stays happy
			const chunks: Uint8Array[] = [];
			for await (const chunk of stream) chunks.push(chunk as Uint8Array);
			const blob = new Blob(chunks, { type: stat.metaData['Content-Type'] });
			return new File([blob], stat.metaData['Original-Name'] ?? key, {
				type: stat.metaData['Content-Type'],
				lastModified: stat.lastModified.getTime(),
			});
		} catch (err: any) {
			if (err.code === 'NotFound') return null;
			throw err;
		}
	}

	async has(id: string): Promise<boolean> {
		try {
			await minio.statObject(MINIO_BUCKET, id);
			return true;
		} catch (err: any) {
			if (err.code === 'NotFound') return false;
			throw err;
		}
	}

	async delete(id: string): Promise<void> {
		try {
			await minio.removeObject(MINIO_BUCKET, id);
		} catch (err: any) {
			if (err.code !== 'NotFound') throw err;
		}
	}
}

export const minioFileStorage = new MinioFileStorage();

// export async function uploadHandler(fileUpload: FileUpload) {
// 	if (fileUpload.fieldName === 'compass-pdf') {
// 		await minioFileStorage.set(fileUpload.name, fileUpload);
// 		return await minioFileStorage.get(fileUpload.name);
// 	}
// }

// /**
//  * 
//  * @param workspacePrefix - The prefix to add to file names. This should be the `workspaceId`.
//  * @returns an upload handler that will upload the file to MinIO with the given prefix.
//  */
// export function uploadHandlerFactory(workspacePrefix: string) {
// 	return async (fileUpload: FileUpload) => {
// 		if (fileUpload.fieldName === 'compass-pdf') {
// 			const key = `${workspacePrefix}-${fileUpload.name}`;
// 			await minioFileStorage.set(key, fileUpload);
// 			return await minioFileStorage.get(key);
// 		}
// 	};
// }