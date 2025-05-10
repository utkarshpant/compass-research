import { type RouteConfig, index, layout, prefix, route } from '@react-router/dev/routes';

export default [
	index('routes/index.tsx'),
	route('workspace/:workspaceId', 'routes/workspace.tsx'),
	...prefix('api', [
		...prefix('workspace', [
			/* supply a research question and create a workspace for it  */
			index('routes/api/workspace.tsx'),
			/* for now, toggles the primary idea of the workspace */
			route('update', 'routes/api/update-workspace.tsx'), 
		]),
		/** upload a file and create a new resource linked to a workspace */
		route('resource', 'routes/api/resource.ts'),
	]),
	/* Manage resources */
] satisfies RouteConfig;
