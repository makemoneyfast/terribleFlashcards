import * as React from "react";
import * as ReactDom from "react-dom";
import { connect } from "react-redux";
import { Dispatch, Action } from "redux";
import * as _ from "Lodash";

import { changeAppState } from "./redux/appDuck";
import { thunkStartSetQuiz } from "./redux/thunks";

import { State, SetAsset, eCardState } from "./common";

import "./styles/setsPanel.less";

interface SetsPanelProps {
    currentSet: string;
    sets: SetAsset[];

    onStartSetQuiz: (setID: string) => void;
}

const BasicSetsPanel: React.StatelessComponent<SetsPanelProps> = (
    props: SetsPanelProps
) => {
    const quizSelectButtons = [];
    for (let set of props.sets) {
        if (set.kanji.length > 0) {
            if (set.id === props.currentSet) {
                quizSelectButtons.push(
                    <div className="set active" key={set.id}>
                        {set.name} <strong>{set.kanji.length}</strong>
                    </div>
                );
            } else {
                quizSelectButtons.push(
                    <div
                        className="set"
                        key={set.id}
                        onClick={() => {
                            props.onStartSetQuiz(set.id);
                        }}>
                        {set.name} <strong>{set.kanji.length}</strong>
                    </div>
                );
            }
        } else {
            quizSelectButtons.push(
                <div className="set empty" key={set.id}>
                    {set.name}
                </div>
            );
        }
    }

    return (
        <div className="setsPanel">
            <div className="sets">{quizSelectButtons}</div>
        </div>
    );
};

const mapStateToProps: (state: State) => Partial<SetsPanelProps> = (
    state: State
) => {
    const setAssets = state.assets.allSets.map(
        index => state.assets.sets[index]
    );
    return {
        collapsed: state.app.mode !== "sets_panel",
        sets: setAssets,
        currentSet: state.quiz.currentSetID
    };
};

const mapDispatchToProps: (
    dispatch: Dispatch<Action>
) => Partial<SetsPanelProps> = (dispatch: Dispatch<Action>) => {
    return {
        onExpand: () => dispatch(changeAppState("sets_panel")),
        onCollapse: () => dispatch(changeAppState("quiz")),
        onStartSetQuiz: (setID: string) => {
            dispatch(thunkStartSetQuiz(setID) as any); // :(
        }
    };
};

const SetsPanel = connect(mapStateToProps, mapDispatchToProps)(BasicSetsPanel);

export default SetsPanel;
