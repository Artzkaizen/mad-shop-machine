import { Button } from "@/components/ui/button";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	loader: () => {
		  throw redirect({
			to: "/login",
		  });
	  },
	component: RouteComponent
});

function RouteComponent() {
	return (
		<div className="w-full h-screen flex flex-col gap-6 items-center justify-center">
			<Button asChild>
				<Link to="/login">Login</Link>
			</Button>
		</div>
	);
}
