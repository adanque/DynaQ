import React, { useState, useEffect } from 'react';
import { useMemo } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register necessary Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const DataVisualizer = () => {
  // State for the fetched data and loading status
  const [chartData, setChartData] = useState(null);
  const [activeMetric, setActiveMetric] = useState('min_dur');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Define the URL of your Azure Function
  // If running locally, this might be 'http://localhost:7071/api/data'
  // When deployed, it will be 'https://<your-function-app-name>.azurewebsites.net/api/data'
  const functionUrl = 'https://dynaq.azurewebsites.net/api/dynaq_chart_data?code=hQ0suSQXjCFo9YP65-67b3ibqRFSPtwereEfEfZkorWSAzFu2UEryQ%3D%3D'; 

  const handleMetricChange = (e) => {
    const newValue = e.target.value;
    console.log("Setting metric to:", newValue); // Check your console for this!
    setActiveMetric(newValue);
    };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch the data from the Azure Function
        const response = await fetch(functionUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        console.log("result: ", result)

        let metricsArray = result; // Default to the root if it's already an array
        if (!Array.isArray(result) && result && Array.isArray(result.chartData)) {
          metricsArray = result.chartData; // Pull from the wrapper key
        }
        console.log("activeMetric for chart:", activeMetric)
        // console.log("metricsArray: ", metricsArray)
        // Format the data for Chart.js
        // const formattedData = useMemo(() => {
        //     return {
        // //   labels: metricsArray.map(item => item.label),
        //         labels: metricsArray.map(item => item.base_path),
        //         datasets: [{
        //         //   label: 'Performance Metrics',
        //         label: `Current Performance Metric: ${activeMetric}`,
        //         //   data: metricsArray.map(item => item.value),
        //         data: metricsArray.map(item => Number(item[activeMetric])),
        //         backgroundColor: 'rgba(75, 192, 192, 0.6)',
        //         borderColor: 'rgba(75, 192, 192, 1)',
        //         borderWidth: 1,
        //         minBarLength: 5,
        //     },
        //      ],
        //   };
        // }, [metricsArray, activeMetric]);


        const formattedData = {
        //   labels: metricsArray.map(item => item.label),
            labels: metricsArray.map(item => item.base_path),
            datasets: [{
            //   label: 'Performance Metrics',
              label: `Current Performance Metric: ${activeMetric}`,
            //   data: metricsArray.map(item => item.value),
              data: metricsArray.map(item => Number(item[activeMetric])),
              backgroundColor: 'rgba(75, 192, 192, 0.6)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
              minBarLength: 5,
            },
          ],
        };

        setChartData(formattedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array means this runs once when the component mounts

  if (loading) {
    return <div>Loading visualization data...</div>;
  }

  if (error) {
    return <div>Error fetching data: {error}</div>;
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Dynamic Data Visualization served from Azure Function',
      },
    },
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div  style={{ height: '400px', position: 'relative' }}>
      {/* Dropdown to specify the vertical axis field */}
      {/* <select onChange={(e) => setActiveMetric(e.target.value)} value={"max_dur"}> */}
        <select 
                value={activeMetric} onChange={handleMetricChange}
                // onChange={(e) => setActiveMetric(e.target.value)}
                // onChange={(e) => {
                //     const newValue = e.target.value;
                //     console.log("Selected Metric:", newValue); // Log to verify update
                //     console.log("Active Metric:", activeMetric);
                //     setActiveMetric(newValue);
                // }}                
            >
        <option value="cnt">Counts</option>
        <option value="min_dur">Min Duration</option>
        <option value="max_dur">Max Duration</option>
      </select>
      {chartData ? <Bar key={activeMetric} options={options} data={chartData} redraw={true} />: <p>No data to display.</p>}
    </div>    
    // <div style={{ width: '600px', margin: 'auto' }}>
    //   <h2>Data Dashboard</h2>
    //   {chartData ? <Bar options={options} data={chartData} /> : <p>No data to display.</p>}
    // </div>
  );
};

export default DataVisualizer;
