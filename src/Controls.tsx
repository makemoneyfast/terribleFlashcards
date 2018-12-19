import * as React from "react";
import * as ReactDom from "react-dom";
import { connect } from "react-redux";
import { Dispatch, Action } from "redux";

import { State, AppMode, eQuizMode, eCardState } from "./common";
import { endCardEdit, CardEditBuffer } from "./redux/cardEditorDuck";

import { quizModeChanged } from "./redux/quizDuck";
import {
    thunkEditNewSet,
    thunkEditNominatedSet,
    thunkEditNewCard,
    thunkEditCurrentCard,
    thunkEditNominatedCard,
    thunkEndCardEdit,
    thunkEndSetEdit,
    thunkStartDefaultQuiz,
    thunkStartSetQuiz,
    thunkStartTagQuiz,
    thunkStartRetest,
    thunkSwitchToEditMode,
    thunkSaveSetBufferContentsAndExit,
    thunkSaveCardBufferContentsAndExit
} from "./redux/thunks";
import { changeAppState } from "./redux/appDuck";

import * as _ from "Lodash";

import "./styles/quiz.less";

interface ControlsProps {
    appMode: AppMode;
    loaded: boolean;
    currentSetID: string;
    currentTagID: string;
    quizMode: eQuizMode;
    canRestart: boolean;
    canRetest: boolean;
    quizzesAvailable: boolean;
    quizInProgress: boolean;

    setIsNew: boolean;
    unsavedSetChanges: boolean;
    okToSaveSet: boolean;

    cardIsNew: boolean;
    unsavedCardChanges: boolean;
    okToSaveCard: boolean;

    onEditNewSet: (modeOnExit: AppMode) => void;
    onEditExistingSet: (setID: string, modeOnExit: AppMode) => void;
    onEditNewCard: (modeOnExit: AppMode) => void;
    onEditCurrentCard: (modeOnExit: AppMode) => void;
    onEditExistingCard: (cardID: string, modeOnExit: AppMode) => void;
    onSaveSet: () => void;
    onSaveCard: () => void;
    onCancelCardEdit: () => void;
    onCancelSetEdit: () => void;
    onChangeQuizMode: () => void;
    onStartRetest: () => void;
    onRestart: (currentSetID: string, currentTagID: string) => void;
    onSwitchToSets: () => void;
    onSwitchToTags: () => void;
    onStartDefaultQuiz: () => void;
    onResumeQuiz: () => void;
    onSwitchToEditMode: () => void;
    onSwitchToCardManager: () => void;
    onSwitchToSetsManager: () => void;
    onSwitchToTagsManager: () => void;
    onSwitchToLoader: () => void;
}

const mapStateToProps = (state: State): Partial<ControlsProps> => {
    const retestCardsExist = _(state.assets.kanji).some(kanji => kanji.retest);
    const canRestart =
        state.quiz.cardState === eCardState.answer &&
        state.quiz.currentCardIndex === state.quiz.currentQuiz.length - 1;
    const canRetest = canRestart && retestCardsExist;
    const quizInProgress =
        state.quiz.currentSetID !== null &&
        state.quiz.currentTagID !== undefined;
    const quizzesAvailable =
        state.assets.allSets && state.assets.allSets.length > 0;

    let unsavedSetChanges = false;
    let okToSaveSet = false;

    let unsavedCardChanges = false;
    let okToSaveCard = false;

    if (state.setEditor.newSet) {
        // Editing a new character
        unsavedSetChanges = state.setEditor.name !== "";
        okToSaveSet = unsavedSetChanges;
    } else {
        if (state.setEditor.id !== null) {
            // Editing an existing character
            const original = state.assets.sets[state.setEditor.id];
            if (
                state.setEditor.name !== original.name ||
                state.setEditor.kanji.toString() !==
                    (original.kanji ? original.kanji.toString() : "")
            ) {
                unsavedSetChanges = true;
            }
            okToSaveSet = unsavedSetChanges;
        } else {
            // Not editing
            unsavedSetChanges = false;
            okToSaveSet = false;
        }
    }

    if (state.cardEditor.newCard) {
        // Editing a new character
        unsavedCardChanges =
            state.cardEditor.kanji !== "" ||
            state.cardEditor.hint !== "" ||
            state.cardEditor.meaning !== "" ||
            state.cardEditor.onyomi !== "" ||
            state.cardEditor.kunyomi !== "" ||
            state.cardEditor.tags.length !== 0;

        okToSaveCard = true;
        if (state.cardEditor.kanji === "") {
            // Have to have a key to save against at least
            okToSaveCard = false;
        } else if (state.cardEditor.sets.length === 0) {
            // Have to be assigning to at least one set
            okToSaveCard = false;
        } else if (state.assets.kanji[state.cardEditor.kanji] !== undefined) {
            // kanji has to not exist yet
            okToSaveCard = false;
        }
    } else {
        if (state.cardEditor.kanji !== null) {
            // Editing an existing character
            const original = state.assets.kanji[state.cardEditor.kanji];
            if (
                state.cardEditor.kanji !== original.character ||
                state.cardEditor.hint !== original.notes ||
                state.cardEditor.meaning !== original.meaning ||
                state.cardEditor.onyomi !== original.onyomi ||
                state.cardEditor.kunyomi !== original.kunyomi ||
                state.cardEditor.tags.toString() !== original.tags.toString()
            ) {
                unsavedCardChanges = true;
            }
            okToSaveCard = unsavedCardChanges;
        } else {
            // Not editing
            unsavedCardChanges = false;
            okToSaveCard = false;
        }
    }
    return {
        appMode: state.app.mode,
        loaded: state.loader.dataState === "data_loaded",
        quizMode: state.quiz.quizMode,
        currentSetID: state.quiz.currentSetID,
        currentTagID: state.quiz.currentTagID,
        canRestart,
        canRetest,
        quizzesAvailable,
        quizInProgress,

        cardIsNew: state.cardEditor.newCard,
        unsavedCardChanges,
        okToSaveCard,

        setIsNew: state.setEditor.newSet,
        unsavedSetChanges,
        okToSaveSet
    };
};

const mapDispatchToProps = (
    dispatch: Dispatch<Action>
): Partial<ControlsProps> => {
    return {
        onEditNewSet: (modeOnExit: AppMode) =>
            dispatch(thunkEditNewSet(modeOnExit) as any),
        onEditExistingSet: (setID: string, modeOnExit: AppMode) =>
            dispatch(thunkEditNominatedSet(setID, modeOnExit) as any),
        onEditNewCard: (modeOnExit: AppMode) =>
            dispatch(thunkEditNewCard(modeOnExit) as any),
        onEditExistingCard: (cardID: string, modeOnExit: AppMode) =>
            dispatch(thunkEditNominatedCard(cardID, modeOnExit) as any),
        onEditCurrentCard: (modeOnExit: AppMode) =>
            dispatch(thunkEditCurrentCard(modeOnExit) as any),
        onSaveSet: () => dispatch(thunkSaveSetBufferContentsAndExit() as any),
        onSaveCard: () => dispatch(thunkSaveCardBufferContentsAndExit() as any),
        onCancelCardEdit: () => dispatch(thunkEndCardEdit() as any),
        onCancelSetEdit: () => dispatch(thunkEndSetEdit() as any),
        onChangeQuizMode: () => dispatch(quizModeChanged()),
        onRestart: (currentSetID: string, currentTagID: string) => {
            if (typeof currentSetID === "string") {
                dispatch(thunkStartSetQuiz(currentSetID) as any);
            } else {
                dispatch(thunkStartTagQuiz(currentTagID) as any);
            }
        },
        onStartRetest: () => dispatch(thunkStartRetest() as any),
        onSwitchToSets: () => dispatch(changeAppState("sets_panel")),
        onSwitchToTags: () => dispatch(changeAppState("tags_panel")),
        onStartDefaultQuiz: () => dispatch(thunkStartDefaultQuiz() as any),
        onResumeQuiz: () => dispatch(changeAppState("quiz")),
        onSwitchToEditMode: () => dispatch(thunkSwitchToEditMode() as any),
        onSwitchToCardManager: () => dispatch(changeAppState("card_manager")),
        onSwitchToSetsManager: () => dispatch(changeAppState("set_manager")),
        onSwitchToTagsManager: () => dispatch(changeAppState("tag_manager")),
        onSwitchToLoader: () => dispatch(changeAppState("load_panel"))
    };
};

interface ControlItem {
    caption: string;
    handler?: () => void;
}

class BasicControls extends React.Component<ControlsProps> {
    constructor(props) {
        super(props);
    }

    render() {
        let quizControls: ControlItem[];

        let quizControl: ControlItem;
        let saveControl: ControlItem;
        let disabledQuizControl: ControlItem;
        let restartControlArray: ControlItem[];
        let disabledRestartControlArray: ControlItem[]; // populate these!
        let retestControlArray: ControlItem[];
        let disabledRetestControlArray: ControlItem[];
        let modeControl: ControlItem;
        let disabledModeControl: ControlItem;

        if (this.props.quizzesAvailable) {
            if (this.props.quizInProgress) {
                quizControl = {
                    caption: "Resume quiz",
                    handler: this.props.onResumeQuiz
                };
                disabledQuizControl = { caption: "Resume quiz" };
            } else {
                quizControl = {
                    caption: "Start quiz",
                    handler: this.props.onStartDefaultQuiz
                };
                disabledQuizControl = { caption: "Start quiz" };
            }
        } else {
            quizControl = disabledQuizControl = {
                caption: "No quizzes defined"
            };
        }

        let disabledRestartControls = this.props.canRestart
            ? [{ caption: "Restart this test" }]
            : [];
        let disabledRetestControls = this.props.canRetest
            ? [{ caption: "Start retest" }]
            : [];
        let restartControls = this.props.canRestart
            ? [
                  {
                      caption: "Restart this test",
                      handler: () =>
                          this.props.onRestart(
                              this.props.currentSetID,
                              this.props.currentTagID
                          )
                  }
              ]
            : [];
        let retestControls = this.props.canRetest
            ? [{ caption: "Start retest", handler: this.props.onStartRetest }]
            : [];

        switch (this.props.quizMode) {
            case eQuizMode.character:
                modeControl = {
                    caption: "Test meanings",
                    handler: this.props.onChangeQuizMode
                };
                disabledModeControl = { caption: "Test meanings" };
                break;
            case eQuizMode.meaning:
                modeControl = {
                    caption: "Test characters",
                    handler: this.props.onChangeQuizMode
                };
                disabledModeControl = { caption: "Test characters" };
                break;
        }

        switch (this.props.appMode) {
            case "load_panel":
                quizControls = [
                    quizControl,
                    {
                        caption: "Edit Mode",
                        handler: this.props.onSwitchToEditMode
                    },
                    {
                        caption: "Load and save"
                    }
                ];
                break;
            case "quiz":
                quizControls = [].concat(
                    [
                        {
                            handler: () => this.props.onEditCurrentCard("quiz"),
                            caption: "Edit this card"
                        },
                        modeControl
                    ],
                    restartControls,
                    retestControls,
                    [
                        {
                            caption: "Sets",
                            handler: this.props.onSwitchToSets
                        },
                        {
                            caption: "Tags",
                            handler: this.props.onSwitchToTags
                        },
                        {
                            caption: "Edit Mode",
                            handler: this.props.onSwitchToEditMode
                        },
                        {
                            caption: "Load and Save",
                            handler: this.props.onSwitchToLoader
                        }
                    ]
                );
                break;
            case "sets_panel":
                quizControls = [
                    quizControl,
                    {
                        caption: "Sets"
                    },
                    {
                        caption: "Tags",
                        handler: this.props.onSwitchToTags
                    },
                    {
                        caption: "Edit Mode",
                        handler: this.props.onSwitchToEditMode
                    },
                    {
                        caption: "Load and Save",
                        handler: this.props.onSwitchToLoader
                    }
                ];
                break;
            case "tags_panel":
                quizControls = [
                    quizControl,
                    {
                        caption: "Sets",
                        handler: this.props.onSwitchToSets
                    },
                    {
                        caption: "Tags"
                    },
                    {
                        caption: "Edit Mode",
                        handler: this.props.onSwitchToEditMode
                    },
                    {
                        caption: "Load and Save",
                        handler: this.props.onSwitchToLoader
                    }
                ];
                break;
            case "card_editor":
                if (this.props.cardIsNew) {
                    if (this.props.okToSaveCard) {
                        saveControl = {
                            caption: "Save",
                            handler: this.props.onSaveCard
                        };
                    } else {
                        saveControl = { caption: "Save" };
                    }
                } else {
                    if (this.props.unsavedCardChanges) {
                        saveControl = {
                            caption: "Save",
                            handler: this.props.onSaveCard
                        };
                    } else {
                        saveControl = { caption: "Save" };
                    }
                }
                quizControls = [
                    saveControl,
                    {
                        caption: "Cancel",
                        handler: this.props.onCancelCardEdit
                    }
                ];
                break;
            case "set_editor":
                if (this.props.setIsNew) {
                    if (this.props.okToSaveSet) {
                        saveControl = {
                            caption: "Save",
                            handler: this.props.onSaveSet
                        };
                    } else {
                        saveControl = { caption: "Save" };
                    }
                } else {
                    if (this.props.unsavedSetChanges) {
                        saveControl = {
                            caption: "Save",
                            handler: this.props.onSaveSet
                        };
                    } else {
                        saveControl = { caption: "Save" };
                    }
                }
                quizControls = [
                    saveControl,
                    {
                        caption: "Cancel",
                        handler: this.props.onCancelSetEdit
                    }
                ];
                break;
            case "card_manager":
                quizControls = [
                    quizControl,
                    {
                        caption: "Make a new card",
                        handler: () => this.props.onEditNewCard("card_manager")
                    },
                    {
                        caption: "Make a new set",
                        handler: () => this.props.onEditNewSet("card_manager")
                    },
                    {
                        caption: "Manage cards"
                    },
                    {
                        caption: "Manage sets",
                        handler: this.props.onSwitchToSetsManager
                    },
                    {
                        caption: "Manage tags",
                        handler: this.props.onSwitchToTagsManager
                    },
                    {
                        caption: "Load and Save",
                        handler: this.props.onSwitchToLoader
                    }
                ];
                break;
            case "set_manager":
                quizControls = [
                    quizControl,
                    {
                        caption: "Make a new card",
                        handler: () => this.props.onEditNewCard("set_manager")
                    },
                    {
                        caption: "Make a new set",
                        handler: () => this.props.onEditNewSet("set_manager")
                    },
                    {
                        caption: "Manage cards",
                        handler: this.props.onSwitchToCardManager
                    },
                    {
                        caption: "Manage sets"
                    },
                    {
                        caption: "Manage tags",
                        handler: this.props.onSwitchToTagsManager
                    },
                    {
                        caption: "Load and Save",
                        handler: this.props.onSwitchToLoader
                    }
                ];
                break;
            case "tag_manager":
                quizControls = [
                    quizControl,
                    {
                        caption: "Make a new card",
                        handler: () => this.props.onEditNewCard("tag_manager")
                    },
                    {
                        caption: "Make a new set",
                        handler: () => this.props.onEditNewSet("tag_manager")
                    },
                    {
                        caption: "Manage cards",
                        handler: this.props.onSwitchToCardManager
                    },
                    {
                        caption: "Manage sets",
                        handler: this.props.onSwitchToSetsManager
                    },
                    {
                        caption: "Manage tags"
                    },
                    {
                        caption: "Load and Save",
                        handler: this.props.onSwitchToLoader
                    }
                ];
                break;
        }

        return (
            <div className="controls">
                {_(quizControls)
                    .map(item => {
                        if (item.handler) {
                            return (
                                <div
                                    key={item.caption}
                                    className="control-button button"
                                    onClick={item.handler}>
                                    {item.caption}
                                </div>
                            );
                        } else {
                            return (
                                <div
                                    key={item.caption}
                                    className="control-button button disabled">
                                    {item.caption}
                                </div>
                            );
                        }
                    })
                    .value()}
            </div>
        );
    }
}

const Controls = connect(
    mapStateToProps,
    mapDispatchToProps
)(BasicControls);

export default Controls;
