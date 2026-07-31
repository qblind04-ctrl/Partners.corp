/*==================================================
PARTNERS CORP
ADMIN.JS
==================================================*/

/*==================================================
PROTEGER PANEL
==================================================*/

(async () => {

    const {

        data: {

            session

        }

    } = await supabaseClient.auth.getSession();

    if (!session) {

        window.location.href =
            "login.html";

        return;

    }

})();
/*==================================================
VARIABLES
==================================================*/

let currentTalents = [];

let editingTalentId = null;

let selectedImage = null;

let imageObject = null;

let imageScale = 1;

let imageX = 0;

let imageY = 0;

let isDragging = false;

let dragStartX = 0;

let dragStartY = 0;

let imageStartX = 0;

let imageStartY = 0;

let initialDistance = 0;

let initialScale = 1;


/*
    FORMATO DEL RECORTE

    4:3

    Este formato funciona bien
    para las tarjetas públicas.
*/


const CROP_WIDTH = 600;

const CROP_HEIGHT = 450;


/*==================================================
ELEMENTOS
==================================================*/

const talentForm =

    document.getElementById(

        "talentForm"

    );


const talentsList =

    document.getElementById(

        "adminTalentsList"

    );


const loading =

    document.getElementById(

        "adminLoading"

    );


const formMessage =

    document.getElementById(

        "formMessage"

    );


const formTitle =

    document.getElementById(

        "formTitle"

    );


const cancelEdit =

    document.getElementById(

        "cancelEdit"

    );


const imageInput =

    document.getElementById(

        "imagen"

    );


const imageEditor =

    document.getElementById(

        "imageEditor"

    );


const canvas =

    document.getElementById(

        "imageCanvas"

    );


const imagePreview =

    document.getElementById(

        "imagePreview"

    );
const successMessage =
    document.getElementById("successMessage");


const ctx =

    canvas

        ? canvas.getContext(

            "2d"

        )

        : null;


/*==================================================
CONFIGURAR CANVAS
==================================================*/

if (canvas) {


    canvas.width =

        CROP_WIDTH;


    canvas.height =

        CROP_HEIGHT;

}



/*==================================================
CARGAR TALENTOS
==================================================*/

async function loadTalents() {


    const {

        data,

        error

    } = await supabaseClient

        .from(

            "talentos"

        )

        .select(

            "*"

        )

        .order(

            "created_at",

            {

                ascending: false

            }

        );


    if (error) {


        console.error(

            "ERROR CARGANDO TALENTOS:",

            error

        );


        if (loading) {

            loading.textContent =

                "Error cargando talentos.";

        }


        return;

    }


    currentTalents =

        data || [];


    console.log(

        "TALENTOS DEL ADMIN:",

        currentTalents

    );


    renderTalents();

}
function showSuccess(message){

    const toast = document.getElementById("successMessage");

    if(!toast){
        console.error("No existe #successMessage");
        return;
    }

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(()=>{

        toast.classList.remove("show");

    },3000);

}


/*==================================================
RENDERIZAR TARJETAS
==================================================*/

function renderTalents() {


    if (!talentsList) {

        console.error(

            "No existe #adminTalentsList"

        );

        return;

    }


    talentsList.innerHTML = "";


    if (

        !currentTalents ||

        currentTalents.length === 0

    ) {


        talentsList.innerHTML = `

            <div class="admin-empty">

                <h3>

                    No hay talentos registrados

                </h3>


                <p>

                    Añade tu primer talento.

                </p>

            </div>

        `;


        return;

    }


    currentTalents.forEach(

        talent => {


            const card =

                document.createElement(

                    "article"

                );


            card.className =

                "admin-talent-card";


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

                <div

                    class="admin-card-image"

                >

                    <img

                        src="${

                            talent.imagen_url ||

                            "assets/default.jpg"

                        }"

                        alt="${talent.nombre}"

                    >

                </div>


                <div

                    class="admin-card-content"

                >


                    <div

                        class="admin-card-tags"

                    >

                        ${tags}

                    </div>


                    <p

                        class="admin-card-location"

                    >

                        📍 ${talent.ciudad}

                    </p>


                    <h3>

                        ${talent.nombre}

                    </h3>


                    <p

                        class="admin-card-category"

                    >

                        ${talent.categoria}

                    </p>


                    <div

                        class="admin-card-price"

                    >

                        ${talent.precio} Bs

                    </div>


                    ${

                        talent.premium

                            ? `

                                <span

                                    class="admin-premium-badge"

                                >

                                    PREMIUM

                                </span>

                            `

                            : ""

                    }


                    <div

                        class="admin-card-actions"

                    >

                        <button

                            type="button"

                            class="admin-edit-btn"

                            onclick="editTalent('${talent.id}')"

                        >

                            Editar

                        </button>


                        <button

                            type="button"

                            class="admin-delete-btn"

                            onclick="deleteTalent('${talent.id}')"

                        >

                            Eliminar

                        </button>

                    </div>


                </div>

            `;


            talentsList.appendChild(

                card

            );

        }

    );

}


/*==================================================
SELECCIONAR IMAGEN
==================================================*/

if (imageInput) {


    imageInput.addEventListener(

        "change",

        event => {


            const file =

                event.target.files[0];


            if (!file) {

                return;

            }


            selectedImage = file;


            const reader =

                new FileReader();


            reader.onload =

                event => {


                    imageObject =

                        new Image();


                    imageObject.onload =

                        () => {


                            imageScale =

                                calculateInitialScale();


                            imageX =

                                (

                                    CROP_WIDTH -

                                    imageObject.width *

                                    imageScale

                                ) / 2;


                            imageY =

                                (

                                    CROP_HEIGHT -

                                    imageObject.height *

                                    imageScale

                                ) / 2;


                            drawImage();

                            updatePreview();

                        };


                    imageObject.src =

                        event.target.result;

                };


            reader.readAsDataURL(

                file

            );

        }

    );

}


/*==================================================
CALCULAR ESCALA INICIAL
==================================================*/

function calculateInitialScale() {


    if (!imageObject) {

        return 1;

    }


    const scaleX =

        CROP_WIDTH /

        imageObject.width;


    const scaleY =

        CROP_HEIGHT /

        imageObject.height;


    return Math.max(

        scaleX,

        scaleY

    );

}


/*==================================================
DIBUJAR IMAGEN
==================================================*/

function drawImage() {


    if (

        !ctx ||

        !imageObject

    ) {

        return;

    }


    ctx.clearRect(

        0,

        0,

        CROP_WIDTH,

        CROP_HEIGHT

    );


    ctx.drawImage(

        imageObject,

        imageX,

        imageY,

        imageObject.width *

        imageScale,

        imageObject.height *

        imageScale

    );

}


/*==================================================
ARRASTRAR IMAGEN
==================================================*/

if (canvas) {


    canvas.addEventListener(

        "mousedown",

        event => {


            if (!imageObject) {

                return;

            }


            isDragging =

                true;


            dragStartX =

                event.clientX;


            dragStartY =

                event.clientY;


            imageStartX =

                imageX;


            imageStartY =

                imageY;


            canvas.style.cursor =

                "grabbing";

        }

    );


    window.addEventListener(

        "mousemove",

        event => {


            if (!isDragging) {

                return;

            }


            const deltaX =

                event.clientX -

                dragStartX;


            const deltaY =

                event.clientY -

                dragStartY;


            imageX =

                imageStartX +

                deltaX;


            imageY =

                imageStartY +

                deltaY;


            drawImage();

            updatePreview();

        }

    );


    window.addEventListener(

        "mouseup",

        () => {


            isDragging =

                false;


            canvas.style.cursor =

                "grab";

        }

    );


    /*
        ZOOM CON RUEDA
    */


    canvas.addEventListener(

        "wheel",

        event => {


            if (!imageObject) {

                return;

            }


            event.preventDefault();


            const oldScale =

                imageScale;


            if (

    event.deltaY < 0

) {


    imageScale += 0.02;

}

else {


    imageScale -= 0.02;

}


            imageScale =

                Math.max(

                    0.1,

                    Math.min(

                        imageScale,

                        5

                    )

                );


            const rect =

                canvas.getBoundingClientRect();


            const mouseX =

                event.clientX -

                rect.left;


            const mouseY =

                event.clientY -

                rect.top;


            imageX =

                mouseX -

                (

                    mouseX -

                    imageX

                ) *

                (

                    imageScale /

                    oldScale

                );


            imageY =

                mouseY -

                (

                    mouseY -

                    imageY

                ) *

                (

                    imageScale /

                    oldScale

                );


            drawImage();

            updatePreview();

        },

        {

            passive: false

        }

    );

}


/*==================================================
SOPORTE PARA MÓVIL
==================================================*/

if (canvas) {


    canvas.addEventListener(

        "touchstart",

        event => {


            if (!imageObject) {

                return;

            }



            /*
                ZOOM CON DOS DEDOS
            */


            if(event.touches.length === 2){


                const touch1 =
                event.touches[0];


                const touch2 =
                event.touches[1];


                initialDistance = Math.hypot(

                    touch2.clientX - touch1.clientX,

                    touch2.clientY - touch1.clientY

                );


                initialScale = imageScale;


                return;

            }



            /*
                ARRASTRE NORMAL
            */


            const touch =

            event.touches[0];



            isDragging = true;



            dragStartX =

            touch.clientX;



            dragStartY =

            touch.clientY;



            imageStartX =

            imageX;



            imageStartY =

            imageY;



        },

        {

            passive:false

        }

    );





    canvas.addEventListener(

        "touchmove",

        event => {


            if (!imageObject) {

                return;

            }


            event.preventDefault();




            /*
                ZOOM DOS DEDOS
            */


            if(event.touches.length === 2){


                const touch1 =

                event.touches[0];


                const touch2 =

                event.touches[1];



                const currentDistance =

                Math.hypot(

                    touch2.clientX - touch1.clientX,

                    touch2.clientY - touch1.clientY

                );



                if(initialDistance){


                    const zoomFactor =

                    currentDistance /

                    initialDistance;



                    imageScale =

                    initialScale *

                    zoomFactor;



                    imageScale =

                    Math.max(

                        0.5,

                        Math.min(

                            imageScale,

                            5

                        )

                    );



                    drawImage();

                    updatePreview();


                }



                return;

            }





            /*
                MOVER IMAGEN
            */


            if(!isDragging){

                return;

            }




            const touch =

            event.touches[0];



            const deltaX =

            touch.clientX -

            dragStartX;



            const deltaY =

            touch.clientY -

            dragStartY;




            imageX =

            imageStartX +

            deltaX;



            imageY =

            imageStartY +

            deltaY;



            drawImage();

            updatePreview();



        },

        {

            passive:false

        }

    );





    canvas.addEventListener(

        "touchend",

        ()=>{


            isDragging = false;


            initialDistance = 0;


        }

    );


}


/*==================================================
PREVISUALIZACIÓN
==================================================*/

function updatePreview() {


    if (

        !imagePreview ||

        !canvas

    ) {

        return;

    }


    imagePreview.innerHTML = "";


    const previewImage =

        document.createElement(

            "img"

        );


    previewImage.src =

        canvas.toDataURL(

            "image/jpeg",

            0.9

        );


    imagePreview.appendChild(

        previewImage

    );

}


/*==================================================
CREAR IMAGEN FINAL
==================================================*/

function getCroppedImage() {


    return new Promise(

        resolve => {


            if (

                !imageObject ||

                !canvas

            ) {


                resolve(

                    null

                );


                return;

            }


            canvas.toBlob(

                blob => {


                    resolve(

                        blob

                    );

                },

                "image/jpeg",

                0.9

            );

        }

    );

}


/*==================================================
SUBIR IMAGEN A SUPABASE
==================================================*/

async function uploadImage(

    blob,

    oldImageUrl = null

) {


    if (!blob) {

        return oldImageUrl;

    }


    const fileName =

        crypto.randomUUID() +

        ".jpg";


    const filePath =

        fileName;


    const {

        error: uploadError

    } = await supabaseClient

        .storage

        .from(

            "talentos"

        )

        .upload(

            filePath,

            blob,

            {

                contentType:

                    "image/jpeg",

                upsert:

                    false

            }

        );


    if (uploadError) {


        console.error(

            "ERROR SUBIENDO IMAGEN:",

            uploadError

        );


        throw uploadError;

    }


    const {

        data

    } = supabaseClient

        .storage

        .from(

            "talentos"

        )

        .getPublicUrl(

            filePath

        );


    return data.publicUrl;

}


/*==================================================
GUARDAR TALENTO
==================================================*/

if (talentForm) {


    talentForm.addEventListener(

        "submit",

        async event => {


            event.preventDefault();


            try {


                const nombre =

                    document

                        .getElementById(

                            "nombre"

                        )

                        .value

                        .trim();


                const precio =

                    Number(

                        document

                            .getElementById(

                                "precio"

                            )

                            .value

                    );


                const categoria =

                    document

                        .getElementById(

                            "categoria"

                        )

                        .value;


                const especializaciones =

                    document

                        .getElementById(

                            "especializaciones"

                        )

                        .value

                        .split(",")

                        .map(

                            item =>

                                item.trim()

                        )

                        .filter(

                            Boolean

                        );


                const ciudad =

                    document

                        .getElementById(

                            "ciudad"

                        )

                        .value

                        .trim();


                const cobertura =

                    document

                        .getElementById(

                            "cobertura"

                        )

                        .value;


                const premium =

                    document

                        .getElementById(

                            "premium"

                        )

                        .checked;

showSuccess("Guardando talento...");

                let imageUrl =

                    null;


                if (selectedImage) {


                    const croppedBlob =

                        await getCroppedImage();


                    imageUrl =

                        await uploadImage(

                            croppedBlob

                        );

                }


                const talentData = {


                    nombre,

                    precio,

                    categoria,

                    especializaciones,

                    ciudad,

                    cobertura,

                    premium

                };


                if (imageUrl) {


                    talentData.imagen_url =

                        imageUrl;

                }


                if (

                    editingTalentId

                ) {


                    const {

                        error

                    } = await supabaseClient

                        .from(

                            "talentos"

                        )

                        .update(

                            talentData

                        )

                        .eq(

                            "id",

                            editingTalentId

                        );


                    if (error) {

                        throw error;

                    }


                    showSuccess("Talento actualizado correctamente.");

                }

                else {


                    const {

                        error

                    } = await supabaseClient

                        .from(

                            "talentos"

                        )

                        .insert(

                            talentData

                        );


                    if (error) {

                        throw error;

                    }


showSuccess("Talento guardado correctamente");

                }


                resetForm();

                await loadTalents();


            }

            catch (error) {


                console.error(

                    "ERROR GUARDANDO TALENTO:",

                    error

                );


                alert("Ocurrió un error al guardar el talento.");

            }

        }

    );

}


/*==================================================
EDITAR TALENTO
==================================================*/

async function editTalent(id) {


    const talent =

        currentTalents.find(

            item =>

                item.id === id

        );


    if (!talent) {

        return;

    }


    editingTalentId =

        id;


    document

        .getElementById(

            "nombre"

        )

        .value =

            talent.nombre || "";


    document

        .getElementById(

            "precio"

        )

        .value =

            talent.precio || "";


    document

        .getElementById(

            "categoria"

        )

        .value =

            talent.categoria || "";


    document

        .getElementById(

            "especializaciones"

        )

        .value =

            Array.isArray(

                talent.especializaciones

            )

                ? talent.especializaciones.join(

                    ", "

                )

                : "";


    document

        .getElementById(

            "ciudad"

        )

        .value =

            talent.ciudad || "";


    document

        .getElementById(

            "cobertura"

        )

        .value =

            talent.cobertura || "";


    document

        .getElementById(

            "premium"

        )

        .checked =

            talent.premium || false;


    formTitle.textContent =

        "Editar talento";


    cancelEdit.style.display =

        "block";


    /*
        CARGAR IMAGEN EXISTENTE
    */


    if (

        talent.imagen_url

    ) {


        imageObject =

            new Image();


        imageObject.crossOrigin =

            "anonymous";


        imageObject.onload =

            () => {


                imageScale =

                    calculateInitialScale();


                imageX =

                    (

                        CROP_WIDTH -

                        imageObject.width *

                        imageScale

                    ) / 2;


                imageY =

                    (

                        CROP_HEIGHT -

                        imageObject.height *

                        imageScale

                    ) / 2;


                drawImage();

                updatePreview();

            };


        imageObject.src =

            talent.imagen_url;

    }


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


/*==================================================
ELIMINAR TALENTO
==================================================*/

async function deleteTalent(id) {


    const talent =

        currentTalents.find(

            item =>

                item.id === id

        );


    if (!talent) {

        return;

    }


    const confirmed =

        confirm(

            `¿Seguro que quieres eliminar a ${talent.nombre}?`

        );


    if (!confirmed) {

        return;

    }


    const {

        error

    } = await supabaseClient

        .from(

            "talentos"

        )

        .delete()

        .eq(

            "id",

            id

        );


    if (error) {


        console.error(

            "ERROR ELIMINANDO:",

            error

        );


        alert(

            "No se pudo eliminar el talento."

        );


        return;

    }


    currentTalents =

        currentTalents.filter(

            talent =>

                talent.id !== id

        );


    renderTalents();


    alert(

        "Talento eliminado correctamente."

    );

}


/*==================================================
CANCELAR EDICIÓN
==================================================*/

if (cancelEdit) {


    cancelEdit.addEventListener(

        "click",

        () => {


            resetForm();

        }

    );

}


/*==================================================
REINICIAR FORMULARIO
==================================================*/

function resetForm() {


    if (talentForm) {

        talentForm.reset();

    }


    editingTalentId =

        null;


    selectedImage =

        null;


    imageObject =

        null;


    imageScale =

        1;


    imageX =

        0;


    imageY =

        0;


    if (ctx && canvas) {


        ctx.clearRect(

            0,

            0,

            canvas.width,

            canvas.height

        );

    }


    if (imagePreview) {

        imagePreview.innerHTML = "";

    }


    if (imageInput) {

        imageInput.value = "";

    }


    if (formTitle) {


        formTitle.textContent =

            "Añadir talento";

    }


    if (cancelEdit) {


        cancelEdit.style.display =

            "none";

    }



}


/*==================================================
INICIAR
==================================================*/

loadTalents();
/*==================================================
CERRAR SESIÓN
==================================================*/

const logoutBtn =
    document.getElementById("logoutBtn");

if (logoutBtn) {

    logoutBtn.addEventListener(

        "click",

        async () => {

            await supabaseClient.auth.signOut();

            window.location.href =
                "login.html";

        }

    );

}