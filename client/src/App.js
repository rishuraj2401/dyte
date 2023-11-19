// App.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css'

function App() {
  const [query, setQuery] = useState(null);
  const [type,setT]=useState('level');
  const [result,setResult]=useState([]);

  const handleSearch = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/query?${type}=${query}`);
      setResult(response);
      console.log(result);
    } catch (error) {
      console.error('Error searching logs:', error);
    }
  };
  const onHandleChange=(e)=>{
    setQuery(e.target.value);
   
  }
  const handlekey=()=>{
   if(!query){
    setResult([]);
   }
  }
  useEffect(()=>{
   setQuery(query)
  
   handleSearch();
  //  if (query==='f') {
  //   setResult([])
  // }
  },[query])
  return (
    <>
    <h1>Query Interface</h1>
    <div className='cont'>      
      <div className='search'>
       <select type='option'onChange={(e)=>{setT(e.target.value)}} value={type}>
        <option>level</option>
        <option>message</option>      
        <option>resourceId</option>
        <option>timestamp</option>
        <option>traceId</option>
        <option>spanId</option>
        <option>commit</option>
        <option >metadata.parentResourceId</option>    
      </select>
      <input
        type="text"
        placeholder="Enter your search query"
        value={query}
        onChange={onHandleChange}
        onKeyUp={handlekey}
        // onKey={(e)=>setQuery(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>
      </div>
      </div>
      <div>
        <h2>Search Results:</h2>    
        
         <div className='output'> 
          {result.length===0 ? (
  <p>No Result</p>
) : (
  result.data.map((item) => 
  <>
  <div className='result'>
    <ul>
      <li><h5>Level:{item.level}</h5> </li>
      <li><h5>Message: {item.message}</h5> </li>
      <li><h5>ResourceId:{item.resourceId} </h5></li>
      <li><h5>TimeStamp:{item.timestamp} </h5></li>
      <li><h5>TraceID: {item.traceId} </h5></li>
      <li><h5>Commit:{item.commit} </h5></li>
      <li><h5>Metadata_parentResouceID: {item.metadata.parentResourceId} </h5></li>


    </ul>
  </div>
  </>
))}
      </div>
      </div>
      </>
    
  );
}

export default App;
