import Chart from "react-apexcharts";

export default function LineChart() {
  const options = {
    chart: {
      toolbar: { show: false },
      background: "transparent",
    },
    theme: { mode: "dark" },
    stroke: { curve: "smooth", width: 3 },
    xaxis: {
      categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    },
  };

  const series = [
    {
      name: "Revenue",
      data: [1200, 1800, 1500, 2200, 2800, 2600, 3200],
    },
  ];

  return <Chart options={options} series={series} type="line" height={300} />;
}