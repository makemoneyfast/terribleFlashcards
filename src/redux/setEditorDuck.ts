import { Action, UnhandledAction } from "./Action";
import { State, SetEditorState, AppMode } from "../common";
import { createShuffledArray } from "./utility";
import { ChangeAppStateAction, CHANGE_APP_STATE } from "./appDuck";
import { DataAvailableAction, DATA_AVAILABLE } from "./loaderDuck";
import * as _ from "Lodash";

// Actions
export const EDIT_NOMINATED_SET = "MorningThunder/setEditor/EDIT_NOMINATED_SET";
export const EDIT_NEW_SET = "MorningThunder/setEditor/EDIT_NEW_SET";
export const UPDATE_SET_BUFFER_NAME =
    "MorningThunder/setEditor/UPDATE_SET_BUFFER_NAME";
export const REMOVE_KANJI_FROM_SET_BUFFER =
    "MorningThunder/setEditor/REMOVE_KANJI_FROM_SET_BUFFER";
export const SAVE_NEW_SET = "MorningThunder/setEditor/SAVE_NEW_SET";
export const SAVE_EXISTING_SET = "MorningThunder/setEditor/SAVE_EXISTING_SET";
export const END_SET_EDIT = "MorningThunder/setEditor/END_SET_EDIT";

type QuizAction =
    | UnhandledAction
    | ChangeAppStateAction
    | EditNominatedSetAction
    | EditNewSetAction
    | EndSetEditAction
    | UpdateSetBufferNameAction
    | RemoveKanjiFromSetBufferAction;

const initialState: SetEditorState = {
    // This is effectively the edit buffer.
    newSet: false,
    id: null,
    name: null,
    kanji: null,
    modeOnExit: null
};
// Reducer
export default function reducer(
    state: SetEditorState,
    action: QuizAction
): SetEditorState {
    if (state === undefined) {
        return Object.assign({}, initialState);
    }

    switch (action.type) {
        case CHANGE_APP_STATE:
            if (action.payload.mode === "set_editor") {
                return {
                    ...state,
                    modeOnExit: action.payload.previousMode
                };
            } else {
                return state;
            }
        case EDIT_NEW_SET:
            return {
                ...state,
                newSet: true,
                id: null,
                name: "",
                kanji: []
            };
        case EDIT_NOMINATED_SET:
            return {
                ...state,
                newSet: false,
                id: action.payload.id,
                name: action.payload.name,
                kanji: action.payload.kanji
            };
        case END_SET_EDIT:
            return {
                ...state,
                newSet: false
            };
        case UPDATE_SET_BUFFER_NAME:
            return {
                ...state,
                name: action.payload
            };
        case REMOVE_KANJI_FROM_SET_BUFFER:
            return {
                ...state,
                kanji: _(state.kanji)
                    .without(action.payload)
                    .value()
            };
        default:
            return state;
    }
}

// Action Creators

export interface SetEditBuffer {
    id: string;
    kanji: string[];
    name: string;
}

export type EditNominatedSetAction = Action<
    "MorningThunder/setEditor/EDIT_NOMINATED_SET",
    SetEditBuffer
>;

export function editNominatedSet(set: SetEditBuffer): EditNominatedSetAction {
    return { type: EDIT_NOMINATED_SET, payload: set };
}

export type EditNewSetAction = Action<
    "MorningThunder/setEditor/EDIT_NEW_SET",
    null
>;

export function editNewSet(): EditNewSetAction {
    return { type: EDIT_NEW_SET, payload: null };
}

export type UpdateSetBufferNameAction = Action<
    "MorningThunder/setEditor/UPDATE_SET_BUFFER_NAME",
    string
>;

export function updateSetBufferName(name: string): UpdateSetBufferNameAction {
    return { type: UPDATE_SET_BUFFER_NAME, payload: name };
}

export type RemoveKanjiFromSetBufferAction = Action<
    "MorningThunder/setEditor/REMOVE_KANJI_FROM_SET_BUFFER",
    string
>;

export function removeKanjiFromSetBuffer(
    tagID: string
): RemoveKanjiFromSetBufferAction {
    return { type: REMOVE_KANJI_FROM_SET_BUFFER, payload: tagID };
}

export type SaveExistingSetAction = Action<
    "MorningThunder/setEditor/SAVE_EXISTING_SET",
    SetEditBuffer
>;

export function saveExistingSet(edits: SetEditBuffer): SaveExistingSetAction {
    return {
        type: SAVE_EXISTING_SET,
        payload: edits
    };
}

export type SaveNewSetAction = Action<
    "MorningThunder/setEditor/SAVE_NEW_SET",
    SetEditBuffer
>;

export function saveNewSet(newSet: SetEditBuffer): SaveNewSetAction {
    return {
        type: SAVE_NEW_SET,
        payload: newSet
    };
}

export type EndSetEditAction = Action<
    "MorningThunder/setEditor/END_SET_EDIT",
    null
>;

export function endSetEdit(): EndSetEditAction {
    return { type: END_SET_EDIT, payload: null };
}
