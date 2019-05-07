import { ipcRenderer } from 'electron'
import { getOptionsFromState } from './help'

// user preference
const state = {
  autoSave: true,
  autoSaveDelay: 3000,
  titleBarStyle: 'csd',
  openFilesInNewWindow: false,
  aidou: true,
  fileSortBy: 'created',
  startUp: 'folder',
  language: 'en',

  editorFontFamily: 'Open Sans',
  fontSize: 16,
  lineHeight: 1.6,
  codeFontSize: 14,
  codeFontFamily: 'DejaVu Sans Mono',
  autoPairBracket: true,
  autoPairMarkdownSyntax: true,
  autoPairQuote: true,
  endOfLine: 'default',
  textDirection: 'ltr',
  hideQuickInsertHint: false,
  imageDropAction: 'folder',

  preferLooseListItem: true,
  bulletListMarker: '-',
  orderListDelimiter: '.',
  preferHeadingStyle: 'atx',
  tabSize: 4,
  listIndentation: 1,

  theme: 'light',
  // edit modes (they are not in preference.md, but still put them here)
  typewriter: false, // typewriter mode
  focus: false, // focus mode
  sourceCode: false // source code mode
}

const getters = {}

const mutations = {
  SET_USER_PREFERENCE (state, preference) {
    Object.keys(preference).forEach(key => {
      if (typeof preference[key] !== 'undefined' && typeof state[key] !== 'undefined') {
        state[key] = preference[key]
      }
    })
  },
  SET_MODE (state, { type, checked }) {
    state[type] = checked
  }
}

const actions = {
  ASK_FOR_USER_PREFERENCE ({ commit, state, rootState }) {
    ipcRenderer.send('mt::ask-for-user-preference')

    ipcRenderer.on('AGANI::user-preference', (e, preference) => {
      console.log(preference)
      const { autoSave } = preference
      commit('SET_USER_PREFERENCE', preference)

      // handle autoSave @todo
      if (autoSave) {
        const { pathname, markdown } = state
        const options = getOptionsFromState(rootState.editor)
        if (pathname) {
          commit('SET_SAVE_STATUS', true)
          ipcRenderer.send('AGANI::response-file-save', { pathname, markdown, options })
        }
      }
    })
  },

  ASK_FOR_MODE ({ commit }) {
    ipcRenderer.send('AGANI::ask-for-mode')
    ipcRenderer.on('AGANI::res-for-mode', (e, modes) => {
      Object.keys(modes).forEach(type => {
        commit('SET_MODE', {
          type,
          checked: modes[type]
        })
      })
    })
  },

  SET_SINGLE_PREFERENCE ({ commit }, { type, value }) {
    // commit('SET_USER_PREFERENCE', { [type]: value })
    // save to electron-store
    ipcRenderer.send('mt::set-user-preference', { [type]: value })
  }
}

const preferences = { state, getters, mutations, actions }

export default preferences
