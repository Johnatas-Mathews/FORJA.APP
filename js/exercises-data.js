// js/exercises-data.js - Banco de Dados Oficial e Completo da FORJA
window.EXERCISE_DATABASE = [
  // ================= PEITO =================
  {
    id: "supino-reto-barra",
    name: "Supino Reto com Barra",
    group: "Peito",
    equipment: "Barra / Banco Reto",
    muscles: "Peitoral maior, tríceps, deltoide anterior",
    tips: "Mantenha as escápulas retraídas, pés firmes no chão e desça a barra controlada até a linha média do peito.",
    img: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Bench_Press_-_Medium_Grip/0.jpg"
  },
  {
    id: "supino-reto-halteres",
    name: "Supino Reto com Halteres",
    group: "Peito",
    equipment: "Halteres / Banco Reto",
    muscles: "Peitoral maior, tríceps, deltoide anterior",
    tips: "Mantenha os pés firmes no chão, escápulas retraídas e desça os halteres controlados até a linha do peito.",
    img: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Bench_Press/0.jpg" // Futuro boneco 3D
  },
  {
    id: "supino-inclinado-halteres",
    name: "Supino Inclinado com Halteres",
    group: "Peito",
    equipment: "Halteres / Banco 30º-45º",
    muscles: "Peitoral superior, tríceps",
    tips: "Ajuste o banco entre 30º e 45º para focar na porção clavicular (superior) do peitoral.",
    img: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Dumbbell_Press/0.jpg" // Apontando para o seu novo arquivo local
  },
  {
    id: "supino-declinado-halteres",
    name: "Supino Declinado com Halteres",
    group: "Peito",
    equipment: "Halteres / Banco Declinado",
    muscles: "Peitoral maior (porção inferior), tríceps",
    tips: "Trave bem os pés no suporte do banco declinado e realize o movimento com amplitude controlada.",
    img: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Dumbbell_Bench_Press/0.jpg" // Futuro boneco 3D
  },
  {
    id: "crucifixo-polia",
    name: "Crucifixo na Polia (Crossover)",
    group: "Peito",
    equipment: "Polia Dupla",
    muscles: "Peitoral maior",
    tips: "Mantenha uma leve semiflexão nos cotovelos durante todo o arco e esmague o peitoral no centro.",
    img: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Crossover/0.jpg"
  },
  {
    id: "supino-declinado-barra",
    name: "Supino Declinado com Barra",
    group: "Peito",
    equipment: "Barra / Banco Declinado",
    muscles: "Peitoral maior (porção inferior), tríceps",
    tips: "Mantenha os pés travados firmemente no suporte e desça a barra na altura inferior do peito.",
    img: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Barbell_Bench_Press/0.jpg"
  },
  {
    id: "pullover-halteres",
    name: "Pullover com Halter no Banco",
    group: "Peito",
    equipment: "Halter / Banco Reto",
    muscles: "Peitoral maior, serrátil anterior, grande dorsal",
    tips: "Deite ao longo do banco, mantendo uma leve flexão nos cotovelos ao descer o peso atrás da cabeça.",
    img: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent-Arm_Dumbbell_Pullover/0.jpg"
  },
  {
    id: "flexao-declinada",
    name: "Flexão Declinada (Pés Elevados)",
    group: "Peito",
    equipment: "Peso Corporal / Step",
    muscles: "Peitoral superior, deltoide anterior, core",
    tips: "Apoie os pés em uma superfície elevada e mantenha o abdômen altamente contraído.",
    img: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Push-Up/0.jpg"
  },



  // ================= PEITO - EXPANSÃO DO CATÁLOGO =================
  {
    "id": "supino-maquina-articulada",
    "name": "Supino na Máquina Articulada",
    "group": "Peito",
    "equipment": "Máquina de supino",
    "muscles": "Peitoral maior, tríceps, deltoide anterior",
    "tips": "Ajuste o banco para que as manoplas fiquem na linha média do peito. Empurre sem travar os cotovelos e retorne controlando.",
    "type": "strength",
    "level": "intermediario",
    "movementType": "composto",
    "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lever_Chest_Press/0.jpg"
  },
  {
    "id": "supino-maquina-convergente",
    "name": "Supino na Máquina Convergente",
    "group": "Peito",
    "equipment": "Máquina convergente",
    "muscles": "Peitoral maior, tríceps, deltoide anterior",
    "tips": "Mantenha as costas apoiadas e acompanhe a trajetória convergente das alavancas sem tirar os ombros do encosto.",
    "type": "strength",
    "level": "intermediario",
    "movementType": "composto",
    "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lever_Chest_Press/0.jpg"
  },
  {
    "id": "supino-smith-reto",
    "name": "Supino Reto no Smith",
    "group": "Peito",
    "equipment": "Smith / Banco reto",
    "muscles": "Peitoral maior, tríceps, deltoide anterior",
    "tips": "Posicione o banco para que a barra desça à linha média do peito. Mantenha os pés firmes e use amplitude confortável.",
    "type": "strength",
    "level": "intermediario",
    "movementType": "composto",
    "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Bench_Press/0.jpg"
  },
  {
    "id": "supino-smith-inclinado",
    "name": "Supino Inclinado no Smith",
    "group": "Peito",
    "equipment": "Smith / Banco inclinado",
    "muscles": "Peitoral superior, tríceps, deltoide anterior",
    "tips": "Ajuste o banco entre 30° e 45°. Desça a barra em direção à parte alta do peito sem elevar os ombros.",
    "type": "strength",
    "level": "intermediario",
    "movementType": "composto",
    "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Incline_Bench_Press/0.jpg"
  },
  {
    "id": "supino-smith-declinado",
    "name": "Supino Declinado no Smith",
    "group": "Peito",
    "equipment": "Smith / Banco declinado",
    "muscles": "Peitoral inferior, tríceps",
    "tips": "Prenda os pés no suporte e controle a descida em direção à região inferior do peito.",
    "type": "strength",
    "level": "intermediario",
    "movementType": "composto",
    "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Decline_Press/0.jpg"
  },
  {
    "id": "supino-inclinado-barra",
    "name": "Supino Inclinado com Barra",
    "group": "Peito",
    "equipment": "Barra / Banco inclinado",
    "muscles": "Peitoral superior, tríceps, deltoide anterior",
    "tips": "Use inclinação moderada, retraia as escápulas e desça a barra com controle até a parte superior do tórax.",
    "type": "strength",
    "level": "intermediario",
    "movementType": "composto",
    "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Barbell_Bench_Press/0.jpg"
  },
  {
    "id": "supino-maquina-inclinado",
    "name": "Supino Inclinado na Máquina",
    "group": "Peito",
    "equipment": "Máquina de supino inclinado",
    "muscles": "Peitoral superior, tríceps, deltoide anterior",
    "tips": "Regule o assento para alinhar as manoplas ao alto do peito. Evite estender completamente os cotovelos.",
    "type": "strength",
    "level": "intermediario",
    "movementType": "composto",
    "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Lever_Chest_Press/0.jpg"
  },
  {
    "id": "supino-maquina-declinado",
    "name": "Supino Declinado na Máquina",
    "group": "Peito",
    "equipment": "Máquina de supino declinado",
    "muscles": "Peitoral inferior, tríceps",
    "tips": "Ajuste a posição para empurrar na linha inferior do peitoral, mantendo as costas apoiadas.",
    "type": "strength",
    "level": "intermediario",
    "movementType": "composto",
    "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Lever_Chest_Press/0.jpg"
  },
  {
    "id": "supino-halteres-pegada-neutra",
    "name": "Supino com Halteres e Pegada Neutra",
    "group": "Peito",
    "equipment": "Halteres / Banco reto",
    "muscles": "Peitoral maior, tríceps",
    "tips": "Mantenha as palmas voltadas uma para a outra e os cotovelos próximos ao tronco durante a descida.",
    "type": "strength",
    "level": "intermediario",
    "movementType": "composto",
    "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Bench_Press/0.jpg"
  },
  {
    "id": "supino-inclinado-pegada-neutra",
    "name": "Supino Inclinado com Halteres e Pegada Neutra",
    "group": "Peito",
    "equipment": "Halteres / Banco inclinado",
    "muscles": "Peitoral superior, tríceps",
    "tips": "Use inclinação moderada e mantenha os punhos alinhados aos antebraços durante todo o movimento.",
    "type": "strength",
    "level": "intermediario",
    "movementType": "composto",
    "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Dumbbell_Press/0.jpg"
  },
  {
    "id": "crucifixo-reto-halteres",
    "name": "Crucifixo Reto com Halteres",
    "group": "Peito",
    "equipment": "Halteres / Banco reto",
    "muscles": "Peitoral maior",
    "tips": "Mantenha cotovelos levemente flexionados e abra os braços até sentir alongamento confortável, sem forçar os ombros.",
    "type": "strength",
    "level": "intermediario",
    "movementType": "isolamento",
    "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Flyes/0.jpg"
  },
  {
    "id": "crucifixo-inclinado-halteres",
    "name": "Crucifixo Inclinado com Halteres",
    "group": "Peito",
    "equipment": "Halteres / Banco inclinado",
    "muscles": "Peitoral superior",
    "tips": "Mantenha a mesma flexão dos cotovelos durante o arco e evite descer além da amplitude confortável.",
    "type": "strength",
    "level": "intermediario",
    "movementType": "isolamento",
    "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Dumbbell_Flyes/0.jpg"
  },
  {
    "id": "crucifixo-declinado-halteres",
    "name": "Crucifixo Declinado com Halteres",
    "group": "Peito",
    "equipment": "Halteres / Banco declinado",
    "muscles": "Peitoral inferior",
    "tips": "Estabilize o tronco no banco e conduza os halteres em arco, sem transformar o movimento em supino.",
    "type": "strength",
    "level": "intermediario",
    "movementType": "isolamento",
    "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Dumbbell_Flyes/0.jpg"
  },
  {
    "id": "crucifixo-maquina",
    "name": "Crucifixo na Máquina (Peck Deck)",
    "group": "Peito",
    "equipment": "Máquina peck deck",
    "muscles": "Peitoral maior",
    "tips": "Ajuste os braços ou apoios para alinhar à altura do peito. Feche sem bater os braços e retorne lentamente.",
    "type": "strength",
    "level": "intermediario",
    "movementType": "isolamento",
    "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lever_Pec_Deck_Fly/0.jpg"
  },
  {
    "id": "crucifixo-polia-alta",
    "name": "Crossover na Polia Alta",
    "group": "Peito",
    "equipment": "Polias altas",
    "muscles": "Peitoral maior, ênfase inferior",
    "tips": "Dê um passo à frente, mantenha o tronco estável e conduza as mãos para baixo e para o centro.",
    "type": "strength",
    "level": "intermediario",
    "movementType": "isolamento",
    "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Crossover/0.jpg"
  },
  {
    "id": "crucifixo-polia-baixa",
    "name": "Crossover na Polia Baixa",
    "group": "Peito",
    "equipment": "Polias baixas",
    "muscles": "Peitoral maior, ênfase superior",
    "tips": "Parta com as mãos próximas aos quadris e eleve em arco até a frente da parte superior do peito.",
    "type": "strength",
    "level": "intermediario",
    "movementType": "isolamento",
    "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Low_Cable_Crossover/0.jpg"
  },
  {
    "id": "crucifixo-polia-unilateral",
    "name": "Crucifixo Unilateral na Polia",
    "group": "Peito",
    "equipment": "Polia individual",
    "muscles": "Peitoral maior",
    "tips": "Mantenha o quadril e o tronco estáveis enquanto leva a mão à frente do peito. Faça os dois lados.",
    "type": "strength",
    "level": "intermediario",
    "movementType": "isolamento",
    "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Single-Arm_Cable_Crossover/0.jpg"
  },
  {
    "id": "crossover-polia-media",
    "name": "Crossover na Polia na Altura do Peito",
    "group": "Peito",
    "equipment": "Polias ajustadas na altura do peito",
    "muscles": "Peitoral maior",
    "tips": "Alinhe as polias ao meio do tórax e aproxime as mãos à frente do corpo sem perder a postura.",
    "type": "strength",
    "level": "intermediario",
    "movementType": "isolamento",
    "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Crossover/0.jpg"
  },
  {
    "id": "press-peito-hammer",
    "name": "Chest Press na Máquina (Pegada Neutra)",
    "group": "Peito",
    "equipment": "Máquina chest press",
    "muscles": "Peitoral maior, tríceps",
    "tips": "Ajuste o assento para manter as manoplas na altura do peito e empurre sem tirar as costas do encosto.",
    "type": "strength",
    "level": "intermediario",
    "movementType": "composto",
    "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lever_Chest_Press/0.jpg"
  },
  {
    "id": "press-peito-unilateral-maquina",
    "name": "Chest Press Unilateral na Máquina",
    "group": "Peito",
    "equipment": "Máquina chest press",
    "muscles": "Peitoral maior, tríceps",
    "tips": "Execute um braço por vez mantendo o tronco quadrado e evitando girar o corpo.",
    "type": "strength",
    "level": "intermediario",
    "movementType": "composto",
    "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Single-Arm_Lever_Chest_Press/0.jpg"
  },
  {
    "id": "flexao-tradicional",
    "name": "Flexão de Braços Tradicional",
    "group": "Peito",
    "equipment": "Peso corporal",
    "muscles": "Peitoral maior, tríceps, deltoide anterior",
    "tips": "Mantenha cabeça, tronco e quadril alinhados. Desça o peito em direção ao chão e empurre sem deixar o quadril cair.",
    "type": "strength",
    "level": "intermediario",
    "movementType": "composto",
    "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pushups/0.jpg"
  },
  {
    "id": "flexao-joelhos",
    "name": "Flexão de Braços com Joelhos Apoiados",
    "group": "Peito",
    "equipment": "Peso corporal",
    "muscles": "Peitoral maior, tríceps",
    "tips": "Apoie os joelhos e mantenha o tronco alinhado dos ombros aos joelhos durante a descida e subida.",
    "type": "strength",
    "level": "intermediario",
    "movementType": "composto",
    "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kneeling_Pushups/0.jpg"
  },
  {
    "id": "flexao-maos-elevadas",
    "name": "Flexão com as Mãos Elevadas",
    "group": "Peito",
    "equipment": "Banco / suporte firme",
    "muscles": "Peitoral maior, tríceps",
    "tips": "Apoie as mãos em uma superfície estável. Quanto mais alta a superfície, menor tende a ser a dificuldade.",
    "type": "strength",
    "level": "intermediario",
    "movementType": "composto",
    "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Pushups/0.jpg"
  },
  {
    "id": "flexao-fechada",
    "name": "Flexão com Pegada Fechada",
    "group": "Peito",
    "equipment": "Peso corporal",
    "muscles": "Peitoral, tríceps",
    "tips": "Aproxime as mãos sem desconforto nos punhos e mantenha os cotovelos próximos ao corpo.",
    "type": "strength",
    "level": "intermediario",
    "movementType": "composto",
    "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Close-Grip_Pushup/0.jpg"
  },
  {
    "id": "flexao-larga",
    "name": "Flexão com Pegada Ampla",
    "group": "Peito",
    "equipment": "Peso corporal",
    "muscles": "Peitoral maior, deltoide anterior",
    "tips": "Posicione as mãos um pouco além da largura dos ombros e mantenha o controle da descida.",
    "type": "strength",
    "level": "intermediario",
    "movementType": "composto",
    "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide_Hands_Pushup/0.jpg"
  },
  {
    "id": "flexao-diamante",
    "name": "Flexão Diamante",
    "group": "Peito",
    "equipment": "Peso corporal",
    "muscles": "Tríceps, peitoral maior",
    "tips": "Aproxime as mãos sob o peito apenas até onde os punhos permitirem, mantendo cotovelos controlados.",
    "type": "strength",
    "level": "intermediario",
    "movementType": "composto",
    "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Diamond_Pushup/0.jpg"
  },
  {
    "id": "flexao-smith",
    "name": "Flexão na Barra do Smith",
    "group": "Peito",
    "equipment": "Smith",
    "muscles": "Peitoral maior, tríceps",
    "tips": "Ajuste a altura da barra para escolher a dificuldade e mantenha o corpo alinhado durante as repetições.",
    "type": "strength",
    "level": "intermediario",
    "movementType": "composto",
    "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Pushup/0.jpg"
  },
  {
    "id": "supino-terra-barra",
    "name": "Supino no Chão com Barra",
    "group": "Peito",
    "equipment": "Barra / chão",
    "muscles": "Peitoral maior, tríceps",
    "tips": "Deite no chão, mantenha os cotovelos apoiando suavemente no solo e pressione a barra sem quicar.",
    "type": "strength",
    "level": "intermediario",
    "movementType": "composto",
    "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Floor_Press/0.jpg"
  },
  {
    "id": "supino-terra-halteres",
    "name": "Supino no Chão com Halteres",
    "group": "Peito",
    "equipment": "Halteres / chão",
    "muscles": "Peitoral maior, tríceps",
    "tips": "Desça até os braços tocarem suavemente o chão e pressione os halteres mantendo os punhos alinhados.",
    "type": "strength",
    "level": "intermediario",
    "movementType": "composto",
    "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Floor_Press/0.jpg"
  },
  {
    "id": "supino-guilhotina-smith",
    "name": "Supino Inclinado Pegada Aberta no Smith",
    "group": "Peito",
    "equipment": "Smith / Banco inclinado",
    "muscles": "Peitoral superior, deltoide anterior, tríceps",
    "tips": "Use carga conservadora e amplitude sem dor. Não force a barra em direção ao pescoço; mantenha a trajetória na região alta do peito.",
    "type": "strength",
    "level": "intermediario",
    "movementType": "composto",
    "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Incline_Bench_Press/0.jpg"
  },
  {
    "id": "squeeze-press-halteres",
    "name": "Squeeze Press com Halteres",
    "group": "Peito",
    "equipment": "Halteres / Banco reto",
    "muscles": "Peitoral maior, tríceps",
    "tips": "Mantenha os halteres pressionados um contra o outro e faça o supino sem perder essa pressão.",
    "type": "strength",
    "level": "intermediario",
    "movementType": "composto",
    "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Squeeze_Press/0.jpg"
  },
  {
    "id": "hex-press",
    "name": "Hex Press com Halteres",
    "group": "Peito",
    "equipment": "Halteres / Banco reto",
    "muscles": "Peitoral maior, tríceps",
    "tips": "Pressione as faces internas dos halteres juntas durante a subida e descida, com cotovelos controlados.",
    "type": "strength",
    "level": "intermediario",
    "movementType": "composto",
    "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Squeeze_Press/0.jpg"
  },
  {
    "id": "pullover-polia",
    "name": "Pullover na Polia Alta",
    "group": "Peito",
    "equipment": "Polia alta / barra ou corda",
    "muscles": "Peitoral maior, grande dorsal",
    "tips": "Com braços quase estendidos, leve a barra em arco até as coxas sem balançar o tronco.",
    "type": "strength",
    "level": "intermediario",
    "movementType": "isolamento",
    "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Pullover/0.jpg"
  },
  {
    "id": "pullover-maquina",
    "name": "Pullover na Máquina",
    "group": "Peito",
    "equipment": "Máquina pullover",
    "muscles": "Peitoral maior, grande dorsal, serrátil",
    "tips": "Ajuste o eixo da máquina ao ombro e mova os braços em arco mantendo o abdômen firme.",
    "type": "strength",
    "level": "intermediario",
    "movementType": "isolamento",
    "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lever_Pullover/0.jpg"
  },
  {
    "id": "pullover-barra",
    "name": "Pullover com Barra",
    "group": "Peito",
    "equipment": "Barra / Banco reto",
    "muscles": "Peitoral maior, grande dorsal, tríceps",
    "tips": "Use carga leve, cotovelos discretamente flexionados e não force a amplitude atrás da cabeça.",
    "type": "strength",
    "level": "intermediario",
    "movementType": "isolamento",
    "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent-Arm_Dumbbell_Pullover/0.jpg"
  },
  {
    "id": "supino-inclinado-cabo",
    "name": "Supino Inclinado na Polia",
    "group": "Peito",
    "equipment": "Polias baixas / banco inclinado",
    "muscles": "Peitoral superior, tríceps",
    "tips": "Posicione o banco entre as polias baixas e pressione as manoplas para cima e para dentro.",
    "type": "strength",
    "level": "intermediario",
    "movementType": "composto",
    "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Cable_Press/0.jpg"
  },
  {
    "id": "supino-cabo-reto",
    "name": "Supino Reto na Polia",
    "group": "Peito",
    "equipment": "Polias / banco reto",
    "muscles": "Peitoral maior, tríceps",
    "tips": "Ajuste as polias à altura do peito e empurre as manoplas à frente mantendo escápulas estáveis.",
    "type": "strength",
    "level": "intermediario",
    "movementType": "composto",
    "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Bench_Press/0.jpg"
  },
  {
    "id": "supino-unilateral-cabo",
    "name": "Supino Unilateral em Pé na Polia",
    "group": "Peito",
    "equipment": "Polia individual",
    "muscles": "Peitoral maior, tríceps, core",
    "tips": "Fique de costas para a polia e pressione uma mão à frente sem permitir rotação do tronco.",
    "type": "strength",
    "level": "intermediario",
    "movementType": "composto",
    "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Single-Arm_Cable_Press/0.jpg"
  },
  {
    "id": "crucifixo-cabo-deitado",
    "name": "Crucifixo Deitado na Polia",
    "group": "Peito",
    "equipment": "Polias baixas / banco reto",
    "muscles": "Peitoral maior",
    "tips": "Deite entre as polias, mantenha cotovelos levemente flexionados e feche os braços em arco.",
    "type": "strength",
    "level": "intermediario",
    "movementType": "isolamento",
    "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Flyes/0.jpg"
  },
  {
    "id": "crucifixo-cabo-inclinado",
    "name": "Crucifixo Inclinado na Polia",
    "group": "Peito",
    "equipment": "Polias baixas / banco inclinado",
    "muscles": "Peitoral superior",
    "tips": "Ajuste o banco e conduza as mãos em arco à frente da parte alta do peito.",
    "type": "strength",
    "level": "intermediario",
    "movementType": "isolamento",
    "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Cable_Flyes/0.jpg"
  },
  {
    "id": "crucifixo-cabo-declinado",
    "name": "Crucifixo Declinado na Polia",
    "group": "Peito",
    "equipment": "Polias altas / banco declinado",
    "muscles": "Peitoral inferior",
    "tips": "Mantenha o tronco apoiado e feche os braços em arco sem elevar os ombros.",
    "type": "strength",
    "level": "intermediario",
    "movementType": "isolamento",
    "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Cable_Flyes/0.jpg"
  },
  {
    "id": "press-isometrico-peito",
    "name": "Pressão Isométrica de Peito",
    "group": "Peito",
    "equipment": "Peso corporal",
    "muscles": "Peitoral maior",
    "tips": "Pressione as palmas das mãos uma contra a outra à frente do peito, mantendo tensão constante e respiração fluida.",
    "type": "strength",
    "level": "intermediario",
    "movementType": "isolamento",
    "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Chest_Squeeze/0.jpg"
  },
  {
    "id": "pulso-peitoral-maquina",
    "name": "Contração Isométrica no Peck Deck",
    "group": "Peito",
    "equipment": "Máquina peck deck",
    "muscles": "Peitoral maior",
    "tips": "Feche os braços até uma posição confortável e sustente a contração sem prender a respiração.",
    "type": "strength",
    "level": "intermediario",
    "movementType": "isolamento",
    "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lever_Pec_Deck_Fly/0.jpg"
  },
  {
    "id": "supino-barra-pegada-fechada",
    "name": "Supino com Barra e Pegada Fechada",
    "group": "Peito",
    "equipment": "Barra / Banco reto",
    "muscles": "Tríceps, peitoral maior",
    "tips": "Use pegada um pouco mais fechada que a tradicional, sem aproximar excessivamente as mãos; mantenha punhos alinhados.",
    "type": "strength",
    "level": "intermediario",
    "movementType": "composto",
    "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Close-Grip_Barbell_Bench_Press/0.jpg"
  },
  {
    "id": "supino-inclinado-smith-pegada-media",
    "name": "Supino Inclinado no Smith com Pegada Média",
    "group": "Peito",
    "equipment": "Smith / Banco inclinado",
    "muscles": "Peitoral superior, tríceps",
    "tips": "Mantenha pegada média e punhos alinhados, descendo a barra de forma controlada à parte alta do tórax.",
    "type": "strength",
    "level": "intermediario",
    "movementType": "composto",
    "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Incline_Bench_Press/0.jpg"
  },
  {
    "id": "flexao-paralela-assistida",
    "name": "Mergulho nas Paralelas Assistido (Ênfase Peitoral)",
    "group": "Peito",
    "equipment": "Máquina assistida / paralelas",
    "muscles": "Peitoral maior, tríceps, deltoide anterior",
    "tips": "Incline levemente o tronco e desça somente até uma amplitude confortável para os ombros.",
    "type": "strength",
    "level": "intermediario",
    "movementType": "composto",
    "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Assisted_Dips/0.jpg"
  },
  {
    "id": "mergulho-paralelas-peso-corporal",
    "name": "Mergulho nas Paralelas (Ênfase Peitoral)",
    "group": "Peito",
    "equipment": "Barras paralelas",
    "muscles": "Peitoral maior, tríceps",
    "tips": "Incline moderadamente o tronco, mantenha os ombros estáveis e evite descer além da mobilidade confortável.",
    "type": "strength",
    "level": "intermediario",
    "movementType": "composto",
    "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dips/0.jpg"
  },

  // ================= COSTAS =================
  {
    id: "puxada-alta-aberta",
    name: "Puxada Alta Pegada Aberta",
    group: "Costas",
    equipment: "Polia Alta",
    muscles: "Grande dorsal, redondo maior, bíceps",
    tips: "Inicie o movimento deprimindo os ombros e puxe a barra até a parte superior do peito.",
    img: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Lat_Pulldown/0.jpg"
  },
  {
    id: "remada-curvada-barra",
    name: "Remada Curvada com Barra",
    group: "Costas",
    equipment: "Barra Livre",
    muscles: "Dorsais, romboides, trapézio, eretores da espinha",
    tips: "Coluna neutra inclinada a ~45º; puxe a barra em direção ao umbigo.",
    img: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent_Over_Barbell_Row/0.jpg"
  },
  {
    id: "remada-baixa-barra-reta",
    name: "Remada Baixa com Barra Reta",
    group: "Costas",
    equipment: "Polia Baixa / Barra Reta",
    muscles: "Dorsais, trapézio inferior, romboides",
    tips: "Puxe a barra em direção ao abdômen inferior mantendo o tronco estável.",
    img: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Cable_Rows/0.jpg"
  },
  {
    id: "puxada-frente-supinada",
    name: "Puxada Frente com Pegada Supinada",
    group: "Costas",
    equipment: "Polia Alta",
    muscles: "Grande dorsal, bíceps braquial",
    tips: "Com as palmas voltadas para você, puxe a barra até o peito focando na contração dos bíceps.",
    img: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Underhand_Cable_Pulldowns/0.jpg"
  },
  {
    id: "remada-t-barra-livre",
    name: "Remada T com Barra Livre (Landmine)",
    group: "Costas",
    equipment: "Barra / Landmine",
    muscles: "Espessura das costas, trapézio, lombar",
    tips: "Mantenha a coluna neutra e puxe a alça em direção às costelas com firmeza.",
    img: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/T-Bar_Row_with_Handle/0.jpg"
  },

  // ================= PERNAS =================
  {
    id: "agachamento-livre",
    name: "Agachamento Livre com Barra",
    group: "Pernas",
    equipment: "Barra / Gaiola",
    muscles: "Quadríceps, glúteos, adutores, core",
    tips: "Empurre os joelhos para fora na linha dos pés e mantenha o tronco firme na subida.",
    img: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Full_Squat/0.jpg"
  },
  {
    id: "leg-press-45",
    name: "Leg Press 45º",
    group: "Pernas",
    equipment: "Máquina Leg Press",
    muscles: "Quadríceps, glúteos",
    tips: "Não trave os joelhos no topo e não deixe o quadril levantar do banco no fundo.",
    img: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Press/0.jpg"
  },
  {
    id: "agachamento-sumo-haltere",
    name: "Agachamento Sumô com Halter",
    group: "Pernas",
    equipment: "Halter",
    muscles: "Glúteos, adutores da coxa, quadríceps",
    tips: "Abra bem a base dos pés com as pontas viradas para fora e desça o quadril na vertical.",
    img: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Squat/0.jpg"
  },
  {
    id: "cadeira-abdutora",
    name: "Cadeira Abdutora",
    group: "Pernas",
    equipment: "Máquina Abdutora",
    muscles: "Glúteo médio e mínimo",
    tips: "Incline o tronco ligeiramente para a frente para focar ainda mais na ativação dos glúteos.",
    img: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Thigh_Abductor/0.jpg"
  },
  {
    id: "cadeira-adutora",
    name: "Cadeira Adutora",
    group: "Pernas",
    equipment: "Máquina Adutora",
    muscles: "Músculos adutores (parte interna da coxa)",
    tips: "Feche as pernas controlando o movimento sem soltar o peso abruptamente.",
    img: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Thigh_Adductor/0.jpg"
  },
  {
    id: "panturrilha-sentada",
    name: "Panturrilha Sentada na Máquina",
    group: "Pernas",
    equipment: "Máquina de Panturrilha Sentada",
    muscles: "Músculo sóleo",
    tips: "Amplitude máxima esticando o calcanhar para baixo e contraindo forte no topo.",
    img: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Calf_Raise/0.jpg"
  },
  {
    id: "bulgarian_split_squat",
    name: "Agachamento Búlgaro com Halteres",
    group: "Pernas",
    equipment: "Halteres / Banco",
    muscles: "Quadríceps, Glúteos, Adutores",
    tips: "Apoie o peito do pé de trás no banco, mantenha o tronco ereto e desça o quadril verticalmente.",
    type: "strength",
    img: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Split_Squat_with_Dumbbells/0.jpg"
  },
  {
    id: "hip_thrust",
    name: "Elevação Pélvica (Hip Thrust)",
    group: "Pernas",
    equipment: "Barra / Banco / Máquina",
    muscles: "Glúteo Máximo, Isquiotibiais",
    tips: "Apoie as escápulas na borda do banco, faça flexão completa do quadril e contraia os glúteos no topo por 1 segundo.",
    type: "strength",
    img: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Hip_Thrust/0.jpg"
  },
  {
    id: "cadeira_extensora",
    name: "Cadeira Extensora",
    group: "Pernas",
    equipment: "Aparelho Extensor",
    muscles: "Quadríceps (Reto Femoral)",
    tips: "Ajuste o encosto para que o joelho coincida com o eixo da máquina. Execute extensão completa com controle na volta.",
    type: "strength",
    img: "assets/3d-avatars/cadeira-extensora.gif"
  },
  {
    id: "mesa_flexora",
    name: "Mesa Flexora",
    group: "Pernas",
    equipment: "Aparelho Flexor",
    muscles: "Isquiotibiais (Posterior de Coxa)",
    tips: "Mantenha o quadril firmemente apoiado no banco para evitar compensações com a lombar.",
    type: "strength",
    img: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Leg_Curls/0.jpg"
  },
  {
    id: "stiff_barra",
    name: "Stiff com Barra",
    group: "Pernas",
    equipment: "Barra",
    muscles: "Isquiotibiais, Glúteos, Lombar",
    tips: "Mantenha as pernas semi-flexionadas, empine o quadril para trás alongando a posterior e retorne à posição inicial.",
    type: "strength",
    img: "assets/3d-avatars/stiff_com_barra .gif"
  },
  {
    id: "panturrilha_em_pe",
    name: "Panturrilha em Pé na Máquina",
    group: "Pernas",
    equipment: "Máquina / Smith",
    muscles: "Gastrocnêmio, Sóleo",
    tips: "Faça amplitude completa: alongue bem o calcanhar na base em baixo e suba na ponta dos pés na máxima altura.",
    type: "strength",
    img: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Calf_Raises/0.jpg"
  },

  // ================= OMBROS =================
  {
    id: "elevacao-lateral-halteres",
    name: "Elevação Lateral com Halteres",
    group: "Ombros",
    equipment: "Halteres",
    muscles: "Deltoide lateral",
    tips: "Suba até a linha dos ombros liderando o movimento pelos cotovelos, sem balançar o tronco.",
    img: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Lateral_Raise/0.jpg"
  },
  {
    id: "desenvolvimento-arnold",
    name: "Desenvolvimento Arnold com Halteres",
    group: "Ombros",
    equipment: "Halteres / Banco",
    muscles: "Deltoides (anterior, lateral e posterior)",
    tips: "Inicie com as palmas voltadas para o rosto e vá girando os punhos para fora durante a subida.",
    img: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Arnold_Dumbbell_Press/0.jpg"
  },
  {
    id: "remada-alta-polia",
    name: "Remada Alta na Polia",
    group: "Ombros",
    equipment: "Polia Baixa / Barra Reta",
    muscles: "Trapézio, deltoide lateral",
    tips: "Puxe a barra rente ao corpo guiando o movimento pelos cotovelos.",
    img: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Upright_Cable_Row/0.jpg"
  },

  // ================= BRAÇOS =================
  {
    id: "rosca-direta-barra",
    name: "Rosca Direta com Barra",
    group: "Braços",
    equipment: "Barra",
    muscles: "Bíceps braquial, braquial",
    tips: "Cotovelos fixos ao lado das costelas; suba sem projetar os ombros para frente.",
    img: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Curl/0.jpg"
  },
  {
    id: "triceps-polia-corda",
    name: "Tríceps na Polia com Corda",
    group: "Braços",
    equipment: "Polia Alta / Corda",
    muscles: "Tríceps braquial",
    tips: "Cotovelos travados ao lado do tronco; abra as pontas da corda no final da extensão.",
    img: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Triceps_Pushdown_-_Rope_Attachment/0.jpg"
  },
  {
    id: "rosca-concentrada",
    name: "Rosca Concentrada com Halter",
    group: "Braços",
    equipment: "Halter / Banco",
    muscles: "Bíceps braquial (pico do bíceps)",
    tips: "Apoie o cotovelo na parte interna da coxa e isole totalmente o movimento do braço.",
    img: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Concentration_Curls/0.jpg"
  },
  {
    id: "triceps-banco-mergulho",
    name: "Mergulho no Banco (Tríceps Dips)",
    group: "Braços",
    equipment: "Banco / Peso Corporal",
    muscles: "Tríceps braquial, peitoral menor",
    tips: "Mantenha o quadril próximo ao banco durante a descida para proteger os ombros.",
    img: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bench_Dips/0.jpg"
  },

  // ================= CORE =================
  {
    id: "prancha-isometrica",
    name: "Prancha Abdominal Isométrica",
    group: "Core",
    equipment: "Peso Corporal",
    muscles: "Transverso abdominal, reto abdominal, lombar",
    tips: "Contraia glúteos e abdômen com força máxima, mantendo a respiração controlada.",
    img: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plank/0.jpg"
  },
  {
    id: "abdominal-remador",
    name: "Abdominal Remador (Full Crunch)",
    group: "Core",
    equipment: "Colchonete",
    muscles: "Core completo, flexores do quadril",
    tips: "Estenda pernas e braços simultaneamente e recolha o corpo abraçando os joelhos.",
    img: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Crunches/0.jpg"
  },
  {
    id: "lombar-hiperextensao",
    name: "Hiperextensão Lombar no Banco",
    group: "Core",
    equipment: "Banco Romano",
    muscles: "Eretores da espinha, glúteos",
    tips: "Evite hiper estender a coluna no topo; pare no alinhamento reto do corpo.",
    img: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hyperextensions_Back_Extensions/0.jpg"
  }
];
