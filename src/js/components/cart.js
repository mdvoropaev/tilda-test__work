document.addEventListener("DOMContentLoaded", () => {
    const productsBtn = document.querySelectorAll(".product__btn");
    const cartProductsList = document.querySelector(".cart-content__list");
    const cart = document.querySelector(".cart");
    const active = document.querySelector(".active");
    const cartQuantity = document.querySelector(".cart__quantity");
    const fullPrice = document.querySelector(".fullprice");
    const orderModalList = document.querySelector(".order__modal-list");
    let price = 0;

    //add random id for cards
    const randomId = () => {
        return (
            Math.random()
            .toString(36)
            .substring(2, 15) +
            Math.random()
            .toString(36)
            .substring(2, 15)
        );
    };

    //deleted spaces in price
    const priceWithoutSpaces = str => {
        return str.replace(/\s/g, "");
    };

    //placing correct spaces
    const normalPrice = str => {
        return String(str).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, "$1 ");
    };

    //summ
    const plusFullPrice = currentPrice => {
        return (price += currentPrice);
    };

    const minusFullPrice = currentPrice => {
        return (price -= currentPrice);
    };

    //print full price
    const printFullPrice = () => {
        fullPrice.textContent = `${normalPrice(price)} р.`;
    };

    //count and print quantity
    const printQuantity = () => {
        let length = cartProductsList.querySelector(".simplebar-content").children
            .length;
        cartQuantity.textContent = length;
        length > 0 ? cart.classList.add("active") : cart.classList.remove("active");
    };
    //generate cart product
    const generateCartProduct = (img, title, price, id, quantityGoods) => {
        return `

    <li class="cart-content__item">
         <article class="cart-content__product cart-product" data-id="${id}">
           <img src="${img}" alt="${title}" class="cart-product__img">
           <div class="cart-product__text">
             <h3 class="cart-product__title">${title}</h3>
             <div class="cart-product__quantity quantity-goods">
                <button class="quantity-goods__btn btn minus">&mdash;</button>
                <span class="quantity-goods__sum">${quantityGoods}</span>
                <button class="quantity-goods__btn btn plus">+</button>
             </div>
             <span class="cart-product__price" data-price="${normalPrice(
               price
             )}">${normalPrice(price)} р.</span>
           </div>
           <button class="cart-product__delete" aria-label="Удалить товар"></button>
         </article>
    </li>
    `;
    };

    //delete products in basket
    const deleteProducts = productParent => {
        let id = productParent.querySelector(".cart-product").dataset.id; //get the id
        document
            .querySelector(`.product[data-id="${id}"]`)
            .querySelector(".product__btn").disabled = false; //disabled false

        let currentPrice = parseInt(
            priceWithoutSpaces(
                productParent.querySelector(".cart-product__price").textContent
            )
        );
        minusFullPrice(currentPrice); //minus price
        printFullPrice(); //print fullprice
        productParent.remove(); //remove productParent
        printQuantity(); //count and print quantity
    };

    //quantity of goods and cost calculator
    const plusQuantityGoods = () => {
        let cartId = event.target.closest(".cart-product[data-id]");
        let quantityGoodsSum = cartId.querySelector(".quantity-goods__sum");
        let cartProdPrice = cartId.querySelector(".cart-product__price");
        let fixedPrice = priceWithoutSpaces(
            cartProdPrice.getAttribute("data-price")
        );
        let currentPrice = parseInt(
            priceWithoutSpaces(
                cartId.querySelector(".cart-product__price").textContent
            )
        );
        let n = quantityGoodsSum.textContent;
        n++;
        quantityGoodsSum.innerHTML = n;

        cartProdPrice.textContent =
            normalPrice(currentPrice + Number(fixedPrice)) + " р.";

        plusFullPrice(Number(fixedPrice));
        printFullPrice();
        printQuantity();
    };

    const minusQuantityGoods = () => {
        let cartId = event.target.closest(".cart-product[data-id]");
        let quantityGoodsSum = cartId.querySelector(".quantity-goods__sum");
        let cartProdPrice = cartId.querySelector(".cart-product__price");
        let fixedPrice = priceWithoutSpaces(
            cartProdPrice.getAttribute("data-price")
        );
        let currentPrice = parseInt(
            priceWithoutSpaces(
                cartId.querySelector(".cart-product__price").textContent
            )
        );
        let n = quantityGoodsSum.textContent;

        if (n >= 2) {
            n--;
            quantityGoodsSum.innerHTML = n;
            cartProdPrice.textContent =
                normalPrice(currentPrice - Number(fixedPrice)) + " р.";

            minusFullPrice(Number(fixedPrice));
            printFullPrice();
            printQuantity();
        }
    };

    productsBtn.forEach(el => {
        el.closest(".product").setAttribute("data-id", randomId());
        el.addEventListener("click", e => {
            let self = e.currentTarget;
            let parent = self.closest(".product");
            let id = parent.dataset.id;
            let img = parent.querySelector(".image").getAttribute("src");
            let title = parent.querySelector(".product__title").textContent;
            let priceNumber = parseInt(
                priceWithoutSpaces(
                    parent.querySelector(".product-price__actual").textContent
                )
            );
            let quantityGoods = 1;

            plusFullPrice(priceNumber);
            printFullPrice();

            //add to cart
            cartProductsList
                .querySelector(".simplebar-content")
                .insertAdjacentHTML(
                    "afterbegin",
                    generateCartProduct(img, title, priceNumber, id, quantityGoods)
                );

            printQuantity();

            //disabled btn
            self.disabled = true;
        });
    });

    cartProductsList.addEventListener("click", event => {
        if (event.target.classList.contains("cart-product__delete")) {
            deleteProducts(event.target.closest(".cart-content__item"));
        }

        if (event.target.classList.contains("plus")) {
            plusQuantityGoods();
        }
        if (event.target.classList.contains("minus")) {
            minusQuantityGoods();
        }
    });

    const generateModalProduct = (img, title, price, id, quantityGoods) => {
        return `

    <li class="order__modal-item">
      <article class="order-modal__product order-product" data-id="${id}">
        <img src="${img}" alt="${title}" class="order-product__img">
        <div class="order-product__text">
          <h3 class="order-product__title">${title}</h3>
          <span class="order-product__price">${normalPrice(price)}</span>
        </div>
        <div class="order-product__quantity-goods">
          <div class="order-product__sum"><span class="text">кол-во:</span> <span class="sum">${quantityGoods}</span> шт.</div>
        </div>
      </article>
    </li>
    `;
    };

    const modal = new Modal({
        isOpen: modal => {
            console.log("opened");
            let array = cartProductsList.querySelector(".simplebar-content").children;
            let fullPrice = document.querySelector(".fullprice").textContent;

            for (item of array) {
                let img = item.querySelector(".cart-product__img").getAttribute("src");
                let title = item.querySelector(".cart-product__title").textContent;
                let quantityGoods = item.querySelector(".quantity-goods__sum")
                    .textContent;
                let priceString = priceWithoutSpaces(
                    item.querySelector(".cart-product__price").textContent
                );
                let id = item.querySelector(".cart-product").dataset.id;

                orderModalList.insertAdjacentHTML(
                    "afterbegin",
                    generateModalProduct(img, title, priceString, id, quantityGoods)
                );
                document.querySelector(
                    ".order__modal-summ span"
                ).textContent = `${fullPrice}`;
            }
        },
        isClose: () => {
            console.log("closed");
        }
    });

    //multi-step shape
    let currentTab = 0;
    let prevBtn = document.querySelector(".prev-btn");
    let nextBtn = document.querySelector(".next-btn");
    let submitBtn = document.querySelector(".submit-btn");
    let x = document.querySelectorAll(".tab");
    let step = document.querySelectorAll(".step");
    let regForm = document.querySelectorAll(".order");
    showTab(currentTab);

    function showTab(n) {
        x[n].style.display = "block";
        if (n == 0) {
            prevBtn.style.display = "none";
            submitBtn.style.display = "none";
        } else {
            prevBtn.style.display = "block";
        }
        if (n == x.length - 1) {
            nextBtn.style.display = "none";
            submitBtn.style.display = "block";
        } else {
            nextBtn.style.display = "block";
            submitBtn.style.display = "none";
        }
        fixStepIndicator(n);
    }

    function nextPrev(n) {
        if (n == 1 && !validateForm()) return false;
        x[currentTab].style.display = "none";
        currentTab = currentTab + n;
        if (currentTab >= x.length) {
            regForm.submit();
            return false;
        }
        showTab(currentTab);
    }

    prevBtn.addEventListener('click', () => {
        nextPrev(-1);
    });

    nextBtn.addEventListener('click', () => {
        nextPrev(1);
    });

    function validateForm() {
        let t,
            y,
            i,
            valid = true;
        t = document.querySelectorAll(".tab");
        y = t[currentTab].querySelectorAll(".input");
        for (i = 0; i < y.length; i++) {
            if (y[i].value == "") {
                y[i].className += " invalid error";
                valid = false;
            }
        }
        if (valid) {
            step[currentTab].className += " finish";
        }
        return valid;
    }



    function fixStepIndicator(n) {
        let i,
            s = document.querySelectorAll(".step");
        for (i = 0; i < s.length; i++) {
            s[i].className = s[i].className.replace(" active", "");
        }
        s[n].className += " active";
    }

    //InputMask
    let inputTel = document.querySelectorAll('input[type="tel"]');
    let imTel = new Inputmask('+7 (999) 999-99-99');
    imTel.mask(inputTel);

});

class Modal {
    constructor(options) {
        let defaultOptions = {
            isOpen: () => {},
            isClose: () => {}
        };
        this.options = Object.assign(defaultOptions, options);
        this.modal = document.querySelector(".modal");
        this.speed = 300;
        this.animation = false;
        this.reOpen = false;
        this.nextWindow = false;
        this.modalContainer = false;
        this.isOpened = false;
        this.previousActiveElement = false;
        this._focusElements = [
            "a[href]",
            "area[href]",
            'input:not([disabled]):not([type="hidden"]):not([aria-hidden])',
            "select:not([disabled]):not([aria-hidden])",
            "textarea:not([disabled]):not([aria-hidden])",
            "button:not([disabled]):not([aria-hidden])",
            "iframe",
            "object",
            "embed",
            "[contenteditable]",
            '[tabindex]:not([tabindex^="-"])'
        ];
        this.fixBlocks = document.querySelectorAll(".fix-block");
        this.events();
    }

    events() {
        document.addEventListener(
            "click",
            function (e) {
                const clickedElement = e.target.closest(`[data-graph-path]`);
                if (clickedElement) {
                    let target = clickedElement.dataset.graphPath;
                    let animation = clickedElement.dataset.graphAnimation;
                    let speed = clickedElement.dataset.graphSpeed;
                    this.animation = animation ? animation : "fade";
                    this.speed = speed ? parseInt(speed) : 300;
                    this.nextWindow = document.querySelector(
                        `[data-graph-target="${target}"]`
                    );
                    this.open();
                    return;
                }

                if (e.target.closest(".modal__close")) {
                    this.close();
                    return;
                }
            }.bind(this)
        );

        window.addEventListener(
            "keydown",
            function (e) {
                if (e.keyCode == 27) {
                    if (this.modalContainer.classList.contains("modal-open")) {
                        this.close();
                    }
                }

                if (e.which == 9 && this.isOpened) {
                    this.focusCatch(e);
                    return;
                }
            }.bind(this)
        );

        this.modal.addEventListener(
            "click",
            function (e) {
                if (
                    !e.target.classList.contains("modal__container") &&
                    !e.target.closest(".modal__container") &&
                    this.isOpened
                ) {
                    this.close();
                }
            }.bind(this)
        );
    }

    open(selector) {
        this.previousActiveElement = document.activeElement;

        if (this.isOpened) {
            this.reOpen = true;
            this.close();
            return;
        }

        this.modalContainer = this.nextWindow;

        if (selector) {
            this.modalContainer = document.querySelector(
                `[data-graph-target="${selector}"]`
            );
        }

        this.modal.style.setProperty("--transition-time", `${this.speed / 1000}s`);
        this.modal.classList.add("is-open");
        this.disableScroll();

        this.modalContainer.classList.add("modal-open");
        this.modalContainer.classList.add(this.animation);

        setTimeout(() => {
            this.options.isOpen(this);
            this.modalContainer.classList.add("animate-open");
            this.isOpened = true;
            this.focusTrap();
        }, this.speed);
    }

    close() {
        if (this.modalContainer) {
            this.modalContainer.classList.remove("animate-open");
            this.modalContainer.classList.remove(this.animation);
            this.modal.classList.remove("is-open");
            this.modalContainer.classList.remove("modal-open");

            this.enableScroll();
            this.options.isClose(this);
            this.isOpened = false;
            this.focusTrap();

            if (this.reOpen) {
                this.reOpen = false;
                this.open();
            }
        }
    }

    focusCatch(e) {
        const nodes = this.modalContainer.querySelectorAll(this._focusElements);
        const nodesArray = Array.prototype.slice.call(nodes);
        const focusedItemIndex = nodesArray.indexOf(document.activeElement);
        if (e.shiftKey && focusedItemIndex === 0) {
            nodesArray[nodesArray.length - 1].focus();
            e.preventDefault();
        }
        if (!e.shiftKey && focusedItemIndex === nodesArray.length - 1) {
            nodesArray[0].focus();
            e.preventDefault();
        }
    }

    focusTrap() {
        const nodes = this.modalContainer.querySelectorAll(this._focusElements);
        if (this.isOpened) {
            if (nodes.length) nodes[0].focus();
        } else {
            this.previousActiveElement.focus();
        }
    }

    disableScroll() {
        let pagePosition = window.scrollY;
        this.lockPadding();
        document.body.classList.add("disable-scroll");
        document.body.dataset.position = pagePosition;
        document.body.style.top = -pagePosition + "px";
    }

    enableScroll() {
        let pagePosition = parseInt(document.body.dataset.position, 10);
        this.unlockPadding();
        document.body.style.top = "auto";
        document.body.classList.remove("disable-scroll");
        window.scroll({
            top: pagePosition,
            left: 0
        });
        document.body.removeAttribute("data-position");
    }

    lockPadding() {
        let paddingOffset = window.innerWidth - document.body.offsetWidth + "px";
        this.fixBlocks.forEach(el => {
            el.style.paddingRight = paddingOffset;
        });
        document.body.style.paddingRight = paddingOffset;
    }

    unlockPadding() {
        this.fixBlocks.forEach(el => {
            el.style.paddingRight = "0px";
        });
        document.body.style.paddingRight = "0px";
    }
}