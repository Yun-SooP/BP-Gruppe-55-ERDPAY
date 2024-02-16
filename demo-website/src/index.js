var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var Article = /** @class */ (function () {
    function Article(name, description, price, imageUrl) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.imageUrl = imageUrl;
    }
    return Article;
}());
var Cart = /** @class */ (function () {
    function Cart() {
        this.items = [];
        this.total = 0;
    }
    Cart.prototype.addToCart = function (article) {
        this.items.push(article);
        this.updateCartUI();
        var popupText = "".concat(article.name, " added to cart");
        showPopup(popupText);
    };
    Cart.prototype.removeAfterPurchase = function () {
        this.items = [];
        this.updateCartUI();
        var popupText = "Purchase successful!";
        showPopup(popupText);
    };
    Cart.prototype.removeFromCart = function (index) {
        var article = this.items.splice(index, 1);
        document.getElementById("".concat(article[0].name)).disabled = false;
        this.updateCartUI();
    };
    Cart.prototype.updateCartUI = function () {
        var _this = this;
        var cart = document.getElementById('cartItems');
        var totalPrice = document.getElementById('totalPrice');
        var payButton = document.getElementById('payButton');
        cart.innerHTML = '';
        this.total = 0;
        if (this.items.length == 0) {
            cart.textContent = 'so empty';
            payButton.disabled = true;
            totalPrice.textContent = '';
        }
        else {
            this.items.forEach(function (item, index) {
                var listItem = document.createElement('li');
                listItem.innerHTML = "\n                    <span>".concat(item.name, "</span>\n                    <span>").concat(item.price, " 0x923439be515b6a928cb9650d70000a9044e49e85 </span>\n                    \n                ");
                var button = document.createElement('button');
                button.className = 'article button';
                button.textContent = "remove";
                button.addEventListener('click', function () { return _this.removeFromCart(index); });
                listItem.appendChild(button);
                cart === null || cart === void 0 ? void 0 : cart.appendChild(listItem);
                _this.total += item.price;
            });
            totalPrice.textContent = "Total: ".concat(this.total, " 0x923439be515b6a928cb9650d70000a9044e49e85");
            payButton.disabled = false;
        }
    };
    return Cart;
}());
function openPopup() {
    var popup = window.open('../ext/dist/index.html', 'Popup', 'width=800,height=1000,location=no,menubar=no,toolbar=no');
    var address = { type: 'address', options: { address1: '0x69c6aBd542d2e64E618', address2: '177d2c5E617dFC3620ba7' } };
    var amount = { type: 'amount', options: { amount: cart.total } };
    var tokenAddress = { type: 'tokenAddress', options: { address: '0x923439be515b6a928cb9650d70000a9044e49e85' } };
    window.addEventListener('message', function (event) {
        if (event.source === popup && event.data.type === 'popupResult') {
            popup.close();
            showPopup(event.data.result.value);
            cart.removeAfterPurchase();
        }
        if (event.source === popup && event.data.type === 'ready') {
            popup.postMessage(address, '*');
            popup.postMessage(amount, '*');
            popup.postMessage(tokenAddress, '*');
        }
    });
}
var cart = new Cart();
var cartButton = document.getElementById('cartButton');
var payButton = document.getElementById('payButton');
payButton === null || payButton === void 0 ? void 0 : payButton.addEventListener('click', function () {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            openPopup();
            return [2 /*return*/];
        });
    });
});
cartButton === null || cartButton === void 0 ? void 0 : cartButton.addEventListener('click', function () {
    if (document.getElementById('cart').style.display == 'none') {
        document.getElementById('cart').style.display = 'block';
    }
    else {
        document.getElementById('cart').style.display = 'none';
    }
});
var articles = [
    new Article('BP Gruppe 55 #1', 'Token ID: 1', 1, '/src/pics/article1.jpg'),
    new Article('BP Gruppe 55 #2', 'Token ID: 2', 1, '/src/pics/article2.jpg'),
    new Article('BP Gruppe 55 #3', 'Token ID: 3', 1, '/src/pics/article3.jpg'),
    new Article('BP Gruppe 55 #4', 'Token ID: 4', 1, '/src/pics/article4.jpg'),
    new Article('BP Gruppe 55 #5', 'Token ID: 5', 1, '/src/pics/article5.jpg'),
    new Article('BP Gruppe 55 #6', 'Token ID: 6', 1, '/src/pics/article6.jpg')
];
function renderArticles() {
    var container = document.getElementById('article-container');
    if (container) {
        container.innerHTML = '';
        articles.forEach(function (article) {
            var articleDiv = document.createElement('div');
            articleDiv.className = 'article';
            var image = document.createElement('img');
            image.src = article.imageUrl;
            image.alt = article.name;
            var heading = document.createElement('h2');
            heading.textContent = article.name;
            var description = document.createElement('p');
            description.textContent = article.description;
            var price = document.createElement('p');
            price.textContent = "Aktueller Preis: ".concat(article.price, " 0x9234...9e85");
            price.title = '0x923439be515b6a928cb9650d70000a9044e49e85';
            var button = document.createElement('button');
            button.className = 'article button';
            button.id = "".concat(article.name);
            button.textContent = "Add to cart";
            button.addEventListener('click', function () {
                cart.addToCart(article);
                button.disabled = true;
            });
            articleDiv.appendChild(image);
            articleDiv.appendChild(heading);
            articleDiv.appendChild(description);
            articleDiv.appendChild(price);
            articleDiv.appendChild(button);
            container.appendChild(articleDiv);
        });
    }
}
var popup = document.getElementById("popup");
function showPopup(message) {
    if (popup) {
        popup.textContent = message;
        popup.style.display = 'block';
        setTimeout(function () {
            popup.style.display = 'none';
        }, 2000);
    }
}
document.addEventListener('DOMContentLoaded', renderArticles);
