const fileList = document.getElementById('file_list');

const token = localStorage.getItem('access_token');



fetch("http://localhost:3000/file/received", {
    method: 'GET',
    headers:{
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
    }
}).then((response)=>response.json()).then(async function(data){
    let listMarkup = "";
    for (let i = 0; i < data.length; i++){
        let img = await buildDetail(data[i].id);
        if (img == "0"){
            img = '<img src="../filestorage/download.png" class="img_value">';
        }
        listMarkup += `<div class="card" style="width: 18rem; id="${data[i].id}">
                            ${img}
                            <div class="card-body">
                                <h5 class="card-title">${data[i].originalname}</h5>
                                <p class="card-text">File Size   ${Math.round(data[i].size / 1024)} KB</p>
                                <button class"btn" onClick="downloadFile(${data[i].id})">Download</button>
                            </div>
                            </div>`
    };
    fileList.innerHTML = listMarkup;
}).catch((error)=>console.log(error)
);

function buildDetail(id) {
    return new Promise((resolve, reject) => {
      fetch('http://localhost:3000/file/' + id, {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        }
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to retrieve file');
          }
          return response.blob();
        })
        .then(blob => {
          const url = URL.createObjectURL(blob);
        //   const img = document.createElement('img');
            if (blob.type.slice(6).match(/(jpg|jpeg|png|gif)$/)){
                img = `<img src="${url}" class="img_value mb-5">`
            } else{
                img = "0";
            }
          resolve(img);
        })
        .catch(error => {
          console.error('Failed to retrieve file:', error);
          reject(error);
        });
    });
  }



async function downloadFile(id) {

  try {
    // Send GET request to the backend endpoint that serves the file
    const response = await fetch(`http://localhost:3000/file/download/${id}`, {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        }
      });
      console.log(response)
    // Check that the response is OK
    if (!response.ok) {
      throw new Error('Failed to download file');
    }

    // Get the filename from the "Content-Disposition" header
    const contentDisposition = response.headers.get('Content-Disposition');
    const match = contentDisposition.match(/filename="([^"]+)"/);
    const filename = match ? match[1] : 'file.txt';

    // Create and click a link to initiate the download
    const blob = await response.blob();
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = filename;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  } catch (error) {
    console.error('Failed to download file:', error);
  }
};
// window.stop()