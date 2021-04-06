const cardsProduct = () => {
    class ProdCard {
        constructor(
            className,
            src,
            alt,
            title,
            price,
            parentSelector
        ) {
            this.className = className;
            this.src = src;
            this.title = title;
            this.alt = alt;
            this.price = price;
            this.parent = document.querySelector(parentSelector);
        }

        render() {
            const element = document.createElement("li");
            element.className = "catalog-list__item";
            element.innerHTML = `
            <article class = "product ${this.className}">
            <a href="#" class="product__wrapper">
              <div class = "product__image" >
                <img class = "image"
                src = "${this.src}"
                alt = "${this.alt}"
                title = "${this.title}">
                <span class="preview">Быстрый просмотр</span>
              </div> 
              <h3 class="product__title h3">${this.title}</h3> 
                <div class = "product__price product-price">
                  <span class="product-price__actual">${this.price}</span>
                </div>
            </a>    
                <button class="product__btn btn">Добавить в&nbsp;корзину</button>
              </article>
        `;
            this.parent.append(element);
        }
    }
    const a = require('../components/goods.json');
    const arr = Object.values(a);
    // console.log(arr);

    arr.forEach(function (i) {
        new ProdCard(
            i.className,
            i.src,
            i.alt,
            i.title,
            i.price,
            ".catalog-list"
        ).render();
    });
};

cardsProduct();