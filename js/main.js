/*==================================================
PARTNERS CORP
MAIN.JS
==================================================*/


const menuButton =
    document.getElementById("menuButton");


const sidebar =
    document.getElementById("sidebar");


const sidebarClose =
    document.getElementById("sidebarClose");


const sidebarOverlay =
    document.getElementById("sidebarOverlay");


/*==================================================
ABRIR MENÚ
==================================================*/

function openSidebar() {

    sidebar.classList.add("active");

    sidebarOverlay.classList.add("active");

}


/*==================================================
CERRAR MENÚ
==================================================*/

function closeSidebar() {

    sidebar.classList.remove("active");

    sidebarOverlay.classList.remove("active");

}


/*==================================================
EVENTOS
==================================================*/

if (menuButton) {

    menuButton.addEventListener(
        "click",
        openSidebar
    );

}


if (sidebarClose) {

    sidebarClose.addEventListener(
        "click",
        closeSidebar
    );

}


if (sidebarOverlay) {

    sidebarOverlay.addEventListener(
        "click",
        closeSidebar
    );

}
/*==================================================
PARTNERS CORP
MAIN.JS
==================================================*/


/*==================================================
ELEMENTOS
==================================================*/

const menuToggle =
    document.querySelector(".menu-toggle");


const navLinks =
    document.querySelector(".nav-links");


/*==================================================
ABRIR / CERRAR MENÚ MÓVIL
==================================================*/

if (menuToggle && navLinks) {

    menuToggle.addEventListener(

        "click",

        () => {

            navLinks.classList.toggle("active");

        }

    );

}


/*==================================================
CERRAR MENÚ AL HACER CLICK EN UN ENLACE
==================================================*/

const links =
    document.querySelectorAll(".nav-links a");


links.forEach(

    link => {

        link.addEventListener(

            "click",

            () => {

                navLinks.classList.remove("active");

            }

        );

    }

);