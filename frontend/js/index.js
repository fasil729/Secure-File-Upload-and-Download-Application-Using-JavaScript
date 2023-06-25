const uploadForm = document.querySelector(".file-upload__form");
const fileInput = document.querySelector(".file-input");
const progressContainer = document.querySelector(".progress-container");
const uploadedContainer = document.querySelector(".uploaded-container");
const faliureContainer = document.querySelector(".faliure-container");

let correct = true;

uploadForm.addEventListener("click", (e) => {
  if (e.target !== fileInput) {
    fileInput.click();
  };
});

fileInput.onchange = ({ target }) => {
  let file = target.files[0];
  if (file) {
    let fileName = file.name;
    if (fileName.length >= 12) {
      let splitName = fileName.split(".");
      fileName = splitName[0].substring(0, 13) + "... ." + splitName[1];
    }
    uploadFile(fileName);
  }
};

const token = localStorage.getItem('access_token');

// function uploadFile(name) {
//   // ... (previous code remains unchanged)

//   // Monitor the upload progress
//   let progressBar = progressContainer.querySelector(".progress-wrapper");
//   let percent = progressContainer.querySelector(".percent");

//   // Use XMLHttpRequest instead of fetch for progress monitoring
//   let xhr = new XMLHttpRequest();
//   xhr.open("POST", endpoint, true);
//   xhr.setRequestHeader("Authorization", "Bearer " + token); // Replace token with the actual authentication token if needed
//   xhr.upload.onprogress = function (event) {
//     if (event.lengthComputable) {
//       let percentComplete = Math.floor(event.loaded / event.total * 100);
//       progressBar.style.width = percentComplete + "%";
//       percent.textContent = percentComplete + "%";
//     }
//   };
//   xhr.onreadystatechange = function () {
//     if (xhr.readyState === XMLHttpRequest.DONE) {
//       if (xhr.status === 200) {
//         // Handle the response from the server
//         let data = JSON.parse(xhr.responseText);
//         console.log(data);
//         progressContainer.innerHTML = "";
//         let uploadedMarkup = `<li class="row">
//           <div class="content-wrapper upload">
//             <i class="fas fa-file-alt"></i>
//             <div class="details-wrapper">
//               <span class="name">${name} | <span>Uploaded</span></span>
//               <span class="file-size">${fileSize}</span>
//             </div>
//           </div>
//         </li>`;
//         uploadedContainer.insertAdjacentHTML("afterbegin", uploadedMarkup);
//       } else {
//         console.error("Error uploading the file");
//       }
//     }
//   };
//   xhr.send(formData);
// }

function uploadFile(name) {
  const endpoint = "http://localhost:3000/file/upload/" + 1; // Replace receiverId with the actual receiver ID
  let file = fileInput.files[0];
  if (file) {
    let fileName = file.name;
    if (fileName.length >= 12) {
      let splitName = fileName.split(".");
      fileName = splitName[0].substring(0, 13) + "... ." + splitName[1];
    }
    let formData = new FormData();
    formData.append("file", file, name);

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
  xhr.upload.onprogress = function (event) {
    if (event.lengthComputable) {
      let percentComplete = Math.floor(event.loaded / event.total * 100);
      progressBar.style.width = percentComplete + "%";
      percent.textContent = percentComplete + "%";
    }
  };
  xhr.onreadystatechange = function () {
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
        console.error("Error uploading the file");
      }
    }
  };
  xhr.send(formData);
}
}
window.stop()