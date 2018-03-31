import * as React from "react";
import * as ReactDom from "react-dom";

import { Dispatch, Action } from "redux";
import { connect } from "react-redux";

import { State } from "./common";

import TagChooser from "./TagChooser";

import {
    CardEditBuffer,
    updateCardBufferCharacter,
    updateCardBufferKunyomi,
    updateCardBufferOnyomi,
    updateCardBufferHint,
    updateCardBufferAnswer,
    updateCardBufferNewTag,
    changeCardBufferTags,
    removeTagFromCardBuffer,
    addSetToCardBuffer,
    removeSetFromCardBuffer
} from "./redux/cardEditorDuck";

import { thunkSaveNewTagAndFlush } from "./redux/thunks";

import * as _ from "Lodash";

import "./styles/cardEditor.less";

interface CardEditorProps {
    newCard: boolean;
    character: string;
    hint: string;
    answer: string;
    kunyomi: string;
    onyomi: string;

    allTags: { name: string; id: string }[];
    selectedTags: string[];
    tagSearchText: string;

    onNewTagSave: (newTag: string) => void;
    onTagSearchTextChange: (newTagSearchText: string) => void;
    onSelectedTagsChange: (selectedTags: string[]) => void;

    newCardAlreadyExists: boolean;
    linkedSets: { name: string; id: string }[];
    unlinkedSets: { name: string; id: string }[];

    setAssigned: boolean;
    idDefined: boolean;
    idCollision: boolean;
    unsavedChanges: boolean;

    onCharacterChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onHintChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onAnswerChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onKunyomiChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onOnyomiChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onLinkSet: (setID: string) => void;
    onUnlinkSet: (setID: string) => void;
}

class BasicCardEditor extends React.Component<CardEditorProps> {
    constructor(props: CardEditorProps) {
        super(props);
    }

    render() {
        const linkedSetControls = _(this.props.linkedSets)
            .map(set => (
                <div key={set.id}>
                    {set.name}{" "}
                    <span onClick={() => this.props.onUnlinkSet(set.id)}>
                        {" "}
                        kill{" "}
                    </span>
                </div>
            ))
            .value();
        const unlinkedSetControls = _(this.props.unlinkedSets)
            .map(set => (
                <div key={set.id}>
                    {set.name}{" "}
                    <span onClick={() => this.props.onLinkSet(set.id)}>
                        {" "}
                        add{" "}
                    </span>
                </div>
            ))
            .value();

        let validatorMessage: string = null;
        if (!this.props.idDefined) {
            validatorMessage = "Enter a kanji to test";
        } else if (this.props.idCollision) {
            validatorMessage = "A card for this kanji already exists";
        } else if (!this.props.setAssigned) {
            validatorMessage = "Choose a set for this card";
        } else if (!this.props.unsavedChanges) {
            validatorMessage = "No changes made";
        }

        return (
            <div className="cardEditor">
                "{this.props.newCard ? "new card" : "existing"}"
                <br />
                {validatorMessage}
                <div>
                    {this.props.newCard ? (
                        <div>
                            Kanji:
                            <input
                                type="string"
                                value={this.props.character}
                                onChange={this.props.onCharacterChange}
                            />
                            <br />
                            {this.props.newCardAlreadyExists ? (
                                <strong>
                                    A card with this text already exists
                                </strong>
                            ) : null}
                        </div>
                    ) : (
                        <div>
                            Character: <strong>{this.props.character}</strong>
                        </div>
                    )}
                    Hint:{" "}
                    <input
                        type="string"
                        value={this.props.hint}
                        onChange={this.props.onHintChange}
                    />
                    <br />
                    Answer:{" "}
                    <input
                        type="string"
                        value={this.props.answer}
                        onChange={this.props.onAnswerChange}
                    />
                    <br />
                    Kunyomi:{" "}
                    <input
                        type="string"
                        value={this.props.kunyomi}
                        onChange={this.props.onKunyomiChange}
                    />
                    <br />
                    Onyomi:{" "}
                    <input
                        type="string"
                        value={this.props.onyomi}
                        onChange={this.props.onOnyomiChange}
                    />
                    <br />
                </div>
                <div>
                    <TagChooser
                        allTags={this.props.allTags}
                        selectedTags={this.props.selectedTags}
                        searchText={this.props.tagSearchText}
                        allowNewTagCreation={true}
                        onSearchTextChange={this.props.onTagSearchTextChange}
                        onTagSave={this.props.onNewTagSave}
                        onTagChange={this.props.onSelectedTagsChange}
                    />
                </div>
                {this.props.newCard ? (
                    <div>
                        <br />
                        Add to: {linkedSetControls}
                        <br />
                        Available sets: {unlinkedSetControls}
                    </div>
                ) : null}
            </div>
        );
    }
}

const mapStateToProps: (state: State) => Partial<CardEditorProps> = (
    state: State
) => {
    // Tags
    const allTags = _(state.assets.tags)
        .map(tag => ({ id: tag.id, name: tag.name }))
        .value();

    // Sets
    const allSets = _(state.assets.sets)
        .map(set => ({ name: set.name, id: set.id }))
        .value();
    const unlinkedSets = _.differenceWith(
        allSets,
        state.cardEditor.sets,
        (a, b) => a.id === b
    );
    const linkedSets = _.intersectionWith(
        allSets,
        state.cardEditor.sets,
        (a, b) => a.id === b
    );

    // Validation
    let setAssigned = false;
    let idDefined = false;
    let idCollision = false;
    let unsavedChanges = false;

    if (state.cardEditor.newCard) {
        idDefined = state.cardEditor.kanji !== "";
        idCollision = state.assets.kanji[state.cardEditor.kanji] !== undefined;
        setAssigned = linkedSets.length > 0;

        unsavedChanges =
            state.cardEditor.kanji !== "" ||
            state.cardEditor.hint !== "" ||
            state.cardEditor.meaning !== "" ||
            state.cardEditor.kunyomi !== "" ||
            state.cardEditor.onyomi !== "" ||
            state.cardEditor.tags.length !== 0; /// O MY GOD HAVE TO FIX THIS OM
    } else {
        const currentCard = state.assets.kanji[state.cardEditor.kanji];
        idDefined = true;
        setAssigned = true;

        unsavedChanges =
            state.cardEditor.hint !== currentCard.notes ||
            state.cardEditor.meaning !== currentCard.meaning ||
            state.cardEditor.kunyomi !== currentCard.kunyomi ||
            state.cardEditor.onyomi !== currentCard.onyomi ||
            state.cardEditor.tags.toString() !==
                (currentCard.tags ? currentCard.tags.toString() : "");
    }

    return {
        newCard: state.cardEditor.newCard,
        character: state.cardEditor.kanji,
        hint: state.cardEditor.hint,
        answer: state.cardEditor.meaning,
        kunyomi: state.cardEditor.kunyomi,
        onyomi: state.cardEditor.onyomi,

        allTags: allTags,
        selectedTags: state.cardEditor.tags,
        tagSearchText: state.cardEditor.tagSearchText,

        linkedSets,
        unlinkedSets,
        idCollision,
        idDefined,
        setAssigned,
        unsavedChanges
    };
};

const mapDispatchToProps: (
    dispatch: Dispatch<Action>
) => Partial<CardEditorProps> = (dispatch: Dispatch<Action>) => {
    return {
        onCharacterChange: (event: React.ChangeEvent<HTMLInputElement>) => {
            dispatch(updateCardBufferCharacter(event.target.value));
        },
        onHintChange: (event: React.ChangeEvent<HTMLInputElement>) => {
            dispatch(updateCardBufferHint(event.target.value));
        },
        onAnswerChange: (event: React.ChangeEvent<HTMLInputElement>) => {
            dispatch(updateCardBufferAnswer(event.target.value));
        },
        onKunyomiChange: (event: React.ChangeEvent<HTMLInputElement>) => {
            dispatch(updateCardBufferKunyomi(event.target.value));
        },
        onOnyomiChange: (event: React.ChangeEvent<HTMLInputElement>) => {
            dispatch(updateCardBufferOnyomi(event.target.value));
        },
        onTagSearchTextChange: (newTagSearchText: string) => {
            dispatch(updateCardBufferNewTag(newTagSearchText));
        },
        onNewTagSave: (newTag: string) => {
            dispatch(thunkSaveNewTagAndFlush(newTag) as any);
        },
        onSelectedTagsChange: (updatedTags: string[]) => {
            dispatch(changeCardBufferTags(updatedTags));
        },
        onLinkSet: (setID: string) => dispatch(addSetToCardBuffer(setID)),
        onUnlinkSet: (setID: string) => {
            dispatch(removeSetFromCardBuffer(setID));
        }
    };
};

const CardEditor = connect(mapStateToProps, mapDispatchToProps)(
    BasicCardEditor
);
export default CardEditor;
