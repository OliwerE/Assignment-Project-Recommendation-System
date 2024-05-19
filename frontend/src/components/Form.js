import React, { useEffect, useState, useContext }from 'react'

const Form = ({ getData }) => {
  const [users, setUsers] = useState([])

  const [user, setUser] = useState('')
  const [similarity, setSimilarity] = useState('')
  const [results, setResults] = useState('')
  const [recommendationType, setRecommendationType] = useState('')
  const [minNumOfRatings, setMinNumOfRatings] = useState(1)

  useEffect(() => {
    fetch(`http://localhost:8080/users/all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'No-Store'
      }
    }).then(res => {
      return res.json()
    }).then(json => {
      setUsers(json.res)
      console.log(json.res)
    })
  }, [])

  const handleFormSubmit = (e) => {
    e.preventDefault()

    if (user === '') {
      alert('Select a user!')
    }

    if (similarity === '') {
      alert('Select a similarity!')
    }

    // console.log('submit')
    // console.log(user)
    // console.log(similarity)
    // console.log(results)
    // console.log(recommendationType)

    getData(user, similarity, results, recommendationType, minNumOfRatings) // user = userId
  } 

  return (
    <>
      <form id='search' onSubmit={handleFormSubmit}>
        <div style={{ float: 'left' }}>
          <label htmlFor="user">User: </label>
          <select id="user" name="user" onChange={e => setUser(e.target.value)} required>
            <option key='default' disabled="disabled" selected="true" value='default'>Select User</option>
            {users.map((user, i) => {
              return (
                <option key={i} value={user.UserId}>
                  {user.Name}
                </option>
              )
            })}
          </select>
        </div>
        <div style={{ float: 'left', marginLeft: '20px' }}>
          <label htmlFor="similarity">Similarity: </label>
          <select id="similarity" name="similarity" onChange={e => setSimilarity(e.target.value)} required>
            <option key='default' disabled="disabled" selected="true" value='default'>Select Similarity</option>
            <option value="euclidean">Euclidean</option>
          </select>
        </div>
        <div style={{ float: 'left', marginLeft: '20px' }}>
          <label htmlFor="results">Results: </label>
          <input type="number" id="results" name="results" onChange={e => setResults(e.target.value)} required/>
        </div>
        <div style={{ float: 'left', marginLeft: '20px' }}>
          <label htmlFor="min-num-of-ratings">Min number of ratings: </label>
          <input type="number" id="min-num-of-ratings" name="min-num-of-ratings" value={minNumOfRatings} onChange={e => setMinNumOfRatings(e.target.value)} required/>
        </div>
        <div style={{ float: 'left', marginLeft: '20px' }}>
          <label HtmlFor="user">User</label>
          <input type="radio" id="user" name="recommendationType" value="user" onChange={e => setRecommendationType(e.target.value)} required/>
          <label HtmlFor="movie">Movie</label>
          <input type="radio" id="movie" name="recommendationType" value="movie" onChange={e => setRecommendationType(e.target.value)} required/>
        </div>
        <input id='submit' type='submit' value='submit' />
      </form>
    </>
  )
}

export default Form