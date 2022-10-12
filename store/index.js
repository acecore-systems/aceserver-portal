import { createClient } from 'newt-client-js'

export const state = () => ({
  app: null,
  page: null,
})

export const getters = {
  app: (state) => state.app,
  page: (state) => state.page,
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
}
