fetch('http://localhost:3000/file/received', {
    method: 'GET',
    headers:{
        "Content-Type": "application/json",
    }
}).then(()=>response)