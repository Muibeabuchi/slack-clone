"use client"; // Error boundaries must be Client Components

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="h-full gap-y-2 flex flex-col justify-center items-center bg-gray-300">
      <Image
        src="/4375082_logo_slack_hashtag_icon.svg"
        alt="slack hashtag svg"
        width={300}
        height={300}
      />
      <h2 className=" font-bold text-slate-900">
        OOps!!...Something went wrong!
      </h2>
      <p className="text-sm font-thin italic">Seems you are on a wrong page</p>
      <Button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      >
        Try again
      </Button>
    </div>
  );
}
