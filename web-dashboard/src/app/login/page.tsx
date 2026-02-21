import { login } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Truck } from "lucide-react";

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string; message?: string }>;
}) {
    const sp = await searchParams;
    const error = sp?.error === "true";
    const message = sp?.message || "Invalid credentials.";

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#F8F9FA]">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-sm border border-gray-200">

                <div className="flex flex-col items-center space-y-2 text-center">
                    <div className="p-3 bg-indigo-50 rounded-full">
                        <Truck size={32} className="text-indigo-600" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Welcome back</h1>
                    <p className="text-sm text-gray-500">
                        Enter your email to sign in to your role.
                    </p>
                </div>

                {error && (
                    <div className="p-3 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md text-center">
                        {message}
                    </div>
                )}

                <form className="space-y-4" action={login}>
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-700">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="m@example.com"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-gray-700">Password</Label>
                        <Input id="password" name="password" type="password" required />
                    </div>
                    <Button type="submit" className="w-full">
                        Sign In
                    </Button>
                </form>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-gray-400">
                            Or quick login as
                        </span>
                    </div>
                </div>

                {/* Quick Login Buttons */}
                <div className="grid grid-cols-2 gap-3">
                    <form action={login}>
                        <input type="hidden" name="email" value="manager@fleetflow.com" />
                        <input type="hidden" name="password" value="pass123" />
                        <Button variant="outline" type="submit" className="w-full h-auto py-2.5 flex flex-col items-center justify-center text-xs font-semibold border-gray-200 hover:border-indigo-200 hover:bg-indigo-50/50">
                            <span className="text-indigo-600">Manager</span>
                        </Button>
                    </form>

                    <form action={login}>
                        <input type="hidden" name="email" value="dispatcher@fleetflow.com" />
                        <input type="hidden" name="password" value="pass123" />
                        <Button variant="outline" type="submit" className="w-full h-auto py-2.5 flex flex-col items-center justify-center text-xs font-semibold border-gray-200 hover:border-emerald-200 hover:bg-emerald-50/50">
                            <span className="text-emerald-600">Dispatcher</span>
                        </Button>
                    </form>

                    <form action={login}>
                        <input type="hidden" name="email" value="safety@fleetflow.com" />
                        <input type="hidden" name="password" value="pass123" />
                        <Button variant="outline" type="submit" className="w-full h-auto py-2.5 flex flex-col items-center justify-center text-xs font-semibold border-gray-200 hover:border-amber-200 hover:bg-amber-50/50">
                            <span className="text-amber-600">Safety Officer</span>
                        </Button>
                    </form>

                    <form action={login}>
                        <input type="hidden" name="email" value="finance@fleetflow.com" />
                        <input type="hidden" name="password" value="pass123" />
                        <Button variant="outline" type="submit" className="w-full h-auto py-2.5 flex flex-col items-center justify-center text-xs font-semibold border-gray-200 hover:border-violet-200 hover:bg-violet-50/50">
                            <span className="text-violet-600">Finance Analyst</span>
                        </Button>
                    </form>
                </div>

                <div className="text-xs text-center text-gray-400 mt-4">
                    Test Password: <code className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-[11px]">pass123</code>
                </div>
            </div>
        </div>
    );
}
