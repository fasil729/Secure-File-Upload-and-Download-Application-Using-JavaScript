const fileList = document.getElementById('file_list');

fetch('http://localhost:3000/file/received', {
    method: 'GET',
    headers:{
        "Content-Type": "application/json",
    }
}).then(()=>response.json()).then(function(data){
    if (data.statusCode == 200){
        return 
    }
})