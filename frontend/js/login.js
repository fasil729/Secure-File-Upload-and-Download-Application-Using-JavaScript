const emailFiled = document.getElementById('email');
const passowrdField = document.getElementById('password');
const form = document.getElementById('form');

form.addEventListener('submit', function(e){
    e.preventDefault();
    const email = emailFiled.value;
    const password = passowrdField.value;
    console.log(email, password);

    fetch('http://localhost:3000/user/signin',{
        method: 'POST',
        body: JSON.stringify({
            email: email,
            password: password
        }),
        headers: {
            "Content-Type": "application/json",
        }
    }).then(function(response){
        return response.json()
    }).then(function(data){
        if (data.statusCode == 403){
            document.getElementById('wrong').innerHTML = 'Email or password not correct!'
        } else {
            console.log("logging data");
        console.log(data);
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        
        if (data.role == "USER") {
            window.open('fileList.html', '_self');
        }
        else if (data.role == "ADMIN") {
            window.open('adminpanel.html', '_self');
        }
        
        }
    })

})
