document.addEventListener('DOMContentLoaded', () => {
    const content = document.querySelector('.product-content');
    const header = document.querySelector('.header');

    window.addEventListener('scroll', () => {
        let scrollTop = window.scrollY;
        let contentCenter = content.offsetHeight / 6;


        if (scrollTop >= contentCenter) {
            header.classList.add('fixed');
            content.style.marginTop = `${header.offsetHeight}px`;
        } else {
            header.classList.remove('fixed');
            content.style.marginTop = `0px`;
        }
    });

    const burger = document.querySelector('.burger');
    const navClose = document.querySelector('.nav__close');
    const nav = document.querySelector('.nav__list');
    const basketBtn = document.querySelector('.header__cart')

    burger.addEventListener('click', () => {
        nav.classList.add('--visible');
        basketBtn.style.display = 'none';
    });

    navClose.addEventListener('click', () => {
        nav.classList.remove('--visible');
        basketBtn.style.display = 'block';
    });

    nav.addEventListener('click', (e) => {
        if (e.target.classList.contains('nav__link')) {
            nav.classList.remove('--visible');
            basketBtn.style.display = 'block';
        }
    });

});