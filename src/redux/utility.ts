import { Assets, KanjiAsset, SetAsset, TagAsset, State } from "../common";
import * as _ from "Lodash";

export function loadFromURL(url: string) {
    return fetch(url).then(res => {
        return res.text();
    });
}

export function loadFromLocalStorage() {
    return localStorage.getItem("MorningThunder");
}

export function saveToLocalStorage(data: string) {
    localStorage.setItem("MorningThunder", data);
}

export function validateAssets(structuredAssets) {
    // validate indeed. Todo.
    return true;
}

export function serialiseAssets(
    allSets: string[],
    assets: {
        kanji: { [key: string]: KanjiAsset };
        sets: { [key: string]: SetAsset };
        tags: { [key: string]: TagAsset };
    },
    applicationState?: {
        unexportedChanges: boolean;
    }
): string {
    const output = {
        allSets,
        assets,
        unexportedChanges: applicationState
            ? applicationState.unexportedChanges
            : false
    };

    output.assets.kanji = _(output.assets.kanji)
        .map(({ character, meaning, notes, tags, onyomi, kunyomi }) => {
            const returnValue: Partial<KanjiAsset> = {
                character,
                meaning,
                notes
            };
            if (tags && tags.length !== 0) {
                returnValue.tags = tags;
            }
            if (onyomi !== "") {
                returnValue.onyomi = onyomi;
            }
            if (kunyomi !== "") {
                returnValue.kunyomi = kunyomi;
            }
            return returnValue as KanjiAsset;
        })
        .keyBy(asset => asset.character)
        .value();
    return JSON.stringify(output);
}

export function writeStringToFile( // THANKS LUCAS
    contents: string,
    filename: string,
    contentType = "application/force-download"
) {
    const blob = new Blob([contents], { type: contentType });
    if (typeof window.navigator.msSaveBlob !== "undefined") {
        window.navigator.msSaveBlob(blob, filename);
    } else {
        var URL = window.URL || window["webkitURL"];
        var downloadUrl = URL.createObjectURL(blob);

        const a = document.createElement("a");
        if (typeof a["download"] === "undefined") {
            window.location.replace(downloadUrl);
        } else {
            a.href = downloadUrl;
            a["download"] = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }

        setTimeout(() => {
            URL.revokeObjectURL(downloadUrl);
        }, 100); // cleanup
    }
}

export function createShuffledArray<T>(kanji: T[]): T[] {
    const workingList = kanji.slice();
    const returnValue: T[] = [];

    while (workingList.length > 0) {
        const elementIndex = Math.floor(Math.random() * workingList.length);
        returnValue.push(workingList.splice(elementIndex, 1)[0]);
    }

    return returnValue;
}

export function clearAllRetestFlags(assets: { [key: string]: KanjiAsset }) {
    const returnValue: { [key: string]: KanjiAsset } = {};
    let retestFound: boolean = false;

    for (let key in assets) {
        if (assets.hasOwnProperty(key)) {
            if (assets[key].retest) {
                retestFound = true;
                returnValue[key] = {
                    ...assets[key],
                    retest: false
                };
            } else {
                returnValue[key] = assets[key];
            }
        }
    }

    return retestFound ? returnValue : assets;
}

export function getFilteredCardsFromState(state: State): string[] {
    // So now we have to figure out which cards are visible.
    // First we filter in.

    let visibleCardIDs: string[] = _.map(
        state.assets.kanji,
        kanji => kanji.character
    );

    // Selected
    if (state.cardManager.matchSelectedForInclude) {
        visibleCardIDs = state.cardManager.selectedCards.slice();
    } else {
        visibleCardIDs = _.map(state.assets.kanji, kanji => kanji.character);
    }

    // Kanji match
    if (state.cardManager.matchKanjiForInclude) {
        visibleCardIDs = _.filter(visibleCardIDs, cardID => {
            return cardID.indexOf(state.cardManager.searchTextForInclude) >= 0;
        });
    }

    // Hint match
    if (state.cardManager.matchHintForInclude) {
        visibleCardIDs = _.filter(visibleCardIDs, cardID => {
            return (
                state.assets.kanji[cardID].notes.indexOf(
                    state.cardManager.searchTextForInclude
                ) >= 0
            );
        });
    }

    // Meaning match
    if (state.cardManager.matchMeaningForInclude) {
        visibleCardIDs = _.filter(visibleCardIDs, cardID => {
            return (
                state.assets.kanji[cardID].meaning.indexOf(
                    state.cardManager.searchTextForInclude
                ) >= 0
            );
        });
    }

    // Kunyomi match
    if (state.cardManager.matchKunyomiForInclude) {
        visibleCardIDs = _.filter(visibleCardIDs, cardID => {
            return (
                state.assets.kanji[cardID].kunyomi.indexOf(
                    state.cardManager.searchTextForInclude
                ) >= 0
            );
        });
    }

    // Onyomi match
    if (state.cardManager.matchOnyomiForInclude) {
        visibleCardIDs = _.filter(visibleCardIDs, cardID => {
            return (
                state.assets.kanji[cardID].onyomi.indexOf(
                    state.cardManager.searchTextForInclude
                ) >= 0
            );
        });
    }

    // Tag match
    for (let tag of state.cardManager.tagsForInclude) {
        visibleCardIDs = _.filter(visibleCardIDs, cardID => {
            return state.assets.kanji[cardID].tags.indexOf(tag) >= 0;
        });
    }

    // Set match
    for (let setID of state.cardManager.setsForInclude) {
        // I need to exclude all cards not in this set
        visibleCardIDs = _.filter(visibleCardIDs, cardID => {
            return state.assets.sets[setID].kanji.indexOf(cardID) >= 0;
        });
    }

    // And now we filter out

    // Selected
    if (state.cardManager.matchSelectedForExclude) {
        visibleCardIDs = _.without(
            visibleCardIDs,
            ...state.cardManager.selectedCards
        );
    }

    // Kanji match
    if (state.cardManager.matchKanjiForExclude) {
        visibleCardIDs = _.filter(visibleCardIDs, cardID => {
            return cardID.indexOf(state.cardManager.searchTextForExclude) < 0;
        });
    }

    // Hint match
    if (state.cardManager.matchHintForExclude) {
        visibleCardIDs = _.filter(visibleCardIDs, cardID => {
            return (
                state.assets.kanji[cardID].notes.indexOf(
                    state.cardManager.searchTextForExclude
                ) < 0
            );
        });
    }

    // Meaning match
    if (state.cardManager.matchMeaningForExclude) {
        visibleCardIDs = _.filter(visibleCardIDs, cardID => {
            return (
                state.assets.kanji[cardID].meaning.indexOf(
                    state.cardManager.searchTextForExclude
                ) < 0
            );
        });
    }

    // Kunyomi match
    if (state.cardManager.matchKunyomiForExclude) {
        visibleCardIDs = _.filter(visibleCardIDs, cardID => {
            return (
                state.assets.kanji[cardID].kunyomi.indexOf(
                    state.cardManager.searchTextForExclude
                ) < 0
            );
        });
    }

    // Onyomi match
    if (state.cardManager.matchOnyomiForExclude) {
        visibleCardIDs = _.filter(visibleCardIDs, cardID => {
            return (
                state.assets.kanji[cardID].onyomi.indexOf(
                    state.cardManager.searchTextForExclude
                ) < 0
            );
        });
    }

    // Tag match
    for (let tag of state.cardManager.tagsForExclude) {
        visibleCardIDs = _.filter(visibleCardIDs, cardID => {
            return state.assets.kanji[cardID].tags.indexOf(tag) < 0;
        });
    }

    // Set match
    for (let setID of state.cardManager.setsForExclude) {
        // I need to exclude all cards not in this set
        visibleCardIDs = _.filter(visibleCardIDs, cardID => {
            return state.assets.sets[setID].kanji.indexOf(cardID) < 0;
        });
    }

    return visibleCardIDs;
}
