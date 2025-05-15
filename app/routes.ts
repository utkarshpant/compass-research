import { type RouteConfig, index, layout, prefix, route } from '@react-router/dev/routes';

export default [
	index('routes/index.tsx'),
	...prefix('workspace', [route(':id', 'routes/workspace.tsx')]),

	/**
	 * API Routes
	 */
	...prefix('api', [
		...prefix('workspace', [
			/* supply a research question and create a workspace for it  */
			index('routes/api/workspace.tsx'),
			/* for now, toggles the primary idea of the workspace */
			// TODO: Refactor this route to become :workspaceId/update
			route('update', 'routes/api/update-workspace.tsx'),
			route(
				':workspaceId/conversation',
				'routes/api/workspace.$workspaceId.conversation.ts'
			),
		]),
		/** upload a file and create a new resource linked to a workspace */
		...prefix('resource', [
			// create resource
			index('routes/api/resource.ts'),
			// get resource
			route(':id', 'routes/api/get-resource.ts'),
		]),
		route('job/:jobId', 'routes/api/job-status.ts'),
	]),
] satisfies RouteConfig;
