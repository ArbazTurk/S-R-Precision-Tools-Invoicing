import { signInAction } from "@/app/actions";
import { FormMessage } from "@/components/form-message"; // Assuming FormMessage can handle a simple string error
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Define a type for the expected searchParams structure, wrapped in a Promise
interface LoginPageProps {
  searchParams: Promise<{ error?: string }>; // Update to indicate searchParams is a Promise
}

// Make component async and handle searchParams as a Promise
export default async function Login(props: LoginPageProps) {
  // Await the searchParams to get the resolved object
  const searchParams = await props.searchParams;
  const error = searchParams?.error;
  // Construct a message object for FormMessage based on the error string
  const message = error
    ? { type: "error" as const, text: error } // Example structure
    : undefined;

  return (
    <form className="flex-1 flex flex-col min-w-64 mt-10 mx-2">
      <h1 className="text-2xl font-medium">Sign in</h1>
      <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          placeholder="you@example.com"
          required
        />
        <div className="flex justify-between items-center">
          <Label htmlFor="password">Password</Label>
        </div>
        <Input
          id="password"
          type="password"
          name="password"
          placeholder="Your password"
          required
        />
        <SubmitButton pendingText="Signing In..." formAction={signInAction}>
          Sign in
        </SubmitButton>
        {/* Pass the constructed message object or the error string */}
        <FormMessage message={message} />
      </div>
    </form>
  );
}
