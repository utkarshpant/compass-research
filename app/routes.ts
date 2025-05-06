import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
	index('routes/index.tsx'),
	route('/api/conversation', 'routes/api/conversation.ts'),
	route('/api/workspace/update', 'routes/api/workspace.update.tsx'),
] satisfies RouteConfig;
