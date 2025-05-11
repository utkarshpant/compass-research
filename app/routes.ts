import { type RouteConfig, index, layout, prefix, route } from '@react-router/dev/routes';

export default [
	index('routes/index.tsx'),
	...prefix('workspace', [route(':id', 'routes/workspace.tsx')]),
	...prefix('api', [
		...prefix('workspace', [
			/* supply a research question and create a workspace for it  */
			index('routes/api/workspace.tsx'),
			/* for now, toggles the primary idea of the workspace */
			// TODO: Refactor this route to become :workspaceId/update
			route('update', 'routes/api/update-workspace.tsx'),
		]),
		/** upload a file and create a new resource linked to a workspace */
		...prefix('resource', [
			// create resource
			index('routes/api/resource.ts'),
			// get resource
			route(':id', 'routes/api/get-resource.ts'),
		]),
	]),
] satisfies RouteConfig;
