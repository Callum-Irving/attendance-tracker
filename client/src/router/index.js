import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';

const routes = [
	{
		path: '/',
		name: 'Home',
		component: Home,
		props: (route) => ({
			oauthCode: route.query.code,
			success: route.query.success,
			errorMsg: route.query.errorMsg,
		}),
	},
	{
		path: '/admin',
		name: 'Admin',
		component: () => import('../views/Admin.vue'),
	},
];

const router = createRouter({
	history: createWebHistory(process.env.BASE_URL),
	routes,
});

export default router;
