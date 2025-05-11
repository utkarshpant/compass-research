import { FileUpload, parseFormData } from "@mjackson/form-data-parser";
import prisma from "~/.server/db";
import { minioFileStorage } from "~/.server/fileUploadHandler";
import type { Route } from "./+types/resource";

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
    prisma.resource
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
        })
        .catch((error) => {
            console.error('Error creating resource:', error);
        });
    return { file };
}