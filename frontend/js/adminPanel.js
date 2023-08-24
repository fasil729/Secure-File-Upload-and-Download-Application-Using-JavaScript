const apiUrl = 'http://localhost:3000/file/action_logs';
const token = localStorage.getItem('access_token');

fetch(apiUrl, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(response => response.json())
.then(data => {
  console.log(data, "here to see respons of action_logs");
  const logsTableBody = document.querySelector('#logs-table tbody');
  if (data.statusCode == 403){
    logsTableBody.innerHTML = "you are not authorized to access this page"
  } 
  
  else {
  data.forEach(fileMetadata => {
    const row = document.createElement('tr');

    const filenameCell = document.createElement('td');
    filenameCell.textContent = fileMetadata.originalname;
    row.appendChild(filenameCell);
    
    const sender = document.createElement('td');
    sender.textContent = fileMetadata.sender.firstName;
    row.appendChild(sender);

    const reciever = document.createElement('td');
    reciever.textContent = fileMetadata.receiver.firstName;
    row.appendChild(reciever);
    

    const fileSizeCell = document.createElement('td');
    fileSizeCell.textContent = fileMetadata.size;
    row.appendChild(fileSizeCell);

    const actionLogsCell = document.createElement('td');
    const actionLogsList = document.createElement('ul');
    
    if (fileMetadata.actionLogs.length === 0) {
      console.log(fileMetadata.actionLogs, "here actionlogs");
      const actionLogItem = document.createElement('li');
      actionLogItem.textContent = `there is no action logs`;
      actionLogsList.appendChild(actionLogItem);
    }
    else {
    fileMetadata.actionLogs.forEach(actionLog => {
      const actionLogItem = document.createElement('li');
      actionLogItem.textContent = `${actionLog.actioner.firstName} is ${actionLog.action} at  ${actionLog.timestamp.toLocaleString('en-GB')}`;
      actionLogsList.appendChild(actionLogItem);
    });
  }
    actionLogsCell.appendChild(actionLogsList);
    row.appendChild(actionLogsCell);

    logsTableBody.appendChild(row);
  });
}
})
.catch(error => console.error(error));