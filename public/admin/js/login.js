const toast = document.querySelector('.toast-container')
const toastText = document.querySelector('.login-message-text')
const toastSubText = document.querySelector('.login-sub-text')
const toastCross = document.querySelector('.cross-icon-toast')

document.addEventListener('DOMContentLoaded' , async ()=>{
    try {
        const response = await fetch('/api/v1/admin/checkLogin' , {
            method : 'GET',
            credentials : 'include',
        })
        const data = await response.json()
        if(response.ok) {
            window.location.href = '/admin/index.html'
        } 

    } catch (err) {
        console.log(err)
    }
})

document.getElementById('loginForm').addEventListener('submit' , async function (e) {
    e.preventDefault()

    const email = document.querySelector('#email').value.trim()
    const password = document.querySelector('#password').value.trim()

    const loginBtn = document.querySelector('.btn-login');
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...'
    loginBtn.disabled = true;

    try {
        const response = await fetch('/api/v1/admin/login' , {
            method: 'POST',
            headers : {
                'Content-type' : 'application/json'
            },
            credentials : 'include',
            body : JSON.stringify({email , password})
        })
    
        const data = await response.json()
    
        if(!response.ok){
            toastSubText.innerHTML = data.message
            toast.style.display = 'block'
            toastCross.addEventListener('click' , (e)=>{
                e.preventDefault()
                toast.style.display = 'none'
            })
        } else {
            window.location.href = '/admin/index.html'
        }
        
    } catch (err) {
        console.log(`unable to login due to ${err}`)
    } finally {
        loginBtn.innerHTML = `<i class="fas fa-sign-in-alt"></i> Login to Dashboard`
        loginBtn.disabled = false
    }

})