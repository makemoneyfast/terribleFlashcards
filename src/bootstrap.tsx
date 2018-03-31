import * as React from "react";
import * as ReactDOM from "react-dom";
import { createStore, applyMiddleware } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import thunk from "redux-thunk";
import { Provider } from "react-redux";

import reducer from "./redux/RootReducer";

import Quiz from "./Quiz";

import "./styles/global-styles.less";

ReactDOM.render(
    <Provider
        store={createStore(
            reducer,
            composeWithDevTools(applyMiddleware(thunk))
        )}>
        <Quiz />
    </Provider>,
    document.getElementById("root")
);
