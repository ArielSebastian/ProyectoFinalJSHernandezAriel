const cartItems = document.getElementById("cart-items");
const cartCount = document.getElementById("cart-count");
const cartTotal = document.getElementById("cart-total");
const clearCartBtn = document.getElementById("clear-cart");
const addToCartBtns = document.querySelectorAll(".add-to-cart");

let freeShippingAlertShown = false;

let cart = [];
let remerasData = []; 

function loadRemerasData() {
    return fetch("remeras.json")
        .then(response => response.json())
        .then(data => {
            remerasData = data;
        })
        .catch(error => {
            console.error("Error cargando datos de remeras:", error);
        });
}
loadRemerasData();

addToCartBtns.forEach((addToCartBtn) => {
	addToCartBtn.addEventListener("click", () => {
		const card = addToCartBtn.parentElement;
		const item = {
			image: card.querySelector("img").src,
			name: card.querySelector("h2").textContent,
			price: "100",
		};
		addItemToCart(item);
		showCartItems();
	});
});

function addItemToCart(item) {
    let itemInCart = false;
    const remeraData = remerasData.find(remera => remera.name === item.name);
    if (!remeraData) {
        console.error("No se encontraron datos para la remera:", item.name);
        return;
    }
    if (remeraData.stock === 0) {
        Swal.fire({
            icon: "error",
            title: `No hay stock de ${item.name}`,
            text: "Lo sentimos, no hay stock disponible para este producto.",
        });
        return;
    }
	if (!freeShippingAlertShown) {
        Swal.fire({
            icon: "success",
            title: "¡Envío sin cargo!",
            text: "Comprando en la próxima hora, el envío es gratuito.",
            timer: 5000,
        });
        freeShippingAlertShown = true;
    }
    cart.forEach((cartItem) => {
        if (cartItem.name === item.name) {
            cartItem.quantity++;
            itemInCart = true;
        }
    });
    if (!itemInCart) {
        item.quantity = 1;
        cart.push(item);
    }
    saveCart();
    showCartItems();
}

function showCartItems() {
	cartItems.innerHTML = "";
	const groupedCartItems = groupCartItems();
	groupedCartItems.forEach((cartItem) => {
		const li = document.createElement("li");
		li.innerHTML = `
    <img src="${cartItem.image}" alt="${cartItem.name}" style="width: 50%">
    <div>
	<h3>${cartItem.name}</h3>
        <p>Precio: $${cartItem.price}</p>
        <p>Cantidad: ${cartItem.quantity}</p>
        <button class="remove-item" data-name="${cartItem.name}">Eliminar</button>
    </div>
    `;
		cartItems.appendChild(li);
	});
	showCartTotal();
}

function groupCartItems() {
	const groupedCartItems = [];
	cart.forEach((cartItem) => {
		const index = groupedCartItems.findIndex((item) => item.name === cartItem.name);
		if (index === -1) {
			groupedCartItems.push(cartItem);
		} else {
			groupedCartItems[index].quantity += cartItem.quantity;
		}
	});
	return groupedCartItems;
}

function showCartTotal() {
	let total = 0;
	cart.forEach((cartItem) => {
		const price = parseFloat(cartItem.price.replace("$", ""));
		total += price * cartItem.quantity;
	});
	cartTotal.textContent = `$${total.toFixed(2)}`;
	cartCount.textContent = cart.length;
}

cartItems.addEventListener("click", (e) => {
	if (e.target.classList.contains("remove-item")) {
		const name = e.target.dataset.name;
		removeItemFromCart(name);
		showCartItems();
	}
});

function removeItemFromCart(name) {
	cart = cart.filter((cartItem) => cartItem.name !== name);
	saveCart();
}

clearCartBtn.addEventListener("click", () => {
	cart = [];
	saveCart();
	showCartItems();
});

function saveCart() {
	localStorage.setItem("cart", JSON.stringify(cart));
}

function loadCart() {
	cart = JSON.parse(localStorage.getItem("cart")) || [];
	showCartItems();
}

loadCart();