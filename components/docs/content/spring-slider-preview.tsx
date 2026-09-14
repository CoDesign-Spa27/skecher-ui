"use client";

import { useState } from "react";

import { SpringSlider } from "@/components/ui-components/spring-slider";
export function SpringSliderPreview() {
 
  const [volume, setVolume] = useState(65);

  return (
    <div className="flex w-full max-w-lg flex-col gap-12 px-2 py-4">
      <div className="flex flex-col gap-3">
      
        <SpringSlider
          aria-label="Volume"
          onValueChange={setVolume}
  
          value={volume}
          valueText={(value) => `${value} percent`}
        />
      </div>
    </div>
  );
}
