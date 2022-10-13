import { createClient } from 'newt-client-js'

export const state = () => ({
  app: null,
  page: null,
  links: [],
})

export const getters = {
  app: (state) => state.app,
  page: (state) => state.page,
  links: (state) => state.links,
  siteTitle: (state) => {
    return (state.app && (state.app.name || state.app.uid)) || ''
  },
}

export const mutations = {
  setApp(state, app) {
    state.app = app
  },
  setPage(state, page) {
    state.page = page
  },
  setLinks(state, links) {
    state.links = links
  },
}

export const actions = {
  async fetchApp({ commit }, { spaceUid, token, apiType, appUid }) {
    try {
      const client = createClient({
        spaceUid,
        token,
        apiType,
      })
      const app = await client.getApp({
        appUid,
      })
      commit('setApp', app)
    } catch (err) {
      // console.error(err)
    }
  },
  async fetchPage(
    { commit },
    { spaceUid, pageModelUid, token, apiType, appUid, slug }
  ) {
    try {
      const client = createClient({
        spaceUid,
        token,
        apiType,
      })
      const page = await client.getFirstContent({
        appUid,
        modelUid: pageModelUid,
        query: {
          depth: 2,
          slug,
        },
      })
      commit('setPage', page)
    } catch (err) {
      // console.error(err)
    }
  },
  async fetchLinks(
    { commit },
    { spaceUid, linkModelUid, token, apiType, appUid }
  ) {
    try {
      const client = createClient({
        spaceUid,
        token,
        apiType,
      })
      const { items } = await client.getContents({
        appUid,
        modelUid: linkModelUid,
        query: {
          depth: 1,
          select: ['_id', 'text', 'href'],
          limit: 5,
        },
      })
      commit('setLinks', items)
    } catch (err) {
      // console.error(err)
    }
  },
}
