#!/usr/bin/env node
import inquirer from "inquirer";
import { writeFileSync, mkdirSync, existsSync, appendFileSync } from "fs";

const choices = {
  redux: {
    label: "redux",
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
  baseRepository: {
    label: "baseRepository",
    write: () => {
      const cwd = process.cwd();
      const repositoryPath = cwd + "/data-access";
      if (!existsSync(repositoryPath)) {
        mkdirSync(repositoryPath, {}, (err) => {
          console.log(err);
        });
      }
      const repositoryString = `import SQLite from 'react-native-sqlite-storage';

class BaseRepository {
  constructor(entityType) {
    this.sqlite = SQLite;
    this.sqlite.DEBUG(true);
    this.sqlite.enablePromise(true);
    this.databaseName = 'awe3';
    this.openDatabase = () => {
      return new Promise((resolve, reject) => {
        this.sqlite
          .openDatabase({
            name: this.databaseName,
            location: 'default',
          })
          .then(db => {
            resolve(db);
          })
          .catch(err => {
            reject(err);
          });
      });
    };
    this.entityType = entityType;
  }

  create() {
    return new Promise((resolve, reject) => {
      this.openDatabase()
        .then(db => {
          const query = \`CREATE TABLE IF NOT EXISTS \${
            this.entityType.className
          } (\${Object.keys(this.entityType.columns)
        .map((column) => column + " " + this.entityType.columns[column])
        .join(", ")});\`;

          db.executeSql(query)
            .then(val => {
              resolve(true);
            })
            .catch(err => {
              reject(false);
            });
        })
        .catch(err => {
          reject(false);
        });
    });
  }

  get(options = {}) {
    return new Promise((resolve, reject) => {
      this.openDatabase().then(db => {
        const query = \`SELECT \${options.get || "*"} FROM \${
        this.entityType.className
      } \${Object.keys(options)
        .map((key) => options[key].keyword + " " + options[key].value)
        .join(" ")}\`;

        db.executeSql(query)
          .then(([values]) => {
            var array = [];

            for (let index = 0; index < values.rows.length; index++) {
              const element = values.rows.item(index);
              array.push(element);
            }

            resolve(array);
          })
          .catch(err => {
            reject(false);
          });
      });
    });
  }

  add(model) {
    return new Promise((resolve, reject) => {
      this.openDatabase().then(db => {
        const filteredModel = Object.keys(model)
          .map(key => (this.entityType.columns[key] ? key : null))
          .filter(k => k);

        const query = \`INSERT INTO \${
          this.entityType.className
        } (\${filteredModel
        .map((key) => key)
        .join(", ")}) VALUES (\${filteredModel
        .map((key) => "'" + model[key] + "'")
        .join(", ")})\`;

        db.executeSql(query)
          .then(val => {
            resolve({...model, id: val[0].insertId});
          })
          .catch(err => {
            reject(false);
          });
      });
    });
  }

  update(model) {
    return new Promise((resolve, reject) => {
      this.openDatabase().then(db => {
        const query = \`UPDATE \${this.entityType.className} SET \${Object.keys(
        model
      )
        .map((key) => (this.entityType.columns[key] ? key : null))
        .filter((k) => k)
        .map((key) => key + " = '" + model[key] + "'")
        .join(", ")} WHERE id = \${model.id}\`;

        db.executeSql(query)
          .then(val => {
            resolve(model);
          })
          .catch(err => {
            reject(false);
          });
      });
    });
  }

  delete(id, option = 'id') {
    return new Promise((resolve, reject) => {
      this.openDatabase().then(db => {
        const query = \`DELETE FROM \${
          this.entityType.className
        } WHERE \${option} = \${id}\`;

        db.executeSql(query)
          .then(val => {
            resolve(true);
          })
          .catch(err => {
            reject(false);
          });
      });
    });
  }
}
`;

      const repositoryFilePath = `${repositoryPath}/BaseRepository.js`;
      const repositoryIndexFilePath = `${repositoryPath}/index.js`;
      writeFileSync(
        repositoryIndexFilePath,
        "export * from './BaseRepository';"
      );
      writeFileSync(repositoryFilePath, repositoryString);
    },
  },
  businessService: {
    label: "businessService",
    write: () => {
      inquirer
        .prompt({
          type: "input",
          name: "name",
          message: "Enter your service name?",
          validate: (a) => {
            const isValid = a.length > 0;
            if (isValid) {
              return true;
            }
            return "The service name length must be greater than zero.";
          },
        })
        .then(({ name }) => {
          const cwd = process.cwd();
          const businessPath = `${cwd}/business`;
          if (!existsSync(businessPath)) {
            mkdirSync(businessPath, {}, (err) => {
              console.log(err);
            });
          }

          const serviceNameFirstLetterUpper =
            name[0].toUpperCase() + name.slice(1);

          const actionString = `import {${serviceNameFirstLetterUpper}Dal} from '../data-access';
import {${serviceNameFirstLetterUpper}Type} from '../types';

export class ${serviceNameFirstLetterUpper}Service {
  constructor() {
    this.${name}Dal = new ${serviceNameFirstLetterUpper}Dal(${serviceNameFirstLetterUpper}Type);
  }

  create() {
    this.${name}Dal.create();
  }

  get() {
    return this.${name}Dal.get();
  }

  getById(id) {
    return this.${name}Dal.get({
      where: {keyword: 'WHERE', value: 'id= ' + id},
    });
  }

  add(model) {
    return this.${name}Dal.add(model);
  }

  update(model) {
    return this.${name}Dal.update(model);
  }

  delete(id) {
    return this.${name}Dal.delete(id);
  }
}
`;

          const businessIndexFilePath = `${businessPath}/index.js`;
          const businessFilePath = `${businessPath}/${serviceNameFirstLetterUpper}Service.js`;
          appendFileSync(
            businessIndexFilePath,
            `export {${serviceNameFirstLetterUpper}Service} from './${serviceNameFirstLetterUpper}Service';\n`
          );
          writeFileSync(businessFilePath, actionString);
        });
    },
  },
  store: {
    label: "store",
    write: () => {
      const cwd = process.cwd();
      const storePath = `${cwd}/store`;
      const reducersPath = `${storePath}/reducers`;
      if (!existsSync(storePath)) {
        mkdirSync(storePath, {}, (err) => {
          console.log(err);
        });
      }
      if (!existsSync(reducersPath)) {
        mkdirSync(reducersPath, {}, (err) => {
          console.log(err);
        });
      }

      const storeString = `import {createStore, compose, applyMiddleware} from 'redux';
import thunkMiddleware from 'redux-thunk';
import createReducer from './reducers/index';

const enhancher = compose(applyMiddleware(thunkMiddleware));
const store = createStore(createReducer(), enhancher);
export default store;
`;

      const reducerString = `import {combineReducers} from 'redux';
const createReducer = () => combineReducers({});

export default createReducer;
`;

      const reducersIndexFilePath = `${reducersPath}/index.js`;
      const storeIndexFilePath = `${storePath}/index.js`;
      writeFileSync(storeIndexFilePath, storeString);
      writeFileSync(reducersIndexFilePath, reducerString);
    },
  },
};

inquirer
  .prompt({
    type: "list",
    name: "template",
    message: "Choose your template?",
    choices: Object.keys(choices).map((key) => choices[key].label),
  })
  .then(({ template }) => {
    console.log(template);
    choices[template].write();
  });
