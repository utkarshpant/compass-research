import type { Route } from './+types/get-resource';
import prisma from '~/.server/db';
import { minio } from '~/.server/fileUploadHandler';

/**
 * This route is used to get a presigned URL for a Resource. Useful for preview URLs etc.
 */
export async function loader({ params }: Route.LoaderArgs) {
	const resource = await prisma.resource.findUnique({
		where: {
			id: params.id,
		},
	});
    if (resource) {
        const presignedGetObjectUrl = await minio.presignedGetObject(
            'compass-pdfs',
            resource.externalId,
            24 * 60 * 60
        );
        return presignedGetObjectUrl;
    }
}
