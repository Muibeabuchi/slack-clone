import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { AuthFlow } from "../types";
import { TriangleAlert } from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";

interface SignUpCardProps {
  setState: (state: AuthFlow) => void;
  flow: AuthFlow;
}

const SignUpCard = ({ setState, flow }: SignUpCardProps) => {
  const { signIn } = useAuthActions();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [authPending, setauthPending] = useState(false);

  const onPasswordSignUp = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError("Password do not match");
    }

    setauthPending(true);

    signIn("password", { email, password, name, flow })
      .catch(() => setError("Something went wrong"))
      .finally(() => {
        setauthPending(false);
      });
  };

  const handleProviderSignUp = (value: "github" | "google") => {
    setauthPending(true);
    void signIn(value).then(() => setauthPending(false));
  };

  return (
    <Card className="w-full h-full p-8">
      <CardHeader className="px-0 pt-0">
        <CardTitle>Sign up to continue</CardTitle>
        <CardDescription>
          Use your email or another service to continue
        </CardDescription>
      </CardHeader>
      {error && (
        <div className="gap-x-2 text-sm text-destructive mb-6 bg-destructive/15 p-3 rounded-md flex items-center">
          <TriangleAlert className="size-4" />
          <p>{error}</p>
        </div>
      )}
      <CardContent className="space-y-5 px-0 pb-0">
        <form className="space-y-2.5" onSubmit={onPasswordSignUp}>
          <Input
            disabled={authPending}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
            placeholder="Full Name"
            type="text"
            required
          />
          <Input
            disabled={authPending}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            placeholder="Email"
            type="email"
            required
          />
          <Input
            disabled={authPending}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            placeholder="Password"
            type="password"
            required
          />
          <Input
            disabled={authPending}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
            }}
            placeholder="Confirm password"
            type="password"
            required
          />
          <Button type="submit" className="w-full" size={"lg"} disabled={false}>
            Continue
          </Button>
        </form>
        <Separator />
        <div className="flex flex-col gap-y-2.5">
          <Button
            size="lg"
            className="w-full relative"
            disabled={authPending}
            variant={"outline"}
            onClick={() => handleProviderSignUp("google")}
          >
            <FcGoogle className="absolute size-5 left-2.5 top-2.5" />
            Continue with Google
          </Button>
          <Button
            size="lg"
            className="w-full relative"
            disabled={authPending}
            variant={"outline"}
            onClick={() => handleProviderSignUp("github")}
          >
            <FaGithub className="absolute size-5 left-2.5 top-2.5" />
            Continue with Github
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Already have an account?
          <span
            onClick={() => setState("signIn")}
            className="text-sky-700 hover:underline cursor-pointer"
          >
            Sign in
          </span>
        </p>
      </CardContent>
    </Card>
  );
};

export default SignUpCard;
