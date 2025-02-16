import useAuthStore from '@/store/auth';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth')({
    loader: () => {
		const user = useAuthStore.getState().user;

		console.log(user)
		if (user) {
			throw redirect({
				to: "/locker"
			});
		}
	},
  component: RouteComponent,
})

function RouteComponent() {
  return <Outlet />
}
