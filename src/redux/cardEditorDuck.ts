import { Action, UnhandledAction } from "./Action";
import { State, CardEditorState, AppMode } from "../common";
import { createShuffledArray } from "./utility";
import { ChangeAppStateAction, CHANGE_APP_STATE } from "./appDuck";
import { DataAvailableAction, DATA_AVAILABLE } from "./loaderDuck";
import * as _ from "Lodash";

// Actions
export const EDIT_NOMINATED_CARD =
    "MorningThunder/cardEditor/EDIT_NOMINATED_CARD";
export const EDIT_NEW_CARD = "MorningThunder/cardEditor/EDIT_NEW_CARD";
export const END_CARD_EDIT = "MorningThunder/cardEditor/END_CARD_EDIT";
const UPDATE_CARD_BUFFER_CHARACTER =
    "MorningThunder/cardEditor/UPDATE_CARD_BUFFER_CHARACTER";
const UPDATE_CARD_BUFFER_HINT =
    "MorningThunder/cardEditor/UPDATE_CARD_BUFFER_HINT";
const UPDATE_CARD_BUFFER_ANSWER =
    "MorningThunder/cardEditor/UPDATE_CARD_BUFFER_ANSWER";
const UPDATE_CARD_BUFFER_NOTES =
    "MorningThunder/cardEditor/UPDATE_CARD_BUFFER_NOTES";
const UPDATE_CARD_BUFFER_NEW_TAG =
    "MorningThunder/cardEditor/UPDATE_CARD_BUFFER_NEW_TAG";
const UPDATE_CARD_BUFFER_KUNYOMI =
    "MorningThunder/cardEditor/UPDATE_CARD_BUFFER_KUNYOMI";
const UPDATE_CARD_BUFFER_ONYOMI =
    "MorningThunder/cardEditor/UPDATE_CARD_BUFFER_ONYOMI";
export const SAVE_NEW_CARD = "MorningThunder/cardEditor/SAVE_NEW_CARD";
export const SAVE_EXISTING_CARD =
    "MorningThunder/cardEditor/SAVE_EXISTING_CARD";
export const SAVE_NEW_TAG = "MorningThunder/cardEditor/SAVE_NEW_TAG";
const CHANGE_CARD_BUFFER_TAGS =
    "MorningThunder/cardEditor/CHANGE_CARD_BUFFER_TAGS";
const REMOVE_TAG_FROM_CARD_BUFFER =
    "MorningThunder/cardEditor/REMOVE_TAG_FROM_CARD_BUFFER";
const ADD_SET_TO_CARD_BUFFER =
    "MorningThunder/cardEditor/ADD_SET_TO_CARD_BUFFER";
const REMOVE_SET_FROM_CARD_BUFFER =
    "MorningThunder/cardEditor/REMOVE_SET_FROM_CARD_BUFFER";
export const FLUSH_TO_LOCAL = "MorningThunder/cardEditor/FLUSH_TO_LOCAL";

type QuizAction =
    | UnhandledAction
    | EditNewCardAction
    | EditNominatedAction
    | EndCardEditAction
    | SaveNewCardAction
    | SaveExistingCardAction
    | UpdateBufferCharacterAction
    | UpdateBufferHintAction
    | UpdateBufferAnswerAction
    | UpdateBufferNotesAction
    | UpdateBufferNewTagAction
    | UpdateBufferKunyomiAction
    | UpdateBufferOnyomiAction
    | SaveNewTagAction
    | ChangeCardBufferTagsAction
    | RemoveTagFromBufferAction
    | AddSetToBufferAction
    | RemoveSetFromBufferAction
    | DataAvailableAction
    | FlushBufferAction
    | ChangeAppStateAction;

const initialState: CardEditorState = {
    // This is effectively the edit buffer.
    newCard: false,
    id: null,
    kanji: null,
    meaning: null,
    hint: null,
    kunyomi: null,
    onyomi: null,
    tags: [],
    sets: [],
    tagSearchText: null,
    unexportedChanges: false,
    unflushedChanges: false,
    modeOnExit: null
};
// Reducer
export default function reducer(
    state: CardEditorState,
    action: QuizAction
): CardEditorState {
    if (state === undefined) {
        return Object.assign({}, initialState);
    }

    switch (action.type) {
        case CHANGE_APP_STATE:
            if (action.payload.mode === "card_editor") {
                return {
                    ...state,
                    modeOnExit: action.payload.previousMode
                };
            } else {
                return state;
            }
        case DATA_AVAILABLE:
            return {
                ...state,
                unexportedChanges: action.payload.unexportedChanges,
                unflushedChanges: true // Local storage will not yet be up to date.
            };
        case EDIT_NEW_CARD:
            return {
                ...state,
                newCard: true,
                id: null,
                kanji: "",
                hint: "",
                meaning: "",
                kunyomi: "",
                onyomi: "",
                tags: [],
                sets: [],
                tagSearchText: ""
            };
        case EDIT_NOMINATED_CARD:
            return {
                ...state,
                newCard: false,
                id: action.payload.id,
                kanji: action.payload.kanji,
                hint: action.payload.hint,
                meaning: action.payload.meaning,
                kunyomi: action.payload.kunyomi,
                onyomi: action.payload.onyomi,
                tags: action.payload.tags,
                tagSearchText: ""
            };
        case END_CARD_EDIT:
            return Object.assign({}, initialState, {
                unexportedChanges: state.unexportedChanges,
                unflushedChanges: state.unflushedChanges
            });
        case UPDATE_CARD_BUFFER_CHARACTER:
            return {
                ...state,
                kanji: action.payload
            };
        case UPDATE_CARD_BUFFER_HINT:
            return {
                ...state,
                hint: action.payload
            };
        case UPDATE_CARD_BUFFER_ANSWER:
            return {
                ...state,
                meaning: action.payload
            };
        case UPDATE_CARD_BUFFER_KUNYOMI:
            return {
                ...state,
                kunyomi: action.payload
            };
        case UPDATE_CARD_BUFFER_ONYOMI:
            return {
                ...state,
                onyomi: action.payload
            };
        case UPDATE_CARD_BUFFER_NOTES:
            return {
                ...state,
                kanji: action.payload
            };
        case UPDATE_CARD_BUFFER_NEW_TAG:
            return {
                ...state,
                tagSearchText: action.payload
            };
        case SAVE_NEW_CARD:
            return {
                ...state,
                newCard: false,
                unexportedChanges: true,
                unflushedChanges: true
            };
        case SAVE_EXISTING_CARD:
            return {
                ...state,
                unexportedChanges: true,
                unflushedChanges: true
            };
        case SAVE_NEW_TAG:
            return {
                ...state,
                tags: state.tags.concat([action.payload.toLowerCase()]),
                unexportedChanges: true,
                unflushedChanges: true
            };
        case CHANGE_CARD_BUFFER_TAGS:
            return {
                ...state,
                tags: action.payload.slice().sort()
            };
        case ADD_SET_TO_CARD_BUFFER:
            if (state.sets.indexOf(action.payload) >= 0) {
                return state;
            } else {
                return {
                    ...state,
                    sets: state.sets.concat([action.payload]).sort()
                };
            }
        case REMOVE_SET_FROM_CARD_BUFFER:
            const setIndex = state.sets.indexOf(action.payload);
            if (setIndex < 0) {
                return state;
            } else {
                return {
                    ...state,
                    sets: state.sets
                        .slice(0, setIndex)
                        .concat(state.sets.slice(setIndex + 1))
                };
            }
        case FLUSH_TO_LOCAL:
            return {
                ...state,
                unflushedChanges: false
            };
        default:
            return state;
    }
}

// Action Creators

export interface CardEditBuffer {
    id: string;
    kanji: string;
    hint: string;
    meaning: string;
    kunyomi: string;
    onyomi: string;
    tags: string[];
    sets: string[];
}

export type EditNominatedAction = Action<
    "MorningThunder/cardEditor/EDIT_NOMINATED_CARD",
    CardEditBuffer
>;

export function editNominatedCard(card: CardEditBuffer): EditNominatedAction {
    return { type: EDIT_NOMINATED_CARD, payload: card };
}

export type EditNewCardAction = Action<
    "MorningThunder/cardEditor/EDIT_NEW_CARD",
    null
>;

export function editNewCard(): EditNewCardAction {
    return { type: EDIT_NEW_CARD, payload: null };
}

export type EndCardEditAction = Action<
    "MorningThunder/cardEditor/END_CARD_EDIT",
    null
>;

export function endCardEdit(): EndCardEditAction {
    return { type: END_CARD_EDIT, payload: null };
}

type UpdateBufferCharacterAction = Action<
    "MorningThunder/cardEditor/UPDATE_CARD_BUFFER_CHARACTER",
    string
>;

export function updateCardBufferCharacter(
    hint: string
): UpdateBufferCharacterAction {
    return { type: UPDATE_CARD_BUFFER_CHARACTER, payload: hint };
}

type UpdateBufferHintAction = Action<
    "MorningThunder/cardEditor/UPDATE_CARD_BUFFER_HINT",
    string
>;

export function updateCardBufferHint(hint: string): UpdateBufferHintAction {
    return { type: UPDATE_CARD_BUFFER_HINT, payload: hint };
}

type UpdateBufferAnswerAction = Action<
    "MorningThunder/cardEditor/UPDATE_CARD_BUFFER_ANSWER",
    string
>;

export function updateCardBufferAnswer(
    answer: string
): UpdateBufferAnswerAction {
    return { type: UPDATE_CARD_BUFFER_ANSWER, payload: answer };
}

type UpdateBufferNotesAction = Action<
    "MorningThunder/cardEditor/UPDATE_CARD_BUFFER_NOTES",
    string
>;

export function updateBufferNotes(notes: string): UpdateBufferNotesAction {
    return { type: UPDATE_CARD_BUFFER_NOTES, payload: notes };
}

type UpdateBufferNewTagAction = Action<
    "MorningThunder/cardEditor/UPDATE_CARD_BUFFER_NEW_TAG",
    string
>;

export function updateCardBufferNewTag(tag: string): UpdateBufferNewTagAction {
    return { type: UPDATE_CARD_BUFFER_NEW_TAG, payload: tag };
}

export type SaveExistingCardAction = Action<
    "MorningThunder/cardEditor/SAVE_EXISTING_CARD",
    CardEditBuffer
>;

export function saveExistingCard(
    edits: CardEditBuffer
): SaveExistingCardAction {
    return {
        type: SAVE_EXISTING_CARD,
        payload: edits
    };
}

export type SaveNewCardAction = Action<
    "MorningThunder/cardEditor/SAVE_NEW_CARD",
    CardEditBuffer
>;

export function saveNewCard(newCard: CardEditBuffer): SaveNewCardAction {
    return {
        type: SAVE_NEW_CARD,
        payload: newCard
    };
}

export type SaveNewTagAction = Action<
    "MorningThunder/cardEditor/SAVE_NEW_TAG",
    string
>;

export function saveNewTag(newTag: string): SaveNewTagAction {
    return {
        type: SAVE_NEW_TAG,
        payload: newTag
    };
}

export type ChangeCardBufferTagsAction = Action<
    "MorningThunder/cardEditor/CHANGE_CARD_BUFFER_TAGS",
    string[]
>;

export function changeCardBufferTags(
    changedTags: string[]
): ChangeCardBufferTagsAction {
    return {
        type: CHANGE_CARD_BUFFER_TAGS,
        payload: changedTags
    };
}

type UpdateBufferKunyomiAction = Action<
    "MorningThunder/cardEditor/UPDATE_CARD_BUFFER_KUNYOMI",
    string
>;

export function updateCardBufferKunyomi(
    kunyomi: string
): UpdateBufferKunyomiAction {
    return { type: UPDATE_CARD_BUFFER_KUNYOMI, payload: kunyomi };
}

type UpdateBufferOnyomiAction = Action<
    "MorningThunder/cardEditor/UPDATE_CARD_BUFFER_ONYOMI",
    string
>;

export function updateCardBufferOnyomi(
    onyomi: string
): UpdateBufferOnyomiAction {
    return { type: UPDATE_CARD_BUFFER_ONYOMI, payload: onyomi };
}

export type RemoveTagFromBufferAction = Action<
    "MorningThunder/cardEditor/REMOVE_TAG_FROM_CARD_BUFFER",
    string
>;

export function removeTagFromCardBuffer(
    tag: string
): RemoveTagFromBufferAction {
    return {
        type: REMOVE_TAG_FROM_CARD_BUFFER,
        payload: tag
    };
}

export type AddSetToBufferAction = Action<
    "MorningThunder/cardEditor/ADD_SET_TO_CARD_BUFFER",
    string
>;

export function addSetToCardBuffer(set: string): AddSetToBufferAction {
    return {
        type: ADD_SET_TO_CARD_BUFFER,
        payload: set
    };
}

export type RemoveSetFromBufferAction = Action<
    "MorningThunder/cardEditor/REMOVE_SET_FROM_CARD_BUFFER",
    string
>;

export function removeSetFromCardBuffer(
    set: string
): RemoveSetFromBufferAction {
    return {
        type: REMOVE_SET_FROM_CARD_BUFFER,
        payload: set
    };
}

type FlushBufferAction = Action<
    "MorningThunder/cardEditor/FLUSH_TO_LOCAL",
    null
>;
export function flushBuffer(): FlushBufferAction {
    return { type: FLUSH_TO_LOCAL, payload: null };
}
