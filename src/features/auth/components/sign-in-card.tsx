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
import React, { useState } from "react";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { AuthFlow } from "../types";
import { TriangleAlert } from "lucide-react";

import { useAuthActions } from "@convex-dev/auth/react";

interface SignInCardProps {
  setState: (state: AuthFlow) => void;
  flow: AuthFlow;
}

const SignInCard = ({ setState, flow }: SignInCardProps) => {
  const { signIn } = useAuthActions();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [authPending, setauthPending] = useState(false);

  const onPasswordSignIn = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setauthPending(true);
    signIn("password", { email, password, flow })
      .catch(() => setError("Invalid Email or Password"))
      .finally(() => {
        setauthPending(false);
      });
  };

  const handleProviderSignIn = (value: "github" | "google") => {
    setauthPending(true);
    void signIn(value).then(() => setauthPending(false));
  };

  return (
    <Card className="w-full h-full p-8">
      <CardHeader className="px-0 pt-0">
        <CardTitle>Log in to continue</CardTitle>
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
        <form className="space-y-2.5" onSubmit={onPasswordSignIn}>
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
          <Button
            type="submit"
            className="w-full"
            size={"lg"}
            disabled={authPending}
          >
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
            onClick={() => handleProviderSignIn("google")}
          >
            <FcGoogle className="absolute size-5 left-2.5 top-2.5" />
            Continue with Google
          </Button>
          <Button
            size="lg"
            className="w-full relative"
            disabled={authPending}
            variant={"outline"}
            onClick={() => handleProviderSignIn("github")}
          >
            <FaGithub className="absolute size-5 left-2.5 top-2.5" />
            Continue with Github
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Don&apos;t have an account?
          <span
            onClick={() => setState("signUp")}
            className="text-sky-700 hover:underline cursor-pointer"
          >
            Sign up
          </span>
        </p>
      </CardContent>
    </Card>
  );
};

export default SignInCard;
