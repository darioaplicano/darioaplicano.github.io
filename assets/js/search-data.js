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
        },{id: "nav-publicaciones",
          title: "publicaciones",
          description: "Publicaciones academicas, ordenadas por año en orden descendente.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/publications/";
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
        },{id: "post-hola-mundo",
        
          title: "Hola mundo",
        
        description: "Primera entrada del blog. Pronto compartire aquí notas sobre AIOps, Machine Learning e IA Generativa.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/hola/";
          
        },
      },{id: "teachings-influxdb-2-x-para-profesionales-de-datos",
          title: 'InfluxDB 2.x para profesionales de datos',
          description: "Curso diseñado para profesionales de datos, mantenimiento y monitoreo industrial que necesitan trabajar con InfluxDB para gestionar grandes volúmenes de datos en tiempo real.",
          section: "Teachings",handler: () => {
              window.location.href = "/teachings/influxdb-2x/";
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
