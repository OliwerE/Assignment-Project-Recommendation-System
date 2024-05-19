import React from 'react'

const Table = ({ tableHeader, tableData, tableType }) => {
  return (
    <>
    <table style={{ margin: '0 auto' }}>
      <tr>
        {tableHeader.map((header, i) => {
          return (
            <th key={i}>{header}</th>
          )
        })}
      </tr>
      {tableData.map((data, i) => {
        if (tableType === 'user') {
          return (
          <tr key={i}>
            <td>{data.name}</td>
            <td>{data.userId}</td>
            <td>{data.similarity}</td>
          </tr>
          )
        } else {
          return (
          <tr key={i}>
            <td>{data.movie}</td>
            <td>{data.movieId}</td>
            <td>{data.numOfRatings}</td>
            <td>{data.score}</td>
          </tr>
          )
        }
      })}
    </table>
    </>
  )
}

export default Table