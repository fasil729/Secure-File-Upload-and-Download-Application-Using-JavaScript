const uploadForm = document.querySelector(".file-upload__form");
const fileInput = document.querySelector(".file-input");
const progressContainer = document.querySelector(".progress-container");
const uploadedContainer = document.querySelector(".uploaded-container");
const faliureContainer = document.querySelector(".faliure-container");
const emailField = document.querySelector('.email');
const token = localStorage.getItem('access_token');

let correct = true;

uploadForm.addEventListener("click", (e) => {
  if (e.target !== fileInput) {
    fileInput.click();
  };
  return false;
});

fileInput.onchange = async ({ target }) => {
  let file = target.files[0];
  if (file) {
    let fileName = file.name;
    if (fileName.length >= 12) {
      let splitName = fileName.split(".");
      fileName = splitName[0].substring(0, 13) + "... ." + splitName[1];
    }
    let email = emailField.value;
    const Id = await getId(email);
    console.log(Id);
    uploadFile(fileName, Id);
  }
  return false;
};

async function getId(email){
  let id;
  console.log(email);
  console.log("getting id");
  const params = new URLSearchParams();
  params.append('email', email);
  await fetch("http://localhost:3000/user/find?" + params.toString(), {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to get user');
        }
        return response.json();
      })
      .then(body=> {
        id = body.id;
        console.log(id)
      })
      .catch(error => {
        console.error('Failed to retrieve file:', error);
      });
      return id;
}


async function uploadFile(name, Id) {
  const endpoint = "http://localhost:3000/file/upload/" + Id; 
  let file = fileInput.files[0];
  if (file) {
    let fileName = file.name;
    if (fileName.length >= 12) {
      let splitName = fileName.split(".");
      fileName = splitName[0].substring(0, 13) + "... ." + splitName[1];
    }
    let formData = new FormData();
    formData.append("file", file, name);

    // Calculate hmac for the file

    const hmacKey = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

    const reader = new FileReader();
    const hmacPromise = new Promise((resolve, reject) => {
      reader.onload = () => {
        const arrayBuffer = reader.result; // file data as an ArrayBuffer
  
        // Convert the ArrayBuffer to a Uint8Array
        const uint8Array = new Uint8Array(arrayBuffer);
  
        // Calculate the HMAC using SubtleCrypto
        crypto.subtle.importKey('raw', new TextEncoder().encode(hmacKey), { name: 'HMAC', hash: { name: 'SHA-256' } }, false, ['sign']).then((key) => {
          return crypto.subtle.sign({ name: 'HMAC' }, key, uint8Array);
        }).then((signature) => {
          const hmacHex = Array.from(new Uint8Array(signature)).map((b) => b.toString(16).padStart(2, '0')).join('');
          resolve(hmacHex);
        }).catch((error) => {
          console.error(error);
          reject(error);
        });
      };
    });

    // Create a progress indicator for the file upload
    let progressMarkup = `<li class="row">
      <i class="fas fa-file-alt"></i>
      <div class="content-wrapper">
        <div class="details-wrapper">
          <span class="name">${name} | <span>Uploading</span></span>
          <span class="percent">0%</span>
        </div>
        <div class="progress-bar-wrapper">
          <div class="progress-wrapper" style="width: 0%"></div>
        </div>
      </div>
    </li>`;
    progressContainer.innerHTML = progressMarkup;

    // Monitor the upload progress
    let progressBar = progressContainer.querySelector(".progress-wrapper");
    let percent = progressContainer.querySelector(".percent");

    // Use XMLHttpRequest instead of fetch for progress monitoring
    let xhr = new XMLHttpRequest();
    xhr.open("POST", endpoint, true);
    xhr.setRequestHeader("Authorization", "Bearer " + token);

    // Chain the HMAC Promise with the Promise returned by reader.readAsArrayBuffer()
    // reader.readAsArrayBuffer(file);
    // hmacPromise.then((hmacHex) => {
    //   console.log("printing hamac", hmacHex)
    //   xhr.setRequestHeader('x-file-hmac', hmacHex);
    // }).catch((error) => {
    //   console.error(error);
    // });
    console.log("here starting");
    xhr.upload.onprogress = function (event) {
      if (event.lengthComputable) {
        let percentComplete = Math.floor(event.loaded / event.total * 100);
        progressBar.style.width = percentComplete + "%";
        percent.textContent = percentComplete + "%";
      }
    };
    xhr.onreadystatechange = function () {
      console.log(xhr)
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 201) {
          // Handle the response from the server
          let data = JSON.parse(xhr.responseText);
          let fileSize =   data.size / (1024 * 1024); 
          progressContainer.innerHTML = "";
          let uploadedMarkup = `<li class="row">
            <div class="content-wrapper upload">
              <i class="fas fa-file-alt"></i>
              <div class="details-wrapper">
                <span class="name">${name} | <span>Uploaded</span></span>
                <span class="file-size">${fileSize} Kb</span>
              </div>
            </div>
          </li>`;
          uploadedContainer.insertAdjacentHTML("afterbegin", uploadedMarkup);
        } else {
          let errorMarkup = `<div class="error" style="color:red">${JSON.parse(xhr.response).message}</div>`;
          progressContainer.innerHTML = "";
          uploadedContainer.innerHTML = errorMarkup;
          console.error("Error uploading the file");
        }
      }
    };
    xhr.send(formData);

    return false;
  }
}


async function generateHMAC(data, key) {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const keyBuffer = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', keyBuffer, dataBuffer);
  const signatureArray = Array.from(new Uint8Array(signature));
  const signatureHex = signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return signatureHex;
}

function hexToBytes(hex) {
  const bytes = [];
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.substr(i, 2), 16));
  }
  return new Uint8Array(bytes);
}
 
const form = document.getElementById('form_validate');
function handleForm(event) {     event.preventDefault(); event.stopPropagation();}  
form.addEventListener('submit', handleForm);