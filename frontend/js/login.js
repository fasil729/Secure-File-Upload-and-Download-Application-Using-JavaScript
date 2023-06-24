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
        console.log("logging data");
        console.log(data);
    })
})
