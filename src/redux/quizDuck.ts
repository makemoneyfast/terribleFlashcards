import { Action, UnhandledAction } from "./Action";
import { State, QuizState, eQuizMode, eCardState } from "../common";
import { createShuffledArray } from "./utility";
import { DeleteCardAction, DELETE_CARD } from "./assetsDuck";
import * as _ from "Lodash";

// Actions
const START_SET_QUIZ = "MorningThunder/quiz/START_SET_QUIZ";
const START_TAG_QUIZ = "MorningThunder/quiz/START_TAG_QUIZ";
const FLIP = "MorningThunder/quiz/FLIP";
const CHANGE_QUIZ_MODE = "MorningThunder/quiz/CHANGE_QUIZ_MODE";
const START_RETEST = "MorningThunder/quiz/START_RETEST";

type QuizAction =
    | UnhandledAction
    | SelectQuizModeAction
    | FlipAction
    | StartSetQuizAction
    | StartTagQuizAction
    | StartRetestAction
    | DeleteCardAction;

const initialState: QuizState = {
    currentQuiz: [],
    quizMode: eQuizMode.character,
    cardState: eCardState.question,
    currentSetID: null,
    currentTagID: null,
    currentCardIndex: null,
    retesting: false
};
// Reducer
export default function reducer(
    state: QuizState,
    action: QuizAction
): QuizState {
    const cardFlipStateMap = [
        eCardState.hint,
        eCardState.answer,
        eCardState.question
    ];
    let currentQuizID: string;
    let shuffledKanji: string[];

    if (state === undefined) {
        return Object.assign({}, initialState);
    }

    switch (action.type) {
        case START_SET_QUIZ:
            // Todo: turn this into a function.
            if (action.payload.setID === null) {
                return {
                    ...state,
                    currentCardIndex: 0,
                    cardState: null,
                    currentSetID: null,
                    currentTagID: null,
                    currentQuiz: [],
                    retesting: false
                };
            } else {
                return {
                    ...state,
                    currentCardIndex: 0,
                    cardState: eCardState.question,
                    currentSetID: action.payload.setID,
                    currentTagID: null,
                    currentQuiz: action.payload.shuffledCardIDs,
                    retesting: false
                };
            }
        case START_TAG_QUIZ:
            // Todo: turn this into a function.
            return {
                ...state,
                currentCardIndex: 0,
                cardState: eCardState.question,
                currentSetID: null,
                currentTagID: action.payload.tag,
                currentQuiz: action.payload.shuffledCardIDs,
                retesting: false
            };
        case FLIP:
            const nextCardState = cardFlipStateMap[state.cardState];
            let newCardIndex = state.currentCardIndex;
            if (nextCardState === eCardState.question) {
                newCardIndex++;
            }
            return {
                ...state,
                currentCardIndex: newCardIndex,
                cardState: nextCardState
            };
        case CHANGE_QUIZ_MODE:
            const newQuizMode = [eQuizMode.meaning, eQuizMode.character][
                state.quizMode
            ];
            return {
                ...state,
                quizMode: newQuizMode
            };
        case START_RETEST:
            return {
                ...state,
                currentQuiz: action.payload.shuffledKanji,
                cardState: eCardState.question,
                currentCardIndex: 0,
                retesting: true
            };
        case DELETE_CARD:
            if (state.currentSetID !== null || state.currentTagID !== null) {
                console.log("oh shit");
            }
            return state;
        default:
            return state;
    }
}

// Action Creators

type StartSetQuizAction = Action<
    "MorningThunder/quiz/START_SET_QUIZ",
    { setID: string; shuffledCardIDs: string[] }
>;

export function setQuizSelected(
    setID: string,
    shuffledCardIDs: string[]
): StartSetQuizAction {
    return {
        type: START_SET_QUIZ,
        payload: {
            setID,
            shuffledCardIDs
        }
    };
}

type StartTagQuizAction = Action<
    "MorningThunder/quiz/START_TAG_QUIZ",
    { tag: string; shuffledCardIDs: string[] }
>;

export function tagQuizSelected(
    tag: string,
    shuffledCardIDs: string[]
): StartTagQuizAction {
    return {
        type: START_TAG_QUIZ,
        payload: {
            tag,
            shuffledCardIDs
        }
    };
}

type SelectQuizModeAction = Action<
    "MorningThunder/quiz/CHANGE_QUIZ_MODE",
    null
>;

export function quizModeChanged(): SelectQuizModeAction {
    return { type: CHANGE_QUIZ_MODE, payload: null };
}

type FlipAction = Action<"MorningThunder/quiz/FLIP", null>;

export function flipCard(): FlipAction {
    return { type: FLIP, payload: null };
}

type StartRetestAction = Action<
    "MorningThunder/quiz/START_RETEST",
    { shuffledKanji: string[] }
>;

export function startRetest(IDsOfKanjiToRetest: string[]): StartRetestAction {
    const shuffledKanji = createShuffledArray(IDsOfKanjiToRetest);
    return {
        type: START_RETEST,
        payload: { shuffledKanji }
    };
}
