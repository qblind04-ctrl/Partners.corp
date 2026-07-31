/*==================================================
PARTNERS CORP
HOMBRES.JS
==================================================*/


/*==================================================
VARIABLES
==================================================*/

let currentTalents = [];


/*==================================================
ELEMENTOS
==================================================*/

const talentsGrid =
    document.getElementById("talentsGrid");


const loading =
    document.getElementById("loading");


const talentModal =
    document.getElementById("talentModal");


const modalContent =
    document.getElementById("modalContent");


const closeModal =
    document.getElementById("closeModal");


/*==================================================
CARGAR MAESTROS DE CEREMONIA
==================================================*/

async function loadMenTalents() {


    const {

        data,

        error

    } = await supabaseClient

        .from("talentos")

        .select("*")

        .eq(

            "categoria",

            "hombres"

        );


    console.log(

        "DATOS RECIBIDOS:",

        data

    );


    if (error) {


        console.error(

            "ERROR:",

            error

        );


        loading.textContent =

            "Error cargando talentos.";


        return;

    }


    currentTalents =

        data || [];


    if (loading) {

        loading.remove();

    }


    if (

        !data ||

        data.length === 0

    ) {


        talentsGrid.innerHTML = `

            <div class="empty-state">

                <h3>

                    No hay maestros disponibles

                </h3>


                <p>

                    Próximamente agregaremos

                    nuevos profesionales.

                </p>

            </div>

        `;


        return;

    }


    data.forEach(

        talent => {

            createTalentCard(talent);

        }

    );

}


/*==================================================
CREAR TARJETA
==================================================*/

function createTalentCard(talent) {


    const card =

        document.createElement(

            "article"

        );


    card.className =

        "card";


    const specializations =

        Array.isArray(

            talent.especializaciones

        )

            ? talent.especializaciones

            : [];


    const tags =

        specializations

            .map(

                specialization => `

                    <span>

                        ${specialization}

                    </span>

                `

            )

            .join("");


    card.innerHTML = `

        <div class="card-image">


            <img

                src="${talent.imagen_url || "assets/default.jpg"}"

                alt="${talent.nombre}"

            >


        </div>


        <div class="card-content">


            <div class="card-tags">

                ${tags}

            </div>


            <p class="location">

                📍 ${talent.ciudad}

            </p>


            <h3>

                ${talent.nombre}

            </h3>


            <div class="price">

                ${talent.precio} Bs

            </div>


            <div class="card-buttons">


                <button

                    class="details-btn"

                    onclick="showTalentDetails('${talent.id}')"

                >

                    Ver detalles

                </button>


                <button

                    class="contract-btn"

                    onclick="contactTalent('${talent.id}')"

                >

                    Contratar

                </button>


            </div>


        </div>

    `;


    talentsGrid.appendChild(card);

}


/*==================================================
MOSTRAR DETALLES
==================================================*/

function showTalentDetails(id) {


    const talent =

        currentTalents.find(

            talent =>

                talent.id === id

        );


    if (!talent) {

        return;

    }


    const specializations =

        Array.isArray(

            talent.especializaciones

        )

            ? talent.especializaciones

            : [];


    const tags =

        specializations

            .map(

                specialization => `

                    <span>

                        ${specialization}

                    </span>

                `

            )

            .join("");


    modalContent.innerHTML = `

        <div class="modal-content">


            <div class="modal-tags">

                ${tags}

            </div>


            <h2>

                ${talent.nombre}

            </h2>


            <p>

                📍 Ciudad:

                ${talent.ciudad}

            </p>


            <p>

                🌎 Cobertura:

                ${talent.cobertura}

            </p>


            <div class="modal-price">

                ${talent.precio} Bs

            </div>


            <a

                href="#"

                class="modal-whatsapp"

                onclick="contactTalent('${talent.id}'); return false;"

            >

                Contratar por WhatsApp

            </a>


        </div>

    `;


    talentModal.classList.add("active");

}


/*==================================================
CONTACTAR POR WHATSAPP
==================================================*/

function contactTalent(id) {


    const talent =

        currentTalents.find(

            talent =>

                talent.id === id

        );


    if (!talent) {

        return;

    }


    const phone =

        "59177979971";


    const message =

        `Hola, quiero contratar a ${talent.nombre} por ${talent.precio} Bs. ¿Está disponible?`;


    const whatsappURL =

        `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;


    window.open(

        whatsappURL,

        "_blank"

    );

}


/*==================================================
CERRAR MODAL
==================================================*/

if (closeModal) {


    closeModal.addEventListener(

        "click",

        () => {


            talentModal.classList.remove(

                "active"

            );

        }

    );

}


if (talentModal) {


    talentModal.addEventListener(

        "click",

        event => {


            if (

                event.target ===

                talentModal

            ) {


                talentModal.classList.remove(

                    "active"

                );

            }

        }

    );

}


/*==================================================
INICIAR
==================================================*/

loadMenTalents();