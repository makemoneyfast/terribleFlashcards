import * as React from "React";
import * as ReactDom from "react-dom";
import { Action, Dispatch } from "redux";
import { connect } from "react-redux";

import { State, KanjiAsset } from "./common";
import {
    FilterMode,
    SelectionEditMode,
    toggleFilterSelected,
    changeFilterTextToMatch,
    toggleMatchKanji,
    toggleMatchHint,
    toggleMatchMeaning,
    toggleMatchKunyomi,
    toggleMatchOnyomi,
    changeTagSearchText,
    changeTagsToMatch,
    changeSetsToMatch,
    changeSetsToModifyOnSelected,
    changeTagsToModifyOnSelected,
    changeTagsToModifyOnSelectedSearchText,
    applyChangesToFiltered
} from "./redux/cardManagerDuck";
import { toggleCardSelection } from "./redux/cardManagerDuck";
import {
    thunkEditNominatedCard,
    thunkDeleteCardAndFlush,
    thunkApplyChangesToFilteredAndFlush,
    thunkSaveNewTagAndFlush
} from "./redux/thunks";

import { getFilteredCardsFromState } from "./redux/utility";

import TagChooser from "./TagChooser";
import SetChooser from "./SetChooser";

import * as _ from "Lodash";

import "./styles/cardManager.less";

interface CardManagerProps {
    visibleCards: { kanji: string; meaning: string; id: string }[];
    selectedCards: string[];
    allTags: { name: string; id: string }[];
    allSets: { name: string; id: string }[];

    includeSelected: boolean;
    includeTextToMatch: string;
    includeMatchedKanji: boolean;
    includeMatchedHint: boolean;
    includeMatchedMeaning: boolean;
    includeMatchedKunyomi: boolean;
    includeMatchedOnyomi: boolean;
    includeTagSearchText: string;
    tagsToInclude: string[];
    setsToInclude: string[];

    excludeSelected: boolean;
    excludeTextToMatch: string;
    excludeMatchedKanji: boolean;
    excludeMatchedHint: boolean;
    excludeMatchedMeaning: boolean;
    excludeMatchedKunyomi: boolean;
    excludeMatchedOnyomi: boolean;
    excludeTagSearchText: string;
    tagsToExclude: string[];
    setsToExclude: string[];

    addTagToSelectedSearchText: string;
    tagsToAddToSelected: string[];
    setsToAddToSelected: string[];

    removeTagFromSelectedSearchText: string;
    tagsToRemoveFromSelected: string[];
    setsToRemoveFromSelected: string[];

    onToggleFilterSelected: (mode: FilterMode) => void;
    onChangeFilterMatchText: (test: string, mode: FilterMode) => void;
    onToggleMatchKanji: (mode: FilterMode) => void;
    onToggleMatchHint: (mode: FilterMode) => void;
    onToggleMatchMeaning: (mode: FilterMode) => void;
    onToggleMatchKunyomi: (mode: FilterMode) => void;
    onToggleMatchOnyomi: (mode: FilterMode) => void;
    onTagSearchChange: (newText: string, mode: FilterMode) => void;
    onFilterTagsChange: (newTags: string[], mode: FilterMode) => void;
    onFilterSetsChange: (newSets: string[], mode: FilterMode) => void;

    onTagToModifyOnSelectedSearchTextChange: (
        searchText: string,
        mode: SelectionEditMode
    ) => void;
    onTagsToModifyOnSelectedChange: (
        tags: string[],
        mode: SelectionEditMode
    ) => void;
    onSetsToModifyOnSelectedChange: (
        sets: string[],
        mode: SelectionEditMode
    ) => void;
    onSaveNewTag: (newTag: string) => void;
    onApplyChangesToFiltered: () => void;

    onKanjiSelectToggle: (id: string) => void;
    onKanjiEdit: (id: string) => void;
    onKanjiDelete: (id: string) => void;
}

const BasicCardManager: React.StatelessComponent<CardManagerProps> = (
    props: CardManagerProps
) => {
    const cardStyle: React.CSSProperties = {
        display: "inline-block",
        padding: "3px",
        margin: "1px",
        border: "#666 1px solid"
    };

    const onIncludeTagSearchChange = (newText: string) => {};
    const onIncludeTagChange = (newTags: string[]) => {};
    const noop = () => {};

    const cards = props.visibleCards.map(card => {
        const className =
            props.selectedCards.indexOf(card.id) >= 0 ? "selected" : "";
        return (
            <span
                key={card.id}
                style={cardStyle}
                onClick={() => props.onKanjiSelectToggle(card.id)}
                className={className}>
                <strong>{card.kanji}</strong> <em>{card.meaning}</em>{" "}
                <input
                    type="button"
                    value="edit"
                    onClick={(e: React.MouseEvent<HTMLInputElement>) => {
                        e.stopPropagation();
                        props.onKanjiEdit(card.id);
                    }}
                />
                <input
                    type="button"
                    value="delete"
                    onClick={(e: React.MouseEvent<HTMLInputElement>) => {
                        e.stopPropagation();
                        props.onKanjiDelete(card.id);
                    }}
                />
            </span>
        );
    });
    return (
        <div className="cardManager">
            <div className="filterOptions">
                <div className="filterIn">
                    <h3>Include</h3>
                    <input
                        type="checkbox"
                        checked={props.includeSelected}
                        onChange={() => props.onToggleFilterSelected("include")}
                    />{" "}
                    Include selected
                    <br />
                    Find{" "}
                    <input
                        type="string"
                        value={props.includeTextToMatch}
                        onChange={(
                            event: React.ChangeEvent<HTMLInputElement>
                        ) => {
                            props.onChangeFilterMatchText(
                                event.target.value,
                                "include"
                            );
                        }}
                    />
                    <br /> in{" "}
                    <input
                        type="checkbox"
                        checked={props.includeMatchedKanji}
                        onChange={() => props.onToggleMatchKanji("include")}
                    />{" "}
                    kanji{" "}
                    <input
                        type="checkbox"
                        checked={props.includeMatchedHint}
                        onChange={() => props.onToggleMatchHint("include")}
                    />{" "}
                    hint{" "}
                    <input
                        type="checkbox"
                        checked={props.includeMatchedMeaning}
                        onChange={() => props.onToggleMatchMeaning("include")}
                    />{" "}
                    meaning{" "}
                    <input
                        type="checkbox"
                        checked={props.includeMatchedKunyomi}
                        onChange={() => props.onToggleMatchKunyomi("include")}
                    />{" "}
                    kunyomi
                    <input
                        type="checkbox"
                        checked={props.includeMatchedOnyomi}
                        onChange={() => props.onToggleMatchOnyomi("include")}
                    />{" "}
                    onyomi
                    <br />
                    <TagChooser
                        allTags={props.allTags}
                        selectedTags={props.tagsToInclude}
                        searchText={props.includeTagSearchText}
                        allowNewTagCreation={false}
                        onSearchTextChange={(newText: string) => {
                            props.onTagSearchChange(newText, "include");
                        }}
                        onTagChange={(newTags: string[]) => {
                            props.onFilterTagsChange(newTags, "include");
                        }}
                        onTagSave={noop}
                    />
                    <br />
                    Contained in these sets:
                    <SetChooser
                        allSets={props.allSets}
                        selectedSets={props.setsToInclude}
                        onSetChange={(newSets: string[]) => {
                            props.onFilterSetsChange(newSets, "include");
                        }}
                    />
                </div>
                <div className="filterOut">
                    <h3>Exclude</h3>
                    <input
                        type="checkbox"
                        checked={props.excludeSelected}
                        onChange={() => props.onToggleFilterSelected("exclude")}
                    />{" "}
                    Include selected
                    <br />
                    Find{" "}
                    <input
                        type="string"
                        value={props.excludeTextToMatch}
                        onChange={(
                            event: React.ChangeEvent<HTMLInputElement>
                        ) => {
                            props.onChangeFilterMatchText(
                                event.target.value,
                                "exclude"
                            );
                        }}
                    />
                    <br /> in{" "}
                    <input
                        type="checkbox"
                        checked={props.excludeMatchedKanji}
                        onChange={() => props.onToggleMatchKanji("exclude")}
                    />{" "}
                    kanji{" "}
                    <input
                        type="checkbox"
                        checked={props.excludeMatchedHint}
                        onChange={() => props.onToggleMatchHint("exclude")}
                    />{" "}
                    hint{" "}
                    <input
                        type="checkbox"
                        checked={props.excludeMatchedMeaning}
                        onChange={() => props.onToggleMatchMeaning("exclude")}
                    />{" "}
                    meaning{" "}
                    <input
                        type="checkbox"
                        checked={props.excludeMatchedKunyomi}
                        onChange={() => props.onToggleMatchKunyomi("exclude")}
                    />{" "}
                    kunyomi
                    <input
                        type="checkbox"
                        checked={props.excludeMatchedOnyomi}
                        onChange={() => props.onToggleMatchOnyomi("exclude")}
                    />{" "}
                    onyomi
                    <br />
                    <TagChooser
                        allTags={props.allTags}
                        selectedTags={props.tagsToExclude}
                        searchText={props.excludeTagSearchText}
                        allowNewTagCreation={false}
                        onSearchTextChange={(newText: string) => {
                            props.onTagSearchChange(newText, "exclude");
                        }}
                        onTagChange={(newTags: string[]) => {
                            props.onFilterTagsChange(newTags, "exclude");
                        }}
                        onTagSave={noop}
                    />
                    <br />
                    Contained in these sets:
                    <SetChooser
                        allSets={props.allSets}
                        selectedSets={props.setsToExclude}
                        onSetChange={(newSets: string[]) => {
                            props.onFilterSetsChange(newSets, "exclude");
                        }}
                    />
                </div>
            </div>
            <div className="selectionEditing">
                <h3>Modify filtered cards</h3>
                <div className="tagsOnSelection">
                    Add tag to all
                    <br />
                    <TagChooser
                        allTags={props.allTags}
                        selectedTags={props.tagsToAddToSelected}
                        searchText={props.addTagToSelectedSearchText}
                        allowNewTagCreation={true}
                        onSearchTextChange={(newText: string) => {
                            props.onTagToModifyOnSelectedSearchTextChange(
                                newText,
                                "add"
                            );
                        }}
                        onTagChange={(newTags: string[]) => {
                            props.onTagsToModifyOnSelectedChange(
                                newTags,
                                "add"
                            );
                        }}
                        onTagSave={(newTag: string) =>
                            props.onSaveNewTag(newTag)
                        }
                    />
                    Remove tag from all
                    <br />
                    <TagChooser
                        allTags={props.allTags}
                        selectedTags={props.tagsToRemoveFromSelected}
                        searchText={props.removeTagFromSelectedSearchText}
                        allowNewTagCreation={true}
                        onSearchTextChange={(newText: string) => {
                            props.onTagToModifyOnSelectedSearchTextChange(
                                newText,
                                "remove"
                            );
                        }}
                        onTagChange={(newTags: string[]) => {
                            props.onTagsToModifyOnSelectedChange(
                                newTags,
                                "remove"
                            );
                        }}
                        onTagSave={(newTag: string) =>
                            props.onSaveNewTag(newTag)
                        }
                    />
                </div>
                <div className="setsOnSelection">
                    Add all to set:
                    <br />
                    <SetChooser
                        allSets={props.allSets}
                        selectedSets={props.setsToAddToSelected}
                        onSetChange={(newSets: string[]) => {
                            props.onSetsToModifyOnSelectedChange(
                                newSets,
                                "add"
                            );
                        }}
                    />
                    Remove all from set:
                    <br />
                    <SetChooser
                        allSets={props.allSets}
                        selectedSets={props.setsToRemoveFromSelected}
                        onSetChange={(newSets: string[]) => {
                            props.onSetsToModifyOnSelectedChange(
                                newSets,
                                "remove"
                            );
                        }}
                    />
                </div>
                <div className="selectionEditingControls">
                    <input
                        type="button"
                        value="Apply"
                        onClick={props.onApplyChangesToFiltered}
                    />
                </div>
            </div>
            <div className="cards">{cards}</div>
        </div>
    );
};

const mapStateToProps: (state: State) => Partial<CardManagerProps> = (
    state: State
) => {
    return {
        visibleCards: getFilteredCardsFromState(state).map(cardID => {
            const { meaning, character } = state.assets.kanji[cardID];
            return { kanji: character, meaning, id: character };
        }),
        selectedCards: state.cardManager.selectedCards,
        allTags: _(state.assets.tags)
            .map(tag => ({ id: tag.id, name: tag.name }))
            .value(),
        allSets: _(state.assets.sets)
            .map(set => ({
                name: set.name,
                id: set.id
            }))
            .value(),

        includeSelected: state.cardManager.matchSelectedForInclude,
        includeTextToMatch: state.cardManager.searchTextForInclude,
        includeMatchedKanji: state.cardManager.matchKanjiForInclude,
        includeMatchedHint: state.cardManager.matchHintForInclude,
        includeMatchedMeaning: state.cardManager.matchMeaningForInclude,
        includeMatchedKunyomi: state.cardManager.matchKunyomiForInclude,
        includeMatchedOnyomi: state.cardManager.matchOnyomiForInclude,
        includeTagSearchText: state.cardManager.tagSearchTextForInclude,
        tagsToInclude: state.cardManager.tagsForInclude,
        setsToInclude: state.cardManager.setsForInclude,

        excludeSelected: state.cardManager.matchSelectedForExclude,
        excludeTextToMatch: state.cardManager.searchTextForExclude,
        excludeMatchedKanji: state.cardManager.matchKanjiForExclude,
        excludeMatchedHint: state.cardManager.matchHintForExclude,
        excludeMatchedMeaning: state.cardManager.matchMeaningForExclude,
        excludeMatchedKunyomi: state.cardManager.matchKunyomiForExclude,
        excludeMatchedOnyomi: state.cardManager.matchOnyomiForExclude,
        excludeTagSearchText: state.cardManager.tagSearchTextForExclude,
        tagsToExclude: state.cardManager.tagsForExclude,
        setsToExclude: state.cardManager.setsForExclude,

        addTagToSelectedSearchText: state.cardManager.tagsToAddSearchText,
        tagsToAddToSelected: state.cardManager.tagsToAdd,
        setsToAddToSelected: state.cardManager.setsToAdd,

        removeTagFromSelectedSearchText:
            state.cardManager.tagsToRemoveSearchText,
        tagsToRemoveFromSelected: state.cardManager.tagsToRemove,
        setsToRemoveFromSelected: state.cardManager.setsToRemove
    };
};

const mapDispatchToProps: (
    dispatch: Dispatch<Action>
) => Partial<CardManagerProps> = (dispatch: Dispatch<Action>) => {
    return {
        onKanjiEdit: (id: string) =>
            dispatch(thunkEditNominatedCard(id, "card_manager") as any),
        onKanjiDelete: (id: string) =>
            dispatch(thunkDeleteCardAndFlush(id) as any),
        onKanjiSelectToggle: (id: string) => dispatch(toggleCardSelection(id)),

        onToggleFilterSelected: (mode: FilterMode) =>
            dispatch(toggleFilterSelected(mode)),
        onChangeFilterMatchText: (text: string, mode: FilterMode) =>
            dispatch(changeFilterTextToMatch(text, mode)),
        onToggleMatchKanji: (mode: FilterMode) =>
            dispatch(toggleMatchKanji(mode)),
        onToggleMatchHint: (mode: FilterMode) =>
            dispatch(toggleMatchHint(mode)),
        onToggleMatchMeaning: (mode: FilterMode) =>
            dispatch(toggleMatchMeaning(mode)),
        onToggleMatchKunyomi: (mode: FilterMode) =>
            dispatch(toggleMatchKunyomi(mode)),
        onToggleMatchOnyomi: (mode: FilterMode) =>
            dispatch(toggleMatchOnyomi(mode)),
        onTagSearchChange: (newText: string, mode: FilterMode) =>
            dispatch(changeTagSearchText(newText, mode)),
        onFilterTagsChange: (newTags: string[], mode: FilterMode) =>
            dispatch(changeTagsToMatch(newTags, mode)),
        onFilterSetsChange: (newSets: string[], mode: FilterMode) =>
            dispatch(changeSetsToMatch(newSets, mode)),

        onTagToModifyOnSelectedSearchTextChange: (
            searchText: string,
            mode: SelectionEditMode
        ) => dispatch(changeTagsToModifyOnSelectedSearchText(searchText, mode)),
        onTagsToModifyOnSelectedChange: (
            tags: string[],
            mode: SelectionEditMode
        ) => dispatch(changeTagsToModifyOnSelected(tags, mode)),
        onSetsToModifyOnSelectedChange: (
            sets: string[],
            mode: SelectionEditMode
        ) => dispatch(changeSetsToModifyOnSelected(sets, mode)),
        onSaveNewTag: (newTag: string) =>
            dispatch(thunkSaveNewTagAndFlush(newTag) as any),
        onApplyChangesToFiltered: () =>
            dispatch(thunkApplyChangesToFilteredAndFlush() as any)
    };
};

const CardManager = connect(mapStateToProps, mapDispatchToProps)(
    BasicCardManager
);

export default CardManager;
