document.addEventListener("DOMContentLoaded", function () {
    document.querySelector("a[href='#footer']").addEventListener("click", function (event) {
        event.preventDefault();

        const targetElement = document.getElementById("footer");
        targetElement.scrollIntoView({ behavior: "smooth" });
    });
    
    function toggleMenu() {
        var menu = document.querySelector('.menu');
        menu.classList.toggle('show');
    }
    // Add your toggleMenu() function here or import it if it's defined in another file.
});
