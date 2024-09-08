"use client";

import { useState } from "react";
import { AuthFlow } from "../types";
import SignInCard from "./sign-in-card";
import SignUpCard from "./sign-up-card";

export const AuthScreen = () => {
  const [state, setState] = useState<AuthFlow>("signIn");
  return (
    <div className="h-full flex justify-center items-center bg-[#5c3d58]">
      <div className="md:h-auto md:w-[420px]">
        {state === "signIn" ? (
          <SignInCard setState={setState} flow={state} />
        ) : (
          <SignUpCard setState={setState} flow={state} />
        )}
      </div>
    </div>
  );
};
