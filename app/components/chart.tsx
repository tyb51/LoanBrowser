"use client";
import React from "react";
import dynamic from "next/dynamic";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import Image from "next/image";
import ArrowDown from "@/public/icons/arrow-down.svg";
import ArrowUp from "@/public/icons/arrow-up.svg";
import { DiagnosisEntry } from "@/app/types/diagnosis";
import ExpandMore from "@/public/icons/expand-more.svg";

// Register the components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Dynamically import Line from react-chartjs-2
const LineChart = dynamic(
  () => import("react-chartjs-2").then((mod) => mod.Line),
  { ssr: false }
);

type MyChartProps = {
  diagnosis: DiagnosisEntry[];
};

export function MyChart({ diagnosis }: MyChartProps) {
  // Sort data by date to ensure correct order
  diagnosis.sort((a: DiagnosisEntry, b: DiagnosisEntry) => {
    const monthOrder: { [key: string]: number } = {
      January: 1,
      February: 2,
      March: 3,
      April: 4,
      May: 5,
      June: 6,
      July: 7,
      August: 8,
      September: 9,
      October: 10,
      November: 11,
      December: 12,
    };

    return a.year - b.year || monthOrder[a.month] - monthOrder[b.month];
  });
  console.log(diagnosis);

  // Extract labels and data
  const labels = diagnosis.map(
    (entry: DiagnosisEntry) => `${entry.month.slice(0, 3)}, ${entry.year}`
  );
  const systolicData = diagnosis.map(
    (entry: DiagnosisEntry) => entry.blood_pressure.systolic.value
  );
  const diastolicData = diagnosis.map(
    (entry: DiagnosisEntry) => entry.blood_pressure.diastolic.value
  );

  return (
    <>
      <div className="flex items-start mt-[40px] bg-[#fff] p-[19px] rounded-[12px] w-1/2 h-auto mx-auto">
        <div className="w-[418px]">
          <div className="flex items-center justify-between w-full">
            <h2 className="text-[#072635] text-[18px] font-bold">
              Diagnosis History
            </h2>

            <button className="flex items-center justify-between w-[119px]">
              <span className="text-[14px] text-[#072635] font-light">
                Last 6 months
              </span>

              <Image src={ExpandMore} alt="" />
            </button>
          </div>

          <div className="mt-[20px] w-full">
            <LineChart
              data={{
                labels: labels,
                datasets: [
                  {
                    label: "Systolic",
                    data: systolicData,
                    backgroundColor: "#5FC3D6",
                    borderColor: "#5FC3D6",
                    borderWidth: 1,
                  },
                  {
                    label: "Diastolic",
                    data: diastolicData,
                    backgroundColor: "#EC5252",
                    borderColor: "#EC5252",
                    borderWidth: 1,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                  x: {
                    beginAtZero: true,
                  },
                  y: {
                    beginAtZero: false,
                    min: 60,
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="w-[208px] flex flex-col items-start justify-center ml-[39.05px]">
          <div className="flex flex-col items-start justify-center w-full">
            <div className="flex items-center w-full">
              <span className="w-[14px] h-[14px] rounded-full bg-[#5FC3D6] border border-[#FFFFFF]"></span>
              <span className="text-[#072635] ml-[4px] text-[14px] font-normal">
                Systolic
              </span>
            </div>

            <h2 className="text-[#072635] text-[22px] font-bold mt-[8px]">
              {diagnosis[3]?.blood_pressure?.systolic?.value}
            </h2>

            <div className="flex items-center w-full mt-[8px]">
              <Image
                className="w-[10px] h-[5px]"
                width={10}
                height={5}
                src={ArrowUp}
                alt=""
              />
              <span className="text-[#072635] text-[14px] ml-[8px] font-light">
                Higher than Average
              </span>
            </div>

            <hr className="w-full h-[1px] mt-[16px] bg-[#CBC8D4]" />

            <div className="flex items-center w-full mt-[19px]">
              <span className="w-[14px] h-[14px] rounded-full bg-[#EC5252] border border-[#FFFFFF]"></span>
              <span className="text-[#072635] ml-[4px] text-[14px] font-normal">
                Diastolic
              </span>
            </div>
            <h2 className="text-[#072635] text-[22px] font-bold mt-[8px]">
              {diagnosis[3].blood_pressure.diastolic.value}
            </h2>

            <div className="flex items-center w-full mt-[8px]">
              <Image
                className="w-[10px] h-[5px]"
                width={10}
                height={5}
                src={ArrowDown}
                alt=""
              />
              <span className="text-[#072635] text-[14px] ml-[8px] font-light">
                Lower than Average
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
