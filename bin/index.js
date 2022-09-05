#!/usr/bin/env node
import inquirer from "inquirer";
import { writeFileSync, mkdirSync, existsSync } from "fs";

const choices = {
  redux: {
    label: "Redux",
    write: () => {
      inquirer
        .prompt({
          type: "input",
          name: "name",
          message: "Enter your folder name?",
          validate: (a) => {
            const isValid = a.length > 0;
            if (isValid) {
              return true;
            }
            return "The folder name length must be greater than zero.";
          },
        })
        .then(({ name }) => {
          const cwd = process.cwd();
          const storePath = `${cwd}/${name}`;
          const actionsPath = `${storePath}/actions`;
          const reducersPath = `${storePath}/reducers`;
          if (!existsSync(storePath)) {
            mkdirSync(storePath, {}, (err) => {
              console.log(err);
            });
          }
          if (!existsSync(actionsPath)) {
            mkdirSync(actionsPath, {}, (err) => {
              console.log(err);
            });
          }
          if (!existsSync(reducersPath)) {
            mkdirSync(reducersPath, {}, (err) => {
              console.log(err);
            });
          }

          const actionFilePath = `${actionsPath}/${name}.action.js`;
          const actionIndexFilePath = `${actionsPath}/index.js`;
          const reducerFilePath = `${reducersPath}/${name}.reducer.js`;

          const filenameUpper = name.toUpperCase();
          const filenameFirstLetterUpper =
            name[0].toUpperCase() + name.slice(1);

          const actionString = `export const GET_${filenameUpper}S = "GET_${filenameUpper}S";
export const GET_${filenameUpper}_BY_ID = "GET_${filenameUpper}_BY_ID";
export const POST_${filenameUpper} = "POST_${filenameUpper}";
export const UPDATE_${filenameUpper} = "UPDATE_${filenameUpper}";
export const DELETE_${filenameUpper} = "DELETE_${filenameUpper}";
export const SET_LOADING = "SET_LOADING_${filenameUpper}";
          
export const get${filenameFirstLetterUpper}S = () => (dispatch) => {
  const service = DatabaseService();
  dispatch(setLoading(true));

  service
    .get()
    .then((response) => {
      dispatch(setLoading(false));
      dispatch({
        type: GET_${filenameUpper}S,
        payload: response,
      });
    })
    .catch((e) => {
      dispatch(setLoading(false));
      dispatch({
        type: GET_${filenameUpper}S,
        payload: [],
      });
    });
};

export const get${filenameFirstLetterUpper}ById = (id) => (dispatch) => {
  const service = DatabaseService();
  dispatch(setLoading(true));

  service
    .getById(id)
    .then((response) => {
      dispatch(setLoading(false));
      dispatch({
        type: GET_${filenameUpper}_BY_ID,
        payload: response,
      });
    })
    .catch((e) => {
      dispatch(setLoading(false));
      dispatch({
        type: GET_${filenameUpper}_BY_ID,
        payload: [],
      });
    });
};

export const add${filenameFirstLetterUpper} = model => (dispatch) => {
  const service = DatabaseService();

  service
    .add(model)
    .then((response) => {
      dispatch({
        type: POST_${filenameUpper},
        payload: response,
      });
    })
    .catch((e) => {
      dispatch({
        type: POST_${filenameUpper},
        payload: {},
      });
    });
};

export const update${filenameFirstLetterUpper} = model => (dispatch) => {
  const service = DatabaseService();

  service
    .update(model)
    .then((response) => {
      dispatch({
        type: UPDATE_${filenameUpper},
        payload: response,
      });
    })
    .catch((e) => {
      dispatch({
        type: UPDATE_${filenameUpper},
        payload: {},
      });
    });
};

export const delete${filenameFirstLetterUpper} = id => (dispatch) => {
  const service = DatabaseService();

  service
    .delete(id)
    .then((response) => {
      dispatch({
        type: DELETE_${filenameUpper},
        payload: response,
      });
    })
    .catch((e) => {
      dispatch({
        type: DELETE_${filenameUpper},
        payload: {},
      });
    });
};

export const setLoading = loading => dispatch => {
  dispatch({
    type: SET_LOADING,
    payload: loading,
  });
};
`;

          const reducerString = `import * as Actions from '../actions/index';

const initialState = {
  data: [],
  loading: false,
  item: {},
};
          
const ${name}Reducer = function (state = initialState, action) {
  switch (action.type) {
    case Actions.GET_${filenameUpper}S:
      return {...state, data: action.payload};

    case Actions.GET_${filenameUpper}_BY_ID:
      return {...state, item: action.payload};

    case Actions.POST_${filenameUpper}:
      return {...state, data: [...state.data, action.payload]};

    case Actions.UPDATE_${filenameUpper}:
      return {
        ...state,
        data: state.data.map(d => {
          if (d.id === action.payload.id) {
            return {...d, ...action.payload};
          }
          return d;
        }),
      };

    case Actions.DELETE_${filenameUpper}:
      return {
        ...state,
        data: state.data.filter(d => d.id !== action.payload.id),
      };

    case Actions.SET_LOADING:
      return {...state, loading: action.payload};

    default:
      return state;
  }
};

export default ${name}Reducer;
`;

          writeFileSync(
            actionIndexFilePath,
            `export * from './${name}.action';`
          );
          writeFileSync(actionFilePath, actionString);
          writeFileSync(reducerFilePath, reducerString);
        });
    },
  },
  baseRepository: { label: "Base Repository", write: () => {} },
  database: { label: "Database", write: () => {} },
  store: { label: "Store", write: () => {} },
};

inquirer
  .prompt({
    type: "list",
    name: "template",
    message: "Choose your template?",
    choices: [choices.redux.label, choices.database.label, choices.store.label],
  })
  .then(({ template }) => {
    console.log(template);
    choices[template].write();
  });
