import React, { useState, useEffect, useMemo } from 'react';
// import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// import { Bar } from 'react-chartjs-2';
import { Line } from 'react-chartjs-2';

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend
// );

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const DataVisualizer = () => {
  const [chartData, setChartData] = useState(null);
  const [metricsArray, setMetricsArray] = useState(null);
  const [activeMetric, setActiveMetric] = useState('min_dur');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dateColumn, setDateColumn] = useState('');
  const [availableMetrics, setAvailableMetrics] = useState([]);
  const apidatakey = import.meta.env.VITE_AZURE_FUNCTION_SQLDATA_KEY;  
  const functionUrl = `https://dynaq.azurewebsites.net/api/dynaq_chart_data?code=${apidatakey}`;
  // const functionUrl = 'http://localhost:7071/api/dynaq_chart_data';
  

  const handleMetricChange = (e) => {
    setActiveMetric(e.target.value);
  };

  const handleResetDates = () => {
    if (metricsArray && dateColumn) {
      const dates = metricsArray.map(item => new Date(item[dateColumn]));
      const minDate = new Date(Math.min(...dates));
      const maxDate = new Date(Math.max(...dates));
      setStartDate(minDate.toISOString().split('T')[0]);
      setEndDate(maxDate.toISOString().split('T')[0]);
    }
  };

  // Filter data based on date range
  const filteredMetricsArray = useMemo(() => {
    if (!metricsArray || !dateColumn) return metricsArray;
    if (!startDate && !endDate) return metricsArray;



    return metricsArray.filter(item => {
      const itemDate = new Date(item[dateColumn]);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      if (start && end) {
        return itemDate >= start && itemDate <= end;
      } else if (start) {
        return itemDate >= start;
      } else if (end) {
        return itemDate <= end;
      }
      return true;
    });
  }, [metricsArray, startDate, endDate, dateColumn]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(functionUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();

        let metricsArray = result;
        if (!Array.isArray(result) && result && Array.isArray(result.chartData)) {
          metricsArray = result.chartData;
        }

        const firstObject = metricsArray[0];
        const keys = Object.keys(firstObject);
        const firstKeyName = keys[0]; 
        const secondKeyName = keys[1];
        
        // Find date column (look for common date field names)
        const dateCol = keys.find(key => 
          key.toLowerCase().includes('date') || 
          key.toLowerCase().includes('time') ||
          key.toLowerCase().includes('timestamp') ||
          key.toLowerCase().includes('proc_date')
        );

        // console.log("keys: ", keys)
        // Metrics are all numeric keys, excluding the label and date columns
        const metricKeys = keys.filter(key => 
          key !== firstKeyName && key !== dateCol
        );
        
        setAvailableMetrics(metricKeys);        
        
        if (dateCol) {
          setDateColumn(dateCol);
          // Set default date range to show all data
          const dates = metricsArray.map(item => new Date(item[dateCol]));
          const minDate = new Date(Math.min(...dates));
          const maxDate = new Date(Math.max(...dates));
          setStartDate(minDate.toISOString().split('T')[0]);
          setEndDate(maxDate.toISOString().split('T')[0]);
        }

        setMetricsArray(metricsArray);
        setActiveMetric(secondKeyName);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [functionUrl]);

  // Update chart when activeMetric or filtered data changes
  // useEffect(() => {
  //   if (filteredMetricsArray && filteredMetricsArray.length > 0) {
  //     const firstKeyName = Object.keys(filteredMetricsArray[0])[0];
  //     const formattedData = {
  //       labels: filteredMetricsArray.map(item => item[firstKeyName]),
  //           datasets: [{
  //             label: `Current ${firstKeyName} Performance Metric: ${activeMetric}`,
  //             data: filteredMetricsArray.map(item => Number(item[activeMetric])),
  //             backgroundColor: 'rgba(75, 192, 192, 0.6)',
  //             borderColor: 'rgba(75, 192, 192, 1)',
  //             borderWidth: 1,
  //             minBarLength: 5,
  //             tension: 0.4,
  //             fill: false,
  //           }],        
  //       // datasets: [{
  //       //   label: `Current ${firstKeyName} Performance Metric: ${activeMetric}`,
  //       //   data: filteredMetricsArray.map(item => Number(item[activeMetric])),
  //       //   backgroundColor: 'rgba(75, 192, 192, 0.6)',
  //       //   borderColor: 'rgba(75, 192, 192, 1)',
  //       //   borderWidth: 1,
  //       //   minBarLength: 5,
  //       // }],
  //     };
  //     setChartData(formattedData);
  //   }
  // }, [activeMetric, filteredMetricsArray]);

// Replace the existing effect that builds chartData with this:
  useEffect(() => {
    if (!filteredMetricsArray || filteredMetricsArray.length === 0) {
      setChartData(null);
      return;
    }

    const labelKey = Object.keys(filteredMetricsArray[0])[0]; // e.g. base_path or similar
    const dateKey = dateColumn || 'date_proc'; // use detected date column or fallback to 'date_proc'

    // unique, sorted dates (use ISO date string for consistent matching)
    const uniqueDates = Array.from(new Set(
      filteredMetricsArray.map(i => new Date(i[dateKey]).toISOString().split('T')[0])
    )).sort((a, b) => new Date(a) - new Date(b));

    // unique series names (full label text)
    const seriesNames = Array.from(new Set(filteredMetricsArray.map(i => i[labelKey])));

    // basic color palette (expand if needed)
    const colors = [
      '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
      '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'
    ];

    // build datasets: for each series, map values onto the master date axis
    const datasets = seriesNames.map((name, idx) => {
      const data = uniqueDates.map(d => {
        const found = filteredMetricsArray.find(item =>
          item[labelKey] === name &&
          new Date(item[dateKey]).toISOString().split('T')[0] === d
        );
        return found ? Number(found[activeMetric]) : null;
      });

      return {
        label: name,                // legend shows full label name
        data,
        borderColor: colors[idx % colors.length],
        backgroundColor: colors[idx % colors.length] + '33',
        tension: 0.3,
        spanGaps: true,             // connect points across nulls if you prefer
        fill: false,
        pointRadius: 3,
      };
    });

    setChartData({ labels: uniqueDates, datasets });
  }, [activeMetric, filteredMetricsArray, dateColumn]);


  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '400px',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading visualization data...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '400px',
        fontSize: '18px',
        color: '#dc3545'
      }}>
        Error fetching data: {error}
      </div>
    );
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
        text: 'Dynamic Data Visualization of AI Powered Extraction Performance Metrics',
      },
    },
  };

  return (
    <div style={{ 
      padding: '24px', 
      backgroundColor: '#f8f9fa',
      minHeight: '100vh'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header Card */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: 'bold', 
            color: '#333',
            marginBottom: '24px',
            marginTop: 0
          }}>
            Performance Dashboard
          </h1>
          

          {/* Data Summary */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '16px',
            fontSize: '14px',
            color: '#666'
          }}>
            <span style={{
              padding: '6px 14px',
              backgroundColor: '#e0f2f1',
              color: '#00695c',
              borderRadius: '20px',
              fontWeight: '600'
            }}>
              {filteredMetricsArray?.length || 0} records
            </span>
            {dateColumn && (
              <span style={{ color: '#888' }}>
                Filtered by: {dateColumn}
              </span>
            )}
          </div>
        </div>

        {/* Chart Section */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          padding: '24px',
          height: '500px'
        }}>
          {chartData && filteredMetricsArray?.length > 0 ? (
            <Line key={activeMetric} options={options} data={chartData} redraw={true} />
            // <Bar key={activeMetric} options={options} data={chartData} redraw={true} />
          ) : (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              height: '100%'
            }}>
              <p style={{ fontSize: '18px', color: '#888' }}>
                No data to display for the selected date range.
              </p>
            </div>
          )}
        </div>

        {/* -- Moved Selector Pane (below chart) -- */}
        <div style={{
          marginTop: '20px',
          background: 'linear-gradient(180deg, #ffffff 0%, #f7fbfb 100%)',
          borderRadius: '12px',
          boxShadow: '0 6px 18px rgba(32,178,170,0.08)',
          padding: '18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <label style={{ fontWeight: 700, color: '#234', marginRight: 6 }}>Metric</label>
                <select
                  value={activeMetric}
                  onChange={handleMetricChange}
                  aria-label="Select metric"
                  style={{
                    padding: '8px 12px',
                    borderRadius: 10,
                    border: '1px solid #e6f2f1',
                    background: 'white',
                    minWidth: 160,
                    fontWeight: 600,
                    color: '#0b4952'
                  }}
                >
                  {availableMetrics.map(metric => (
                    <option key={metric} value={metric}>
                      {metric}
                    </option>
                  ))}
                </select>              
              {/* <select
                value={activeMetric}
                onChange={handleMetricChange}
                aria-label="Select metric"
                style={{
                  padding: '8px 12px',
                  borderRadius: 10,
                  border: '1px solid #e6f2f1',
                  background: 'white',
                  minWidth: 160,
                  fontWeight: 600,
                  color: '#0b4952'
                }}
              >
                <option value="cnt">Counts</option>
                <option value="min_dur">Min Duration</option>
                <option value="max_dur">Max Duration</option>
              </select> */}
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: 12, color: '#556' }}>Start</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 10,
                    border: '1px solid #e6f2f1',
                    background: 'white'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: 12, color: '#556' }}>End</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 10,
                    border: '1px solid #e6f2f1',
                    background: 'white'
                  }}
                />
              </div>

              <button
                onClick={handleResetDates}
                style={{
                  padding: '10px 14px',
                  background: '#20b2aa',
                  color: 'white',
                  borderRadius: 10,
                  border: 'none',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 3px 8px rgba(32,178,170,0.18)'
                }}
              >
                Reset Dates
              </button>
            </div>
          </div>

          <div style={{ fontSize: 13, color: '#667', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ padding: '6px 12px', background: '#e9fbf9', color: '#037a6b', borderRadius: 18, fontWeight: 700 }}>
              {filteredMetricsArray?.length || 0} records
            </div>
            {dateColumn && <div>Filtered by: <strong style={{ color: '#234' }}>{dateColumn}</strong></div>}
          </div>
        </div>

      </div>
    </div>
  );
};

export default DataVisualizer;

// import React, { useState, useEffect } from 'react';
// import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
// import { Bar } from 'react-chartjs-2';

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend
// );

// const DataVisualizer = () => {
//   // State for the fetched data and loading status
//   const [chartData, setChartData] = useState(null);
//   const [metricsArray, setMetricsArray] = useState(null);
//   const [activeMetric, setActiveMetric] = useState('min_dur');
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const apidatakey = import.meta.env.VITE_AZURE_FUNCTION_SQLDATA_KEY;  
//   const functionUrl = `https://dynaq.azurewebsites.net/api/dynaq_chart_data?code=${apidatakey}`; 


//   const handleMetricChange = (e) => {
//     const newValue = e.target.value;
//     // console.log("Setting metric to:", newValue); // Check your console for this!
//     setActiveMetric(newValue);
//     };

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         // Fetch the data from the Azure Function
//         const response = await fetch(functionUrl);
//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         const result = await response.json();
//         // console.log("result: ", result)

//         let metricsArray = result; // Default to the root if it's already an array
//         if (!Array.isArray(result) && result && Array.isArray(result.chartData)) {
//           metricsArray = result.chartData; // Pull from the wrapper key
//         }
//         // console.log("activeMetric for chart:", activeMetric)


//         const firstObject = metricsArray[0];
//         const firstKeyName = Object.keys(firstObject)[0]; 
//         // console.log("data first element name: ", firstKeyName);
//         const SecondKeyName = Object.keys(firstObject)[1]; 
//         // console.log("data second element name: ", SecondKeyName);

//         setMetricsArray(metricsArray);
//         setActiveMetric(SecondKeyName);

//         const formattedData = {
//             labels: metricsArray.map(item => item[firstKeyName]),
//             datasets: [{
//             //   label: 'Performance Metrics',
//               label: `Current ${firstKeyName} Performance Metric: ${activeMetric}`,
//             //   data: metricsArray.map(item => item.value),
//               data: metricsArray.map(item => Number(item[activeMetric])),
//               backgroundColor: 'rgba(75, 192, 192, 0.6)',
//               borderColor: 'rgba(75, 192, 192, 1)',
//               borderWidth: 1,
//               minBarLength: 5,
//             },
//           ],
//         };

//         setChartData(formattedData);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []); // runs once when the component mounts
   

//   // second effect so to update chart when activeMetric changes
//   useEffect(() => {
//     if (metricsArray) {
//       const firstKeyName = Object.keys(metricsArray[0])[0];
//       const formattedData = {
//         labels: metricsArray.map(item => item[firstKeyName]),
//         datasets: [{
//           label: `Current ${firstKeyName} Performance Metric: ${activeMetric}`,
//           data: metricsArray.map(item => Number(item[activeMetric])),
//           backgroundColor: 'rgba(75, 192, 192, 0.6)',
//           borderColor: 'rgba(75, 192, 192, 1)',
//           borderWidth: 1,
//           minBarLength: 5,
//         }],
//       };
//       setChartData(formattedData);
//     }
//   }, [activeMetric, metricsArray]);

//   if (loading) {
//     return <div>Loading visualization data...</div>;
//   }

//   if (error) {
//     return <div>Error fetching data: {error}</div>;
//   }

//   const options = {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//       legend: {
//         position: 'top',
//       },
//       title: {
//         display: true,
//         text: 'Dynamic Data Visualization of AI Powered Extraction Performance Metrics',
//       },
//     },
//   };

//   if (loading) return <p>Loading...</p>;

//   return (
//     <div  style={{ height: '400px', position: 'relative' }}>
//         <select 
//                 value={activeMetric} onChange={handleMetricChange}
//             >
//         <option value="cnt">Counts</option>
//         <option value="min_dur">Min Duration</option>
//         <option value="max_dur">Max Duration</option>
//       </select>
//       {chartData ? <Bar key={activeMetric} options={options} data={chartData} redraw={true} />: <p>No data to display.</p>}
//     </div>    
//   );
// };

// export default DataVisualizer;