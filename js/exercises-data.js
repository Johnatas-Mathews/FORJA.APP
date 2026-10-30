// js/exercises-data.js
const BASE_IMG_URL = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/";

const EXERCISE_DATABASE = [
  // PEITO
  {
    id: 'bench-press-barbell',
    name: 'Supino Reto com Barra',
    group: 'Peito',
    equipment: 'Barra Olímpica',
    muscles: 'Peitoral Maior (Fibras médias), Tríceps, Deltóide Anterior',
    tips: 'Pés plantados no chão, escápulas em retração contínua e barra tocando a linha dos mamilos.',
    img: BASE_IMG_URL + 'Barbell_Bench_Press/0.jpg'
  },
  {
    id: 'bench-press-dumbbell',
    name: 'Supino Reto com Halteres',
    group: 'Peito',
    equipment: 'Halteres & Banco Reto',
    muscles: 'Peitoral Maior, Estabilizadores do Ombro',
    tips: 'Permite maior amplitude de descida do que a barra; não bata os halteres no topo.',
    img: BASE_IMG_URL + 'Dumbbell_Bench_Press/0.jpg'
  },
  {
    id: 'incline-barbell-press',
    name: 'Supino Inclinado com Barra',
    group: 'Peito',
    equipment: 'Barra Olímpica & Banco 30°',
    muscles: 'Peitoral Superior (Porção Clavicular)',
    tips: 'Desça a barra na região alta do peito, logo abaixo da clavícula.',
    img: BASE_IMG_URL + 'Barbell_Incline_Bench_Press/0.jpg'
  },
  {
    id: 'incline-dumbbell-press',
    name: 'Supino Inclinado com Halteres',
    group: 'Peito',
    equipment: 'Halteres & Banco 30°/45°',
    muscles: 'Peitoral Superior, Deltóide Anterior',
    tips: 'Evite inclinação além de 45° para não transformar o exercício em desenvolvimento de ombros.',
    img: BASE_IMG_URL + 'Incline_Dumbbell_Press/0.jpg'
  },
  {
    id: 'decline-barbell-press',
    name: 'Supino Declinado com Barra',
    group: 'Peito',
    equipment: 'Barra Olímpica & Banco Declinado',
    muscles: 'Peitoral Inferior (Porção Costal)',
    tips: 'Excelente ativação de peitoral inferior com menor sobrecarga na articulação do ombro.',
    img: BASE_IMG_URL + 'Decline_Barbell_Bench_Press/0.jpg'
  },
  {
    id: 'chest-dips',
    name: 'Paralelas com Foco em Peitoral',
    group: 'Peito',
    equipment: 'Barras Paralelas / Graviton',
    muscles: 'Peitoral Inferior, Tríceps, Core',
    tips: 'Incline o tronco levemente para a frente e afaste ligeiramente os cotovelos.',
    img: BASE_IMG_URL + 'Chest_Dips/0.jpg'
  },
  {
    id: 'cable-crossover-high',
    name: 'Crossover na Polia Alta',
    group: 'Peito',
    equipment: 'Polia Dupla',
    muscles: 'Peitoral Maior (Foco Inferior/Esternal)',
    tips: 'Cruze levemente as mãos à frente da cintura mantendo os cotovelos com ângulo fixo.',
    img: BASE_IMG_URL + 'Cable_Crossover/0.jpg'
  },
  {
    id: 'cable-crossover-low',
    name: 'Crossover na Polia Baixa',
    group: 'Peito',
    equipment: 'Polia Baixa Dupla',
    muscles: 'Peitoral Superior e Clavicular',
    tips: 'Puxe as alças de baixo para cima convergindo na altura dos olhos.',
    img: BASE_IMG_URL + 'Low_Cable_Crossover/0.jpg'
  },
  {
    id: 'dumbbell-flys',
    name: 'Crucifixo Reto com Halteres',
    group: 'Peito',
    equipment: 'Halteres',
    muscles: 'Peitoral Maior (Alongamento Máximo)',
    tips: 'Mantenha os cotovelos semi-flexionados em todo o arco de abertura.',
    img: BASE_IMG_URL + 'Dumbbell_Flyes/0.jpg'
  },
  {
    id: 'peck-deck',
    name: 'Voador / Peck Deck Máquina',
    group: 'Peito',
    equipment: 'Máquina',
    muscles: 'Peitoral Maior (Isolamento contínuo)',
    tips: 'Mantenha o peito estufado e não deixe os ombros serem puxados para frente.',
    img: BASE_IMG_URL + 'Butterfly/0.jpg'
  },
  {
    id: 'pushups',
    name: 'Flexão de Braços no Solo',
    group: 'Peito',
    equipment: 'Peso Corporal',
    muscles: 'Peitoral, Core, Tríceps',
    tips: 'Mantenha a prancha perfeita sem deixar o quadril cair.',
    img: BASE_IMG_URL + 'Pushups/0.jpg'
  },

  // COSTAS
  {
    id: 'pull-ups',
    name: 'Barra Fixa Pronada (Pull-Up)',
    group: 'Costas',
    equipment: 'Barra Fixa',
    muscles: 'Grande Dorsal (Largura), Redondo Maior, Bíceps',
    tips: 'Inicie a subida puxando com as dorsais e não com os braços; queixo acima da barra.',
    img: BASE_IMG_URL + 'Pullups/0.jpg'
  },
  {
    id: 'chin-ups',
    name: 'Barra Fixa Supinada (Chin-Up)',
    group: 'Costas',
    equipment: 'Barra Fixa',
    muscles: 'Grande Dorsal e Bíceps Braquial',
    tips: 'Palmas voltadas para você; forte ativação de bíceps com carga corporal.',
    img: BASE_IMG_URL + 'Chin-Ups/0.jpg'
  },
  {
    id: 'lat-pulldown-wide',
    name: 'Puxada Frontal Aberta na Polia',
    group: 'Costas',
    equipment: 'Polia Alta',
    muscles: 'Grande Dorsal, Redondo Maior',
    tips: 'Puxe a barra em direção à fúrcula esternal projetando o peito para cima.',
    img: BASE_IMG_URL + 'Wide-Grip_Lat_Pulldown/0.jpg'
  },
  {
    id: 'lat-pulldown-close',
    name: 'Puxada Frontal com Triângulo',
    group: 'Costas',
    equipment: 'Polia Alta & Triângulo',
    muscles: 'Grande Dorsal (Fibras inferiores) e Bíceps',
    tips: 'Pegada neutra que protege o ombro e permite puxar com grande sobrecarga.',
    img: BASE_IMG_URL + 'V-bar_Pulldown/0.jpg'
  },
  {
    id: 'bent-over-row-barbell',
    name: 'Remada Curvada com Barra',
    group: 'Costas',
    equipment: 'Barra Olímpica',
    muscles: 'Dorsais, Rombóides, Trapézio, Lombar',
    tips: 'Tronco a 45 graus, coluna alinhada e puxe a barra rente à coxa até o umbigo.',
    img: BASE_IMG_URL + 'Bent_Over_Barbell_Row/0.jpg'
  },
  {
    id: 'seated-cable-row',
    name: 'Remada Baixa no Triângulo',
    group: 'Costas',
    equipment: 'Polia Baixa',
    muscles: 'Dorsais, Trapézio Médio/Inferior',
    tips: 'Alongue as escápulas na ida e aperte as costas na volta sem usar a lombar como pêndulo.',
    img: BASE_IMG_URL + 'Seated_Cable_Rows/0.jpg'
  },
  {
    id: 'dumbbell-single-row',
    name: 'Remada Unilateral com Halter (Serrote)',
    group: 'Costas',
    equipment: 'Halter & Banco',
    muscles: 'Grande Dorsal, Redondo Maior',
    tips: 'Traga o halter em direção ao quadril criando uma curva de alavanca natural.',
    img: BASE_IMG_URL + 'One-Arm_Dumbbell_Row/0.jpg'
  },
  {
    id: 't-bar-row',
    name: 'Remada Cavalinho (Barra T)',
    group: 'Costas',
    equipment: 'Barra T / Apoio',
    muscles: 'Espessura de Costas, Rombóides',
    tips: 'Mantenha os joelhos semi-flexionados para absorver a carga na cadeia posterior.',
    img: BASE_IMG_URL + 'T-Bar_Row/0.jpg'
  },
  {
    id: 'straight-arm-pulldown',
    name: 'Pulldown na Polia com Barra/Corda',
    group: 'Costas',
    equipment: 'Polia Alta',
    muscles: 'Grande Dorsal (Isolamento)',
    tips: 'Cotovelos destravados mas imóveis; desça apenas pela extensão do ombro.',
    img: BASE_IMG_URL + 'Straight-Arm_Pulldown/0.jpg'
  },
  {
    id: 'deadlift',
    name: 'Levantamento Terra Clássico',
    group: 'Costas',
    equipment: 'Barra Olímpica',
    muscles: 'Eretores da Espinha, Glúteos, Isquiotibiais, Trapézio',
    tips: 'A barra deve subir rente às canelas; trave o abdômen e empurre o chão.',
    img: BASE_IMG_URL + 'Barbell_Deadlift/0.jpg'
  },

  // PERNAS
  {
    id: 'back-squat',
    name: 'Agachamento Livre com Barra',
    group: 'Pernas',
    equipment: 'Barra Olímpica & Rack',
    muscles: 'Quadríceps, Glúteos, Isquiotibiais, Core',
    tips: 'Base na largura dos ombros, ponta dos pés para fora e quebre a paralela de 90°.',
    img: BASE_IMG_URL + 'Barbell_Full_Squat/0.jpg'
  },
  {
    id: 'front-squat',
    name: 'Agachamento Frontal com Barra',
    group: 'Pernas',
    equipment: 'Barra Olímpica',
    muscles: 'Foco Total em Quadríceps e Core',
    tips: 'Barra apoiada nos deltóides anteriores; tronco muito mais ereto durante a descida.',
    img: BASE_IMG_URL + 'Front_Barbell_Squat/0.jpg'
  },
  {
    id: 'leg-press-45',
    name: 'Leg Press 45°',
    group: 'Pernas',
    equipment: 'Máquina 45°',
    muscles: 'Quadríceps e Glúteos',
    tips: 'Nunca tire a lombar do encosto e não trave os joelhos em hiperextensão.',
    img: BASE_IMG_URL + 'Leg_Press/0.jpg'
  },
  {
    id: 'hack-squat',
    name: 'Agachamento Hack',
    group: 'Pernas',
    equipment: 'Máquina Hack',
    muscles: 'Vasto Lateral e Quadríceps Geral',
    tips: 'Estabilidade guiada para descer com profundidade máxima sem risco lombar.',
    img: BASE_IMG_URL + 'Hack_Squat/0.jpg'
  },
  {
    id: 'bulgarian-squat',
    name: 'Agachamento Búlgaro com Halteres',
    group: 'Pernas',
    equipment: 'Halteres & Banco',
    muscles: 'Quadríceps, Glúteo Médio/Máximo',
    tips: 'Pé de trás suspenso no banco; desça o joelho traseiro quase até tocar o piso.',
    img: BASE_IMG_URL + 'Dumbbell_Split_Squat/0.jpg'
  },
  {
    id: 'leg-extension',
    name: 'Cadeira Extensora',
    group: 'Pernas',
    equipment: 'Máquina',
    muscles: 'Quadríceps (Isolamento / Reto Femoral)',
    tips: 'Pausa isométrica de 1 segundo no pico de contração antes de descer.',
    img: BASE_IMG_URL + 'Leg_Extensions/0.jpg'
  },
  {
    id: 'romanian-deadlift',
    name: 'Stiff / RDL com Barra',
    group: 'Pernas',
    equipment: 'Barra Olímpica',
    muscles: 'Isquiotibiais (Posterior de Coxa) e Glúteos',
    tips: 'Mantenha os joelhos com microflexão fixa e jogue a bacia para trás.',
    img: BASE_IMG_URL + 'Romanian_Deadlift/0.jpg'
  },
  {
    id: 'lying-leg-curl',
    name: 'Mesa Flexora',
    group: 'Pernas',
    equipment: 'Máquina',
    muscles: 'Isquiotibiais (Bíceps Femoral)',
    tips: 'Pressione o quadril contra o estofado durante toda a fase concêntrica.',
    img: BASE_IMG_URL + 'Lying_Leg_Curls/0.jpg'
  },
  {
    id: 'seated-leg-curl',
    name: 'Cadeira Flexora',
    group: 'Pernas',
    equipment: 'Máquina',
    muscles: 'Isquiotibiais (Em posição alongada)',
    tips: 'O ângulo do quadril sentado gera maior hipertrofia na cabeça longa do posterior.',
    img: BASE_IMG_URL + 'Seated_Leg_Curl/0.jpg'
  },
  {
    id: 'hip-thrust',
    name: 'Elevação Pélvica com Barra',
    group: 'Pernas',
    equipment: 'Barra & Banco',
    muscles: 'Glúteo Máximo',
    tips: 'Apoio na altura das escápulas; trave os glúteos no topo por 1 segundo.',
    img: BASE_IMG_URL + 'Barbell_Hip_Thrust/0.jpg'
  },
  {
    id: 'standing-calf-raise',
    name: 'Panturrilha em Pé no Smith / Degrau',
    group: 'Pernas',
    equipment: 'Smith / Máquina',
    muscles: 'Gastrocnêmio',
    tips: 'Alongamento máximo na descida e subida explosiva na ponta dos pés.',
    img: BASE_IMG_URL + 'Standing_Calf_Raises/0.jpg'
  },
  {
    id: 'seated-calf-raise',
    name: 'Panturrilha Sentado (Gêmeos)',
    group: 'Pernas',
    equipment: 'Máquina',
    muscles: 'Sóleo',
    tips: 'Com os joelhos flexionados a 90°, o sóleo é o músculo predominante.',
    img: BASE_IMG_URL + 'Seated_Calf_Raise/0.jpg'
  },

  // OMBROS
  {
    id: 'overhead-press-barbell',
    name: 'Desenvolvimento Militar com Barra',
    group: 'Ombros',
    equipment: 'Barra Olímpica',
    muscles: 'Deltóide Anterior, Tríceps, Core',
    tips: 'Feito em pé; contraia os glúteos para blindar a coluna enquanto empurra a barra.',
    img: BASE_IMG_URL + 'Standing_Military_Press/0.jpg'
  },
  {
    id: 'seated-dumbbell-shoulder-press',
    name: 'Desenvolvimento com Halteres Sentado',
    group: 'Ombros',
    equipment: 'Halteres & Banco 90°',
    muscles: 'Deltóide Anterior e Lateral',
    tips: 'Desça os halteres na linha das orelhas sem bater no retorno superior.',
    img: BASE_IMG_URL + 'Dumbbell_Shoulder_Press/0.jpg'
  },
  {
    id: 'lateral-raise-dumbbell',
    name: 'Elevação Lateral com Halteres',
    group: 'Ombros',
    equipment: 'Halteres',
    muscles: 'Deltóide Lateral (Largura de Ombros)',
    tips: 'Cotovelo lidera o movimento até a linha do ombro; não balance o tronco.',
    img: BASE_IMG_URL + 'Side_Lateral_Raise/0.jpg'
  },
  {
    id: 'lateral-raise-cable',
    name: 'Elevação Lateral na Polia Baixa',
    group: 'Ombros',
    equipment: 'Polia Baixa',
    muscles: 'Deltóide Lateral (Tensão Contínua)',
    tips: 'A polia mantém a tensão uniforme mesmo no início do movimento.',
    img: BASE_IMG_URL + 'Cable_One_Arm_Lateral_Raise/0.jpg'
  },
  {
    id: 'front-raise-dumbbell',
    name: 'Elevação Frontal com Halteres',
    group: 'Ombros',
    equipment: 'Halteres',
    muscles: 'Deltóide Anterior',
    tips: 'Levante o halter alternado até a altura dos olhos com controle de descida.',
    img: BASE_IMG_URL + 'Front_Dumbbell_Raise/0.jpg'
  },
  {
    id: 'face-pull',
    name: 'Face Pull na Polia com Corda',
    group: 'Ombros',
    equipment: 'Polia Alta & Corda',
    muscles: 'Deltóide Posterior, Trapézio, Manguito Rotador',
    tips: 'Puxe a corda em direção aos olhos separando as mãos e rodando os ombros para trás.',
    img: BASE_IMG_URL + 'Face_Pull/0.jpg'
  },
  {
    id: 'rear-delt-fly-dumbbell',
    name: 'Crucifixo Invertido com Halteres',
    group: 'Ombros',
    equipment: 'Halteres',
    muscles: 'Deltóide Posterior',
    tips: 'Tronco inclinado para a frente; abra os braços como asas sentindo as costas altas.',
    img: BASE_IMG_URL + 'Bent-Over_Rear_Delt_Raise/0.jpg'
  },
  {
    id: 'arnold-press',
    name: 'Desenvolvimento Arnold',
    group: 'Ombros',
    equipment: 'Halteres',
    muscles: 'Deltóide Anterior, Lateral e Manguito',
    tips: 'Inicie com as palmas voltadas para você e rode os punhos enquanto sobe a carga.',
    img: BASE_IMG_URL + 'Arnold_Dumbbell_Press/0.jpg'
  },

  // BÍCEPS
  {
    id: 'barbell-bicep-curl',
    name: 'Rosca Direta com Barra W',
    group: 'Bíceps',
    equipment: 'Barra W',
    muscles: 'Bíceps Braquial, Braquial',
    tips: 'Cotovelos colados nas costelas sem avançá-los durante a flexão do braço.',
    img: BASE_IMG_URL + 'Barbell_Curl/0.jpg'
  },
  {
    id: 'dumbbell-alternate-bicep-curl',
    name: 'Rosca Alternada com Halteres',
    group: 'Bíceps',
    equipment: 'Halteres',
    muscles: 'Bíceps Braquial (Com Supinação)',
    tips: 'Inicie neutro e faça a supinação (gire a palma para cima) no ápice do movimento.',
    img: BASE_IMG_URL + 'Alternate_Incline_Dumbbell_Curl/0.jpg'
  },
  {
    id: 'incline-dumbbell-curl',
    name: 'Rosca no Banco Inclinado',
    group: 'Bíceps',
    equipment: 'Halteres & Banco 45°',
    muscles: 'Cabeça Longa do Bíceps (Pico)',
    tips: 'O estiramento com os braços para trás gera estímulo hipertrófico diferenciado.',
    img: BASE_IMG_URL + 'Incline_Dumbbell_Curl/0.jpg'
  },
  {
    id: 'preacher-curl',
    name: 'Rosca Scott com Barra W / Máquina',
    group: 'Bíceps',
    equipment: 'Banco Scott',
    muscles: 'Cabeça Curta do Bíceps (Isolamento puro)',
    tips: 'Não tire as axilas do apoio; controle a descida para não lesionar o tendão distal.',
    img: BASE_IMG_URL + 'Preacher_Curl/0.jpg'
  },
  {
    id: 'hammer-curl',
    name: 'Rosca Martelo com Halteres',
    group: 'Bíceps',
    equipment: 'Halteres',
    muscles: 'Braquial Anterior e Braquiorradial',
    tips: 'Pegada neutra constante para aumentar a espessura e densidade do braço.',
    img: BASE_IMG_URL + 'Hammer_Curls/0.jpg'
  },
  {
    id: 'cable-bicep-curl',
    name: 'Rosca na Polia Baixa',
    group: 'Bíceps',
    equipment: 'Polia Baixa & Barra Reta',
    muscles: 'Bíceps Braquial',
    tips: 'Cabo garante tração angular contínua em todo o arco articular.',
    img: BASE_IMG_URL + 'Cable_Curl/0.jpg'
  },
  {
    id: 'concentration-curl',
    name: 'Rosca Concentrada',
    group: 'Bíceps',
    equipment: 'Halter & Banco',
    muscles: 'Pico de Bíceps',
    tips: 'Cotovelo apoiado na parte interna da coxa; elimine qualquer inércia corporal.',
    img: BASE_IMG_URL + 'Concentration_Curls/0.jpg'
  },

  // TRÍCEPS
  {
    id: 'triceps-pushdown-rope',
    name: 'Tríceps Corda na Polia Alta',
    group: 'Tríceps',
    equipment: 'Polia Alta & Corda',
    muscles: 'Tríceps (Cabeça Lateral)',
    tips: 'Abra a corda no final da descida para contração em pico de 1 segundo.',
    img: BASE_IMG_URL + 'Triceps_Pushdown_-_Rope_Attachment/0.jpg'
  },
  {
    id: 'triceps-pushdown-bar',
    name: 'Tríceps Barra Reta na Polia',
    group: 'Tríceps',
    equipment: 'Polia Alta & Barra',
    muscles: 'Tríceps (Cabeça Medial e Lateral)',
    tips: 'Permite o uso de cargas mais altas com grande estabilidade de punho.',
    img: BASE_IMG_URL + 'Triceps_Pushdown/0.jpg'
  },
  {
    id: 'skull-crushers',
    name: 'Tríceps Testa com Barra W',
    group: 'Tríceps',
    equipment: 'Barra W & Banco Reto',
    muscles: 'Cabeça Longa e Medial do Tríceps',
    tips: 'Desça a barra controladamente em direção à testa ou atrás do topo da cabeça.',
    img: BASE_IMG_URL + 'Lying_Triceps_Press/0.jpg'
  },
  {
    id: 'overhead-cable-extension',
    name: 'Tríceps Francês na Polia com Corda',
    group: 'Tríceps',
    equipment: 'Polia Média/Alta',
    muscles: 'Cabeça Longa do Tríceps (Alongamento)',
    tips: 'Braços estendidos acima da cabeça atacam a maior porção do tríceps.',
    img: BASE_IMG_URL + 'Cable_Rope_Overhead_Triceps_Extension/0.jpg'
  },
  {
    id: 'close-grip-bench-press',
    name: 'Supino com Pegada Fechada',
    group: 'Tríceps',
    equipment: 'Barra Olímpica & Banco Reto',
    muscles: 'Tríceps e Peitoral Central',
    tips: 'Mãos na largura dos ombros; mantenha os cotovelos junto às costelas.',
    img: BASE_IMG_URL + 'Close-Grip_Barbell_Bench_Press/0.jpg'
  },
  {
    id: 'bench-dips',
    name: 'Tríceps no Banco (Mergulho)',
    group: 'Tríceps',
    equipment: 'Banco',
    muscles: 'Tríceps Geral',
    tips: 'Mãos apoiadas no banco por trás; desça o corpo mantendo a coluna rente ao estofado.',
    img: BASE_IMG_URL + 'Bench_Dips/0.jpg'
  },
  {
    id: 'dumbbell-kickback',
    name: 'Tríceps Coice com Halter',
    group: 'Tríceps',
    equipment: 'Halter',
    muscles: 'Tríceps (Foco no encurtamento total)',
    tips: 'Braço paralelo ao chão; estenda o antebraço travando o cotovelo no lugar.',
    img: BASE_IMG_URL + 'Tricep_Dumbbell_Kickback/0.jpg'
  },

  // ABDÔMEN & CORE
  {
    id: 'hanging-leg-raise',
    name: 'Elevação de Pernas na Barra Fixa',
    group: 'Abdômen',
    equipment: 'Barra Fixa',
    muscles: 'Reto Abdominal (Porção Infra)',
    tips: 'Enrole a pelve na subida em vez de apenas elevar as coxas pelos flexores.',
    img: BASE_IMG_URL + 'Hanging_Leg_Raise/0.jpg'
  },
  {
    id: 'cable-crunch',
    name: 'Abdominal na Polia Alta (Cable Crunch)',
    group: 'Abdômen',
    equipment: 'Polia Alta & Corda',
    muscles: 'Reto Abdominal Geral',
    tips: 'Ajoelhe-se e flexione o tronco levando os cotovelos em direção aos joelhos.',
    img: BASE_IMG_URL + 'Cable_Crunch/0.jpg'
  },
  {
    id: 'plank',
    name: 'Prancha Isométrica no Solo',
    group: 'Abdômen',
    equipment: 'Peso Corporal',
    muscles: 'Transverso do Abdômen e Core',
    tips: 'Alinhe calcanhares, quadril e ombros mantendo o abdômen contraído.',
    img: BASE_IMG_URL + 'Plank/0.jpg'
  },
  {
    id: 'ab-wheel-rollout',
    name: 'Roda Abdominal (Ab Wheel)',
    group: 'Abdômen',
    equipment: 'Roda Abdominal',
    muscles: 'Reto Abdominal, Oblíquos, Dorsal',
    tips: 'Role para frente até quase encostar o peito no chão e puxe pelo abdômen.',
    img: BASE_IMG_URL + 'Ab_Roller/0.jpg'
  },
  {
    id: 'russian-twist',
    name: 'Giro Russo (Russian Twist)',
    group: 'Abdômen',
    equipment: 'Anilha / Peso Corporal',
    muscles: 'Oblíquos e Core Rotacional',
    tips: 'Com os pés suspensos, gire o tronco controlando a inércia lateral.',
    img: BASE_IMG_URL + 'Russian_Twist/0.jpg'
  },

  // TRAPÉZIO
  {
    id: 'barbell-shrug',
    name: 'Encolhimento de Ombros com Barra',
    group: 'Trapézio',
    equipment: 'Barra Olímpica',
    muscles: 'Trapézio Superior',
    tips: 'Suba os ombros em direção às orelhas em linha reta; nunca gire os ombros.',
    img: BASE_IMG_URL + 'Barbell_Shrug/0.jpg'
  },
  {
    id: 'dumbbell-shrug',
    name: 'Encolhimento com Halteres',
    group: 'Trapézio',
    equipment: 'Halteres',
    muscles: 'Trapézio Superior',
    tips: 'Segure os halteres ao lado do corpo para uma pegada mais anatômica e neutra.',
    img: BASE_IMG_URL + 'Dumbbell_Shrug/0.jpg'
  },

  // ANTEBRAÇO
  {
    id: 'wrist-curl-barbell',
    name: 'Rosca de Punho com Barra',
    group: 'Antebraço',
    equipment: 'Barra',
    muscles: 'Flexores do Punho e Força de Pegada',
    tips: 'Antebraços apoiados nas coxas ou no banco; flexione apenas os punhos.',
    img: BASE_IMG_URL + 'Palms-Up_Barbell_Wrist_Curl/0.jpg'
  },
  {
    id: 'reverse-wrist-curl',
    name: 'Rosca de Punho Inversa',
    group: 'Antebraço',
    equipment: 'Barra ou Halteres',
    muscles: 'Extensores do Punho',
    tips: 'Fortalece os extensores, prevenindo dores e epicondilites no cotovelo.',
    img: BASE_IMG_URL + 'Palms-Down_Barbell_Wrist_Curl/0.jpg'
  }
];
