import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Spanish-only resources. English lives as inline defaults in components
// (t('key', 'English default')), so EN rendering is unchanged and ES is layered on top.
const es = {
  common: {
    viewWork: 'Ver el trabajo →',
    seeAllWork: 'Ver todo el trabajo →',
    view: 'Ver →',
    visit: 'Visitar →',
    moreAboutMe: 'Más sobre mí →',
    getInTouch: 'Hablemos →',
    backHome: '← Volver al inicio',
    scroll: 'Desliza',
  },
  nav: { work: 'Proyectos', about: 'Sobre mí', tools: 'Herramientas', contact: 'Contacto', menu: 'Menú', close: 'Cerrar' },
  lang: { en: 'EN', es: 'ES', switch: 'Cambiar idioma' },
  hero: {
    role: 'Desarrollador Web y Creativo',
    line1: 'Creo productos que',
    move: 'impulsan',
    line2: 'el trabajo.',
    blurb:
      'Desarrollador y diseñador web con base en Miami. Creo apps, sitios web rápidos, e-commerce y agentes de IA para startups y pequeñas empresas — disponible para nuevos proyectos.',
  },
  mission: {
    eyebrow: 'Lo que hago',
    heading:
      'Diseño y construyo productos digitales de principio a fin — desde plataformas de healthtech hasta agentes de IA — obsesionado con el detalle, la velocidad y el movimiento.',
  },
  featured: { eyebrow: 'Trabajo seleccionado', heading: 'Proyectos destacados' },
  stats: { labels: ['Proyectos lanzados', 'Productos en vivo', 'Construyendo desde'] },
  aboutTeaser: {
    eyebrow: 'Sobre mí',
    heading: 'Constructor, ciclista, de Miami.',
    p1:
      'Soy Tommy — desarrollador y creativo lanzando productos desde 2015. Construyo apps, plataformas web y agentes de IA de principio a fin, cuidando cada detalle de diseño, velocidad y movimiento.',
    p2:
      'Lejos del teclado, me encontrarás en la bici. El ciclismo moldeó mi forma de trabajar: ritmo constante, líneas limpias y amor por el camino largo.',
  },
  capabilities: {
    eyebrow: 'Servicios',
    heading: 'Web, apps e IA — hechos para startups y pequeñas empresas.',
    names: { Apps: 'Apps', Web: 'Web', 'AI Agents': 'Agentes de IA', Tools: 'Herramientas' },
    desc: {
      Apps: 'Apps de iOS y Android con React Native y Expo.',
      Web: 'Sitios web rápidos, e-commerce y Shopify para pequeñas empresas.',
      'AI Agents': 'Agentes de IA a medida y automatización de flujos.',
      Tools: 'Herramientas web prácticas que resuelven problemas reales.',
    },
    tags: { Utilities: 'Utilidades', Automation: 'Automatización' },
  },
  faq: {
    eyebrow: 'Preguntas',
    heading: 'Respuestas directas a lo que más me preguntan.',
    items: {
      who: {
        q: '¿Quién hace páginas web para pequeñas empresas en Miami?',
        a: 'Soy Tommy Roldan, desarrollador y diseñador web radicado en Miami, Florida. Creo sitios web, tiendas de e-commerce, apps móviles y agentes de IA para startups y pequeñas empresas, y llevo lanzando proyectos en producción desde 2015.',
      },
      services: {
        q: '¿Qué tipo de proyectos aceptas?',
        a: 'Cuatro tipos: sitios web rápidos, tiendas de e-commerce y Shopify, apps para iOS y Android, y agentes de IA y automatización de flujos a medida. Si vive en la web o en una tienda de apps, probablemente entra.',
      },
      cost: {
        q: '¿Cuánto cuesta una página web?',
        a: 'Depende del alcance, porque un sitio de marketing, una tienda Shopify y una aplicación web a medida son proyectos muy distintos. Cuéntame lo que tienes en mente por el formulario de contacto y recibirás una respuesta clara sobre alcance y costo antes de empezar.',
      },
      timeline: {
        q: '¿Cuánto tiempo toma crear una página web?',
        a: 'El plazo depende del alcance y de qué tan rápido lleguen el contenido y los comentarios. Un sitio de marketing enfocado avanza más rápido que un e-commerce o una aplicación a medida. Comparte tu fecha límite al escribirme y te diré con honestidad si es realista.',
      },
      shopify: {
        q: '¿Creas tiendas en Shopify?',
        a: 'Sí. Construyo y personalizo tiendas Shopify, incluyendo trabajo de tema a medida, flujos de producto y checkout, y el diseño de marca alrededor. Dolce Vita Supplements es una tienda Shopify mía que está en vivo.',
      },
      apps: {
        q: '¿Desarrollas apps móviles para iOS y Android?',
        a: 'Sí, ambas desde un solo código usando React Native y Expo. Clear Care Dental es una plataforma full-stack de beneficios dentales hecha así, donde los miembros encuentran dentistas en red, controlan su plan y reservan citas desde una sola app.',
      },
      ai: {
        q: '¿Qué es un agente de IA y los desarrollas?',
        a: 'Un agente de IA es software que ejecuta trabajo de varios pasos por su cuenta en vez de solo responder una pregunta: investiga, llama APIs y actualiza tus sistemas. Sí, creo agentes a medida y automatización de flujos, incluido un agente de voz que atiende llamadas en vivo.',
      },
      redesign: {
        q: '¿Puedes rediseñar o retomar un sitio web existente?',
        a: 'Sí, los rediseños y reconstrucciones son parte habitual del trabajo. NST Pharma y World Resort Rescue fueron rediseños completos de sitios existentes, reconstruidos por estructura, velocidad y cómo se ven en el móvil.',
      },
      spanish: {
        q: '¿Trabajas con clientes de habla hispana?',
        a: 'Sí. Hablo español e inglés con fluidez, así que todo el proyecto puede llevarse en cualquiera de los dos idiomas, y este sitio está publicado en ambos. Para negocios de Miami con clientes bilingües, también puedo construir el sitio así.',
      },
      available: {
        q: '¿Estás disponible para nuevos proyectos?',
        a: 'Sí, actualmente estoy tomando nuevos proyectos. La forma más rápida de empezar es el formulario de contacto, donde puedes describir el proyecto, el tipo de desarrollo y tu rango de presupuesto.',
      },
    },
  },
  footer: {
    available: 'Disponible para nuevos proyectos',
    onRepeat: 'En repetición:',
    joinDiscord: 'Únete al Discord',
    inMiami: 'en Miami',
    privacy: 'Privacidad',
    discord: {
      online: 'En línea en Discord',
      idle: 'Ausente en Discord',
      dnd: 'No molestar en Discord',
      offline: 'Desconectado en Discord',
      playing: 'Jugando {{name}}',
    },
    taglines: [
      'Construyendo desde 2015.',
      'Ritmo constante, líneas limpias.',
      'Con café con leche.',
      'Siempre una vuelta más.',
      'Hecho en Miami. 🌴',
    ],
  },
  work: {
    eyebrow: 'Portafolio',
    heading: 'Trabajo seleccionado.',
    subtitle: 'Apps, plataformas web, agentes de IA y herramientas — una década construyendo.',
    empty: 'Aún no hay proyectos en esta categoría.',
  },
  filter: { all: 'Todos', apps: 'Apps', web: 'Web', ai: 'IA / Agentes', tool: 'Herramientas', archived: 'Antiguos / Archivados' },
  badges: { private: 'Privado', public: 'Público', live: 'En vivo', archived: 'Archivado' },
  toolsPage: {
    eyebrow: 'Utilidades',
    heading: 'Herramientas.',
    subtitle: 'Utilidades prácticas — creadas para resolver problemas reales.',
    wip: '🚧 En construcción — todavía trabajando, espera detalles ásperos.',
    badge: { New: 'Nuevo', Hosted: 'Alojado', 'Open Source': 'Open Source', 'In Progress': 'En progreso' },
    cta: { 'Launch tool': 'Abrir herramienta', 'Launch KOM Memorial': 'Abrir KOM Memorial', 'Preview Domain Hub': 'Ver Domain Hub' },
  },
  contact: {
    eyebrow: 'Contacto',
    heading: 'Hablemos.',
    blurb: 'Me encanta conocer gente nueva. ¿Un proyecto, una cerveza o una idea? Escríbeme.',
    followAlong: 'Sígueme',
    sendNote: 'Envía un mensaje',
  },
  form: {
    name: 'Tu nombre *',
    email: 'Tu correo *',
    company: 'Empresa (opcional)',
    projectTypePlaceholder: 'Tipo de proyecto…',
    budgetPlaceholder: 'Presupuesto (opcional)…',
    message: 'Cuéntame sobre tu proyecto *',
    send: 'Enviar mensaje →',
    sending: 'Enviando…',
    successTitle: '¡Mensaje enviado — gracias!',
    successBody: 'Te responderé pronto. Hablamos. 🚀',
    errorText: 'Algo salió mal.',
    emailDirectly: 'Escríbeme directamente',
    projectTypes: {
      Website: 'Sitio web',
      'Web app': 'Aplicación web',
      'E-commerce / Shopify': 'E-commerce / Shopify',
      'AI agent / automation': 'Agente de IA / automatización',
      'Something else': 'Otra cosa',
    },
    budgets: { 'Not sure yet': 'Aún no estoy seguro' },
  },
  notFound: { message: 'Esa página se perdió.' },
  detail: {
    notFound: 'No encontrado.',
    notFoundBody: 'No pudimos encontrar ese proyecto.',
    allWork: '← Todo el trabajo',
    visitLive: 'Visitar sitio →',
  },
  story: {
    eyebrow: 'Historia de origen',
    heading: 'De Medellín a Key Biscayne',
    p1:
      'Nacido en Medellín, Colombia y criado en Key Biscayne — una pequeña isla privada justo frente a la costa de Miami. Crecer con padres emprendedores hizo que el hustle estuviera en la sangre desde el día uno. Administración de Empresas se sintió natural, y lo fue.',
    p2:
      'Pero desde temprano, una fascinación por la tecnología empezó a tirar con la misma fuerza. De la curiosidad por la ciberseguridad a una inmersión total en el desarrollo web, encontré la manera de unir ambos mundos — temple de negocio respaldado por habilidad técnica real.',
  },
  experience: {
    eyebrow: 'Experiencia',
    rootsLabel: 'Raíces',
    rootsText: 'Retail de ciclismo — Mack Cycle & Fitness · City Bikes Miami',
    m1Title: 'Generando ingresos, forjando alianzas',
    m1p1:
      'Hoy soy CTO y Director de Ventas LATAM del TerryCo Group, impulsando alianzas estratégicas y soluciones orientadas al mercado en farma, belleza y bienestar. Los resultados incluyen un aumento del 25% en el engagement de clientes mediante outreach dirigido y ventas centradas en la relación.',
    m1p2:
      'Años en retail de ciclismo de alta gama — en Mack Cycle & Fitness y City Bikes Miami — afinaron mi capacidad de alinear soluciones con los objetivos del cliente y construir relaciones de valor en mercados premium. Cada conversación es un trato; cada trato es una relación.',
    m2Title: '10 semanas que lo cambiaron todo',
    m2p1:
      'Entré al bootcamp de Ironhack — 10 semanas intensas del stack MEAN metidas en mi cabeza. Me enseñó que la mejor forma de aprender es lanzarse al agua. Desde entonces, el trabajo freelance y los proyectos personales han mantenido las habilidades afiladas y la curiosidad viva.',
    m2p2:
      'El resultado: uno los mundos de producto, ventas y tecnología como pocos — cómodo tanto en una presentación de directorio como en un código.',
  },
  skills: {
    eyebrow: 'Mi stack',
    heading: 'Con qué trabajo',
    items: [
      'Ventas estratégicas', 'Desarrollo de negocio', 'Farma y bienestar', 'Alianzas estratégicas',
      'HTML / CSS', 'JavaScript', 'Node.js', 'Express', 'MongoDB', 'React', 'Git / GitHub', 'Shopify', 'Siempre aprendiendo',
    ],
  },
  aboutHero: {
    eyebrow: 'Sobre mí',
    line1: 'Constructor, ciclista,',
    line2: 'de Miami.',
    blurb: 'Desarrollador y creativo uniendo negocio, ventas y tecnología — construyendo desde 2015.',
    facts: {
      labels: { 'Based in': 'Radicado en', 'Born in': 'Nacido en', Position: 'Cargo', Passion: 'Pasión' },
      position: 'CTO · Director de Ventas LATAM · TerryCo Group',
      passion: 'Autos rápidos, bicis fixie, buen diseño, código limpio y cerrar tratos',
    },
  },
  hobbies: {
    eyebrow: 'Lejos del teclado',
    heading: 'Pasatiempos',
    gamingTitle: 'Gaming',
    gamingP: 'Cuando no estoy construyendo, estoy jugando — noches de co-op, ligas competitivas y algún que otro RPG a fondo.',
    cyclingTitle: 'Ciclismo',
    cyclingStory:
      'Llevo más de una década en el ciclismo. Empezó con bicis de pista/fixie — el amor por la adrenalina fue lo que catapultó mi carrera en el ciclismo. Andar sin frenos, a fondo entre el tráfico de Miami, era una locura, pero fue el inicio de un viaje hermoso. Unos años de eso destrozaron mis rodillas, lo que me empujó a comprar mi primera bici de ruta con Robbie en Brickell Bikes — también la primera tienda donde trabajé. Solo duró un par de meses (sin resentimientos), pero abrió la puerta a trabajar en Mack Cycle y City Bikes Miami.',
    clubsLabel: 'Clubes de Strava',
    clubNotes: {
      'Fixed Latinos': 'representa un movimiento',
      GRVT: 'la marca de ciclismo que creé hace ~una década',
    },
    latestRides: 'Últimas rutas del club',
    musicEyebrow: 'En repetición',
    musicHeading: 'Siempre suena algo',
    musicP: 'Programando, pedaleando, manejando — todo tiene su banda sonora. Mira lo que escucho en Apple Music.',
    grvtEyebrow: 'Una marca que creé',
    grvtHeading: 'GRVT — un hermoso fracaso',
    grvtP:
      'GRVT fue un intento fallido — empezó unos años demasiado pronto, antes de que suficiente gente estuviera metida en el ciclismo, y nunca dio dinero. Pero aprendí muchísimo, hice diseños geniales que todavía uso, y fue un viaje increíble. Un recordatorio de que no todo lo que construyes es por ROI.',
  },
  steam: {
    memberSince: 'Miembro desde {{year}}',
    mostPlayed: 'Más jugados',
    played: '{{h}} jugadas',
    viewProfile: 'Ver perfil completo →',
    shortcuts: { Profile: 'Perfil', Games: 'Juegos', Screenshots: 'Capturas', Groups: 'Grupos' },
  },
  discordCard: {
    loading: 'Cargando…',
    sayHi: 'Saluda — abierto a charlar',
    joinServer: 'Únete al servidor →',
    addMe: 'Agrégame →',
    playing: 'Jugando {{name}}',
    status: { online: 'En línea', idle: 'Ausente', dnd: 'No molestar', offline: 'Desconectado' },
  },
  appleMusic: { link: '@tmizle en Apple Music →' },
  meta: {
    '/': {
      title: 'Tommy Roldan — Desarrollador y Diseñador Web en Miami',
      desc: 'Desarrollador y diseñador web en Miami — apps en React, sitios rápidos, e-commerce y agentes de IA para startups y pequeñas empresas.',
    },
    '/work': {
      title: 'Trabajo — Tommy Roldan',
      desc: 'Proyectos seleccionados — apps, plataformas web, agentes de IA y herramientas, además de trabajos antiguos archivados.',
    },
    '/about': {
      title: 'Sobre mí — Tommy Roldan',
      desc: 'Desarrollador y creativo uniendo negocio, ventas y tecnología. De Miami, ciclista, construyendo desde 2015.',
    },
    '/tools': {
      title: 'Herramientas — Tommy Roldan',
      desc: 'Utilidades prácticas creadas para resolver problemas reales — PPT Speech, herramientas de Strava y más.',
    },
    '/contact': {
      title: 'Contrata a Tommy Roldan — Desarrollador Web en Miami',
      desc: 'Inicia un proyecto con Tommy Roldan — desarrollador y diseñador web en Miami. Sitios, apps, e-commerce y agentes de IA.',
    },
  },
  data: {
    projects: {
      'clear-care-dental': 'Plataforma full-stack de beneficios dentales construida con React Native y Expo. Los miembros encuentran dentistas en red, controlan el uso de su plan en tiempo real y reservan citas — todo desde una sola app multiplataforma.',
      'cleancare-enterprise': 'Panel empresarial que impulsa la plataforma Clear Care. Gestiona la administración de beneficios, los miembros y las operaciones a gran escala con una interfaz React rápida y densa en datos.',
      'cleancare-marketing': 'Sitio de marketing enfocado en conversión para el grupo Clear Care Dental. Cuenta la historia de la marca, explica las opciones de planes y guía a los visitantes hacia el registro.',
      geo: 'Agente de Generative Engine Optimization que audita la rastreabilidad por IA de un sitio y aplica las correcciones automáticamente — para que tus páginas sean citadas en ChatGPT, Perplexity y otras respuestas de IA.',
      'voice-agent': 'Agente de voz con IA en tiempo real para conversaciones naturales por teléfono y chat. Transmite voz con baja latencia, gestionando llamadas, reservas y preguntas sin un humano en la línea.',
      'bloodwork-pro': 'Convierte análisis de sangre en información de salud clara y rastreable. Procesa paneles, marca valores fuera de rango y grafica tendencias para que los pacientes entiendan sus resultados.',
      'nst-redesign': 'Rediseño desde cero del sitio de NST Pharma, hecho en React + Vite con Tailwind. Cuna del sistema de tarjetas de producto que inspiró esta misma página.',
      nullscan: 'NullScan.co — escaneo de seguridad automatizado para pequeñas empresas: encuentra vulnerabilidades antes que los hackers, con reportes en lenguaje claro. Front-end en Next.js respaldado por un worker de escaneo en Python. Creado, lanzado y retirado recientemente.',
      'versatile-customs': 'Sitio de marca y tienda para un taller de personalización. Muestra servicios y una galería de proyectos, y permite a los clientes pedir cotizaciones a medida en pocos clics.',
      'cuatro-group': 'Sitio corporativo multilingüe para Cuatro Group. Limpio, rápido y totalmente internacionalizado — creado para presentar la empresa a una audiencia global y multilingüe.',
      'alexandra-rossi-collection': 'Tienda boutique de e-commerce de papeles tapiz y textiles a medida. Explora la colección, configura piezas y finaliza la compra en una tienda pulida y centrada en la marca.',
      'dolce-vita-supplements': 'Marca de e-commerce en Shopify para los SoulStrips sublinguales. Tienda editorial y audaz con narrativa respaldada por la ciencia, envío el mismo día desde Miami y un checkout sin fricción.',
      'la-dolce-vita-casa': 'Sitio de marca de hogar y estilo de vida de inspiración italiana. Cálido, editorial y centrado en el producto — diseñado para que explorar la colección se sienta como hojear una revista de diseño.',
      'local-legend-predictor': 'Conecta tu Strava y descubre cuántos esfuerzos más necesitas para reclamar el título de Local Legend en tus segmentos. Genera una tarjeta para compartir en Instagram.',
      'powerpoint-speech-tool': 'Sube cualquier .pptx y escúchalo leído diapositiva por diapositiva con las voces de tu navegador. Elige idioma y velocidad, navega libremente — sin servidor, sin subir nada.',
      'gravity-cycles': 'Sitio web en Shopify que puso los diseños de GRVT a disposición del público.',
      'vc-metal-supply-corp': 'Rediseño completo del sitio de V&C Metal Supply Corp — más limpio, más rápido, moderno.',
      'fixed-latinos': 'Aplicación para el equipo de ciclismo Fixed Latinos — comunidad, rutas y eventos.',
      'brick-breaker': 'Un juego en JS/Canvas — rompe ladrillos con una bola mientras aparecen bolas RGBA aleatorias para el caos.',
      'follow-meme': 'Crea, descarga y publica memes en un feed público anónimo. Construido sobre el stack MEAN.',
      'drinks-on-demand': 'App de entrega de alcohol — busca, ordena, recibe. Build completo en stack MEAN.',
      'tropical-sun-design': 'Inspirado en la atmósfera tropical de Miami — un diseño retro de sol que originalmente se vendía en línea.',
      'cycling-rick': 'Un mashup de diseño inspirado en Rick & Morty con la cultura ciclista.',
      'grvt-logo': 'Logo e identidad de marca para GRVT, mi antigua etiqueta de ciclismo. La marca no duró, pero los diseños siguen vigentes.',
    },
    tools: {
      'effort-tracker': {
        name: 'Rastreador de Esfuerzos',
        desc: 'Conecta tu Strava y visualiza tus esfuerzos por segmento en los últimos 90 días. Compara tu ritmo con el mismo periodo del año pasado, fija metas por segmento, sigue tu progreso y descarga una tarjeta PNG para compartir — todo usando solo tus datos.',
      },
      'ppt-speech': {
        desc: 'Sube cualquier .pptx y escúchalo leído diapositiva por diapositiva con las voces de tu navegador. Elige idioma, velocidad, navega libremente — sin servidor, sin subir nada.',
      },
      'kom-memorial': {
        desc: 'Registra cada segmento KOM (King of the Mountain) que tengas. Cuando alguien te robe la corona, dale la despedida que merece — obituario gracioso autogenerado, contador de días en posesión y una tarjeta conmemorativa PNG de 1080×1080 lista para Instagram. Sin necesidad de la API de Strava.',
      },
      'domain-hub': {
        desc: 'Encuentra, evalúa y gestiona nombres de dominio para reventa. Genera combinaciones de TLD automáticamente y puntúa el potencial de reventa de cada dominio con un motor de valoración, registra en masa con un checkout simulado de Namecheap y administra tu portafolio en un solo panel.',
      },
    },
  },
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { es: { translation: es } },
    fallbackLng: 'en',
    supportedLngs: ['en', 'es'],
    nonExplicitSupportedLngs: true,
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'lang',
      caches: ['localStorage'],
    },
  })

// Keep <html lang> in sync.
const applyLang = (lng) => {
  if (typeof document !== 'undefined') document.documentElement.lang = (lng || 'en').split('-')[0]
}
applyLang(i18n.resolvedLanguage)
i18n.on('languageChanged', applyLang)

export default i18n
