import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import { z } from "zod";

import { useLogin, useRegister } from "@/api/auth-query";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";

const authFormSchema = (type: "login" | "sign-up") => z.object({
    username: 
    type === "sign-up" ?
    z.string().min(2, {
        message: "Username must be at least 2 characters.",
    }) : z.string().optional(),
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
    password: z.string().min(6, {
        message: "Password must be at least 6 characters.",
    }),
})


export function LoginForm({
    className,
    ...props
}: React.ComponentPropsWithoutRef<"div">) {

    const isSignUp = location.pathname.includes("sign-up");
    const formSchema = isSignUp ? authFormSchema("sign-up") : authFormSchema("login");

    const login = useLogin();
    const register = useRegister();
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            email: "",
            password: "",
        },
    });

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        if (isSignUp) {
            if (!data.username) 
                throw new Error("Username is required");
            await register.mutateAsync({
                username: data.username,
                email: data.email,
                password: data.password
            });
        }
        else {
            await login.mutateAsync({
                identifier: data.email,
                password: data.password
            });
        }
        console.log(data);
    };


    return (
        <section className="dark flex flex-col items-center min-h-screen bg-gradient-to-br from-gray-900 to-black p-4">

        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <div className={cn("flex flex-col gap-6", className)} {...props}>
                    <Card className="bg-white/5 backdrop-blur-md  border-white/10">
                        <CardHeader>
                            <CardTitle className="text-2xl">{isSignUp ? "Sign up":"Login"}</CardTitle>
                            <CardDescription>
                                Enter your email below to login to your account
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                    <div className="flex flex-col gap-6">
                                       {
                                        isSignUp &&  <FormField
                                        control={form.control}
                                        name="username"
                                        render={({ field }) => (
                                            <FormItem className="group relative">
                                                <FormLabel
                                                    htmlFor={"id"}
                                                    className="origin-start absolute top-1/2 block -translate-y-1/2 cursor-text px-1 text-sm text-muted-foreground/70 transition-all group-focus-within:pointer-events-none group-focus-within:top-0 group-focus-within:cursor-default group-focus-within:text-xs group-focus-within:font-medium group-focus-within:text-foreground has-[+input:not(:placeholder-shown)]:pointer-events-none has-[+input:not(:placeholder-shown)]:top-0 has-[+input:not(:placeholder-shown)]:cursor-default has-[+input:not(:placeholder-shown)]:text-xs has-[+input:not(:placeholder-shown)]:font-medium has-[+input:not(:placeholder-shown)]:text-foreground"
                                                >
                                                    <span className="inline-flex bg-white/1 px-2">Username</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input placeholder="" {...field} />
                                                </FormControl>
                                                <FormMessage className="text-red-500" />
                                            </FormItem>
                                        )}
                                    />
                                       }
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem className="group relative">
                                                    <FormLabel
                                                        htmlFor={"id"}
                                                        className="origin-start absolute top-1/2 block -translate-y-1/2 cursor-text px-1 text-sm text-muted-foreground/70 transition-all group-focus-within:pointer-events-none group-focus-within:top-0 group-focus-within:cursor-default group-focus-within:text-xs group-focus-within:font-medium group-focus-within:text-foreground has-[+input:not(:placeholder-shown)]:pointer-events-none has-[+input:not(:placeholder-shown)]:top-0 has-[+input:not(:placeholder-shown)]:cursor-default has-[+input:not(:placeholder-shown)]:text-xs has-[+input:not(:placeholder-shown)]:font-medium has-[+input:not(:placeholder-shown)]:text-foreground"
                                                    >
                                                        <span className="inline-flex bg-white/1 px-2">Email</span>
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input placeholder=""  {...field} />
                                                    </FormControl>
                                                    <FormMessage  />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem className="group relative">
                                                    <div className="flex items-center">
                                                <Label htmlFor="password">Password</Label>
                                                <a
                                                    href="#"
                                                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                                                >
                                                    Forgot your password?
                                                </a>
                                            </div>
                                                    <FormControl>
                                                    <Input id="password" type="password" {...field} />
                                                    </FormControl>
                                                    <FormMessage  />
                                                </FormItem>
                                            )}
                                        />

                                        <Button type="submit" className="w-full">
                                            Login
                                        </Button>
                                    </div>
                                    <div className="mt-4 text-center text-sm">
                                        Don&apos;t have an account?{" "}
                                        <Link to={isSignUp ? "/login":"/sign-up"} className="underline underline-offset-4">
                                            { isSignUp ? "Login ":"Sign up"}
                                        </Link>
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
        </section>

    );
}