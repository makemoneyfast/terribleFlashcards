import * as React from "react";
import * as ReactDom from "react-dom";

import * as _ from "Lodash";

import "./styles/setChooser.less";

interface SetChooserProps {
    allSets: { name: string; id: string }[];
    selectedSets: string[];

    onSetChange: (sets: string[]) => void;
}

class SetChooser extends React.Component<SetChooserProps> {
    constructor(props: SetChooserProps) {
        super(props);
    }

    render() {
        const allSetIDs = this.props.allSets.map(set => set.id);
        const unselectedSets = _(allSetIDs)
            .without(...this.props.selectedSets)
            .value();
        const setsByID = _(this.props.allSets)
            .keyBy(set => set.id)
            .value();

        const linkedSetControls = this.props.selectedSets.map(
            (setID, index) => {
                const set = setsByID[setID];
                return (
                    <div key={set.id} className="setItem">
                        {set.name}{" "}
                        <span
                            onClick={() =>
                                this.props.onSetChange(
                                    this.props.selectedSets
                                        .slice(0, index)
                                        .concat(
                                            this.props.selectedSets.slice(
                                                index + 1
                                            )
                                        )
                                )
                            }
                            className="clickable">
                            {" "}
                            kill{" "}
                        </span>
                    </div>
                );
            }
        );

        const unlinkedSetControls = unselectedSets.map((setID, index) => {
            const set = setsByID[setID];
            return (
                <div key={set.id} className="setItem">
                    {set.name}{" "}
                    <span
                        onClick={() =>
                            this.props.onSetChange(
                                this.props.selectedSets.concat(setID).sort()
                            )
                        }
                        className="clickable">
                        {" "}
                        add{" "}
                    </span>
                </div>
            );
        });

        return (
            <div className="setChooser">
                <div>Sets: {linkedSetControls}</div>
                <div>{unlinkedSetControls}</div>
            </div>
        );
    }
}
export default SetChooser;
