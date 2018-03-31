import { State, Assets, KanjiAsset, TagAsset, AppMode } from "../common";
import {
    clearAllRetest,
    toggleRetest,
    deleteCard,
    deleteTag,
    deleteSet
} from "./assetsDuck";
import {
    DataSource,
    exportData,
    dataAvailable,
    dataBad,
    dataLoaded
} from "./loaderDuck";
import { changeAppState } from "./appDuck";
import { setQuizSelected, tagQuizSelected, startRetest } from "./quizDuck";
import {
    editNominatedCard,
    saveExistingCard,
    endCardEdit,
    flushBuffer,
    CardEditBuffer,
    editNewCard,
    saveNewCard,
    saveNewTag
} from "./cardEditorDuck";
import {
    SetEditBuffer,
    saveNewSet,
    saveExistingSet,
    endSetEdit
} from "./setEditorDuck";
import {
    applyChangesToFiltered,
    resetFilterParameters
} from "./cardManagerDuck";
import {
    createShuffledArray,
    validateAssets,
    serialiseAssets,
    writeStringToFile,
    saveToLocalStorage,
    getFilteredCardsFromState
} from "./utility";

import * as _ from "Lodash";
import { editNewSet, editNominatedSet } from "./setEditorDuck";

export function thunkAttemptToLoadFromJSON(
    rawJSON: string,
    source: DataSource
) {
    return (dispatch, getState: () => State) => {
        let output;
        let parsingFailed = false;

        if (rawJSON === null) {
            parsingFailed = true;
            dispatch(dataBad(source));
        } else {
            try {
                output = JSON.parse(rawJSON);
            } catch (e) {
                parsingFailed = true;
                dispatch(dataBad(source));
            }
        }

        if (!parsingFailed) {
            if (!validateAssets(output)) {
                dispatch(dataBad(source));
            } else {
                let unsavedChanges;
                if (source === "local") {
                    unsavedChanges = output.unexportedChanges;
                } else {
                    unsavedChanges = false;
                }
                let initialQuizID: string = output.allSets[0];
                output.assets.kanji = _(output.assets.kanji)
                    .map((asset: KanjiAsset) =>
                        _.assign(
                            {
                                onyomi: "",
                                kunyomi: "",
                                tags: [],
                                retest: false
                            },
                            asset
                        )
                    )
                    .keyBy(asset => asset.character)
                    .value();
                output.assets.tags = _(output.assets.tags)
                    .map((asset: TagAsset) =>
                        _.assign(
                            {
                                name: asset.id
                            },
                            asset
                        )
                    )
                    .keyBy(asset => asset.id)
                    .value();
                dispatch(
                    dataAvailable(
                        {
                            kanji: output.assets.kanji,
                            sets: output.assets.sets,
                            tags: output.assets.tags,
                            allSets: output.allSets
                        },
                        source,
                        unsavedChanges
                    )
                );
                dispatch(dataLoaded(source));
                dispatch(thunkFlushToLocalStorage());
                dispatch(thunkStartSetQuiz(initialQuizID));
            }
        }
    };
}

export function thunkFlushToLocalStorage() {
    return (dispatch, getState: () => State) => {
        const state = getState();

        // Write newly loaded state into local storage.
        let newDataSerialised = serialiseAssets(
            state.assets.allSets,
            {
                kanji: state.assets.kanji,
                sets: state.assets.sets,
                tags: state.assets.tags
            },
            {
                unexportedChanges: state.cardEditor.unexportedChanges
            }
        );
        saveToLocalStorage(newDataSerialised);
        dispatch(flushBuffer());
    };
}

export function thunkToggleRetest() {
    return (dispatch, getState: () => State) => {
        const state = getState();
        const currentCardID =
            state.quiz.currentQuiz[state.quiz.currentCardIndex];
        dispatch(toggleRetest(currentCardID));
    };
}

export function thunkStartDefaultQuiz() {
    return (dispatch, getState: () => State) => {
        const state = getState();
        if (!state.assets.allSets || state.assets.allSets.length === 0) {
            console.log("No sets so can't start default quiz :(");
            return;
        } else {
            const setID = state.assets.allSets[0];
            const shuffledCardIDs = createShuffledArray(
                state.assets.sets[setID].kanji
            );
            dispatch(clearAllRetest());
            dispatch(setQuizSelected(setID, shuffledCardIDs));
            dispatch(changeAppState("quiz"));
        }
    };
}

export function thunkStartSetQuiz(setID: string) {
    return (dispatch, getState: () => State) => {
        const state = getState();
        const shuffledCardIDs = createShuffledArray(
            state.assets.sets[setID].kanji
        );
        dispatch(clearAllRetest());
        dispatch(setQuizSelected(setID, shuffledCardIDs));
        dispatch(changeAppState("quiz"));
    };
}

export function thunkStartTagQuiz(tag: string) {
    return (dispatch, getState: () => State) => {
        const state = getState();
        const shuffledCardIDs = createShuffledArray(
            _(state.assets.kanji)
                .filter(kanji => kanji.tags.indexOf(tag) > -1)
                .map(kanji => kanji.character)
                .value()
        );
        dispatch(clearAllRetest());
        dispatch(tagQuizSelected(tag, shuffledCardIDs));
        dispatch(changeAppState("quiz"));
    };
}

export function thunkStartRetest() {
    return (dispatch, getState: () => State) => {
        let IDsOfKanjiToRetest: string[] = _(getState().assets.kanji)
            .filter(kanji => kanji.retest)
            .map(kanji => kanji.character)
            .value();
        IDsOfKanjiToRetest = createShuffledArray(IDsOfKanjiToRetest);
        dispatch(clearAllRetest());
        dispatch(startRetest(IDsOfKanjiToRetest));
    };
}

export function thunkEditNewSet(modeOnExit: AppMode) {
    return (dispatch, getState: () => State) => {
        dispatch(editNewSet());
        dispatch(changeAppState("set_editor", modeOnExit));
    };
}

export function thunkEditNominatedSet(id: string, modeOnExit: AppMode) {
    return (dispatch, getState: () => State) => {
        const state = getState();
        const set = state.assets.sets[id];
        if (set !== undefined) {
            dispatch(
                editNominatedSet({
                    id: set.id,
                    name: set.name,
                    kanji: set.kanji
                })
            );
            dispatch(changeAppState("set_editor", modeOnExit));
        }
    };
}

export function thunkEditNewCard(modeOnExit: AppMode) {
    return (dispatch, getState: () => State) => {
        dispatch(editNewCard());
        dispatch(changeAppState("card_editor", modeOnExit));
    };
}

export function thunkEditNominatedCard(id: string, modeOnExit: AppMode) {
    return (dispatch, getState: () => State) => {
        const state = getState();
        const kanji = state.assets.kanji[id];
        if (kanji !== undefined) {
            dispatch(
                editNominatedCard({
                    id: kanji.character,
                    kanji: kanji.character,
                    hint: kanji.notes,
                    meaning: kanji.meaning,
                    kunyomi: kanji.kunyomi,
                    onyomi: kanji.onyomi,
                    tags: kanji.tags ? kanji.tags : [],
                    sets: []
                })
            );
            dispatch(changeAppState("card_editor", modeOnExit));
        }
    };
}

export function thunkEditCurrentCard(modeOnExit: AppMode) {
    return (dispatch, getState: () => State) => {
        const state = getState();
        if (state.quiz.currentQuiz.length > 0) {
            const kanjiID = state.quiz.currentQuiz[state.quiz.currentCardIndex];
            dispatch(thunkEditNominatedCard(kanjiID, modeOnExit));
        }
    };
}

export function thunkSaveNewTagAndFlush(tagName: string) {
    return (dispatch, getState: () => State) => {
        dispatch(saveNewTag(tagName));
        dispatch(thunkFlushToLocalStorage() as any);
    };
}

export function thunkSaveSetBufferContentsAndExit() {
    return (dispatch, getState: () => State) => {
        const state = getState();
        let changes: SetEditBuffer;
        if (state.setEditor.newSet) {
            changes = {
                id: null,
                name: state.setEditor.name,
                kanji: state.setEditor.kanji.slice()
            };
            dispatch(saveNewSet(changes));
        } else {
            changes = {
                id: state.setEditor.id,
                name: state.setEditor.name,
                kanji: state.setEditor.kanji.slice()
            };
            dispatch(saveExistingSet(changes));
        }
        dispatch(thunkFlushToLocalStorage());
        dispatch(endSetEdit());
        dispatch(changeAppState(state.setEditor.modeOnExit, null));
    };
}

export function thunkSaveCardBufferContentsAndExit() {
    return (dispatch, getState: () => State) => {
        const state = getState();
        let changes: CardEditBuffer;
        if (state.cardEditor.newCard) {
            changes = {
                id: null,
                kanji: state.cardEditor.kanji,
                hint: state.cardEditor.hint,
                meaning: state.cardEditor.meaning,
                kunyomi: state.cardEditor.kunyomi,
                onyomi: state.cardEditor.onyomi,
                tags: state.cardEditor.tags,
                sets: state.cardEditor.sets
            };
            dispatch(saveNewCard(changes));
        } else {
            changes = {
                id: state.cardEditor.kanji,
                kanji: state.cardEditor.kanji,
                hint: state.cardEditor.hint,
                meaning: state.cardEditor.meaning,
                kunyomi: state.cardEditor.kunyomi,
                onyomi: state.cardEditor.onyomi,
                tags: state.cardEditor.tags,
                sets: []
            };
            dispatch(saveExistingCard(changes));
        }
        dispatch(thunkFlushToLocalStorage());
        dispatch(endCardEdit());
        dispatch(changeAppState(state.cardEditor.modeOnExit, null));
    };
}

export function thunkEndCardEdit() {
    return (dispatch, getState: () => State) => {
        const state = getState();
        const newMode = state.cardEditor.modeOnExit;
        dispatch(endCardEdit);
        dispatch(changeAppState(newMode));
    };
}

export function thunkEndSetEdit() {
    return (dispatch, getState: () => State) => {
        const state = getState();
        const newMode = state.setEditor.modeOnExit;
        dispatch(endCardEdit);
        dispatch(changeAppState(newMode));
    };
}

export function thunkDeleteSetAndFlush(setID: string) {
    return (dispatch, getState: () => State) => {
        dispatch(deleteSet(setID));
        dispatch(thunkFlushToLocalStorage() as any);
    };
}

export function thunkDeleteCardAndFlush(cardID: string) {
    return (dispatch, getState: () => State) => {
        dispatch(deleteCard(cardID));
        dispatch(thunkFlushToLocalStorage() as any);
    };
}

export function thunkDeleteTagAndFlush(tagID: string) {
    return (dispatch, getState: () => State) => {
        dispatch(deleteTag(tagID));
        dispatch(thunkFlushToLocalStorage() as any);
    };
}

export function thunkApplyChangesToFilteredAndFlush() {
    return (dispatch, getState: () => State) => {
        const state = getState();

        // Apply changes
        dispatch(
            applyChangesToFiltered(
                getFilteredCardsFromState(state),
                state.cardManager.setsToAdd,
                state.cardManager.setsToRemove,
                state.cardManager.tagsToAdd,
                state.cardManager.tagsToRemove
            )
        );

        // Flush
        dispatch(thunkFlushToLocalStorage() as any);

        // Clear editor state. Maybe? Yes.
        dispatch(resetFilterParameters());
    };
}

export function thunkSwitchToEditMode() {
    return (dispatch, getState: () => State) => {
        dispatch(setQuizSelected(null, null));
        dispatch(changeAppState("card_manager"));
    };
}

export function thunkHandleExport() {
    return (dispatch, getState: () => State) => {
        const state = getState();
        // This is the point.
        const output: string = serialiseAssets(state.assets.allSets, {
            kanji: state.assets.kanji,
            sets: state.assets.sets,
            tags: state.assets.tags
        });

        console.log(output);
        writeStringToFile(output, "Quiz.json");
        dispatch(exportData());
    };
}
