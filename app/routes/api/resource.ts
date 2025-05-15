import { FileUpload, parseFormData } from '@mjackson/form-data-parser';
import prisma from '~/.server/db';
import { minioFileStorage } from '~/.server/fileUploadHandler';
import type { Route } from './+types/resource';
import { resourceQueue } from '~/.server/queues';

export function loader({}: Route.LoaderArgs) {
	return null;
}

export async function action({ request }: Route.ActionArgs) {
	const searchParams = new URL(request.url).searchParams;
	const workspaceId = searchParams.get('workspace');
	async function uploadHandler(fileUpload: FileUpload) {
		if (fileUpload.fieldName === 'compass-pdf') {
			await minioFileStorage.set(`${workspaceId}/${fileUpload.name}`, fileUpload);
			return await minioFileStorage.get(`${workspaceId}/${fileUpload.name}`);
		}
	}

	const formData = await parseFormData(request, uploadHandler);
	const file = formData.get('compass-pdf') as File;
	const resource = await prisma.resource
		.create({
			data: {
				// originalName and name
				externalId: file.name,
				originalName: file.name.split('/')[1],
				type: 'FILE',
				embeddingStatus: 'PENDING',
				workspaces: {
					connect: {
						id: workspaceId as string,
					},
				},
			},
		});

	const job = await resourceQueue.add('resource', {
		resourceId: resource.id,
		// workspaceId: workspaceId,
		// fileName: file.name,
		// fileStream: file.stream(),
	});

	// return the job ID to the client so that the events can be traced;
	return {
		job: {
			id: job.id,
		},
	};
}
