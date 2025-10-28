// index.html 
const bar = document.getElementById('bar')
const close = document.getElementById('close')
const nav = document.getElementById('nav')

if (bar) {
    bar.addEventListener('click', () => {
        nav.classList.add('active')
    })
}

if (close) {
    close.addEventListener('click', () => {
        nav.classList.remove('active')
    })
}

function createProductCard(product) {
    return `
      <div class="featured-card" 
      onclick="window.location.href='product.html?productId=${product.productId}&category=${product.category}';">
        <img src="${product.imageSrc}" alt="${product.name}" class="featured-img">
        <div class="details">
          <h3>${product.brand}</h3>
          <p>${product.name}</p>
          <div class="rating">
            ${'<img src="./img/misc/star.png" class="star">'.repeat(product.rating)}
          </div>
          <p>Rs.${product.price}
          <span style="text-decoration: line-through; color: #999; margin-left: 5px;">Rs.${product.price * 4 + 3}</span></p>
        </div>
      </div>
    `;
}

function loadProducts(jsonFile, sectionId) {
    fetch(jsonFile)
        .then(response => response.json())
        .then(products => {
            const section = document.getElementById(sectionId);
            section.innerHTML = products.map(createProductCard).join('');
        })
        .catch(error => console.error('Error loading products:', error));
}

document.addEventListener('DOMContentLoaded', () => {
    loadProducts('./api/featuredProducts.json', 'featured-products-section');
    loadProducts('./api/newArrivals.json', 'new-arrivals-section');
    loadProducts('./api/menProducts.json', 'men-products-section');
    loadProducts('./api/womenProducts.json', 'women-products-section');
});


// product.html
function loadFilteredProducts(jsonFile, sectionClass, category) {
    fetch(jsonFile)
        .then(response => response.json())
        .then(products => {
            const filteredProducts = products.filter(product => product.category === category);

            const section = document.querySelector(`.${sectionClass}`);
            section.innerHTML = filteredProducts.map(createProductCard).join('');
        })
        .catch(error => console.error('Error loading featured products:', error));
}

var mainImg = document.getElementById('mainImg')
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('productId');
const category = urlParams.get('category');

document.addEventListener('DOMContentLoaded', () => {
    fetch(`./api/${category}Products.json`)
        .then(response => response.json())
        .then(products => {
            const product = products.find(p => p.productId === productId);
            if (product) {
                document.title = product.name;
                mainImg.src = product.imageSrc;
                document.querySelector('.productDesc h5').innerText = `Home / ${product.category.charAt(0).toUpperCase() + product.category.slice(1)} / ${product.brand}`;
                document.querySelector('.productDesc h3').innerText = product.name;
                document.querySelector('.productDesc h1').innerHTML = `Rs.${product.price}
                <span style="text-decoration: line-through; color: #999; margin-left: 5px; font-weight: 450; 
                font-size: 0.7em;">Rs.${product.price * 4 + 3}</span>`;

                const thumbnailImagesContainer = document.getElementById('thumbnailImages');
                thumbnailImagesContainer.innerHTML = product.images.map(src => `
                <div class="small-Img">
                    <img src="./img/${product.category}/${src}.avif" class="smallImg" alt="Thumbnail" width="100%">
                </div>
                `).join('');

                const smallImgs = document.getElementsByClassName('smallImg');
                Array.from(smallImgs).forEach((img) => {
                    img.onclick = function () {
                        mainImg.src = img.src;
                    };
                });

                const navLinks = document.querySelectorAll('.nav-link');
                navLinks.forEach(link => link.classList.remove('active'));

                if (category === 'men') {
                    document.querySelector('a[href="men.html"]').classList.add('active');
                } else if (category === 'women') {
                    document.querySelector('a[href="women.html"]').classList.add('active');
                }

                loadFilteredProducts('./api/newArrivals.json', 'featured', category);

                const addToCartButton = document.getElementById('addToCartButton');
                const quantityInput = document.getElementById('quantityInput');
                
                const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
                const existingItemIndex = cartItems.findIndex(item => item.productId === productId);

                if (existingItemIndex > -1) {
                    quantityInput.value = cartItems[existingItemIndex].quantity; 
                    addToCartButton.innerText = 'Go to Cart'; 
                    addToCartButton.style.backgroundColor = "#3f0737";
                    addToCartButton.onclick = function() {
                        window.location.href = 'cart.html'; 
                    };
                }

                addToCartButton.addEventListener('click', () => {
                    const quantity = parseInt(quantityInput.value, 10);
                    // const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
                    const existingItem = cartItems.find(item => item.productId === product.productId);

                    if (existingItem) {
                        existingItem.quantity = quantity;
                    } else {
                        const cartItem = {
                            productId: product.productId,
                            category: product.category,
                            name: product.name,
                            price: product.price,
                            quantity: quantity,
                            imageSrc: product.imageSrc
                        };
                        cartItems.push(cartItem);
                    }

                    localStorage.setItem('cartItems', JSON.stringify(cartItems));

                    addToCartButton.innerText = 'Go to Cart';
                    addToCartButton.style.backgroundColor = "#3f0737";
                    addToCartButton.onclick = function () {
                        window.location.href = 'cart.html';
                    };
                });
            }
        })
        .catch(error => console.error('Error fetching product details:', error));

    displayCartItems();
})

function displayCartItems() {
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    const cartTableBody = document.getElementById('carttable').getElementsByTagName('tbody')[0];
    cartTableBody.innerHTML = '';    

    cartItems.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><a href="#" onclick="removeFromCart('${item.productId}')"><span class="material-symbols-outlined text-3xl">cancel</span></a></td>
            <td><img onclick="window.location.href='product.html?productId=${item.productId}&category=${item.category}';" style="cursor: pointer"; src="${item.imageSrc}" alt="${item.name}" /></td>
            <td>${item.name}</td>
            <td id="price">Rs. ${item.price}</td>
            <td id="quantity"><button style="border: 0.5px solid black; background-color: transparent; width: 50px;">${item.quantity}</button></td>
            <td id="subtot">Rs. ${item.price * item.quantity}</td>
        `;
        cartTableBody.appendChild(row);
    });

    const totalAmount = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    document.querySelector('#subtotal table').innerHTML = `
        <tr>
            <td>Cart Items Total Amount</td>
            <td>Rs. ${totalAmount}</td>
        </tr>
        <tr>
            <td>Shipping Cost</td>
            <td><span style="text-decoration: line-through; color: #999; margin-right: 5px; font-weight: 450;">Rs. 50</span> Free</td>
        </tr>
        <tr>
            <td><strong>Total Amount</strong></td>
            <td><strong>Rs. ${totalAmount}</strong></td>
        </tr>
    `;
}

function removeFromCart(productId) {
    let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    cartItems = cartItems.filter(item => item.productId !== productId);
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    location.reload();
}

// blog.htnl 
function createBlogCard(blog) {
    return `
      <div class="card">
        <div onclick="window.location.href='blogpost.html?blogId=${blog.blogId}';" class="card_image">
          <img src="${blog.imageSrc}" alt="${blog.title}" loading="lazy" class="card_img">
        </div>
        
        <div class="card_title_container">
          <a href="blogpost.html?blogId=${blog.blogId}">
            <h2 class="card_title">${blog.title}</h2>
          </a>
          <p class="card_desc">${blog.description}</p>
        </div>

        <div class="card_footer">
          <div class="author">
            <div class="author_avatar">
              <img src="https://api.dicebear.com/7.x/notionists/svg?seed=John?size=64" alt="${blog.author}" loading="lazy">
            </div>
            <div class="author_info">
              <span class="author_name">${blog.author}</span>
              <span class="author_date">${blog.date}</span>
            </div>
          </div>
          <div>
            <span class="card_tag">${blog.tag}</span>
          </div>
        </div>
      </div>
    `;
}

function loadBlogs(jsonFile, containerId) {
    fetch(jsonFile)
        .then(response => response.json())
        .then(blogs => {
            const container = document.getElementById(containerId);
            container.innerHTML = blogs.map(createBlogCard).join('');
        })
        .catch(error => console.error('Error loading blogs:', error));
}

document.addEventListener('DOMContentLoaded', () => {
    loadBlogs('./api/blog.json', 'blogContainer');
});