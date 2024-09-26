$(document).ready(function() {
    getList();
});
/*
  --------------------------------------------------------------------------------------
  Função para obter a lista existente do servidor via requisição GET
  --------------------------------------------------------------------------------------
*/
const getList = async () => {
    let url = 'http://127.0.0.1:5000/pacientes';
    try {
        let response = await fetch(url, { method: 'GET' });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        let data = await response.json();

        if (data && data.pacientes && Array.isArray(data.pacientes.pacientes)) {
            const table = document.getElementById('recordsTable');
            const tbody = table.querySelector('tbody');
            tbody.innerHTML = ''; // Limpar apenas o corpo da tabela

            data.pacientes.pacientes.forEach(item => {
                if (item.name && item.radius_mean && item.texture_mean && item.perimeter_mean && item.area_mean) {
                    insertList(
                        item.name,
                        item.radius_mean,
                        item.texture_mean,
                        item.perimeter_mean,
                        item.area_mean,
                        item.outcome
                    );
                } else {
                    console.warn('Dados incompletos:', item);
                }
            });
        } else {
            console.warn('Nenhum dado encontrado ou formato inválido:', data);
        }
    } catch (error) {
        console.error('Error:', error);
    }
};

/*
  --------------------------------------------------------------------------------------
  Função para colocar um item na lista do servidor via requisição POST
  --------------------------------------------------------------------------------------
*/
const postItem = async (name, radius, texture, perimeter, area) => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('radius_mean', radius);
    formData.append('texture_mean', texture);
    formData.append('perimeter_mean', perimeter);
    formData.append('area_mean', area);

    const url = 'http://127.0.0.1:5000/paciente';

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro:', error);
        return null;
    }
};

/*
  --------------------------------------------------------------------------------------
  Função para criar um botão de exclusão para cada item da lista
  --------------------------------------------------------------------------------------
*/
const insertDeleteButton = (parent) => {
    let icon = document.createElement("i");
    icon.className = "fa fa-trash close";
    icon.onclick = async function() {
        let row = this.closest("tr");
        const nomeItem = row.getElementsByTagName('td')[0].textContent;
        const result = await Swal.fire({
            title: 'Você tem certeza?',
            text: "Este item será removido.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sim, remover!',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            await deleteItem(nomeItem);
            row.remove();
            Swal.fire(
                'Removido!',
                'O item foi removido com sucesso.',
                'success'
            );
        }
    };
    parent.appendChild(icon);
}

/*
  --------------------------------------------------------------------------------------
  Função para deletar um item da lista do servidor via requisição DELETE
  --------------------------------------------------------------------------------------
*/
const deleteItem = async (item) => {
    let url = `http://127.0.0.1:5000/paciente?name=${encodeURIComponent(item)}`;
    try {
        const response = await fetch(url, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.statusText}`);
        }

        await response.json();
        await getList();
    } catch (error) {
        console.error('Error:', error);
    }
}

/*
  --------------------------------------------------------------------------------------
  Função para adicionar um novo item com nome e características
  --------------------------------------------------------------------------------------
*/
const newItem = async () => {
    let inputName = document.getElementById("name").value;
    let inputRadiusMean = document.getElementById("radius_mean").value;
    let inputTextureMean = document.getElementById("texture_mean").value;
    let inputPerimeterMean = document.getElementById("perimeter_mean").value;
    let inputAreaMean = document.getElementById("area_mean").value;

    if (inputName === '') {
        Swal.fire({
            icon: 'error',
            title: 'Erro!',
            text: 'O nome do paciente não pode ser vazio!',
        });
        return;
    }

    if (isNaN(inputRadiusMean) || isNaN(inputTextureMean) || isNaN(inputPerimeterMean) || isNaN(inputAreaMean)) {
        Swal.fire({
            icon: 'error',
            title: 'Erro!',
            text: 'Os campos de média precisam ser números!',
        });
        return;
    }

    const checkUrl = `http://127.0.0.1:5000/pacientes?nome=${encodeURIComponent(inputName)}`;
    try {
        const response = await fetch(checkUrl, { method: 'GET' });
        const data = await response.json();

        if (Array.isArray(data.pacientes) && data.pacientes.some(item => item.name === inputName)) {
            Swal.fire({
                icon: 'warning',
                title: 'Paciente já cadastrado',
                text: 'Cadastre o paciente com um nome diferente ou atualize o existente.',
            });
        } else {
            const result = await Swal.fire({
                title: 'Confirmação',
                text: "Você deseja adicionar este item?",
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sim, adicionar!',
                cancelButtonText: 'Cancelar'
            });

            if (result.isConfirmed) {
                await postItem(inputName, inputRadiusMean, inputTextureMean, inputPerimeterMean, inputAreaMean);
                Swal.fire(
                    'Adicionado!',
                    'O item foi adicionado com sucesso!',
                    'success'
                );

                await getList();
            }
        }
    } catch (error) {
        console.error('Erro:', error);
        Swal.fire({
            icon: 'error',
            title: 'Erro!',
            text: 'Ocorreu um erro ao verificar o paciente. Por favor, tente novamente.',
        });
    }
};

/*
  --------------------------------------------------------------------------------------
  Função para inserir itens na lista apresentada
  --------------------------------------------------------------------------------------
*/
const insertList = (namePatient, radiusMean, textureMean, perimeterMean, areaMean, outcome) => {
    const table = document.getElementById('recordsTable');
    const tbody = table.querySelector('tbody'); // Selecione o corpo da tabela
    const row = tbody.insertRow();
    console.log("outcome", outcome)
    const item = [
        namePatient,
        radiusMean,
        textureMean,
        perimeterMean,
        areaMean,
        outcome === 1 ? "Maligno" : "Benigno"
    ];

    item.forEach((value, index) => {
        const cell = row.insertCell(index);
        cell.textContent = value;
    });

    const deleteCell = row.insertCell(item.length);
    deleteCell.className = "table-action";
    insertDeleteButton(deleteCell);

    document.getElementById("predictionForm").reset();
}