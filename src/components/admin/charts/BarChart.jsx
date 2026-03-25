import Chart from "react-apexcharts";

export default function BarChart() {
  const options = {
    chart: { toolbar: { show: false } },
    theme: { mode: "dark" },
    plotOptions: {
      bar: { borderRadius: 8, horizontal: false },
    },
    xaxis: {
      categories: ["Shoes", "Clothes", "Electronics", "Accessories"],
    },
  };

  const series = [
    {
      name: "Sales",
      data: [400, 300, 500, 200],
    },
  ];

  return <Chart options={options} series={series} type="bar" height={300} />;
}