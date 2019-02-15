import * as React from "React";
import * as ReactDom from "react-dom";
import { Action, Dispatch } from "redux";
import { connect } from "react-redux";

import { State } from "./common";
import { changeAppState } from "./redux/appDuck";
import { thunkEditNominatedSet, thunkDeleteSetAndFlush } from "./redux/thunks";

import * as _ from "Lodash";

import "./styles/setManager.less";

interface SetManagerProps {
    sets: { name: string; cardCount: number; id: string }[];
    onEditSet: (setID: string) => void;
    onDeleteSet: (setID: string) => void;
}

const BasicSetManager: React.StatelessComponent<SetManagerProps> = (
    props: SetManagerProps
) => {
    const sets = _(props.sets)
        .map(set => (
            <div key={set.id} className="set">
                {set.name} <strong>{set.cardCount}</strong>
                <input
                    type="button"
                    value="edit"
                    onClick={() => props.onEditSet(set.id)}
                />
                <input
                    type="button"
                    value="delete"
                    onClick={() => props.onDeleteSet(set.id)}
                />
            </div>
        ))
        .value();
    return <div className="setManager">{sets}</div>;
};

const mapStateToProps: (state: State) => Partial<SetManagerProps> = (
    state: State
) => {
    const sets = _(state.assets.sets)
        .map(set => ({
            name: set.name,
            cardCount: set.kanji.length,
            id: set.id
        }))
        .value();
    return { sets };
};

const mapDispatchToProps: (
    dispatch: Dispatch<Action>
) => Partial<SetManagerProps> = (dispatch: Dispatch<Action>) => {
    return {
        onEditSet: (setID: string) =>
            dispatch(thunkEditNominatedSet(setID, "set_manager") as any),
        onDeleteSet: (setID: string) =>
            dispatch(thunkDeleteSetAndFlush(setID) as any)
    };
};

const SetManager = connect(
    mapStateToProps,
    mapDispatchToProps
)(BasicSetManager);

export default SetManager;
