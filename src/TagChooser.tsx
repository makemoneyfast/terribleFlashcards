import * as React from "react";
import * as ReactDom from "react-dom";

import * as _ from "Lodash";

import "./styles/tagChooser.less";

interface TagChooserProps {
    allTags: { name: string; id: string }[];
    selectedTags: string[]; // Should be IDs.
    searchText: string;
    allowNewTagCreation: boolean;

    onSearchTextChange: (newText: string) => void;
    onTagSave: (tag: string) => void;
    onTagChange: (tags: string[]) => void;
}

class TagChooser extends React.Component<TagChooserProps> {
    constructor(props: TagChooserProps) {
        super(props);
    }

    render() {
        const lolol = _(this.props.allTags)
            .keyBy("id")
            .value();
        const onAddTag = (tag: string) => {
            if (this.props.selectedTags.indexOf(tag) < 0) {
                this.props.onTagChange(this.props.selectedTags.concat(tag));
            }
        };

        const onRemoveTag = (tag: string) => {
            const tagIndex = this.props.selectedTags.indexOf(tag);
            if (tagIndex >= 0) {
                this.props.onTagChange(
                    this.props.selectedTags
                        .slice(0, tagIndex)
                        .concat(this.props.selectedTags.slice(tagIndex + 1))
                );
            }
        };

        const somethingElse = _(this.props.selectedTags)
            .sort()
            .map(tagID => lolol[tagID])
            .value();

        const selectedTagControls = _(somethingElse)
            .map(tag => (
                <div
                    key={tag.id}
                    id={tag.id}
                    className="tagItem"
                    onClick={() => onRemoveTag(tag.id)}>
                    {tag.name}
                </div>
            ))
            .value();

        let matchedTagControls: JSX.Element[] = [];
        if (this.props.searchText !== "") {
            const matchedTags = _(this.props.allTags)
                .filter(
                    tag =>
                        tag.id.indexOf(this.props.searchText.toLowerCase()) >= 0
                )
                .filter(tag => this.props.selectedTags.indexOf(tag.id) < 0)
                .sortBy(tag => tag.id)
                .value();
            matchedTagControls = _(matchedTags)
                .map(tag => (
                    <div
                        key={tag.id}
                        id={"tag_" + tag.id}
                        className="tagItem"
                        onClick={() => onAddTag(tag.id)}>
                        {tag.name}
                    </div>
                ))
                .value();
        }

        const canCreateTag: boolean =
            this.props.allowNewTagCreation &&
            this.props.searchText &&
            this.props.searchText.length > 0 &&
            !_(this.props.allTags).some(
                item => item.id === this.props.searchText.toLowerCase()
            );

        return (
            <div className="tagChooser">
                <div>Tag: {selectedTagControls}</div>
                Search for tags:{" "}
                <input
                    type="string"
                    value={this.props.searchText}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        this.props.onSearchTextChange(e.target.value);
                    }}
                />
                {canCreateTag ? (
                    <input
                        type="button"
                        value="Create this tag"
                        onClick={() => {
                            this.props.onTagSave(this.props.searchText);
                        }}
                    />
                ) : null}
                <div>{matchedTagControls}</div>
            </div>
        );
    }
}
export default TagChooser;
