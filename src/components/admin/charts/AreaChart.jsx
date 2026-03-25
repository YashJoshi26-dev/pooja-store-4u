import Chart from "react-apexcharts";

export default function AreaChart() {
  const options = {
    chart: { toolbar: { show: false } },
    theme: { mode: "dark" },
    stroke: { curve: "smooth" },
    fill: { opacity: 0.3 },
    xaxis: {
      categories: ["Jan", "Feb", "Mar", "Apr", "May"],
    },
  };

  const series = [
    {
      name: "Customers",
      data: [100, 200, 150, 300, 400],
    },
  ];

  return <Chart options={options} series={series} type="area" height={300} />;
}