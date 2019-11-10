//variables
const cartBtn = document.getElementById("cart-btn");
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsOct = document.getElementById("octspecials");
const productsGrad = document.getElementById("graduation");
const productsAnniversary = document.getElementById("anniversary");
const subscribeBtn = document.getElementById("sub-btn");
const emailField = document.getElementById("email-field");
const successMsg = document.getElementById("success-msg");
const registerForm = document.getElementById("reg-form");
const loginForm = document.getElementById("login-form");
const emailExistMsg = document.getElementById("email-exist-msg");
const loginMsg = document.getElementById("login-msg");
const cartShipping = document.querySelector('.cart-shipping');
const cartFinalTotal = document.querySelector('.cart-final-total');
const paymentForm = document.getElementById("payment-form");

//cart 
let cart = [];
//add to cart buttons
let buttonsDOM = [];
//login elements
let loginEmail = document.getElementById("email-login");
let loginPass = document.getElementById("pw-login");
//register elements
let registerEmail = document.getElementById("email-register");
let registerPass = document.getElementById("pw-register");
//registered users
let users = [{
    email:"email@sample.com",
    password:"password"
}];


//getting the products
class Products{
    async getProducts(){
        try {
            //fetch product from json file
            let result = await fetch('products.json');
            let data = await result.json();
            let products = data.items;
            //return products in a more readable format
            products = products.map(items =>{
                const {title, price} = items.fields;
                const {id} = items.sys;
                const image = items.fields.image.fields.file.url;
                return{title,price,id,image};
            })
            return products;
        } catch (error) {
            console.log(error);
        }    
    }
}

//display product
class UI{
    displayProducts(products){
        let resultOct='';
        let resultGrad='';
        let resultAnniversary='';
        //loop through each product in the json file and dynamically display using HTML
        products.forEach(product => {
            let productDisplay = `
            <!-- single product-->
            <article class="product">
                <div class="img-container">
                    <img src="${product.image}" class="product-img">
                    <button class="bag-btn" data-id=${product.id}>Add to cart</button>
                </div>
                <h3>${product.title}</h3>
                <h4>RM ${product.price}</h4>
            </article>
            <!--end of single product -->
            `;
            //product will be under October Specials 
            if (product.id < 6){
                resultOct += productDisplay;
            }
            //product will be under Graduation
            if (product.id >= 6 && product.id < 10){
                resultGrad += productDisplay;
            }
            //product will be under Anniversary
            if (product.id >= 10){
                resultAnniversary += productDisplay;
            }  
        });
        if(productsOct){productsOct.innerHTML = resultOct;}
        if(productsGrad){productsGrad.innerHTML = resultGrad;}
        if(productsAnniversary){productsAnniversary.innerHTML = resultAnniversary;}    
    }
    getBagButtons(){
        //select all the "Add to cart" buttons to apply the same functionality for every one 
        const btns = [...document.querySelectorAll(".bag-btn")];
        buttonsDOM = btns;
        btns.forEach(btn => {
            let id = btn.dataset.id;
            let inCart = cart.find(item => item.id === id);
            //if the item is already in cart, change add to cart text and disable the button so user cannot add more of the same item
            if(inCart){
                btn.innerText = "In Cart";
                btn.disabled = true;
            }
            btn.addEventListener('click', (event)=>{
                event.target.innerText = "In Cart";
                event.target.disabled = true;
                //get product from products (with id)
                let cartItem = {...Storage.getProduct(id), amount:1};
                //add product to cart
                cart  = [...cart, cartItem];
                //save cart in local storage
                Storage.saveCart(cart);
                //set cart values
                this.setCartValues(cart);
                //display cart item
                this.addCartItem(cartItem);
                //show cart
                this.showCart();
            })   
        })
    }
    setCartValues(cart){
        //total price of all items in cart
        let tempTotal = 0;
        //number of items in cart
        let itemsTotal = 0;
        cart.map(item =>{
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        })
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        //for shipping & payment page, where final total is calculated
        if (cartFinalTotal){
            cartFinalTotal.innerText = parseFloat(tempTotal.toFixed(2));
        }
        //for pages that have cart icon, where number of items is shown
        if (cartBtn){
            cartItems.innerText = itemsTotal;
        }
    }
    addCartItem(item){
        const div = document.createElement('div')
        div.classList.add('cart-item');
        //dynamically display cart items using HTML
        //for shipping & payment page, where amount of items is not modifiable
        if(cartShipping){
            div.innerHTML = `
            <img src=${item.image}>
            <div>
                <h4>${item.title}</h4>
                <h5>RM ${item.price}</h5>
            </div>
            <div>
                <p class="item-amount item-amount-border">${item.amount}</p>                 
            </div>
            `;
        }else{
            //for other pages with cart, where amount of items is modifiable
            div.innerHTML = `
            <img src=${item.image}>
            <div>
                <h4>${item.title}</h4>
                <h5>RM ${item.price}</h5>
                <span class="remove-item" data-id=${item.id}>remove</span>
            </div>
            <div>
                <i class="fas fa-chevron-up" data-id=${item.id}></i>
                <p class="item-amount">${item.amount}</p>
                <i class="fas fa-chevron-down" data-id=${item.id}></i>   
            </div>
            `;
        }
        cartContent.appendChild(div);
    }   
    showCart(){
        cartOverlay.classList.add('transparentBg');
        cartDOM.classList.add('showCart');
    }
    setupApp(){
        //set up cart from local storage upon page load
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
        //for pages that have cart 
        if (cartBtn){
            cartBtn.addEventListener('click', this.showCart);
            closeCartBtn.addEventListener('click', this.hideCart);
        }        
    }
    populateCart(cart){
        cart.forEach(item =>this.addCartItem(item));
    }
    hideCart(){
        cartOverlay.classList.remove('transparentBg');
        cartDOM.classList.remove('showCart');
    }
    cartLogic(){
        //clear cart upon successful purchase
        if (paymentForm){
            paymentForm.addEventListener('submit',(e)=>{
              this.clearCart();
        })
        }
        //button to clear cart
        if (clearCartBtn){
            clearCartBtn.addEventListener('click', ()=>{
                this.clearCart();
            });
        }
        
        //cart functionality
        cartContent.addEventListener('click', event =>{
            if(event.target.classList.contains('remove-item')){
                //remove single item
                let removeItem = event.target;
                let id = removeItem.dataset.id;
                cartContent.removeChild(removeItem.parentElement.parentElement);
                this.removeItem(id);
            }else if(event.target.classList.contains('fa-chevron-up')){
                //increase number of items
                let addAmount = event.target;
                let id = addAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount += 1;
                Storage.saveCart(cart);
                this.setCartValues(cart);
                addAmount.nextElementSibling.innerText= tempItem.amount;
            }else if(event.target.classList.contains('fa-chevron-down')){
                //decrease number of items
                let lowerAmount = event.target;
                let id = lowerAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount -= 1;
                if (tempItem.amount > 0){
                    Storage.saveCart(cart);
                    this.setCartValues(cart);
                    lowerAmount.previousElementSibling.innerText= tempItem.amount;
                }else{
                    //remove item is number of items is decreased by user to 0
                    cartContent.removeChild(lowerAmount.parentElement.parentElement);
                    this.removeItem(id);
                }
            }
        })
    }
    clearCart(){
        let cartItems = cart.map(item => item.id);
        cartItems.forEach(id => this.removeItem(id));
        while(cartContent.children.length>0){
            //sequentially remove first item
            cartContent.removeChild(cartContent.children[0]);
        }
        this.hideCart();
    }
    removeItem(id){
        //will clear cart because id of item = id of item
        cart = cart.filter(item => item.id !== id);
        this.setCartValues(cart);
        Storage.saveCart(cart);
        //if the item is completely removed from cart, re-enable Add to cart button
        if(productsOct){
            //apply only to the button in which its product has been removed from cart
            let btn = this.getSingleButton(id);
            btn.disabled = false;
            btn.innerText = 'Add to cart';     
        }    
    }
    getSingleButton(id){
        return buttonsDOM.find(btn => btn.dataset.id === id);
    }
    footerLogic(){
        //when user has subscribed, inform user of successful subscription
        subscribeBtn.addEventListener('click', ()=>{
            emailField.parentNode.removeChild(emailField);
            subscribeBtn.parentNode.removeChild(subscribeBtn);
            successMsg.innerText="You are now subscribed to our newsletter."
        })
    }
}

class Validation{
    static checkLogin(){
        loginForm.addEventListener('submit',(e)=>{
            let loginEmailVal = loginEmail.value;
            let loginPassVal = loginPass.value;
            users = Storage.getUsers();
            //loop through each user in local storage and check if the email & password matches
            for(let i=0; i<users.length;i++){
                if(loginEmailVal == users[i].email && loginPassVal == users[i].password){
                    //if matches, display success message and redirect to main page
                    alert("You are now logged in!");  
                    return;
                }  
            };
            //if does not match, display error message and do not submit form
            loginMsg.innerText="Incorrect username or password! Try again."
            e.preventDefault();
        })
    }
    static checkRegister(){            
        registerForm.addEventListener('submit', (e)=>{
            let registerEmailVal = registerEmail.value;
            let registerPassVal = registerPass.value;
            let newUser = {
                email: registerEmailVal,
                password: registerPassVal
            }
            users = Storage.getUsers(); 
            //loop through each user in local storage and check if the email has been used before
            for(let i=0; i<users.length;i++){
                if(registerEmailVal == users[i].email){
                    //if email exists, display error message and do not submit form
                    emailExistMsg.innerText = "That email already exists!";
                    e.preventDefault();
                    return;               
                    }
            };
            //if email does not exist, add new user registration details to users and push to local storage, display success message and redirect to login page
            users.push(newUser);
            Storage.saveUser(users);
            alert("Your registration was successful! Please log in.");                                  
        });
    }   
}

//local storage
class Storage{
    static saveProducts(products){
        localStorage.setItem("products", JSON.stringify(products))
    }
    static getProduct(id){
        let products = JSON.parse(localStorage.getItem('products'));
        return products.find(product => product.id === id)
    }
    static saveCart(cart){
        localStorage.setItem("cart", JSON.stringify(cart))
    }
    static getCart(){
        //if there are items in cart, return items in cart, else: return empty cart
        return localStorage.getItem('cart')?JSON.parse(localStorage.getItem('cart')):[]
    }
    static saveUser(users){
        localStorage.setItem("users", JSON.stringify(users));
    }
    static getUsers(){
        return localStorage.getItem('users')?JSON.parse(localStorage.getItem('users')):[]
    }
}

//main
document.addEventListener("DOMContentLoaded", ()=>{
    const ui = new UI();
    const products = new Products();

    //setup application
    ui.setupApp();
    //footer - subscribe
    if(subscribeBtn){
        ui.footerLogic(); 
    }
    //login
    if(loginForm){
       Validation.checkLogin(); 
    }
    //register
    if(registerForm){
        Validation.checkRegister();
    }
    //get all products
    if (cartBtn){
        products.getProducts().then(products => {
            ui.displayProducts(products);
            Storage.saveProducts(products);
        }).then(()=> {
            ui.getBagButtons();
            ui.cartLogic();
        });
    }else{
        ui.cartLogic();
    }
})