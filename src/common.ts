export enum eQuizMode {
    character,
    reading,
    meaning
}
export enum eCardState {
    question = 0,
    hint = 1,
    answer = 2
}

export interface Assets {
    sets: SetAsset[];
}

export interface SetAsset {
    name: string;
    kanji: string[];
    id: string;
}
export interface KanjiAsset {
    character: string;
    meaning: string;
    notes: string;
    onyomi: string;
    kunyomi: string;
    tags?: string[]; // radicals. Maybe separate tag list for themes?
    retest?: boolean; // Not defined in data but added on import.
}

export interface TagAsset {
    id: string;
    name: string;
}

export interface State {
    app: AppState;
    assets: AssetsState;
    quiz: QuizState;
    setEditor: SetEditorState;
    cardEditor: CardEditorState;
    loader: LoaderState;
    cardManager: CardManagerState;
}

export interface AssetsState {
    kanji: { [key: string]: KanjiAsset };
    sets: { [key: string]: SetAsset };
    tags: { [key: string]: TagAsset };
    allSets: string[];
}

export type AppMode =
    | "load_panel"
    | "quiz"
    | "tags_panel"
    | "sets_panel"
    | "set_editor"
    | "card_editor"
    | "card_manager"
    | "set_manager"
    | "tag_manager";

export interface AppState {
    mode: AppMode;
}

export interface QuizState {
    // Quiz

    // This needs to be sufficient.
    // Should the 'Can we retest' be here? No, it's redundant.
    // Should it be in the component?

    currentSetID: string; // Indicates which set's button should be disabled, so can be null.
    currentTagID: string; // Indicates which tag's button should be disabled, so can be null.
    currentQuiz: string[]; // Arbitrary array of card IDs, shuffled
    currentCardIndex: number; // Index into currentQuiz
    quizMode: eQuizMode;
    cardState: eCardState;
    retesting: boolean;
}

export interface SetEditorState {
    newSet: boolean;
    id: string;
    name: string;
    kanji: string[];
    modeOnExit: AppMode;
}

export interface CardEditorState {
    id: string;
    kanji: string;
    hint: string;
    meaning: string;
    kunyomi: string;
    onyomi: string;
    tags: string[];
    sets: string[];
    tagSearchText: string;
    newCard: boolean;
    unexportedChanges: boolean;
    unflushedChanges: boolean;
    modeOnExit: AppMode;
}

// This belongs in a duck?
export interface LoaderState {
    dataState: "uninitialized" | "no_data" | "data_loaded";
    localStorageIsBad: boolean;
    fileSelected: boolean;
    selectedFileIsBad: boolean;
    currentFileName: string;
    revisionCount: number;
    error: string;
}

export interface CardManagerState {
    selectedCards: string[];

    // Filter parameters
    // Filter in
    matchSelectedForInclude: boolean;
    searchTextForInclude: string;
    matchKanjiForInclude: boolean;
    matchHintForInclude: boolean;
    matchMeaningForInclude: boolean;
    matchKunyomiForInclude: boolean;
    matchOnyomiForInclude: boolean;
    tagSearchTextForInclude: string;
    tagsForInclude: string[];
    setsForInclude: string[];
    // Filter out
    matchSelectedForExclude: boolean;
    searchTextForExclude: string;
    matchKanjiForExclude: boolean;
    matchHintForExclude: boolean;
    matchMeaningForExclude: boolean;
    matchKunyomiForExclude: boolean;
    matchOnyomiForExclude: boolean;
    tagSearchTextForExclude: string;
    tagsForExclude: string[];
    setsForExclude: string[];

    // Selection edit properties
    setsToAdd: string[];
    setsToRemove: string[];
    tagsToAdd: string[];
    tagsToRemove: string[];
    tagsToAddSearchText: string;
    tagsToRemoveSearchText: string;
}
