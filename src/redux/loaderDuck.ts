import { Action, UnhandledAction } from "./Action";
import { Assets, KanjiAsset, SetAsset, TagAsset, LoaderState } from "../common";
import * as _ from "Lodash";

// // Actions
export const DATA_AVAILABLE = "MorningThunder/loader/DATA_AVAILABLE";
export const DATA_LOADED = "MorningThunder/loader/DATA_LOADED";
export const DATA_BAD = "MorningThunder/loader/DATA_BAD";
const EXPORT_DATA = "MorningThunder/loader/EXPORT_DATA";
const FILE_SELECTED_CHANGED = "MorningThunder/loader/FILE_SELECTED_CHANGED";

export type DataSource = "file" | "local" | "remote";
type LoaderAction =
    | DataAvailableAction
    | DataBadAction
    | DataLoadedAction
    | UnhandledAction
    | FileSelectedChangedAction
    | ExportDataAction;

const initialState: LoaderState = {
    dataState: "uninitialized",
    localStorageIsBad: false,
    fileSelected: false,
    selectedFileIsBad: false,
    currentFileName: "Quiz",
    revisionCount: 0,
    error: null
};

// Reducer
export default function reducer(
    state: LoaderState,
    action: LoaderAction
): LoaderState {
    let currentQuizID: string;
    let shuffledKanji: string[];

    if (state === undefined) {
        return Object.assign({}, initialState);
    }

    switch (action.type) {
        case FILE_SELECTED_CHANGED:
            return {
                ...state,
                fileSelected: action.payload,
                selectedFileIsBad: false
            };
        case DATA_BAD:
            const dataState =
                state.dataState === "uninitialized"
                    ? "no_data"
                    : state.dataState; // ??
            if (action.payload === "file") {
                return {
                    ...state,
                    selectedFileIsBad: true,
                    dataState
                };
            } else if (action.payload === "local") {
                return {
                    ...state,
                    localStorageIsBad: true,
                    dataState
                };
            }
        case DATA_LOADED:
            return {
                ...state,
                dataState: "data_loaded"
            };
        default:
            return state;
    }
}

// Action Creators

type FileSelectedChangedAction = Action<
    "MorningThunder/loader/FILE_SELECTED_CHANGED",
    boolean
>;
export function fileSelectionChanged(
    fileIsSelected: boolean
): FileSelectedChangedAction {
    return {
        type: FILE_SELECTED_CHANGED,
        payload: fileIsSelected
    };
}

export type DataAvailableAction = Action<
    "MorningThunder/loader/DATA_AVAILABLE",
    {
        source: DataSource;
        unexportedChanges: boolean;
        kanji: { [id: string]: KanjiAsset };
        sets: { [key: string]: SetAsset };
        tags: { [key: string]: TagAsset };
        allSets: string[];
    }
>;
export function dataAvailable(
    assets: {
        kanji: { [id: string]: KanjiAsset };
        sets: { [key: string]: SetAsset };
        tags: { [key: string]: TagAsset };
        allSets: string[];
    },
    source: DataSource,
    unexportedChanges: boolean
): DataAvailableAction {
    return {
        type: DATA_AVAILABLE,
        payload: {
            ...assets,
            source,
            unexportedChanges
        }
    };
}

export type DataBadAction = Action<
    "MorningThunder/loader/DATA_BAD",
    DataSource
>;
export function dataBad(source: DataSource): DataBadAction {
    return {
        type: DATA_BAD,
        payload: source
    };
}

export type DataLoadedAction = Action<
    "MorningThunder/loader/DATA_LOADED",
    DataSource
>;
export function dataLoaded(source: DataSource): DataLoadedAction {
    return {
        type: DATA_LOADED,
        payload: source
    };
}

type ExportDataAction = Action<"MorningThunder/loader/EXPORT_DATA", null>;
export function exportData(): ExportDataAction {
    return { type: EXPORT_DATA, payload: null };
}
