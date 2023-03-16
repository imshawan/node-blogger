define('client/blog/index', [], function () {
    const index = {};

    index.initialize = function () {
        index.attachPageScrollEffects();

        $('.owl-carousel').owlCarousel({
            loop:true,
            margin:10,
            stagePadding: 60,
            responsiveClass:true,
            autoplay: true,
            autoplayTimeout:2500,
            autoplayHoverPause:true,
            navText: [
                '<i class="fa fa-angle-left" aria-hidden="true"></i>',
                '<i class="fa fa-angle-right" aria-hidden="true"></i>'
            ],
            navContainer: '.owl-main-content .custom-nav',
            responsive:{
                0:{
                    items:1,
                    nav:true,
                    stagePadding: false,
                    margin: 2
                },
                900:{
                    items:2,
                    nav:true,
                    stagePadding: 65,
                },
                1100:{
                    items:3,
                    nav:true,
                }
            }
        });
    }

    index.attachPageScrollEffects = function () {
        const nav = document.querySelector('.navbar')
        const allNavItems = document.querySelectorAll('.nav-link')
        const navList = document.querySelector('.navbar-collapse')
        const btn = document.querySelector('.navbar-toggler')
    
        function addShadow(){
            if (window.scrollY>=200) {
                nav.classList.add('shadow-bg')
            }
            else if(window.scrollY==0){
                nav.classList.remove('shadow-bg')
            }
    
        }
        function addShadowClick (){
            nav.classList.add('shadow-bg')
        }
    
        allNavItems.forEach(item => item.addEventListener('click',()=> navList.classList.remove('show')))
        btn.addEventListener('click', addShadowClick)
    
        window.addEventListener('scroll', addShadow)
    }

    return index;
})