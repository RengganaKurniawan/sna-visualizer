import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import cytoscape from 'cytoscape';
import coseBilkent from 'cytoscape-cose-bilkent';

cytoscape.use(coseBilkent)

function App() {
  const [file, setFile] = useState(null); 
  const [graphData, setGraphData] = useState(null); 
  const cyRef = useRef(null);

  useEffect(() => {
    if (graphData && cyRef.current) {
      try {
        const cy = cytoscape({
          container: cyRef.current,
          elements: graphData.elements,
          style: [
            {
              selector: 'node',
              style: {
                'background-color': 'blue',
                'label': 'data(label)', // id label
                'width': 15, // ukuran node
                'height': 15,
                'font-size': '6px',
                'color': '#fff', // warna label
                'text-outline-color': '#000', // warna garis
                'text-outline-width': 0.5, // lebar garis
                'text-valign': 'center', // posisi vertical teks
                'text-halign': 'center' // posisi horizontal teks
              } 
            },
            {
              selector: 'edge',
              style: {
                'width': 0.5,
                'line-color': '#ccc',
                'target-arrow-shape': 'triangle',
                'arrow-scale': 0.4,
                'curve-style': 'bezier'
              }
            }
          ],
          layout: { 
            name: 'cose-bilkent', 
            animate: false, 
            fit: true, 
            padding: 10 
          }
        });
      } catch (error) {
        console.error(error);
      }
    }
  }, [graphData]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setGraphData(null);
  };

  const handleUpload = async() => {
    if (!file) {
      alert('Masuka file JSON')
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://127.0.0.1:5000/api/process', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setGraphData(response.data);
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || "Error tidak diketahui";
      console.error("Error dari backend:", errorMsg, err.response)
      alert('Gagal proses')
      setGraphData(null)
    }
  };

  return (
    <div style={{ 
      alignItems: 'center',
      padding: '20px',
      color: 'black'
      }}>
      <h1>Test Visualisasi Graf</h1>
      <input type="file" accept=".json" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={!file} style={{ marginLeft: '10px' }}>
        Upload & Proses
      </button>

      <div
        ref={cyRef}
        style={{
          width: '90%', 
          height: '500px', 
          border: '1px solid black', 
          marginTop: '20px',
          margin: '20px auto', 
        }}
      />
    </div>
  );


}

export default App
