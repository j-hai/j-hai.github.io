// get the ninja-keys element
const ninja = document.querySelector('ninja-keys');

// add the home and posts menu items
ninja.data = [{
    id: "nav-about",
    title: "about",
    section: "Navigation",
    handler: () => {
      window.location.href = "/";
    },
  },{id: "nav-publications",
          title: "publications",
          description: "Publications in reversed chronological order by categories - Journal Articles, Working Papers, and Book Chapters.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/publications/";
          },
        },{id: "nav-projects",
          title: "projects",
          description: "Selected research projects, including methods with software packages and applications.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/projects/";
          },
        },{id: "nav-repositories",
          title: "repositories",
          description: "coming soon",
          section: "Navigation",
          handler: () => {
            window.location.href = "/repositories/";
          },
        },{id: "nav-cv",
          title: "cv",
          description: "Click the PDF button to download the CV.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/cv/";
          },
        },{id: "nav-teaching",
          title: "teaching",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/teaching/";
          },
        },{id: "nav-people",
          title: "people",
          description: "Members of the Research Group and Alumni",
          section: "Navigation",
          handler: () => {
            window.location.href = "/people/";
          },
        },{id: "dropdown-publications",
              title: "publications",
              description: "",
              section: "Dropdown",
              handler: () => {
                window.location.href = "";
              },
            },{id: "dropdown-projects",
              title: "projects",
              description: "",
              section: "Dropdown",
              handler: () => {
                window.location.href = "";
              },
            },{id: "projects-kernel-ml-methods",
          title: 'Kernel ML Methods',
          description: "",
          section: "Projects",handler: () => {
              window.location.href = "/projects/10_project/";
            },},{id: "projects-linking-health-records",
          title: 'Linking Health Records',
          description: "",
          section: "Projects",handler: () => {
              window.location.href = "/projects/11_project/";
            },},{id: "projects-health-disparities",
          title: 'Health Disparities',
          description: "",
          section: "Projects",handler: () => {
              window.location.href = "/projects/12_project/";
            },},{id: "projects-whatsapp-surveys",
          title: 'WhatsApp Surveys',
          description: "",
          section: "Projects",handler: () => {
              window.location.href = "/projects/13_project/";
            },},{id: "projects-secondary-migration",
          title: 'Secondary Migration',
          description: "",
          section: "Projects",handler: () => {
              window.location.href = "/projects/14_project/";
            },},{id: "projects-ethnic-networks",
          title: 'Ethnic Networks',
          description: "",
          section: "Projects",handler: () => {
              window.location.href = "/projects/15_project/";
            },},{id: "projects-language-training",
          title: 'Language Training',
          description: "",
          section: "Projects",handler: () => {
              window.location.href = "/projects/16_project/";
            },},{id: "projects-employment-bans",
          title: 'Employment Bans',
          description: "",
          section: "Projects",handler: () => {
              window.location.href = "/projects/17_project/";
            },},{id: "projects-asylum-wait-times",
          title: 'Asylum Wait Times',
          description: "",
          section: "Projects",handler: () => {
              window.location.href = "/projects/18_project/";
            },},{id: "projects-financial-bailouts",
          title: 'Financial Bailouts',
          description: "",
          section: "Projects",handler: () => {
              window.location.href = "/projects/19_project/";
            },},{id: "projects-interaction-effects",
          title: 'Interaction Effects',
          description: "",
          section: "Projects",handler: () => {
              window.location.href = "/projects/1_project_interflex/";
            },},{id: "projects-geomatch",
          title: 'GeoMatch',
          description: "",
          section: "Projects",handler: () => {
              window.location.href = "/projects/20_project/";
            },},{id: "projects-refugee-housing",
          title: 'Refugee Housing',
          description: "",
          section: "Projects",handler: () => {
              window.location.href = "/projects/21_project/";
            },},{id: "projects-integration-contracts",
          title: 'Integration Contracts',
          description: "",
          section: "Projects",handler: () => {
              window.location.href = "/projects/22_project/";
            },},{id: "projects-ethical-supply-chains",
          title: 'Ethical Supply Chains',
          description: "",
          section: "Projects",handler: () => {
              window.location.href = "/projects/23_project/";
            },},{id: "projects-active-labor-market-policies",
          title: 'Active Labor Market Policies',
          description: "",
          section: "Projects",handler: () => {
              window.location.href = "/projects/24_project/";
            },},{id: "projects-regression-discontinuity",
          title: 'Regression Discontinuity',
          description: "",
          section: "Projects",handler: () => {
              window.location.href = "/projects/25_project/";
            },},{id: "projects-incumbency-advantage",
          title: 'Incumbency Advantage',
          description: "",
          section: "Projects",handler: () => {
              window.location.href = "/projects/26_project/";
            },},{id: "projects-fair-trade",
          title: 'Fair Trade',
          description: "",
          section: "Projects",handler: () => {
              window.location.href = "/projects/27_project/";
            },},{id: "projects-congressional-stock-trading",
          title: 'Congressional Stock Trading',
          description: "",
          section: "Projects",handler: () => {
              window.location.href = "/projects/28_project/";
            },},{id: "projects-synthetic-control-methods",
          title: 'Synthetic Control Methods',
          description: "",
          section: "Projects",handler: () => {
              window.location.href = "/projects/2_project/";
            },},{id: "projects-immigration-policy-lab-ipl",
          title: 'Immigration Policy Lab (IPL)',
          description: "",
          section: "Projects",handler: () => {
              window.location.href = "/projects/3_project/";
            },},{id: "projects-entropy-balancing",
          title: 'Entropy Balancing',
          description: "",
          section: "Projects",handler: () => {
              window.location.href = "/projects/4_project/";
            },},{id: "projects-conjoint-experiments",
          title: 'Conjoint Experiments',
          description: "",
          section: "Projects",handler: () => {
              window.location.href = "/projects/5_project/";
            },},{id: "projects-citizenship",
          title: 'Citizenship',
          description: "",
          section: "Projects",handler: () => {
              window.location.href = "/projects/6_project/";
            },},{id: "projects-immigration-attitudes",
          title: 'Immigration Attitudes',
          description: "",
          section: "Projects",handler: () => {
              window.location.href = "/projects/7_project/";
            },},{id: "projects-measuring-integration",
          title: 'Measuring Integration',
          description: "",
          section: "Projects",handler: () => {
              window.location.href = "/projects/8_project/";
            },},{id: "projects-null-results",
          title: 'Null Results',
          description: "",
          section: "Projects",handler: () => {
              window.location.href = "/projects/9_project/";
            },},{
        id: 'social-email',
        title: 'email',
        section: 'Socials',
        handler: () => {
          window.open("mailto:%6A%68%61%69%6E@%73%74%61%6E%66%6F%72%64.%65%64%75", "_blank");
        },
      },{
        id: 'social-orcid',
        title: 'ORCID',
        section: 'Socials',
        handler: () => {
          window.open("https://orcid.org/0000-0001-8214-9041", "_blank");
        },
      },{
        id: 'social-scholar',
        title: 'Google Scholar',
        section: 'Socials',
        handler: () => {
          window.open("https://scholar.google.com/citations?user=S-8-QyIAAAAJ", "_blank");
        },
      },{
        id: 'social-custom_social',
        title: 'Custom_social',
        section: 'Socials',
        handler: () => {
          window.open("https://immigrationlab.org/", "_blank");
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
