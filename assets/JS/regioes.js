function toggleCidade(id) {
    const todasCaixas = ["Regiao1", "Regiao2", "Regiao3"];

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
