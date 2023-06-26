function logout(){
    localStorage.setItem('access_token', '')
    window.open('login.html', '_self')
}