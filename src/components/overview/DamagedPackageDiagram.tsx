"use client";

import * as React from "react";
import { Component, TrendingUp } from "lucide-react";
import { Label, Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { AssetOverviewDTO } from "@/types/api/api";
import { forEach } from "lodash";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";

export const colorPalette = [
  "#FFD700", // Gelb
  "#32CD32", // Grün
  "#1E90FF", // Blau
  "#FF69B4", // Pink
  "#FF6347", // Rot
  "#8A2BE2", // Lila
  "#FFA500", // Orange
  "#00CED1", // Türkis
  "#DC143C", // Karmesinrot
];

export interface ChartConfig {
  [key: string]: {
    label: string;
    color: string;
  };
}

export function dataToChart(
  data: any[],
  key: string,
  label: string,
): ChartConfig {
  const chartData: ChartConfig = {};
  data.forEach((item) => {
    chartData[item[key]] = {
      label: item[label],
      color: item.fill,
    };
  });

  return chartData;
}

export function DamagedPackage({ data }: { data: AssetOverviewDTO }) {
  var i = 0;
  const dataWithColors = data.assetHighestDamagedPackages.map((item) => ({
    ...item,
    fill: colorPalette[i++ % colorPalette.length],
  }));
  const d = dataToChart(dataWithColors, "component", "component");
  const da = data.assetHighestDamagedPackages;

  return (
    <Card x-chunk="dashboard-01-chunk-5">
      <CardHeader>
        <CardTitle>most 3 highest damaged Packages</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-8">
        <div>
          {da.map((item, index) => (
            <div key={index} className="flex items-center gap-4">
              <Avatar className="hidden h-9 w-9 sm:flex">
                <AvatarImage src={""} alt="Avatar" />
                <AvatarFallback>Test</AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <p className="text-sm font-medium leading-none">
                  Olivia Martin
                </p>
                <p className="text-sm text-muted-foreground">
                  {item.component}
                </p>
              </div>
              <div className="ml-auto font-medium"> {item.count} </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4"></div>
      </CardContent>
    </Card>
  );
}

/** 
export function DamagedPackage({ data }: { data: AssetOverviewDTO }) {
  var i = 0;
  const dataWithColors = data.assetHighestDamagedPackages.map((item) => ({
    ...item,
    fill: colorPalette[i++ % colorPalette.length],
  }));

  const d = dataToChart(dataWithColors, "component", "component");

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>most 3 highest damaged Packages</CardTitle>
        <CardDescription></CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={d}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={dataWithColors}
              dataKey="count"
              nameKey="component"
            ></Pie>
            {dataWithColors.map((item, index) => (
              <ChartLegend
                key={index}
                content={<ChartLegendContent nameKey="component" />}
                className="max-h-[50px] -translate-y-2 flex-wrap gap-2"
              />
            ))}
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none"></div>
        <div className="leading-none text-muted-foreground"></div>
      </CardFooter>
    </Card>
  );
}

*/
