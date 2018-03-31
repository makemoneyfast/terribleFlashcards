import * as React from "React";
import * as ReactDom from "react-dom";
import { Action, Dispatch } from "redux";
import { connect } from "react-redux";

import { State } from "./common";
import { changeAppState } from "./redux/appDuck";
import { thunkDeleteTagAndFlush } from "./redux/thunks";

import * as _ from "Lodash";

import "./styles/tagManager.less";
interface TagManagerProps {
    tags: { name: string; id: string }[];
    onTagDelete: (tagID: string) => void;
}

const BasicTagManager: React.StatelessComponent<TagManagerProps> = (
    props: TagManagerProps
) => {
    const tags = _(props.tags)
        .sortBy(tag => tag.id)
        .map(tag => (
            <div key={tag.id} className="tag">
                {tag.name}
                <input type="button" value="edit" />
                <input
                    type="button"
                    value="delete"
                    onClick={() => props.onTagDelete(tag.id)}
                />
            </div>
        ))
        .value();
    return (
        <div className="tagManager">
            <div className="tags">{tags}</div>
        </div>
    );
};

const mapStateToProps: (state: State) => Partial<TagManagerProps> = (
    state: State
) => {
    const tags = _(state.assets.tags)
        .map(tag => ({ id: tag.id, name: tag.name }))
        .value();
    return { tags };
};

const mapDispatchToProps: (
    dispatch: Dispatch<Action>
) => Partial<TagManagerProps> = (dispatch: Dispatch<Action>) => {
    return {
        onTagDelete: (tagID: string) =>
            dispatch(thunkDeleteTagAndFlush(tagID) as any)
    };
};

const TagManager = connect(mapStateToProps, mapDispatchToProps)(
    BasicTagManager
);

export default TagManager;
