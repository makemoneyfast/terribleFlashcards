import * as React from "react";
import * as ReactDom from "react-dom";

import { Dispatch, Action } from "redux";
import { connect } from "react-redux";

import { State } from "./common";
import {
    SetEditBuffer,
    updateSetBufferName,
    removeKanjiFromSetBuffer
} from "./redux/setEditorDuck";

import * as _ from "Lodash";

import "./styles/setEditor.less";

interface SetEditorProps {
    id: string;
    name: string;
    kanji: string[];
    onNameChange: (name: string) => void;
    onKanjiDelete: (kanjiID: string) => void;
}

const BasicSetEditor: React.StatelessComponent<SetEditorProps> = (
    props: SetEditorProps
) => {
    const kanjiElements: JSX.Element[] = [];

    for (let kanji of props.kanji) {
        kanjiElements.push(
            <div className="kanji" key={kanji}>
                {kanji}{" "}
                <input
                    type="button"
                    value="delete"
                    onClick={() => props.onKanjiDelete(kanji)}
                />
            </div>
        );
    }
    return (
        <div className="setEditor">
            Set name:{" "}
            <input
                type="text"
                value={props.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    props.onNameChange(e.target.value)
                }
            />
            <br />
            Kanji: {kanjiElements}
        </div>
    );
};

const mapStateToProps: (state: State) => Partial<SetEditorProps> = (
    state: State
) => {
    return {
        id: state.setEditor.id,
        name: state.setEditor.name,
        kanji: state.setEditor.kanji
    };
};

const mapDispatchToProps: (
    dispatch: Dispatch<Action>
) => Partial<SetEditorProps> = (dispatch: Dispatch<Action>) => {
    return {
        onNameChange: (name: string) => dispatch(updateSetBufferName(name)),
        onKanjiDelete: (kanjiID: string) =>
            dispatch(removeKanjiFromSetBuffer(kanjiID))
    };
};

const SetEditor = connect(mapStateToProps, mapDispatchToProps)(BasicSetEditor);
export default SetEditor;
