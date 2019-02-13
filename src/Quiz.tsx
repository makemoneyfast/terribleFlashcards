import * as React from "react";
import * as ReactDom from "react-dom";
import { connect } from "react-redux";
import { Dispatch, Action } from "redux";

import { State, AppMode, eQuizMode, eCardState } from "./common";

import Controls from "./Controls";
import Card from "./Card";
import SetEditor from "./SetEditor";
import CardEditor from "./CardEditor";
import SetsPanel from "./SetsPanel";
import TagsPanel from "./TagsPanel";
import LoadPanel from "./LoadPanel";
import CardManager from "./CardManager";
import SetManager from "./SetManager";
import TagManager from "./TagManager";

import * as _ from "Lodash";

import "./styles/quiz.less";

interface QuizProps {
    appMode: AppMode;
    loaded: boolean;
    currentSetID: string;
    currentTagID: string;
    quizMode: eQuizMode;
}

const mapStateToProps = (state: State): Partial<QuizProps> => {
    const retestCardsExist = _(state.assets.kanji).some(kanji => kanji.retest);

    return {
        appMode: state.app.mode,
        loaded: state.loader.dataState === "data_loaded",
        quizMode: state.quiz.quizMode,
        currentSetID: state.quiz.currentSetID,
        currentTagID: state.quiz.currentTagID
    };
};

const mapDispatchToProps = (dispatch: Dispatch<Action>): Partial<QuizProps> => {
    return {};
};

class BasicQuiz extends React.Component<QuizProps> {
    constructor(props) {
        super(props);
    }

    render() {
        switch (this.props.appMode) {
            case "load_panel":
                return (
                    <div className="quiz">
                        <LoadPanel />
                        <Controls />
                    </div>
                );
            case "quiz":
                return (
                    <div
                        className={
                            this.props.quizMode === eQuizMode.meaning
                                ? "quiz meaning"
                                : "quiz character"
                            // TODO: fix this hack (no reading)
                        }>
                        <Card />
                        <Controls />
                    </div>
                );
            case "sets_panel":
                return (
                    <div className="quiz">
                        <SetsPanel />
                        <Controls />
                    </div>
                );
            case "tags_panel":
                return (
                    <div className="quiz">
                        <TagsPanel />
                        <Controls />
                    </div>
                );
            case "set_editor":
                return (
                    <div className="quiz">
                        <SetEditor />
                        <Controls />
                    </div>
                );
            case "card_editor":
                return (
                    <div className="quiz">
                        <CardEditor />
                        <Controls />
                    </div>
                );
            case "card_manager":
                return (
                    <div className="quiz">
                        <CardManager />
                        <Controls />
                    </div>
                );
            case "set_manager":
                return (
                    <div className="quiz">
                        <SetManager />
                        <Controls />
                    </div>
                );
            case "tag_manager":
                return (
                    <div className="quiz">
                        <TagManager />
                        <Controls />
                    </div>
                );
        }
    }
}

const Quiz = connect(
    mapStateToProps,
    mapDispatchToProps
)(BasicQuiz);

export default Quiz;
