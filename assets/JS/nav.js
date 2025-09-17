const hamburger = document.querySelector('.hamburger');
const navList = document.querySelector('#nav_list');

hamburger.addEventListener('click', () => {
    navList.classList.toggle('active');
});