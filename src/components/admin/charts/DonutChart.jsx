import Chart from "react-apexcharts";

export default function DonutChart() {
  const options = {
    labels: ["Direct", "Social", "Ads", "Referral"],
    theme: { mode: "dark" },
    legend: { position: "bottom" },
  };

  const series = [40, 25, 20, 15];

  return <Chart options={options} series={series} type="donut" height={300} />;
}