class Article {
    constructor(public name: string, public description: string, public price: number, public imageUrl: string) {}
}

class Cart {
    private items: Article[] = [];
    public total: number = 0;

    addToCart(article: Article) {
        this.items.push(article);
        this.updateCartUI();
        const popupText = `${article.name} added to cart`;
        showPopup(popupText);
    }

    removeAfterPurchase () {
        this.items = [];
        this.updateCartUI();
        const popupText = "Purchase successful!"
        showPopup(popupText);
    }

    removeFromCart(index: number) {
        const article = this.items.splice(index, 1);
        (<HTMLButtonElement>document.getElementById(`${article[0].name}`)).disabled=false;
        this.updateCartUI();
    }

    private updateCartUI(): void {
        const cart = document.getElementById('cartItems');
        const totalPrice = document.getElementById('totalPrice');
        const payButton = <HTMLButtonElement>document.getElementById('payButton');

        cart!.innerHTML = '';
        this.total = 0;

        if (this.items.length == 0) {
            cart!.textContent = 'so empty';
            payButton!.disabled = true;
            totalPrice!.textContent = '';
        }

        else {
            this.items.forEach((item, index) => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `
                    <span>${item.name}</span>
                    <span>${item.price} 0x923439be515b6a928cb9650d70000a9044e49e85 </span>
                    
                `
                const button = document.createElement('button');
                button.className= 'article button'
                button.textContent = "remove";
                button.addEventListener('click', () => this.removeFromCart(index));
                listItem.appendChild(button);
                cart?.appendChild(listItem);
                this.total += item.price;
            })

            totalPrice!.textContent = `Total: ${this.total} 0x923439be515b6a928cb9650d70000a9044e49e85`;
            payButton!.disabled = false;
        }
    }
}



function openPopup () {
    const popup = window.open('../ext/dist/index.html', 'Popup', 'width=800,height=1000,location=no,menubar=no,toolbar=no');
    const address = {type: 'address', options: {address1: '0x69c6aBd542d2e64E618', address2: '177d2c5E617dFC3620ba7'}};
    const amount = {type: 'amount', options: {amount: cart.total}};
    const tokenAddress = {type: 'tokenAddress', options: {address: '0x923439be515b6a928cb9650d70000a9044e49e85'}};

    window.addEventListener('message', (event) => {
        if (event.source === popup && event.data.type === 'popupResult') {
            popup!.close();
            showPopup(event.data.result.value)
            cart.removeAfterPurchase();
        }
        if (event.source === popup && event.data.type === 'ready') {
            popup!.postMessage(address, '*');
            popup!.postMessage(amount, '*');
            popup!.postMessage(tokenAddress, '*');
        }
    });
}


const cart = new Cart();
const cartButton = document.getElementById('cartButton');
const payButton = document.getElementById('payButton');


payButton?.addEventListener('click', async function() {
    openPopup();
});

cartButton?.addEventListener('click', function () {
    if (document.getElementById('cart')!.style.display == 'none') {
        document.getElementById('cart')!.style.display = 'block';
    }
    else {
        document.getElementById('cart')!.style.display = 'none';
    }

})

const articles: Article[] = [
    new Article('BP Gruppe 55 #1', 'Token ID: 1', 1, '/src/pics/article1.jpg'),
    new Article('BP Gruppe 55 #2', 'Token ID: 2', 1, '/src/pics/article2.jpg'),
    new Article('BP Gruppe 55 #3', 'Token ID: 3', 1, '/src/pics/article3.jpg'),
    new Article('BP Gruppe 55 #4', 'Token ID: 4', 1, '/src/pics/article4.jpg'),
    new Article('BP Gruppe 55 #5', 'Token ID: 5', 1, '/src/pics/article5.jpg'),
    new Article('BP Gruppe 55 #6', 'Token ID: 6', 1, '/src/pics/article6.jpg')
];

function renderArticles() {
    const container = document.getElementById('article-container');
    if (container) {
        container.innerHTML = '';

        articles.forEach(article => {
            const articleDiv = document.createElement('div');
            articleDiv.className = 'article';

            const image = document.createElement('img');
            image.src = article.imageUrl;
            image.alt = article.name;

            const heading = document.createElement('h2');
            heading.textContent = article.name;

            const description = document.createElement('p');
            description.textContent = article.description;

            const price = document.createElement('p');
            price.textContent = `Aktueller Preis: ${article.price} 0x9234...9e85`;
            price.title = '0x923439be515b6a928cb9650d70000a9044e49e85';

            const button = document.createElement('button');
            button.className= 'article button';
            button.id = `${article.name}`
            button.textContent = "Add to cart";
            button.addEventListener('click', function() {
                cart.addToCart(article);
                button.disabled=true;
            })

            articleDiv.appendChild(image);
            articleDiv.appendChild(heading);
            articleDiv.appendChild(description);
            articleDiv.appendChild(price);
            articleDiv.appendChild(button);

            container.appendChild(articleDiv);
        });
    }
}


const popup = document.getElementById("popup")


function showPopup (message: string) {
    if(popup) {
        popup.textContent = message;
        popup.style.display = 'block';

        setTimeout(() => {
            popup.style.display = 'none';
        }, 2000);
    }
}

document.addEventListener('DOMContentLoaded', renderArticles);
