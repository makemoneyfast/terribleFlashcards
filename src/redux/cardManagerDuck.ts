import { Action, UnhandledAction } from "./Action";
import { State, CardManagerState } from "../common";
import { DeleteCardAction, DELETE_CARD } from "./assetsDuck";
import * as _ from "Lodash";

// Actions
export const TOGGLE_CARD_SELECTION =
    "MorningThunder/cardManager/TOGGLE_CARD_SELECTION";
const TOGGLE_FILTER_SELECTED =
    "MorningThunder/cardManager/TOGGLE_FILTER_SELECTED";
const TOGGLE_MATCH_KANJI = "MorningThunder/cardManager/TOGGLE_MATCH_KANJI";
const TOGGLE_MATCH_HINT = "MorningThunder/cardManager/TOGGLE_MATCH_HINT";
const TOGGLE_MATCH_MEANING = "MorningThunder/cardManager/TOGGLE_MATCH_MEANING";
const TOGGLE_MATCH_KUNYOMI = "MorningThunder/cardManager/TOGGLE_MATCH_KUNYOMI";
const TOGGLE_MATCH_ONYOMI = "MorningThunder/cardManager/TOGGLE_MATCH_ONYOMI";
const CHANGE_FILTER_TEXT_TO_MATCH =
    "MorningThunder/cardManager/CHANGE_FILTER_TEXT_TO_MATCH";
const CHANGE_TAG_SEARCH_TEXT =
    "MorningThunder/cardManager/CHANGE_TAG_SEARCH_TEXT";
const CHANGE_TAGS_TO_MATCH = "MorningThunder/cardManager/CHANGE_TAGS_TO_MATCH";
const CHANGE_SETS_TO_MATCH = "MorningThunder/cardManager/CHANGE_SETS_TO_MATCH";
const CHANGE_SETS_TO_MODIFY_ON_SELECTED =
    "MorningThunder/cardManager/CHANGE_SETS_TO_MODIFY_ON_SELECTED";
const CHANGE_TAGS_TO_MODIFY_ON_SELECTED_SEARCH_TEXT =
    "MorningThunder/cardManager/CHANGE_TAGS_TO_MODIFY_ON_SELECTED_SEARCH_TEXT";
const CHANGE_TAGS_TO_MODIFY_ON_SELECTED =
    "MorningThunder/cardManager/CHANGE_TAGS_TO_MODIFY_ON_SELECTED";
export const APPLY_CHANGES_TO_FILTERED =
    "MorningThunder/cardManager/APPLY_CHANGES_TO_FILTERED";
const RESET_FILTER_PARAMETERS =
    "MorningThunder/cardManager/RESET_FILTER_PARAMETERS";

type CardManagerAction =
    | UnhandledAction
    | ToggleCardSelectAction
    | ToggleFilterSelectedAction
    | ChangeFilterTextToMatchAction
    | ToggleMatchKanjiAction
    | ToggleMatchHintAction
    | ToggleMatchMeaningAction
    | ToggleMatchKunyomiAction
    | ToggleMatchOnyomiAction
    | ChangeTagSearchTextAction
    | ChangeTagsToMatchAction
    | ChangeSetsToMatchAction
    | ChangeTagsToModifyOnSelectedSearchTextAction
    | ChangeTagsToModifyOnSelectedAction
    | ChangeSetsToModifyOnSelectedAction
    | DeleteCardAction
    | ResetFilterParametersAction;

const initialState: CardManagerState = {
    // Have to render Loader to begin with because rendering it
    // kicks off the load from local storage.
    selectedCards: [],

    matchSelectedForInclude: false,
    searchTextForInclude: "",
    matchKanjiForInclude: false,
    matchHintForInclude: false,
    matchMeaningForInclude: false,
    matchKunyomiForInclude: false,
    matchOnyomiForInclude: false,
    tagSearchTextForInclude: "",
    tagsForInclude: [],
    setsForInclude: [],

    matchSelectedForExclude: false,
    searchTextForExclude: "",
    matchKanjiForExclude: false,
    matchHintForExclude: false,
    matchMeaningForExclude: false,
    matchKunyomiForExclude: false,
    matchOnyomiForExclude: false,
    tagSearchTextForExclude: "",
    tagsForExclude: [],
    setsForExclude: [],

    setsToAdd: [],
    setsToRemove: [],
    tagsToAdd: [],
    tagsToRemove: [],
    tagsToAddSearchText: "",
    tagsToRemoveSearchText: ""
};
// Reducer
export default function reducer(
    state: CardManagerState,
    action: CardManagerAction
): CardManagerState {
    if (state === undefined) {
        return Object.assign({}, initialState);
    }

    switch (action.type) {
        case TOGGLE_CARD_SELECTION:
            const cardIndex = state.selectedCards.indexOf(action.payload);
            if (cardIndex < 0) {
                // add the card to those selected
                return {
                    ...state,
                    selectedCards: state.selectedCards
                        .concat(action.payload)
                        .sort()
                };
            } else {
                // remove
                return {
                    ...state,
                    selectedCards: state.selectedCards
                        .slice(0, cardIndex)
                        .concat(state.selectedCards.slice(cardIndex + 1))
                        .sort()
                };
            }
        case TOGGLE_FILTER_SELECTED:
            if (action.payload === "include") {
                return {
                    ...state,
                    matchSelectedForInclude: !state.matchSelectedForInclude
                };
            } else {
                return {
                    ...state,
                    matchSelectedForExclude: !state.matchSelectedForExclude
                };
            }
        case CHANGE_FILTER_TEXT_TO_MATCH:
            if (action.payload.mode === "include") {
                return {
                    ...state,
                    searchTextForInclude: action.payload.text
                };
            } else {
                return {
                    ...state,
                    searchTextForExclude: action.payload.text
                };
            }
        case TOGGLE_MATCH_KANJI:
            if (action.payload === "include") {
                return {
                    ...state,
                    matchKanjiForInclude: !state.matchKanjiForInclude
                };
            } else {
                return {
                    ...state,
                    matchKanjiForExclude: !state.matchKanjiForExclude
                };
            }
        case TOGGLE_MATCH_HINT:
            if (action.payload === "include") {
                return {
                    ...state,
                    matchHintForInclude: !state.matchHintForInclude
                };
            } else {
                return {
                    ...state,
                    matchHintForExclude: !state.matchHintForExclude
                };
            }
        case TOGGLE_MATCH_MEANING:
            if (action.payload === "include") {
                return {
                    ...state,
                    matchMeaningForInclude: !state.matchMeaningForInclude
                };
            } else {
                return {
                    ...state,
                    matchMeaningForExclude: !state.matchMeaningForExclude
                };
            }
        case TOGGLE_MATCH_KUNYOMI:
            if (action.payload === "include") {
                return {
                    ...state,
                    matchKunyomiForInclude: !state.matchKunyomiForInclude
                };
            } else {
                return {
                    ...state,
                    matchKunyomiForExclude: !state.matchKunyomiForExclude
                };
            }
        case TOGGLE_MATCH_ONYOMI:
            if (action.payload === "include") {
                return {
                    ...state,
                    matchOnyomiForInclude: !state.matchOnyomiForInclude
                };
            } else {
                return {
                    ...state,
                    matchOnyomiForExclude: !state.matchOnyomiForExclude
                };
            }
        case CHANGE_TAG_SEARCH_TEXT:
            if (action.payload.mode === "include") {
                return {
                    ...state,
                    tagSearchTextForInclude: action.payload.searchText
                };
            } else {
                return {
                    ...state,
                    tagSearchTextForExclude: action.payload.searchText
                };
            }
        case CHANGE_TAGS_TO_MATCH:
            if (action.payload.mode === "include") {
                return {
                    ...state,
                    tagsForInclude: action.payload.tags.slice()
                };
            } else {
                return {
                    ...state,
                    tagsForExclude: action.payload.tags.slice()
                };
            }
        case CHANGE_SETS_TO_MATCH:
            if (action.payload.mode === "include") {
                return {
                    ...state,
                    setsForInclude: action.payload.sets.slice()
                };
            } else {
                return {
                    ...state,
                    setsForExclude: action.payload.sets.slice()
                };
            }
        case CHANGE_TAGS_TO_MODIFY_ON_SELECTED_SEARCH_TEXT:
            if (action.payload.mode === "add") {
                return {
                    ...state,
                    tagsToAddSearchText: action.payload.searchText
                };
            } else {
                return {
                    ...state,
                    tagsToRemoveSearchText: action.payload.searchText
                };
            }
        case CHANGE_TAGS_TO_MODIFY_ON_SELECTED:
            if (action.payload.mode === "add") {
                return {
                    ...state,
                    tagsToAdd: action.payload.tags
                };
            } else {
                return {
                    ...state,
                    tagsToRemove: action.payload.tags
                };
            }
        case CHANGE_SETS_TO_MODIFY_ON_SELECTED:
            if (action.payload.mode === "add") {
                return {
                    ...state,
                    setsToAdd: action.payload.sets
                };
            } else {
                return {
                    ...state,
                    setsToRemove: action.payload.sets
                };
            }
        case DELETE_CARD:
            if (state.selectedCards.indexOf(action.payload) >= 0) {
                return {
                    ...state,
                    selectedCards: _(state.selectedCards)
                        .without(action.payload)
                        .value()
                };
            }
        case RESET_FILTER_PARAMETERS:
            return { ...initialState };
        default:
            return state;
    }
}

// Action Creators

export type FilterMode = "include" | "exclude";
export type SelectionEditMode = "add" | "remove";

type ToggleCardSelectAction = Action<
    "MorningThunder/cardManager/TOGGLE_CARD_SELECTION",
    string
>;

export function toggleCardSelection(id: string): ToggleCardSelectAction {
    return {
        type: TOGGLE_CARD_SELECTION,
        payload: id
    };
}

type ToggleFilterSelectedAction = Action<
    "MorningThunder/cardManager/TOGGLE_FILTER_SELECTED",
    FilterMode
>;

export function toggleFilterSelected(
    mode: FilterMode
): ToggleFilterSelectedAction {
    return {
        type: TOGGLE_FILTER_SELECTED,
        payload: mode
    };
}

type ChangeFilterTextToMatchAction = Action<
    "MorningThunder/cardManager/CHANGE_FILTER_TEXT_TO_MATCH",
    { mode: FilterMode; text: string }
>;

export function changeFilterTextToMatch(
    text: string,
    mode: FilterMode
): ChangeFilterTextToMatchAction {
    return {
        type: CHANGE_FILTER_TEXT_TO_MATCH,
        payload: { mode, text }
    };
}

type ToggleMatchKanjiAction = Action<
    "MorningThunder/cardManager/TOGGLE_MATCH_KANJI",
    FilterMode
>;

export function toggleMatchKanji(mode: FilterMode): ToggleMatchKanjiAction {
    return {
        type: TOGGLE_MATCH_KANJI,
        payload: mode
    };
}

type ToggleMatchHintAction = Action<
    "MorningThunder/cardManager/TOGGLE_MATCH_HINT",
    FilterMode
>;

export function toggleMatchHint(mode: FilterMode): ToggleMatchHintAction {
    return {
        type: TOGGLE_MATCH_HINT,
        payload: mode
    };
}

type ToggleMatchMeaningAction = Action<
    "MorningThunder/cardManager/TOGGLE_MATCH_MEANING",
    FilterMode
>;

export function toggleMatchMeaning(mode: FilterMode): ToggleMatchMeaningAction {
    return {
        type: TOGGLE_MATCH_MEANING,
        payload: mode
    };
}

type ToggleMatchKunyomiAction = Action<
    "MorningThunder/cardManager/TOGGLE_MATCH_KUNYOMI",
    FilterMode
>;

export function toggleMatchKunyomi(mode: FilterMode): ToggleMatchKunyomiAction {
    return {
        type: TOGGLE_MATCH_KUNYOMI,
        payload: mode
    };
}

type ToggleMatchOnyomiAction = Action<
    "MorningThunder/cardManager/TOGGLE_MATCH_ONYOMI",
    FilterMode
>;

export function toggleMatchOnyomi(mode: FilterMode): ToggleMatchOnyomiAction {
    return {
        type: TOGGLE_MATCH_ONYOMI,
        payload: mode
    };
}

type ChangeTagSearchTextAction = Action<
    "MorningThunder/cardManager/CHANGE_TAG_SEARCH_TEXT",
    { mode: FilterMode; searchText: string }
>;

export function changeTagSearchText(
    searchText: string,
    mode: FilterMode
): ChangeTagSearchTextAction {
    return {
        type: CHANGE_TAG_SEARCH_TEXT,
        payload: { mode, searchText }
    };
}

type ChangeTagsToMatchAction = Action<
    "MorningThunder/cardManager/CHANGE_TAGS_TO_MATCH",
    { mode: FilterMode; tags: string[] }
>;

export function changeTagsToMatch(
    tags: string[],
    mode: FilterMode
): ChangeTagsToMatchAction {
    return {
        type: CHANGE_TAGS_TO_MATCH,
        payload: { mode, tags }
    };
}

type ChangeSetsToMatchAction = Action<
    "MorningThunder/cardManager/CHANGE_SETS_TO_MATCH",
    { mode: FilterMode; sets: string[] }
>;

export function changeSetsToMatch(
    sets: string[],
    mode: FilterMode
): ChangeSetsToMatchAction {
    return {
        type: CHANGE_SETS_TO_MATCH,
        payload: { mode, sets }
    };
}

type ChangeTagsToModifyOnSelectedSearchTextAction = Action<
    "MorningThunder/cardManager/CHANGE_TAGS_TO_MODIFY_ON_SELECTED_SEARCH_TEXT",
    { mode: SelectionEditMode; searchText: string }
>;

export function changeTagsToModifyOnSelectedSearchText(
    searchText: string,
    mode: SelectionEditMode
): ChangeTagsToModifyOnSelectedSearchTextAction {
    return {
        type: CHANGE_TAGS_TO_MODIFY_ON_SELECTED_SEARCH_TEXT,
        payload: { mode, searchText }
    };
}

type ChangeTagsToModifyOnSelectedAction = Action<
    "MorningThunder/cardManager/CHANGE_TAGS_TO_MODIFY_ON_SELECTED",
    { mode: SelectionEditMode; tags: string[] }
>;

export function changeTagsToModifyOnSelected(
    tags: string[],
    mode: SelectionEditMode
): ChangeTagsToModifyOnSelectedAction {
    return {
        type: CHANGE_TAGS_TO_MODIFY_ON_SELECTED,
        payload: { mode, tags }
    };
}

type ChangeSetsToModifyOnSelectedAction = Action<
    "MorningThunder/cardManager/CHANGE_SETS_TO_MODIFY_ON_SELECTED",
    { mode: SelectionEditMode; sets: string[] }
>;

export function changeSetsToModifyOnSelected(
    sets: string[],
    mode: SelectionEditMode
): ChangeSetsToModifyOnSelectedAction {
    return {
        type: CHANGE_SETS_TO_MODIFY_ON_SELECTED,
        payload: { mode, sets }
    };
}

export type ApplyChangesToFilteredAction = Action<
    "MorningThunder/cardManager/APPLY_CHANGES_TO_FILTERED",
    {
        cardIDs: string[];
        setsToAdd: string[];
        setsToRemove: string[];
        tagsToAdd: string[];
        tagsToRemove: string[];
    }
>;

export function applyChangesToFiltered(
    cardIDs: string[],
    setsToAdd: string[],
    setsToRemove: string[],
    tagsToAdd: string[],
    tagsToRemove: string[]
): ApplyChangesToFilteredAction {
    return {
        type: APPLY_CHANGES_TO_FILTERED,
        payload: { cardIDs, setsToAdd, setsToRemove, tagsToAdd, tagsToRemove }
    };
}

export type ResetFilterParametersAction = Action<
    "MorningThunder/cardManager/RESET_FILTER_PARAMETERS",
    null
>;

export function resetFilterParameters(): ResetFilterParametersAction {
    return {
        type: RESET_FILTER_PARAMETERS,
        payload: null
    };
}
