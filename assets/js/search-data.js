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
              window.location.href = "/projects/10_project_krls/";
            },},{id: "projects-linking-health-records",
          title: 'Linking Health Records',
          description: "",
          section: "Projects",handler: () => {
              window.location.href = "/projects/11_project_Linking_Health_Records/";
            },},{id: "projects-health-disparities",
          title: 'Health Disparities',
          description: "",
          section: "Projects",handler: () => {
              window.location.href = "/projects/12_project_Health_Disparities/";
            },},{id: "projects-whatsapp-surveys",
          title: 'WhatsApp Surveys',
          description: "",
          section: "Projects",handler: () => {
              window.location.href = "/projects/13_project_WhatsApp/";
            },},{id: "projects-secondary-migration",
          title: 'Secondary Migration',
          description: "",
          section: "Projects",handler: () => {
              window.location.href = "/projects/14_project_Secondary_Migration/";
            },},{id: "projects-ethnic-networks",
          title: 'Ethnic Networks',
          description: "",
          section: "Projects",handler: () => {
              window.location.href = "/projects/15_project_Ethnic_Networks/";
            },},{id: "projects-language-training",
          title: 'Language Training',
          description: "",
          section: "Projects",handler: () => {
              window.location.href = "/projects/16_project_Language_Training/";
            },},{id: "projects-employment-bans",
          title: 'Employment Bans',
          description: "",
          section: "Projects",handler: () => {
              window.location.href = "/projects/17_project_Employment_Bans/";
            },},{id: "projects-asylum-wait-times",
          title: 'Asylum Wait Times',
          description: "",
          section: "Projects",handler: () => {
              window.location.href = "/projects/18_project_Asylum_Wait_Times/";
            },},{id: "projects-financial-bailouts",
          title: 'Financial Bailouts',
          description: "",
          section: "Projects",handler: () => {
              window.location.href = "/projects/19_project_Financial_Bailouts/";
            },},{id: "projects-interaction-effects",
          title: 'Interaction Effects',
          description: "",
          section: "Projects",handler: () => {
              window.location.href = "/projects/1_project_interflex/";
            },},{id: "projects-geomatch",
          title: 'GeoMatch',
          description: "",
          section: "Projects",handler: () => {
              window.location.href = "/projects/20_project_GeoMatch/";
            },},{id: "projects-refugee-housing",
          title: 'Refugee Housing',
          description: "",
          section: "Projects",handler: () => {
              window.location.href = "/projects/21_project_Refugee_Housing/";
            },},{id: "projects-integration-contracts",
          title: 'Integration Contracts',
          description: "",
          section: "Projects",handler: () => {
              window.location.href = "/projects/22_project_Integration_Contracts/";
            },},{id: "projects-ethical-supply-chains",
          title: 'Ethical Supply Chains',
          description: "",
          section: "Projects",handler: () => {
              window.location.href = "/projects/23_project_Ethical_Supply_Chains/";
            },},{id: "projects-active-labor-market-policies",
          title: 'Active Labor Market Policies',
          description: "",
          section: "Projects",handler: () => {
              window.location.href = "/projects/24_project_caseloads/";
            },},{id: "projects-regression-discontinuity",
          title: 'Regression Discontinuity',
          description: "",
          section: "Projects",handler: () => {
              window.location.href = "/projects/25_project_rdd/";
            },},{id: "projects-incumbency-advantage",
          title: 'Incumbency Advantage',
          description: "",
          section: "Projects",handler: () => {
              window.location.href = "/projects/26_project_Incumbency/";
            },},{id: "projects-fair-trade",
          title: 'Fair Trade',
          description: "",
          section: "Projects",handler: () => {
              window.location.href = "/projects/27_project_Fair_Trade/";
            },},{id: "projects-congressional-stock-trading",
          title: 'Congressional Stock Trading',
          description: "",
          section: "Projects",handler: () => {
              window.location.href = "/projects/28_project_CongressionalStockTrading/";
            },},{id: "projects-synthetic-control-methods",
          title: 'Synthetic Control Methods',
          description: "",
          section: "Projects",handler: () => {
              window.location.href = "/projects/2_project_scm/";
            },},{id: "projects-electoral-balancing",
          title: 'Electoral Balancing',
          description: "",
          section: "Projects",handler: () => {
              window.location.href = "/projects/30_project_midtermloss/";
            },},{id: "projects-returns-to-political-office",
          title: 'Returns to Political Office',
          description: "",
          section: "Projects",handler: () => {
              window.location.href = "/projects/31_project_mpsforsale/";
            },},{id: "projects-media-effects",
          title: 'Media Effects',
          description: "",
          section: "Projects",handler: () => {
              window.location.href = "/projects/32_project_dresden/";
            },},{id: "projects-framing-effects",
          title: 'Framing Effects',
          description: "",
          section: "Projects",handler: () => {
              window.location.href = "/projects/33_project_frameing/";
            },},{id: "projects-legal-services-providers",
          title: 'Legal Services Providers',
          description: "",
          section: "Projects",handler: () => {
              window.location.href = "/projects/35_project_ispnetwork/";
            },},{id: "projects-immigration-policy-lab-ipl",
          title: 'Immigration Policy Lab (IPL)',
          description: "",
          section: "Projects",handler: () => {
              window.location.href = "/projects/3_project_ipl/";
            },},{id: "projects-entropy-balancing",
          title: 'Entropy Balancing',
          description: "",
          section: "Projects",handler: () => {
              window.location.href = "/projects/4_project_ebal/";
            },},{id: "projects-conjoint-experiments",
          title: 'Conjoint Experiments',
          description: "",
          section: "Projects",handler: () => {
              window.location.href = "/projects/5_project_Conjoint_Experiments/";
            },},{id: "projects-citizenship",
          title: 'Citizenship',
          description: "",
          section: "Projects",handler: () => {
              window.location.href = "/projects/6_project_Citizenship/";
            },},{id: "projects-immigration-attitudes",
          title: 'Immigration Attitudes',
          description: "",
          section: "Projects",handler: () => {
              window.location.href = "/projects/7_project_Immigration_Attitudes/";
            },},{id: "projects-measuring-integration",
          title: 'Measuring Integration',
          description: "",
          section: "Projects",handler: () => {
              window.location.href = "/projects/8_project_Measuring_Integration/";
            },},{id: "projects-null-results",
          title: 'Null Results',
          description: "",
          section: "Projects",handler: () => {
              window.location.href = "/projects/9_project_Null_Results/";
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
