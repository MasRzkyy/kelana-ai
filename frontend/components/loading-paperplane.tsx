"use client";

import { useLottie, LottieDisplay } from "lottie-react";
import { useEffect } from "react";
import paperplaneData from "@/public/Loading 40 _ Paperplane.json";

export default function LoadingPaperplane() {
  const lottie = useLottie({
    src: paperplaneData,
    loop: true,
    autoplay: false,
  });

  useEffect(() => {
    lottie.play();
  }, [lottie]);

  return (
    <div className="w-48 h-48 mx-auto flex items-center justify-center">
      <LottieDisplay
        lottie={lottie}
        className="w-full h-full object-contain"
      />
    </div>
  );
}
