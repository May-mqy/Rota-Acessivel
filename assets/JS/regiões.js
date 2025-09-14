/*function toggleManaus() {
    const manaus = document.getElementById("Manaus");
    if (manaus.style.display === "none") {
        manaus.style.display = "block"; // aparece
    } else {
        manaus.style.display = "none";  // desaparece
    }
}

function toggleBelem() {
    const belem = document.getElementById("Belem");
    if (belem.style.display === "none") {
        belem.style.display = "block"; // aparece
    } else {
        belem.style.display = "none";  // desaparece
    }
}

function togglePalmas() {
    const palmas = document.getElementById("Palmas");
    if (palmas.style.display === "none") {
        palmas.style.display = "block"; // aparece
    } else {
        palmas.style.display = "none";  // desaparece
    }
}*/

function toggleCidade(id) {
    const todasCaixas = ["Manaus", "Belem", "Palmas"];

    todasCaixas.forEach(caixa => {
        const box = document.getElementById(caixa);
        if (caixa !== id) {
            box.style.display = "none"; // esconde todas exceto a clicada
        }
    });

    const targetBox = document.getElementById(id);
    // Alterna a caixinha clicada
    if (targetBox.style.display === "none" || targetBox.style.display === "") {
        targetBox.style.display = "block"; // aparece
    } else {
        targetBox.style.display = "none";  // desaparece
    }
}
