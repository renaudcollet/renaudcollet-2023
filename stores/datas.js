import { defineStore } from 'pinia'
// import {mande} from 'mande'

export const S_DATA_ACCUEIL = 'accueil'
export const S_DATA_CONTACT = 'contact'
export const S_DATA_SEO = 'seo'
export const S_DATA_ABOUT = 'agence'
export const S_DATA_PROJECTS = 'projets'
export const S_DATA_KEYWORDS = 'keywords'

export const useDatasStore = defineStore( 'datas', {
  
  state: () => ({
    datas: null,
    accueil: null,
    contact: null,
    seo: null,
    about: null,
    projects: null,
    projectsById: null,
    projectsFiltered: null,
    projectsHomepage: null,
    footer: null,
    keywords: null,
    lockScroll: false,
    currentPage: null,
    previousPage: null,
  }),

  actions: {
    setCurrentPage(page) {
      if (this.currentPage === page) return
      
      this.previousPage = this.currentPage
      this.currentPage = page
      console.log('--- setCurrentPage', this.currentPage, this.previousPage);
    },

    setIsScrollLocked(value) {
      this.lockScroll = value
    },

    filterProjects(datasKeywordsSelected) {
      let tmp = []
      datasKeywordsSelected.forEach(item => {
        item.attributes.projets.data.forEach(project => {
          tmp.push(this.projectsById[project.id])
        })
      })
      // console.log('--- Filtered projectsFiltered', tmp);

      // Remove duplicates
      const seen = new Set();
      this.projectsFiltered = tmp.filter(item => {
        const duplicate = seen.has(item.id);
        seen.add(item.id);
        return !duplicate;
      });

      if (this.projectsFiltered.length === 0) {
        this.projectsFiltered = this.projects
      }

      // console.log('--- Filtered projectsFiltered singles', this.projectsFiltered);
    },

    async fetchDatas(apiId) {

      // console.log('--- Fetching datas for ', apiId);

      switch (apiId) {
        case S_DATA_ACCUEIL:
          if (this.accueil) return
          break;
        case S_DATA_CONTACT:
          if (this.contact) return
          break;
        case S_DATA_SEO:
          if (this.seo) return
          break;
        case S_DATA_ABOUT:
          if (this.about) return
          break;
        case S_DATA_PROJECTS:
          if (this.projects) return
          break;
        case S_DATA_KEYWORDS:
          if (this.keywords) return
          break;
        default:
      }
      
      const config = useRuntimeConfig()

      let query = { populate: '*' }

      if (apiId === S_DATA_PROJECTS) {
        // Query sort by date:desc, and find content where Type = B et C 
        // https://docs.strapi.io/dev-docs/api/rest/filters-locale-publication#example-find-multiple-restaurants-with-ids-3-68
        // (
        // NB : [$eq] peut lever une erreur de securité
        // Answer : https://support.plesk.com/hc/en-us/articles/12377453278871
        // Ajouter l'ID de la règle dans Web App Firewall -> Switch off security rules : 211760
        // )
        // query = { ...query, sort: 'Date:desc', 'filters[Type][$eq][0]': 'B et C', 'filters[Type][$eq][1]': this.currentFolder }
        // ?filters[slug][$eq]=mon-projet-1
        query = { populate: 'deep', sort: 'Date:desc' }
      }
      else if (apiId === S_DATA_KEYWORDS) {
        // TODO: Should only return id of related projects (not createdAt, updatedAt, etc.)
        query = { populate: 'deep' }
      }
      else if (apiId === S_DATA_CONTACT) {
        query = { populate: 'deep' }
      }
      else if (apiId === S_DATA_ACCUEIL) {
        query = { populate: 'deep' }
      }
      else if (apiId === S_DATA_SEO) {
        query = { populate: 'deep' }
      }
      else if (apiId === S_DATA_ABOUT) {
        query = { populate: 'deep' }
      }
      
      console.log(`Fetch url ${config.public.apiUrl}/${apiId}`);

      try {        
        const { data, pending, error, refresh } = await useFetch(`${config.public.apiUrl}/${apiId}`, {
          method: 'GET',
          query
        })

        // console.log('Data ERROR', error);
        // console.log(`Data from ${apiId}`, data.value);

        switch (apiId) {
          case S_DATA_CONTACT:
            this.contact = data.value
            break;
          case S_DATA_ACCUEIL:
            this.accueil = data.value
            this.projectsHomepage = data.value.data.attributes.projets.data
            break;
          case S_DATA_CONTACT:
            this.contact = data.value
            break;
          case S_DATA_SEO:
            this.seo = data.value
            break;
          case S_DATA_ABOUT:
            this.about = data.value
            break;
          case S_DATA_PROJECTS:
            this.projects = data.value.data
            this.projectsById = {}
            this.projects.forEach(project => {
              this.projectsById[project.id] = project
            })
            this.projectsFiltered = data.value.data // includes all projects by default
            break;
          case S_DATA_KEYWORDS:
            this.keywords = data.value
            break;
          default:
        }
      } catch(e) {
        console.log(`Error fetching - ${e}`);
      }
    }
  }
})