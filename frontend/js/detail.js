const token = localStorage.getItem('access_token');

function buildDetail(id) {
    console.log('clicked');
    fetch('http://localhost:3000/file/' + id,  {
        method: 'GET',
        headers:{
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        }
    })
  .then(response => {
    if (!response.ok) {
      throw new Error('Failed to retrieve file');
    }
    console.log(response.blob());
    return response.blob();
  })
  .then(blob => {
    const url = URL.createObjectURL(blob);
    const img = document.createElement('img');
    img.src = url;
    document.body.appendChild(img);
  })
  .catch(error => {
    console.error('Failed to retrieve file:', error);
  });
}