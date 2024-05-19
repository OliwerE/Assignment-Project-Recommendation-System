import React, { useEffect, useState, useContext } from 'react'
import logo from './logo.svg';
import './App.css';
import Form from './components/Form';
import Table from './components/Table';

function App() {
  const [hello, setHello] = useState('')
  const [tableTitle, setTableTitle] = useState('')
  const [tableData, setTableData] = useState([])
  const [tableHeader, setTableHeader] = useState([])
  const [tableType, setTableType] = useState('')

  useEffect(() => {
    fetch(`http://localhost:8080`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'No-Store'
      }
    }).then(res => {
      return res.json()
    }).then(json => {
      setHello(json.msg)
    })
    
  }, [])

  const getData = (userId, similarity, results, recommendationType, minNumOfRatings) => {

    if (recommendationType === 'user') {
      // Remove old table
      setTableData([])
      setTableHeader([])

      //get data 
      fetch(`http://localhost:8080/top-matching-users?userId=${userId}&similarity=${similarity}&results=${results}&ratings=${minNumOfRatings}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'No-Store'
        }
      }).then(res => {
        return res.json()
      }).then(json => {
        // setHello(json.msg)
        console.log(json)
        setTableType('user')
        setTableTitle('Top Matching Users')
        setTableData(json.data)
        setTableHeader(['Name', 'ID', 'Score'])
      })
    } else if (recommendationType === 'movie') {
      // Remove old table
      setTableData([])
      setTableHeader([])

      //get data 
      fetch(`http://localhost:8080/recommended-movies?userId=${userId}&similarity=${similarity}&results=${results}&ratings=${minNumOfRatings}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'No-Store'
        }
      }).then(res => {
        return res.json()
      }).then(json => {
        // setHello(json.msg)
        console.log(json)
        setTableType('movie')
        setTableTitle('Recommended Movies')
        setTableData(json.data)
        setTableHeader(['Name', 'ID', 'Ratings', 'Score'])
      })
    } else {
      alert(`Recommendation type "${recommendationType}" does not exist!`)
    }
    
  }

  return (
    <div className="App">
      <h1>2DV015 - Project</h1>
      <Form getData={getData}/>
      <h2>{tableTitle}</h2>
      {tableHeader.length > 0 && tableData.length > 0 ? <Table tableData={tableData} tableType={tableType} tableHeader={tableHeader} /> : null}
    </div>
  );
}

export default App;
