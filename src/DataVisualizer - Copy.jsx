import React, { useState, useEffect, useMemo } from 'react';
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
  const [chartData, setChartData] = useState(null);
  const [metricsArray, setMetricsArray] = useState(null);
  const [activeMetric, setActiveMetric] = useState('min_dur');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dateColumn, setDateColumn] = useState('');
  
  const apidatakey = import.meta.env.VITE_AZURE_FUNCTION_SQLDATA_KEY;  
  // const functionUrl = `https://dynaq.azurewebsites.net/api/dynaq_chart_data?code=${apidatakey}`;
  const functionUrl = 'http://localhost:7071/api/dynaq_chart_data';
  

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

        console.log("keys: ", keys)
        
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
  useEffect(() => {
    if (filteredMetricsArray && filteredMetricsArray.length > 0) {
      const firstKeyName = Object.keys(filteredMetricsArray[0])[0];
      const formattedData = {
        labels: filteredMetricsArray.map(item => item[firstKeyName]),
        datasets: [{
          label: `Current ${firstKeyName} Performance Metric: ${activeMetric}`,
          data: filteredMetricsArray.map(item => Number(item[activeMetric])),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
          minBarLength: 5,
        }],
      };
      setChartData(formattedData);
    }
  }, [activeMetric, filteredMetricsArray]);

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
          
          {/* Controls Section */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: dateColumn ? 'repeat(auto-fit, minmax(200px, 1fr))' : '1fr',
            gap: '16px',
            marginBottom: '20px'
          }}>
            {/* Metric Selector */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#555',
                marginBottom: '8px'
              }}>
                Select Metric
              </label>
              <select 
                value={activeMetric} 
                onChange={handleMetricChange}
                style={{
                  padding: '10px 12px',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'all 0.2s',
                  backgroundColor: 'white'
                }}
                onMouseOver={(e) => e.target.style.borderColor = '#20b2aa'}
                onMouseOut={(e) => e.target.style.borderColor = '#ddd'}
                onFocus={(e) => e.target.style.borderColor = '#20b2aa'}
                onBlur={(e) => e.target.style.borderColor = '#ddd'}
              >
                <option value="cnt">Counts</option>
                <option value="min_dur">Min Duration</option>
                <option value="max_dur">Max Duration</option>
              </select>
            </div>

            {/* Date Range Pickers */}
            {dateColumn && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: '#555',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#20b2aa" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={{
                      padding: '10px 12px',
                      border: '2px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '14px',
                      cursor: 'pointer',
                      outline: 'none',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.borderColor = '#20b2aa'}
                    onMouseOut={(e) => e.target.style.borderColor = '#ddd'}
                    onFocus={(e) => e.target.style.borderColor = '#20b2aa'}
                    onBlur={(e) => e.target.style.borderColor = '#ddd'}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: '#555',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#20b2aa" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    style={{
                      padding: '10px 12px',
                      border: '2px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '14px',
                      cursor: 'pointer',
                      outline: 'none',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.borderColor = '#20b2aa'}
                    onMouseOut={(e) => e.target.style.borderColor = '#ddd'}
                    onFocus={(e) => e.target.style.borderColor = '#20b2aa'}
                    onBlur={(e) => e.target.style.borderColor = '#ddd'}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button
                    onClick={handleResetDates}
                    style={{
                      padding: '10px 20px',
                      border: '2px solid #20b2aa',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      backgroundColor: 'white',
                      color: '#20b2aa',
                      transition: 'all 0.2s',
                      width: '100%'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.backgroundColor = '#20b2aa';
                      e.target.style.color = 'white';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.backgroundColor = 'white';
                      e.target.style.color = '#20b2aa';
                    }}
                  >
                    Reset Dates
                  </button>
                </div>
              </>
            )}
          </div>

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
            <Bar key={activeMetric} options={options} data={chartData} redraw={true} />
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