import { type RouteConfig, index, layout, route } from '@react-router/dev/routes';

export default [
	index('routes/index.tsx'),
	route('/workspace/:workspaceId', 'routes/workspace.tsx'),
	route('/api/conversation', 'routes/api/conversation.ts'),
	route('/api/workspace/update', 'routes/api/workspace.update.tsx'),
] satisfies RouteConfig;
