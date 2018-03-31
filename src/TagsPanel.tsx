import * as React from "react";
import * as ReactDom from "react-dom";
import { connect } from "react-redux";
import { Dispatch, Action } from "redux";
import * as _ from "Lodash";

import { TagAsset } from "./common";
import { changeAppState } from "./redux/appDuck";
import { thunkStartTagQuiz } from "./redux/thunks";

import { State, SetAsset, eCardState } from "./common";

import "./styles/tagsPanel.less";

interface TagsPanelProps {
    currentTag: string;
    tags: { name: string; id: string; cardCount: number }[];

    onStartTagQuiz: (tag: string) => void;
}

const BasicTagsPanel: React.StatelessComponent<TagsPanelProps> = (
    props: TagsPanelProps
) => {
    const tagSelectButtons = [];
    for (let tag of props.tags) {
        if (tag.cardCount > 0) {
            if (tag.id === props.currentTag) {
                tagSelectButtons.push(
                    <div className="tag active" key={tag.id}>
                        {tag.name} <strong>{tag.cardCount}</strong>
                    </div>
                );
            } else {
                tagSelectButtons.push(
                    <div
                        className="tag"
                        key={tag.id}
                        onClick={() => {
                            props.onStartTagQuiz(tag.id);
                        }}>
                        {tag.name} <strong>{tag.cardCount}</strong>
                    </div>
                );
            }
        } else {
            tagSelectButtons.push(
                <div className="tag empty" key={tag.id}>
                    {tag.id}
                </div>
            );
        }
    }

    return (
        <div className="tagsPanel">
            <div className="tags">{tagSelectButtons}</div>
        </div>
    );
};

const mapStateToProps: (state: State) => Partial<TagsPanelProps> = (
    state: State
) => {
    const setAssets = state.assets.allSets.map(
        index => state.assets.sets[index]
    );

    return {
        currentTag: state.quiz.currentTagID,
        tags: _(state.assets.tags)
            .map(tag => {
                return {
                    name: tag.name,
                    id: tag.id,
                    cardCount: _(state.assets.kanji)
                        .filter(kanji => kanji.tags.indexOf(tag.id) >= 0)
                        .value().length
                };
            })
            .sort((a, b) => {
                if (a.id > b.id) {
                    return 1;
                } else if (a.id < b.id) {
                    return -1;
                } else {
                    return 0;
                }
            })
            .value()
    };
};

const mapDispatchToProps: (
    dispatch: Dispatch<Action>
) => Partial<TagsPanelProps> = (dispatch: Dispatch<Action>) => {
    return {
        onStartTagQuiz: (tag: string) => {
            dispatch(thunkStartTagQuiz(tag) as any);
        }
    };
};

const TagsPanel = connect(mapStateToProps, mapDispatchToProps)(BasicTagsPanel);

export default TagsPanel;
