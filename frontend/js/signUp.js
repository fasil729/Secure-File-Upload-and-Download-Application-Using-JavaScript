

const firstNameField = document.getElementById('firstName');
const lastNameField = document.getElementById('lastName');
const emailFiled = document.getElementById('email');
const passowrdField = document.getElementById('password');
const  rePassowrdField = document.getElementById('repassword');
const form = document.getElementById('form');

form.addEventListener('submit', function(e){
    e.preventDefault();
    const firstName = firstNameField.value;
    const lastName = lastNameField.value;
    const email = emailFiled.value;
    const password = passowrdField.value;
    const rePassword = rePassowrdField.value;
    console.log(firstName, lastName, email, password, rePassword);

    fetch('http://localhost:3000/user/customer/signup',{
    method: 'POST',
    body:JSON.stringify({
    firstName: firstName,
    lastName: lastName,
    email: email,
    password: password
    }),
    headers:{
        "Content-Type": "application/json",
    }
}).then(function (response) {
    return response.json()}).then(function(data) {
        if (data.statusCode == 201){
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        } else {
            document.getElementById('wrong').innerHTML = 'User Already Exists!'
        }
    })

});

function comparePassword(){
    const password = passowrdField.value;
    const rePassword = rePassowrdField.value;
    const matcher = document.getElementById('matcher');
    if (password != rePassword){
       matcher.innerHTML = "Password do not match!"; 
    }else{
        matcher.innerHTML = "";
    }
}