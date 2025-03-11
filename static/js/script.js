// VariÃ¡veis globais
const palpitesContainer = document.getElementById('palpites-container');
let palpiteCount = 1;

// FunÃ§Ã£o para inicializar os handlers da pÃ¡gina
function init() {
    // Adiciona event listeners para o primeiro conjunto de inputs
    adicionarEventListenersParaInputs(palpitesContainer.querySelector('.palpite-row'));
}

// Função para adicionar uma nova linha de palpites
function adicionarNovaPalpiteRow() {
    palpiteCount++;
    
    const novaPalpiteRow = document.createElement('div');
    novaPalpiteRow.className = 'palpite-row';
    novaPalpiteRow.innerHTML = `
        <div class="numeros-container">
            <input type="number" min="1" max="60" class="numero-input" placeholder="Nº 1" required>
            <input type="number" min="1" max="60" class="numero-input" placeholder="Nº 2" required>
            <input type="number" min="1" max="60" class="numero-input" placeholder="Nº 3" required>
            <input type="number" min="1" max="60" class="numero-input" placeholder="Nº 4" required>
            <input type="number" min="1" max="60" class="numero-input" placeholder="Nº 5" required>
            <input type="number" min="1" max="60" class="numero-input" placeholder="Nº 6" required>
        </div>
        <div class="analise-container">
            <!-- Aqui serão exibidos os resultados da análise -->
        </div>
    `;
    
    palpitesContainer.appendChild(novaPalpiteRow);
    adicionarEventListenersParaInputs(novaPalpiteRow);
}

// FunÃ§Ã£o para adicionar event listeners aos inputs de uma linha de palpites
function adicionarEventListenersParaInputs(palpiteRow) {
    const inputs = palpiteRow.querySelectorAll('.numero-input');
    const analiseContainer = palpiteRow.querySelector('.analise-container');
    
    inputs.forEach((input, index) => {
        // ValidaÃ§Ã£o em tempo real
        input.addEventListener('input', function() {
            validarInput(input, inputs, index);
        });
        
        // Quando o Ãºltimo input for preenchido, adiciona uma nova linha
        if (index === inputs.length - 1) {
            input.addEventListener('change', function() {
                if (estaPreenchidoCorretamente(inputs)) {
                    // Faz a anÃ¡lise do palpite
                    analisarPalpite(inputs, analiseContainer);
                    
                    // Adiciona uma nova linha de palpites
                    adicionarNovaPalpiteRow();
                }
            });
        }
    });
}

// FunÃ§Ã£o para validar um input individual
function validarInput(input, allInputs, currentIndex) {
    // Limpa classes de validaÃ§Ã£o
    input.classList.remove('valid', 'invalid');
    
    const valor = parseInt(input.value);
    
    // Verifica se estÃ¡ vazio
    if (!input.value.trim()) {
        return;
    }
    
    // Verifica se estÃ¡ no intervalo vÃ¡lido
    if (isNaN(valor) || valor < 1 || valor > 60) {
        input.classList.add('invalid');
        return;
    }
    
    // Verifica se hÃ¡ nÃºmeros repetidos
    for (let i = 0; i < allInputs.length; i++) {
        if (i !== currentIndex && parseInt(allInputs[i].value) === valor) {
            input.classList.add('invalid');
            return;
        }
    }
    
    // Se passou por todas as validaÃ§Ãµes, marca como vÃ¡lido
    input.classList.add('valid');
}

// FunÃ§Ã£o para verificar se todos os inputs estÃ£o preenchidos corretamente
function estaPreenchidoCorretamente(inputs) {
    for (let input of inputs) {
        if (!input.value || input.classList.contains('invalid')) {
            return false;
        }
    }
    return true;
}

// FunÃ§Ã£o para analisar o palpite completo
function analisarPalpite(inputs, analiseContainer) {
    // Coleta os nÃºmeros
    const numeros = Array.from(inputs).map(input => parseInt(input.value));
    
    // Analisa quantos dÃ­gitos diferentes foram usados
    const digitosUsados = new Set();
    numeros.forEach(numero => {
        const digitos = numero.toString().padStart(2, '0').split('');
        digitos.forEach(digito => digitosUsados.add(digito));
    });
    
    // Cria o HTML da anÃ¡lise
    const analiseHTML = `
        <h3>Análise do Palpite</h3>
        <p><strong>Dígitos utilizados (${digitosUsados.size}):</strong></p>
        <div class="numeros-usados">
            ${Array.from(digitosUsados).sort().map(digito => 
                `<span class="numero-usado">${digito}</span>`
            ).join('')}
        </div>
    `;
    
    // Atualiza o container de anÃ¡lise
    analiseContainer.innerHTML = analiseHTML;
}

// Inicializa a pÃ¡gina quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', init);

// Funções para a área de arrastar e soltar
document.addEventListener('DOMContentLoaded', function() {
    // Inicializa o event listener para a seção de arrastar e soltar
    inicializarDropArea();
});

function inicializarDropArea() {
    const dropArea = document.getElementById('drop-area');
    
    // Prevenir comportamento padrão de arrastar e soltar
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });
    
    // Destacar a área quando um arquivo é arrastado para dentro
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });
    
    // Remover destaque quando o arquivo é arrastado para fora ou solto
    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });
    
    // Processar os arquivos quando forem soltos
    dropArea.addEventListener('drop', handleDrop, false);
    
    // Adicionar efeito de "active" ao clicar
    dropArea.addEventListener('mousedown', function() {
        this.classList.add('active');
    });
    
    window.addEventListener('mouseup', function() {
        dropArea.classList.remove('active');
    });
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight(e) {
    document.getElementById('drop-area').classList.add('highlight');
}

function unhighlight(e) {
    document.getElementById('drop-area').classList.remove('highlight');
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

// Processa os arquivos
async function handleFiles(files) {
    showLoading();
    
    try {
        const fileArray = Array.from(files);
        if (fileArray.length === 0) {
            hideLoading();
            return;
        }
        
        // Verificar se são arquivos válidos
        const validExtensions = ['.txt', '.csv'];
        const allValid = fileArray.every(file => {
            const extension = '.' + file.name.split('.').pop().toLowerCase();
            return validExtensions.includes(extension);
        });
        
        if (!allValid) {
            showNotification('Apenas arquivos .txt e .csv são aceitos', 'error');
            hideLoading();
            return;
        }
        
        // Processar cada arquivo
        const jogosPromises = fileArray.map(processarArquivo);
        const resultadosPorArquivo = await Promise.all(jogosPromises);
        
        // Juntar todos os jogos de todos os arquivos
        const todosJogos = resultadosPorArquivo.flat();
        
        if (todosJogos.length === 0) {
            showNotification('Nenhum jogo da Mega Sena foi encontrado nos arquivos', 'error');
            hideLoading();
            return;
        }
        
        exibirJogosImportados(todosJogos);
        showNotification(`${todosJogos.length} jogos importados com sucesso!`, 'success');
    } catch (error) {
        console.error('Erro ao processar arquivos:', error);
        showNotification('Erro ao processar os arquivos', 'error');
    } finally {
        hideLoading();
    }
}

// Processa um único arquivo
async function processarArquivo(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const conteudo = e.target.result;
                const jogos = extrairJogosMegaSena(conteudo);
                resolve(jogos);
            } catch (error) {
                console.error(`Erro ao processar o arquivo ${file.name}:`, error);
                reject(error);
            }
        };
        
        reader.onerror = function() {
            reject(new Error(`Erro ao ler o arquivo ${file.name}`));
        };
        
        reader.readAsText(file);
    });
}

// Extrai jogos da Mega Sena do conteúdo do arquivo
function extrairJogosMegaSena(conteudo) {
    const linhas = conteudo.split(/\r?\n/);
    const jogos = [];
    
    // Expressões regulares para diferentes formatos de jogos da Mega Sena
    const regexes = [
        /\b(\d{2})[\s\-,;._](\d{2})[\s\-,;._](\d{2})[\s\-,;._](\d{2})[\s\-,;._](\d{2})[\s\-,;._](\d{2})\b/, // formato 01-02-03-04-05-06 ou variações
        /\b(\d{2}),\s*(\d{2}),\s*(\d{2}),\s*(\d{2}),\s*(\d{2}),\s*(\d{2})\b/, // formato com vírgulas e espaços
        /\b(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\b/ // formato apenas com espaços
    ];
    
    for (let linha of linhas) {
        let jogoEncontrado = false;
        
        for (let regex of regexes) {
            const match = linha.match(regex);
            if (match) {
                // Extrair os números do jogo e converter para números
                const numeros = match.slice(1, 7).map(num => parseInt(num, 10));
                
                // Verificar se todos os números estão no intervalo válido
                const numerosValidos = numeros.every(num => num >= 1 && num <= 60);
                
                // Verificar se não há números repetidos
                const numerosUnicos = new Set(numeros).size === 6;
                
                if (numerosValidos && numerosUnicos) {
                    const jogo = {
                        numeros: numeros.sort((a, b) => a - b), // Ordenar os números
                        digitosUsados: extrairDigitos(numeros),
                        digitosOrdenados: extrairDigitosOrdenados(numeros),
                        quantidadeDigitos: extrairDigitosOrdenados(numeros).length
                    };
                    jogos.push(jogo);
                    jogoEncontrado = true;
                    break;
                }
            }
        }
        
        // Se nenhum jogo foi encontrado, procurar por números individuais
        if (!jogoEncontrado) {
            const numerosIndividuais = linha.match(/\b\d{1,2}\b/g);
            if (numerosIndividuais && numerosIndividuais.length === 6) {
                const numeros = numerosIndividuais.map(num => parseInt(num, 10));
                
                // Verificar se todos os números estão no intervalo válido
                const numerosValidos = numeros.every(num => num >= 1 && num <= 60);
                
                // Verificar se não há números repetidos
                const numerosUnicos = new Set(numeros).size === 6;
                
                if (numerosValidos && numerosUnicos) {
                    const jogo = {
                        numeros: numeros.sort((a, b) => a - b), // Ordenar os números
                        digitosUsados: extrairDigitos(numeros),
                        digitosOrdenados: extrairDigitosOrdenados(numeros),
                        quantidadeDigitos: extrairDigitosOrdenados(numeros).length
                    };
                    jogos.push(jogo);
                }
            }
        }
    }
    
    return jogos;
}

// Extrai os dígitos usados em um jogo
function extrairDigitos(numeros) {
    const digitosSet = new Set();
    
    numeros.forEach(numero => {
        // Converter para string e garantir que tenha dois dígitos
        const numeroStr = numero.toString().padStart(2, '0');
        for (let digito of numeroStr) {
            digitosSet.add(digito);
        }
    });
    
    // Converter de volta para array e ordenar
    return Array.from(digitosSet).sort();
}

// Extrai os dígitos ordenados para exibição
function extrairDigitosOrdenados(numeros) {
    return extrairDigitos(numeros);
}

// Exibe os jogos importados na tabela
// Função para exibir jogos importados
function exibirJogosImportados(jogos) {
    const tbody = document.querySelector('#jogos-importados-table tbody');
    const container = document.getElementById('jogos-importados-container');
    
    // Limpar tabela anterior
    tbody.innerHTML = '';
    
    // Exibir o container da tabela
    container.style.display = 'block';
    
    // Adicionar cada jogo à tabela
    jogos.forEach(jogo => {
        const tr = document.createElement('tr');
        
        // Coluna dos números do jogo
        const tdJogo = document.createElement('td');
        tdJogo.textContent = jogo.numeros.map(n => n.toString().padStart(2, '0')).join(' - ');
        tr.appendChild(tdJogo);
        
        // Coluna dos dígitos usados
        const tdDigitos = document.createElement('td');
        const digitosDiv = document.createElement('div');
        digitosDiv.className = 'digitos-celula';
        
        jogo.digitosUsados.forEach(digito => {
           const digitoSpan = document.createElement('span');
           digitoSpan.className = 'digito-item';
           digitoSpan.textContent = digito;
            digitoSpan.style.color = 'yellow'; // Cor negra para Digitos Usados
            digitosDiv.appendChild(digitoSpan);
            
            // Adicionar espaço entre os dígitos
           digitosDiv.appendChild(document.createTextNode(' '));
        });
        
        tdDigitos.appendChild(digitosDiv);
        tr.appendChild(tdDigitos);
        
        // Coluna dos dígitos ordenados
        const tdDigitosOrdenados = document.createElement('td');
        tdDigitosOrdenados.className = 'digitos-ordenados'; // Adiciona classe para centralização
        tdDigitosOrdenados.textContent = jogo.digitosOrdenados.join(', ');
        tr.appendChild(tdDigitosOrdenados);
        
        // Coluna da quantidade de dígitos
        const tdQuantidade = document.createElement('td');
        tdQuantidade.textContent = jogo.quantidadeDigitos;
        tr.appendChild(tdQuantidade);
        
        tbody.appendChild(tr);
    });
    
    // Adicionar botão de download ao final da tabela, caso ainda não exista
    if (!document.getElementById('download-importados-excel-btn')) {
        // Criar container para botões, se ainda não existir
        let acoesContainer = document.querySelector('#jogos-importados-container .acoes-container');
        
        if (!acoesContainer) {
            acoesContainer = document.createElement('div');
            acoesContainer.className = 'acoes-container';
            container.appendChild(acoesContainer);
        }
        
        // Criar botão de download
        const downloadBtn = document.createElement('button');
        downloadBtn.id = 'download-importados-excel-btn';
        downloadBtn.className = 'button';
        downloadBtn.style.backgroundColor = '#217346'; // Cor do Excel
        downloadBtn.textContent = 'Baixar em Excel';
        downloadBtn.addEventListener('click', downloadJogosImportadosExcel);
        
        // Adicionar o botão ao container
        acoesContainer.appendChild(downloadBtn);
    }
}

// Função corrigida para download dos jogos importados em Excel
function downloadJogosImportadosExcel() {
    // Verificar se há jogos importados
    const jogosImportadosTable = document.querySelector('#jogos-importados-table tbody');
    
    if (!jogosImportadosTable || jogosImportadosTable.rows.length === 0) {
        showNotification('Não há jogos importados para baixar.', 'error');
        return;
    }
    
    console.log('Iniciando download Excel - quantidade de linhas:', jogosImportadosTable.rows.length);
    
    // Criar conteúdo HTML para Excel
    let excelContent = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">';
    excelContent += '<head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Jogos Importados</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>';
    excelContent += '<body><table border="1">';
    
    // Adicionar cabeçalho com fundo preto e texto branco
    excelContent += '<tr>';
    excelContent += '<th style="background-color: #000000; color: #ffffff;">Jogo</th>';
    excelContent += '<th style="background-color: #000000; color: #ffffff;">Dígitos Usados</th>';
    excelContent += '<th style="background-color: #000000; color: #ffffff;">Dígitos Ordenados</th>';
    excelContent += '<th style="background-color: #000000; color: #ffffff;">Quantidade</th>';
    excelContent += '</tr>';
    
    // Extrair dados da tabela
    for (let i = 0; i < jogosImportadosTable.rows.length; i++) {
        const row = jogosImportadosTable.rows[i];
        
        excelContent += '<tr>';
        // Coluna Jogo
        excelContent += `<td style="text-align: center;">${row.cells[0].textContent}</td>`;
        
        // Coluna Dígitos Ordenados
        excelContent += `<td style="text-align: center;">${row.cells[1].textContent}</td>`;
        
        // Coluna Quantidade
        excelContent += `<td style="text-align: center;">${row.cells[2].textContent}</td>`;
        
        excelContent += '</tr>';
    }
    
    excelContent += '</table></body></html>';
    
    try {
        // Criar o blob com tipo MIME para Excel
        const blob = new Blob([excelContent], {type: 'application/vnd.ms-excel'});
        
        // Criar URL para o blob
        const url = URL.createObjectURL(blob);
        
        // Criar um elemento de link para download
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = 'jogos_importados_mega_sena.xls';
        
        // Adicionar o link ao documento (necessário em alguns navegadores)
        document.body.appendChild(downloadLink);
        
        // Acionar o clique no link
        downloadLink.click();
        
        // Remover o link do documento
        setTimeout(() => {
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(url);
        }, 100);
        
        console.log('Download iniciado com sucesso');
        showNotification('Download dos jogos importados iniciado!', 'success');
    } catch (error) {
        console.error('Erro ao gerar arquivo Excel:', error);
        showNotification('Erro ao gerar o arquivo Excel: ' + error.message, 'error');
    }
}

// Funções auxiliares para UI

function showLoading() {
    let loadingOverlay = document.querySelector('.loading-overlay');
    
    if (!loadingOverlay) {
        loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'loading-overlay';
        
        const loader = document.createElement('div');
        loader.className = 'loader';
        
        loadingOverlay.appendChild(loader);
        document.body.appendChild(loadingOverlay);
    }
    
    loadingOverlay.style.display = 'flex';
}

function hideLoading() {
    const loadingOverlay = document.querySelector('.loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
}

function showNotification(message, type = 'info') {
    let notification = document.querySelector('.notification');
    
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'notification';
        document.body.appendChild(notification);
    }
    
    // Resetar classes
    notification.className = 'notification';
    
    // Adicionar classe de tipo
    if (type) {
        notification.classList.add(type);
    }
    
    notification.textContent = message;
    
    // Mostrar notificação
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Ocultar após alguns segundos
    setTimeout(() => {
        notification.classList.remove('show');
    }, 5000);
}
// Funções para geração de jogos aleatórios
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar event listeners para seção de jogos aleatórios
    inicializarGeradorJogos();
});

// Array global para armazenar os jogos gerados
let jogosGerados = [];

function inicializarGeradorJogos() {
    const gerarJogosBtn = document.getElementById('gerar-jogos-btn');
    const downloadExcelBtn = document.getElementById('download-excel-btn');
    const gerarMaisBtn = document.getElementById('gerar-mais-btn');
    
    if (gerarJogosBtn) {
        gerarJogosBtn.addEventListener('click', gerarJogosAleatorios);
    }
    
    if (downloadExcelBtn) {
        downloadExcelBtn.addEventListener('click', downloadJogosExcel);
    }
    
    if (gerarMaisBtn) {
        gerarMaisBtn.addEventListener('click', gerarMaisJogos);
    }
}

function gerarJogosAleatorios() {
    const quantidadeDigitos = document.getElementById('quantidade-digitos').value;
    const quantidadeJogos = parseInt(document.getElementById('quantidade-jogos').value);
    
    // Validar entrada
    if (!quantidadeDigitos) {
        showNotification('Selecione a quantidade de dígitos', 'error');
        return;
    }
    
    if (isNaN(quantidadeJogos) || quantidadeJogos < 1 || quantidadeJogos > 100) {
        showNotification('A quantidade de jogos deve ser entre 1 e 100', 'error');
        return;
    }
    
    // Verificar se há dígitos específicos selecionados
    const digitosSelecionados = [];
    for (let i = 0; i <= 9; i++) {
        const checkbox = document.getElementById(`digito-${i}`);
        if (checkbox && checkbox.checked) {
            digitosSelecionados.push(i.toString());
        }
    }
    
    // Gerar jogos
    try {
        showLoading();
        jogosGerados = gerarJogos(parseInt(quantidadeDigitos), quantidadeJogos, digitosSelecionados);
        exibirJogosGerados(jogosGerados);
        showNotification(`${jogosGerados.length} jogos gerados com sucesso!`, 'success');
    } catch (error) {
        console.error('Erro ao gerar jogos:', error);
        showNotification('Erro ao gerar jogos: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

function gerarMaisJogos() {
    const quantidadeDigitos = document.getElementById('quantidade-digitos').value;
    const quantidadeJogos = parseInt(document.getElementById('quantidade-jogos').value);
    
    // Validar entrada
    if (!quantidadeDigitos || isNaN(quantidadeJogos) || quantidadeJogos < 1 || quantidadeJogos > 100) {
        showNotification('Verifique os parâmetros de geração', 'error');
        return;
    }
    
    // Verificar se há dígitos específicos selecionados
    const digitosSelecionados = [];
    for (let i = 0; i <= 9; i++) {
        const checkbox = document.getElementById(`digito-${i}`);
        if (checkbox && checkbox.checked) {
            digitosSelecionados.push(i.toString());
        }
    }
    
    // Gerar mais jogos
    try {
        showLoading();
        const novosJogos = gerarJogos(parseInt(quantidadeDigitos), quantidadeJogos, digitosSelecionados);
        jogosGerados = [...jogosGerados, ...novosJogos];
        exibirJogosGerados(jogosGerados);
        showNotification(`${novosJogos.length} jogos adicionais gerados com sucesso!`, 'success');
    } catch (error) {
        console.error('Erro ao gerar mais jogos:', error);
        showNotification('Erro ao gerar mais jogos: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

function gerarJogos(quantidadeDigitos, quantidadeJogos, digitosEspecificos = []) {
    const jogos = [];
    const maximoTentativas = 1000; // Evitar loops infinitos
    
    // Se quantidadeDigitos for 10, usar todos os dígitos (0-9)
    const usarTodosDigitos = quantidadeDigitos === 10;
    
    // Determinar quais dígitos usar
    let digitosDisponiveis = [];
    if (digitosEspecificos.length > 0) {
        // Se dígitos específicos foram selecionados, usar somente esses
        digitosDisponiveis = [...digitosEspecificos];
        
        // Verificar se a quantidade selecionada é compatível
        if (!usarTodosDigitos && digitosEspecificos.length < quantidadeDigitos) {
            throw new Error(`Você selecionou apenas ${digitosEspecificos.length} dígitos, mas pediu jogos com ${quantidadeDigitos} dígitos.`);
        }
    } else {
        // Caso contrário, usar todos os dígitos (0-9)
        digitosDisponiveis = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    }
    
    // Conjunto para rastrear combinações únicas
    const jogosUnicos = new Set();
    
    for (let i = 0; i < quantidadeJogos; i++) {
        let tentativas = 0;
        let jogoValido = false;
        
        while (!jogoValido && tentativas < maximoTentativas) {
            // Gerar um jogo aleatório da Mega Sena
            const numeros = gerarNumerosAleatorios();
            
            // Extrair dígitos do jogo
            const digitosDoJogo = extrairDigitos(numeros);
            
            // Verificar se atende aos requisitos de quantidade de dígitos
            let digitosValidos = false;
            
            if (usarTodosDigitos) {
                // Se pediu todos os dígitos, qualquer jogo é válido
                digitosValidos = true;
            } else if (digitosEspecificos.length > 0) {
                // Se especificou dígitos, todos os dígitos do jogo devem estar nessa lista
                // E o jogo deve ter exatamente a quantidade de dígitos solicitada
                const todosDigitosValidos = digitosDoJogo.every(d => digitosEspecificos.includes(d));
                digitosValidos = todosDigitosValidos && digitosDoJogo.length === quantidadeDigitos;
            } else {
                // Caso normal: jogo deve ter exatamente a quantidade de dígitos solicitada
                digitosValidos = digitosDoJogo.length === quantidadeDigitos;
            }
            
            if (digitosValidos) {
                // Verificar se este jogo já foi gerado
                const jogoKey = numeros.join('-');
                if (!jogosUnicos.has(jogoKey)) {
                    jogosUnicos.add(jogoKey);
                    
                    const jogo = {
                        numeros: numeros,
                        digitosUsados: digitosDoJogo,
                        digitosOrdenados: digitosDoJogo,
                        quantidadeDigitos: digitosDoJogo.length
                    };
                    
                    jogos.push(jogo);
                    jogoValido = true;
                }
            }
            
            tentativas++;
        }
        
        // Se atingiu o máximo de tentativas sem sucesso
        if (tentativas >= maximoTentativas && !jogoValido) {
            throw new Error(`Não foi possível gerar ${quantidadeJogos} jogos com exatamente ${quantidadeDigitos} dígitos. Tente com uma quantidade diferente de dígitos.`);
        }
    }
    
    return jogos;
}

function gerarNumerosAleatorios() {
    // Gerar 6 números aleatórios entre 1 e 60 sem repetição
    const numeros = new Set();
    
    while (numeros.size < 6) {
        const numero = Math.floor(Math.random() * 60) + 1;
        numeros.add(numero);
    }
    
    // Converter para array e ordenar
    return Array.from(numeros).sort((a, b) => a - b);
}

function extrairDigitos(numeros) {
    const digitosSet = new Set();
    
    numeros.forEach(numero => {
        // Converter para string e garantir que tenha dois dígitos
        const numeroStr = numero.toString().padStart(2, '0');
        for (let digito of numeroStr) {
            digitosSet.add(digito);
        }
    });
    
    // Converter de volta para array e ordenar
    return Array.from(digitosSet).sort();
}

function exibirJogosGerados(jogos) {
    const container = document.getElementById('jogos-gerados-container');
    const tbody = document.querySelector('#jogos-gerados-table tbody');
    
    // Mostrar o container
    container.style.display = 'block';
    
    // Limpar tabela anterior
    tbody.innerHTML = '';
    
    // Adicionar cada jogo à tabela
    jogos.forEach(jogo => {
        const tr = document.createElement('tr');
        
        // Coluna dos números do jogo
        const tdJogo = document.createElement('td');
        tdJogo.textContent = jogo.numeros.map(n => n.toString().padStart(2, '0')).join(' - ');
        tr.appendChild(tdJogo);
        
        // Coluna dos dígitos usados
        const tdDigitos = document.createElement('td');
        const digitosDiv = document.createElement('div');
        digitosDiv.className = 'digitos-celula';
        
        jogo.digitosUsados.forEach(digito => {
            const digitoSpan = document.createElement('span');
            digitoSpan.className = 'digito-item';
            digitoSpan.textContent = digito;
            digitosDiv.appendChild(digitoSpan);
        });
        
        tdDigitos.appendChild(digitosDiv);
        tr.appendChild(tdDigitos);
        
        // Coluna dos dígitos ordenados
		const tdDigitosOrdenados = document.createElement('td');
		tdDigitosOrdenados.className = 'digitos-ordenados'; // Adiciona classe para centralização
		tdDigitosOrdenados.textContent = jogo.digitosOrdenados.join(', ');
		tr.appendChild(tdDigitosOrdenados);
        
        // Coluna da quantidade de dígitos
        const tdQuantidade = document.createElement('td');
        tdQuantidade.textContent = jogo.quantidadeDigitos;
        tr.appendChild(tdQuantidade);
        
        tbody.appendChild(tr);
    });
    
    // Rolar para a tabela
    container.scrollIntoView({ behavior: 'smooth' });
}

function downloadJogosExcel() {
    if (jogosGerados.length === 0) {
        showNotification('Não há jogos para baixar. Gere alguns jogos primeiro.', 'error');
        return;
    }
    
    // Criar conteúdo HTML para Excel
    let excelContent = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">';
    excelContent += '<head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Jogos Mega Sena</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>';
    excelContent += '<body><table border="1">';
    
    // Adicionar cabeçalho com fundo preto e texto branco
    excelContent += '<tr>';
    excelContent += '<th style="background-color: #000000; color: #ffffff;">Jogo</th>';
    excelContent += '<th style="background-color: #000000; color: #ffffff;">Dígitos Usados</th>';
    excelContent += '<th style="background-color: #000000; color: #ffffff;">Dígitos Ordenados</th>';
    excelContent += '<th style="background-color: #000000; color: #ffffff;">Quantidade</th>';
    excelContent += '</tr>';
    
    // Adicionar dados
    jogosGerados.forEach(jogo => {
        excelContent += '<tr>';
        excelContent += `<td style="text-align: left;">${jogo.numeros.map(n => n.toString().padStart(2, '0')).join(' - ')}</td>`;
        excelContent += `<td style="text-align: left;">${jogo.digitosUsados.join(' ')}</td>`;
        excelContent += `<td style="text-align: left;">${jogo.digitosOrdenados.join(', ')}</td>`;
        excelContent += `<td style="text-align: left;">${jogo.quantidadeDigitos}</td>`;
        excelContent += '</tr>';
    });
    
    excelContent += '</table></body></html>';
    
    // Criar o blob com tipo MIME para Excel
    const blob = new Blob([excelContent], {type: 'application/vnd.ms-excel'});
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = 'jogos_mega_sena_digitos.xls';
    link.click();
    
    showNotification('Download do arquivo Excel iniciado!', 'success');
}

document.addEventListener('DOMContentLoaded', function() {
    const existingInit = window.inicializarGeradorJogos;
    
    // Substituir a função de inicialização para adicionar estilos específicos
    window.inicializarGeradorJogos = function() {
        if (existingInit) {
            existingInit();
        }
        
        const gerarMaisBtn = document.getElementById('gerar-mais-btn');
        if (gerarMaisBtn) {
            gerarMaisBtn.style.backgroundColor = '#209869'; // Cor verde da Mega Sena
        }
        
        // Ajustar título dos jogos gerados
        const jogosGeradosH3 = document.querySelector('.jogos-gerados-container h3');
        if (jogosGeradosH3) {
            jogosGeradosH3.style.color = '#209869';
        }
    };
});


// Adicionar inicialização do botão de download
document.addEventListener('DOMContentLoaded', function() {
    // Capturar função de inicialização existente
    const existingInit = window.inicializarGeradorJogos;
    
    // Redefinir a função para adicionar o evento ao novo botão
    window.inicializarGeradorJogos = function() {
        if (existingInit) {
            existingInit();
        }
        
        // Adicionar evento ao botão de download de todos os jogos
        const downloadAllExcelBtn = document.getElementById('download-all-excel-btn');
        if (downloadAllExcelBtn) {
            downloadAllExcelBtn.addEventListener('click', downloadAllJogosExcel);
        }
        
        // Adicionar borda à seção
        const jogosAleatoriosSection = document.querySelector('.jogos-aleatorios-section');
        if (jogosAleatoriosSection) {
            jogosAleatoriosSection.style.border = '3px solid black';
            jogosAleatoriosSection.style.padding = '20px';
            jogosAleatoriosSection.style.margin = '20px 0';
        }
    };
    
    // Se o botão já estiver no DOM, adiciona o evento diretamente
    const downloadAllExcelBtn = document.getElementById('download-all-excel-btn');
    if (downloadAllExcelBtn) {
        downloadAllExcelBtn.addEventListener('click', downloadAllJogosExcel);
    }
});