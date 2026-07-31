/*==================================================
PARTNERS CORP
LOGIN.JS
==================================================*/


/*==================================================
ELEMENTOS
==================================================*/

const loginForm =
    document.getElementById("loginForm");

const loginMessage =
    document.getElementById("loginMessage");


/*==================================================
SI YA ESTÁ LOGUEADO
==================================================*/

(async () => {

    const {

        data: {

            session

        }

    } = await supabaseClient.auth.getSession();

    if (session) {

        window.location.href =
            "admin.html";

    }

})();


/*==================================================
LOGIN
==================================================*/

loginForm.addEventListener(

    "submit",

    async event => {

        event.preventDefault();

        loginMessage.textContent =
            "Iniciando sesión...";


        const email =
            document
            .getElementById("email")
            .value
            .trim();


        const password =
            document
            .getElementById("password")
            .value;


        const {

            error

        } = await supabaseClient.auth.signInWithPassword({

            email,

            password

        });


        if (error) {

            loginMessage.style.color =
                "#ff6b6b";

            loginMessage.textContent =
                "Correo o contraseña incorrectos.";

            return;

        }


        loginMessage.style.color =
            "#61d095";

        loginMessage.textContent =
            "Bienvenido.";


        setTimeout(() => {

            window.location.href =
                "admin.html";

        }, 800);

    }

);