import { Action, UnhandledAction } from "./Action";
import { State, AppMode, AppState } from "../common";
import { DataAvailableAction, DATA_AVAILABLE } from "./loaderDuck";
import {
    EditNominatedAction,
    EDIT_NOMINATED_CARD,
    EndCardEditAction,
    END_CARD_EDIT
} from "./cardEditorDuck";
import * as _ from "Lodash";

// Actions
export const CHANGE_APP_STATE = "MorningThunder/app/CHANGE_APP_STATE";

type AppAction =
    | UnhandledAction
    | ChangeAppStateAction
    | EditNominatedAction
    | EndCardEditAction;

const initialState: AppState = {
    // Have to render Loader to begin with because rendering it
    // kicks off the load from local storage.
    mode: "load_panel"
};
// Reducer
export default function reducer(state: AppState, action: AppAction): AppState {
    if (state === undefined) {
        return Object.assign({}, initialState);
    }

    switch (action.type) {
        case CHANGE_APP_STATE:
            return {
                ...state,
                mode: action.payload.mode
            };
        default:
            return state;
    }
}

// Action Creators

export type ChangeAppStateAction = Action<
    "MorningThunder/app/CHANGE_APP_STATE",
    {
        mode: AppMode;
        previousMode: AppMode;
    }
>;

export function changeAppState(
    newMode: AppMode,
    previousMode: AppMode = null
): ChangeAppStateAction {
    return {
        type: CHANGE_APP_STATE,
        payload: {
            mode: newMode,
            previousMode
        }
    };
}
