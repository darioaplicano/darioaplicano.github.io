// get the ninja-keys element
const ninja = document.querySelector('ninja-keys');

// add the home and posts menu items
ninja.data = [{
    id: "nav-sobre-mi",
    title: "sobre mi",
    section: "Navigation",
    handler: () => {
      window.location.href = "/";
    },
  },{id: "nav-blog",
          title: "blog",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/blog/";
          },
        },{id: "nav-repositorios",
          title: "repositorios",
          description: "Perfil de GitHub y repos públicos. Código, ejercicios de cursos y proyectos personales en Python, Scala, TypeScript y más.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/repositories/";
          },
        },{id: "nav-cv",
          title: "CV",
          description: "Curriculum profesional. Experiencia, formación, habilidades, certificaciones e idiomas.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/cv/";
          },
        },{id: "nav-docencia",
          title: "docencia",
          description: "Cursos y materiales formativos. Recursos públicos para aprender herramientas y metodologías relacionadas con datos.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/teaching/";
          },
        },{id: "post-de-chatbots-a-agentes-arquitectura-de-sistemas-agénticos-en-producción-con-langgraph-y-mcp",
        
          title: "De Chatbots a Agentes: Arquitectura de Sistemas Agénticos en Producción con LangGraph y...",
        
        description: "Cómo evolucionar de simples flujos lineales de pregunta-respuesta a arquitecturas agénticas basadas en grafos de estado con LangGraph y herramientas desacopladas mediante el Model Context Protocol (MCP).",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/de-chatbots-a-agentes-langgraph-mcp/";
          
        },
      },{id: "teachings-docencia-universitaria-en-matemáticas-e-informática",
          title: 'Docencia Universitaria en Matemáticas e Informática',
          description: "Cátedras de Cálculo Diferencial e Integral, Informática y Bioestadística. Coordinación institucional del programa de Tutorías entre Pares en ciencias exactas.",
          section: "Teachings",handler: () => {
              window.location.href = "/teachings/docencia-universitaria/";
            },},{id: "teachings-influxdb-2-x-para-profesionales-de-datos",
          title: 'InfluxDB 2.x para profesionales de datos',
          description: "Curso diseñado para profesionales de datos, mantenimiento y monitoreo industrial que necesitan trabajar con InfluxDB para gestionar grandes volúmenes de datos en tiempo real.",
          section: "Teachings",handler: () => {
              window.location.href = "/teachings/influxdb-2x/";
            },},{id: "teachings-automatización-de-procesos-e-integración-de-apis-con-make",
          title: 'Automatización de Procesos e Integración de APIs con Make',
          description: "Creación de escenarios avanzados de automatización, webhooks, transformación estructurada de datos y conexión de sistemas e IA con Make (en desarrollo para Imagina Formación).",
          section: "Teachings",handler: () => {
              window.location.href = "/teachings/make-automatizaciones/";
            },},{
        id: 'social-email',
        title: 'email',
        section: 'Socials',
        handler: () => {
          window.open("mailto:%61%6C%65%78%64%61%72%69%6F.%66%6C%6F%72%65%73@%74%65%6C%65%66%6F%6E%69%63%61.%63%6F%6D", "_blank");
        },
      },{
        id: 'social-linkedin',
        title: 'LinkedIn',
        section: 'Socials',
        handler: () => {
          window.open("https://www.linkedin.com/in/darioaplicano", "_blank");
        },
      },{
        id: 'social-github',
        title: 'GitHub',
        section: 'Socials',
        handler: () => {
          window.open("https://github.com/darioaplicano", "_blank");
        },
      },{
      id: 'light-theme',
      title: 'Change theme to light',
      description: 'Change the theme of the site to Light',
      section: 'Theme',
      handler: () => {
        setThemeSetting("light");
      },
    },
    {
      id: 'dark-theme',
      title: 'Change theme to dark',
      description: 'Change the theme of the site to Dark',
      section: 'Theme',
      handler: () => {
        setThemeSetting("dark");
      },
    },
    {
      id: 'system-theme',
      title: 'Use system default theme',
      description: 'Change the theme of the site to System Default',
      section: 'Theme',
      handler: () => {
        setThemeSetting("system");
      },
    },];
