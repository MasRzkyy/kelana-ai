"use client";

import { useLottie, LottieDisplay } from "lottie-react";
import { useEffect } from "react";
import worldMapData from "@/public/World map.json";

export default function WorldMapAnimation() {
  const lottie = useLottie({
    src: worldMapData,
    loop: true,
    autoplay: false,
  });

  useEffect(() => {
    lottie.play();
  }, [lottie]);

  return (
    <div className="w-full max-w-[500px] lg:max-w-[580px] mx-auto flex items-center justify-center">
      <LottieDisplay
        lottie={lottie}
        className="w-full h-auto opacity-95 hover:opacity-100 transition-opacity bg-transparent"
      />
    </div>
  );
}
