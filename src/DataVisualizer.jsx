import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

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
  const [metricsArray, setMetricsArray] = useState(null);
  const [activeMetric, setActiveMetric] = useState('min_dur');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apidatakey = import.meta.env.VITE_AZURE_FUNCTION_SQLDATA_KEY;  
  const functionUrl = `https://dynaq.azurewebsites.net/api/dynaq_chart_data?code=${apidatakey}`; 


  const handleMetricChange = (e) => {
    const newValue = e.target.value;
    // console.log("Setting metric to:", newValue); // Check your console for this!
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
        // console.log("result: ", result)

        let metricsArray = result; // Default to the root if it's already an array
        if (!Array.isArray(result) && result && Array.isArray(result.chartData)) {
          metricsArray = result.chartData; // Pull from the wrapper key
        }
        // console.log("activeMetric for chart:", activeMetric)


        const firstObject = metricsArray[0];
        const firstKeyName = Object.keys(firstObject)[0]; 
        // console.log("data first element name: ", firstKeyName);
        const SecondKeyName = Object.keys(firstObject)[1]; 
        // console.log("data second element name: ", SecondKeyName);

        setMetricsArray(metricsArray);
        setActiveMetric(SecondKeyName);

        const formattedData = {
            labels: metricsArray.map(item => item[firstKeyName]),
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
  }, []); // runs once when the component mounts
   

  // second effect so to update chart when activeMetric changes
  useEffect(() => {
    if (metricsArray) {
      const firstKeyName = Object.keys(metricsArray[0])[0];
      const formattedData = {
        labels: metricsArray.map(item => item[firstKeyName]),
        datasets: [{
          label: `Current Performance Metric: ${activeMetric}`,
          data: metricsArray.map(item => Number(item[activeMetric])),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
          minBarLength: 5,
        }],
      };
      setChartData(formattedData);
    }
  }, [activeMetric, metricsArray]);

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
        <select 
                value={activeMetric} onChange={handleMetricChange}
            >
        <option value="cnt">Counts</option>
        <option value="min_dur">Min Duration</option>
        <option value="max_dur">Max Duration</option>
      </select>
      {chartData ? <Bar key={activeMetric} options={options} data={chartData} redraw={true} />: <p>No data to display.</p>}
    </div>    
  );
};

export default DataVisualizer;