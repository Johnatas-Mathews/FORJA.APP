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
    img: "assets/3d-avatars/peito-supino-reto.png" // Futuro boneco 3D
  },
  {
    id: "supino-inclinado-halteres",
    name: "Supino Inclinado com Halteres",
    group: "Peito",
    equipment: "Halteres / Banco 30º-45º",
    muscles: "Peitoral superior, tríceps",
    tips: "Ajuste o banco entre 30º e 45º para focar na porção clavicular (superior) do peitoral.",
    img: "assets/3d-avatars/supino-inclinado.gif" // Apontando para o seu novo arquivo local
  },
  {
    id: "supino-declinado-halteres",
    name: "Supino Declinado com Halteres",
    group: "Peito",
    equipment: "Halteres / Banco Declinado",
    muscles: "Peitoral maior (porção inferior), tríceps",
    tips: "Trave bem os pés no suporte do banco declinado e realize o movimento com amplitude controlada.",
    img: "assets/3d-avatars/peito-supino-declinado.png" // Futuro boneco 3D
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
    img: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "hip_thrust",
    name: "Elevação Pélvica (Hip Thrust)",
    group: "Pernas",
    equipment: "Barra / Banco / Máquina",
    muscles: "Glúteo Máximo, Isquiotibiais",
    tips: "Apoie as escápulas na borda do banco, faça flexão completa do quadril e contraia os glúteos no topo por 1 segundo.",
    type: "strength",
    img: "https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "cadeira_extensora",
    name: "Cadeira Extensora",
    group: "Pernas",
    equipment: "Aparelho Extensor",
    muscles: "Quadríceps (Reto Femoral)",
    tips: "Ajuste o encosto para que o joelho coincida com o eixo da máquina. Execute extensão completa com controle na volta.",
    type: "strength",
    img: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "mesa_flexora",
    name: "Mesa Flexora",
    group: "Pernas",
    equipment: "Aparelho Flexor",
    muscles: "Isquiotibiais (Posterior de Coxa)",
    tips: "Mantenha o quadril firmemente apoiado no banco para evitar compensações com a lombar.",
    type: "strength",
    img: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "stiff_barra",
    name: "Stiff com Barra",
    group: "Pernas",
    equipment: "Barra",
    muscles: "Isquiotibiais, Glúteos, Lombar",
    tips: "Mantenha as pernas semi-flexionadas, empine o quadril para trás alongando a posterior e retorne à posição inicial.",
    type: "strength",
    img: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "panturrilha_em_pe",
    name: "Panturrilha em Pé na Máquina",
    group: "Pernas",
    equipment: "Máquina / Smith",
    muscles: "Gastrocnêmio, Sóleo",
    tips: "Faça amplitude completa: alongue bem o calcanhar na base em baixo e suba na ponta dos pés na máxima altura.",
    type: "strength",
    img: "https://images.unsplash.com/photo-1549476464-37392f717541?auto=format&fit=crop&w=400&q=80"
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
