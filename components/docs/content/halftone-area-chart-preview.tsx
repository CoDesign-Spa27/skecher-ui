"use client";

import type { Format } from "@number-flow/react";

import { HalftoneAreaChart } from "@/components/ui-components/halftone-area-chart";

const revenue = [
  { label: "Jan", value: 32400 },
  { label: "Feb", value: 21700 },
  { label: "Mar", value: 38900 },
  { label: "Apr", value: 27300 },
  { label: "May", value: 44800 },
  { label: "Jun", value: 19600 },
  { label: "Jul", value: 35200 },
  { label: "Aug", value: 52100 },
  { label: "Sep", value: 30500 },
  { label: "Oct", value: 41700 },
  { label: "Nov", value: 24900 },
  { label: "Dec", value: 47300 },
];

const currency: Format = {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
};

export function HalftoneAreaChartPreview() {
  return (
    <div className="w-full max-w-3xl px-6 py-12 sm:px-10">
      <HalftoneAreaChart
        data={revenue}
        format={currency}
        label="Monthly revenue"
        seriesName="Revenue"
      />
    </div>
  );
}
