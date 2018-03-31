import { Action, UnhandledAction } from "./Action";
import {
    Assets,
    State,
    AssetsState,
    QuizState,
    eQuizMode,
    eCardState,
    KanjiAsset,
    TagAsset,
    SetAsset
} from "../common";
import {
    SAVE_NEW_CARD,
    SaveNewCardAction,
    SAVE_EXISTING_CARD,
    SaveExistingCardAction,
    SAVE_NEW_TAG,
    SaveNewTagAction
} from "./cardEditorDuck";
import {
    SAVE_NEW_SET,
    SaveNewSetAction,
    SAVE_EXISTING_SET,
    SaveExistingSetAction
} from "./setEditorDuck";
import {
    APPLY_CHANGES_TO_FILTERED,
    ApplyChangesToFilteredAction
} from "./cardManagerDuck";
import { DATA_AVAILABLE, DataAvailableAction } from "./loaderDuck";
import { clearAllRetestFlags } from "./utility";
import * as _ from "Lodash";

// Actions
const TOGGLE_RETEST = "MorningThunder/assets/TOGGLE_RETEST";
const CLEAR_RETEST = "MorningThunder/assets/CLEAR_RETEST";
export const DELETE_SET = "MorningThunder/assets/DELETE_SET";
export const DELETE_CARD = "MorningThunder/assets/DELETE_CARD";
export const DELETE_TAG = "MorningThunder/assets/DELETE_TAG";

type AssetsAction =
    | UnhandledAction
    | DataAvailableAction
    | ToggleRetestAction
    | ClearAllRetestAction
    | SaveNewSetAction
    | SaveExistingSetAction
    | SaveNewCardAction
    | SaveExistingCardAction
    | DeleteSetAction
    | DeleteCardAction
    | DeleteTagAction
    | SaveNewTagAction
    | ApplyChangesToFilteredAction;

const initialState: AssetsState = {
    kanji: {},
    sets: {},
    tags: {},
    allSets: []
};

// Reducer
export default function reducer(
    state: AssetsState,
    action: AssetsAction
): AssetsState {
    let currentQuizID: string;
    let shuffledKanji: string[];
    let allKanji: typeof state.kanji;
    let allSets: typeof state.sets;
    let allTags: typeof state.tags;
    let setCollection: typeof state.allSets;

    if (state === undefined) {
        return Object.assign({}, initialState);
    }

    switch (action.type) {
        case DATA_AVAILABLE:
            return {
                ...state,
                kanji: action.payload.kanji,
                sets: action.payload.sets,
                tags: action.payload.tags,
                allSets: action.payload.allSets
            };
        case TOGGLE_RETEST:
            let kanjiToRetest = state.kanji[action.payload];
            kanjiToRetest = {
                ...kanjiToRetest,
                retest: !kanjiToRetest.retest
            };
            return {
                ...state,
                kanji: {
                    ...state.kanji,
                    [kanjiToRetest.character]: kanjiToRetest
                }
            };
        case CLEAR_RETEST:
            return {
                ...state,
                kanji: clearAllRetestFlags(state.kanji)
            };
        case SAVE_NEW_SET:
            const newSetID: string = (
                _(state.sets).reduce((accumulator: number, set) => {
                    const setID = parseInt(set.id);
                    return accumulator > setID ? accumulator : setID;
                }, 0) + 1
            ).toString();
            return {
                ...state,
                sets: {
                    ...state.sets,
                    [newSetID]: {
                        id: newSetID,
                        name: action.payload.name,
                        kanji: action.payload.kanji.slice()
                    }
                },
                allSets: state.allSets.concat(newSetID)
            };
        case SAVE_EXISTING_SET:
            return {
                ...state,
                sets: {
                    ...state.sets,
                    [action.payload.id]: {
                        id: action.payload.id,
                        name: action.payload.name,
                        kanji: action.payload.kanji.slice()
                    }
                }
            };
        case SAVE_NEW_CARD:
            const updatedSets = { ...state.sets };
            for (const setID of action.payload.sets) {
                updatedSets[setID] = {
                    ...state.sets[setID],
                    kanji: state.sets[setID].kanji.concat(action.payload.kanji)
                };
            }
            //
            return {
                ...state,
                sets: updatedSets,
                kanji: {
                    ...state.kanji,
                    [action.payload.kanji]: {
                        character: action.payload.kanji,
                        meaning: action.payload.meaning,
                        notes: action.payload.hint,
                        tags: action.payload.tags.slice().sort(),
                        onyomi: action.payload.kunyomi,
                        kunyomi: action.payload.onyomi,
                        retest: false
                    }
                }
            };
        case SAVE_EXISTING_CARD:
            // Much easier than it could be because we know the character itself (and hence
            // the record ID) hasn't changed.
            return {
                ...state,
                kanji: {
                    ...state.kanji,
                    [action.payload.kanji]: {
                        character: action.payload.kanji,
                        meaning: action.payload.meaning,
                        notes: action.payload.hint,
                        tags: action.payload.tags.slice().sort(),
                        onyomi: action.payload.kunyomi,
                        kunyomi: action.payload.onyomi,
                        retest: state.kanji[action.payload.id].retest
                    }
                }
            };
        case SAVE_NEW_TAG:
            return {
                ...state,
                tags: {
                    ...state.tags,
                    [action.payload.toLowerCase()]: {
                        id: action.payload.toLowerCase(),
                        name: action.payload
                    }
                }
            };
        case DELETE_SET:
            allSets = { ...state.sets };
            delete allSets[action.payload];
            setCollection = _(state.allSets)
                .without(action.payload)
                .value();
            return {
                ...state,
                sets: allSets,
                allSets: setCollection
            };
        case DELETE_CARD:
            allKanji = { ...state.kanji };
            delete allKanji[action.payload];
            allSets = { ...state.sets };
            for (let key in allSets) {
                const set = allSets[key];
                if (set.kanji.indexOf(action.payload) >= 0) {
                    // There's something to delete.
                    allSets[key] = {
                        ...set,
                        kanji: _(set.kanji)
                            .without(action.payload)
                            .value()
                    };
                }
            }
            return {
                ...state,
                kanji: allKanji,
                sets: allSets
            };
        case DELETE_TAG:
            allTags = { ...state.tags };
            delete allTags[action.payload];
            allKanji = { ...state.kanji };
            for (let kanjiID in allKanji) {
                const kanji = allKanji[kanjiID];
                const tagIndex = kanji.tags.indexOf(action.payload);
                if (tagIndex >= 0) {
                    // There's something to delete.
                    allKanji[kanjiID] = {
                        ...kanji,
                        tags: kanji.tags
                            .slice(0, tagIndex)
                            .concat(kanji.tags.slice(tagIndex + 1))
                    };
                }
            }
            return {
                ...state,
                tags: allTags,
                kanji: allKanji
            };
        case APPLY_CHANGES_TO_FILTERED:
            if (action.payload.cardIDs.length > 0) {
                /// hoooookay
                const newState: AssetsState = { ...state };
                if (
                    action.payload.tagsToAdd.length > 0 ||
                    action.payload.tagsToRemove.length > 0
                ) {
                    newState.kanji = { ...state.kanji };
                    for (let cardID of action.payload.cardIDs) {
                        const updatedKanji = { ...state.kanji[cardID] };

                        for (let tag of action.payload.tagsToAdd) {
                            if (updatedKanji.tags.indexOf(tag) < 0)
                                updatedKanji.tags = updatedKanji.tags.concat(
                                    tag
                                );
                        }

                        for (let tag of action.payload.tagsToRemove) {
                            const tagIndex = updatedKanji.tags.indexOf(tag);
                            if (tagIndex >= 0) {
                                updatedKanji.tags = updatedKanji.tags
                                    .slice(0, tagIndex)
                                    .concat(
                                        updatedKanji.tags.slice(tagIndex + 1)
                                    );
                            }
                        }

                        newState.kanji[updatedKanji.character] = updatedKanji;
                    }
                }
                if (
                    action.payload.setsToAdd.length > 0 ||
                    action.payload.setsToRemove.length > 0
                ) {
                    newState.sets = { ...state.sets };
                    for (let setID of action.payload.setsToAdd) {
                        // clone stuff
                        const updatedSet = { ...newState.sets[setID] };
                        updatedSet.kanji = updatedSet.kanji.slice();

                        // insert cards
                        for (let cardID of action.payload.cardIDs) {
                            if (updatedSet.kanji.indexOf(cardID) < 0) {
                                updatedSet.kanji = updatedSet.kanji.concat(
                                    cardID
                                );
                            }
                        }

                        // Write back the new set
                        newState.sets[updatedSet.id] = updatedSet;
                    }

                    for (let setID of action.payload.setsToRemove) {
                        // clone stuff
                        const updatedSet = { ...newState.sets[setID] };
                        updatedSet.kanji = updatedSet.kanji.slice();

                        // remove cards
                        for (let cardID of action.payload.cardIDs) {
                            const cardIDIndex = updatedSet.kanji.indexOf(
                                cardID
                            );
                            if (cardIDIndex >= 0) {
                                updatedSet.kanji = updatedSet.kanji
                                    .slice(0, cardIDIndex)
                                    .concat(
                                        updatedSet.kanji.slice(
                                            0,
                                            cardIDIndex + 1
                                        )
                                    );
                            }
                        }

                        // And write set back to state
                        newState.sets[updatedSet.id] = updatedSet;
                    }
                }
                return newState;
            } else {
                return state;
            }

        default:
            return state;
    }
}

// Action Creators

export type DeleteSetAction = Action<
    "MorningThunder/assets/DELETE_SET",
    string
>;
export function deleteSet(setID: string): DeleteSetAction {
    return { type: DELETE_SET, payload: setID };
}

export type DeleteCardAction = Action<
    "MorningThunder/assets/DELETE_CARD",
    string
>;
export function deleteCard(cardID: string): DeleteCardAction {
    return { type: DELETE_CARD, payload: cardID };
}

export type DeleteTagAction = Action<
    "MorningThunder/assets/DELETE_TAG",
    string
>;
export function deleteTag(tagID: string): DeleteTagAction {
    return { type: DELETE_TAG, payload: tagID };
}

type ToggleRetestAction = Action<"MorningThunder/assets/TOGGLE_RETEST", string>;
export function toggleRetest(cardID: string): ToggleRetestAction {
    return { type: TOGGLE_RETEST, payload: cardID };
}

type ClearAllRetestAction = Action<"MorningThunder/assets/CLEAR_RETEST", null>;
export function clearAllRetest(): ClearAllRetestAction {
    return { type: CLEAR_RETEST, payload: null };
}
